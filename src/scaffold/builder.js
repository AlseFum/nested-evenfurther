import { send } from "./network.js"
import { tolocal } from "./local.js"

const NodeOperator = {
    create(name) {
        let node = Object.create(this);
        node._name = name;
        node._mode = "unset";
        node._slot = null;
        node._title = "";
        node._line = undefined;
        return node;
    },
    
    root(root_) {
        this._first_root = root_;
        return this;
    },
    
    title(title) { 
        this._title = title; 
        return this; 
    },
    
    line(line) { 
        this._line = line; 
        return this; 
    },
    
    slot(slot) {
        this._mode = "slot";
        if (!this._slot) { 
            this._slot = []; 
        }
        
        if (Array.isArray(slot)) {
            this._slot = this._slot.concat(slot);
        } else if (slot?.__proto__ == NodeOperator) {
            this._slot.push(slot._name);
        } else {
            this._slot.push(slot);
        }
        return this;
    },
    
    seq(seq_) {
        this._mode = "seq";
        this._slot = Array.isArray(seq_) ? seq_ : [seq_];
        return this;
    },
    
    branch(branch_) {
        this._mode = "branch";
        if (!branch_) {
            return NodeBranchWrapper(this);
        }
        
        if (!this._slot) {
            this._slot = [];
        }
        
        if (Array.isArray(branch_)) {
            this._slot = this._slot.concat(branch_);
        } else if (branch_) {
            this._slot.push(branch_);
        }
        
        return this;
    },
    
    toJSON() {
        const result = {
            title: this._title,
            line: this._line
        };
        
        // 根据模式生成正确的slot结构[1,4](@ref)
        if (this._mode === "seq" && Array.isArray(this._slot)) {
            result.slot = { seq: this._slot };
        } else if (this._mode === "branch" && Array.isArray(this._slot)) {
            // 标准化分支格式[4](@ref)
            const normalizedBranch = this._slot.map(item => {
                if (item && typeof item === 'object' && item._allBranch) {
                    // 处理分支构建器对象
                    return item.toJSON()[0]; // 取第一个分支项
                }
                return item;
            }).filter(item => item != null);
            
            result.slot = { branch: normalizedBranch };
        } else if (Array.isArray(this._slot)) {
            // 基础模式：字符串数组[2](@ref)
            result.slot = this._slot;
        } else {
            result.slot = this._slot || [];
        }
        
        return result;
    }
}

const NodeBranchWrapper = (whichnode) => {
    let pbranch = createBranch();
    
    return {
        weight(n) {
            pbranch.weight(n);
            return this;
        },
        
        value(content) {
            // 标准化content格式[4](@ref)
            if (typeof content === "string") {
                pbranch.value([content]);
            } else if (Array.isArray(content)) {
                pbranch.value(content);
            } else if (content?.__proto__ == NodeOperator) {
                pbranch.value([content._name]);
            } else {
                pbranch.value([content]);
            }
            return this;
        },
        
        next() {
            // 完成当前分支，准备创建新分支[1](@ref)
            if (!whichnode._slot) {
                whichnode._slot = [];
            }
            whichnode._slot.push(pbranch.toJSON()[0]);
            pbranch = createBranch();
            whichnode._mode = "branch";
            return this;
        },
        
        over() {
            // 添加最后一个分支并返回父节点[1](@ref)
            if (!whichnode._slot) {
                whichnode._slot = [];
            }
            whichnode._slot.push(pbranch.toJSON()[0]);
            whichnode._mode = "branch";
            return whichnode;
        }
    }
}

const createNode = (root, name) => {
    if (root.__proto__ == NodeOperator) {
        return root;
    }
    let node = Object.create(NodeOperator);
    node.root = root;
    node._name = name;
    root[name || Math.random() * 1000] = node;
    return node;
}

// 标准化的repeat函数[4](@ref)
const repeat = (time, value) => {
    if (Array.isArray(time) && time.length === 2 && 
        typeof time[0] === 'number' && typeof time[1] === 'number') {
        return { 
            repeat: time, 
            value: value
        };
    }
    return { 
        repeat: time, 
        value: value 
    };
}

const BranchOperator = {
    ensureCurBranch() {
        if (!this._curBranch) {
            this._curBranch = {
                weight: 1,
                content: []  // 使用content字段[4](@ref)
            }
        }
        if (!this._allBranch) {
            this._allBranch = [];
            this._allBranch.push(this._curBranch);
        }
        return this;
    },
    
    weight(n) {
        this.ensureCurBranch();
        this._curBranch.weight = n;
        return this;
    },
    
    value(content) {
        this.ensureCurBranch();
        if (typeof content === "string") {
            this._curBranch.content = [content];
        } else if (Array.isArray(content)) {
            this._curBranch.content = content;
        } else if (content?.__proto__ == NodeOperator) {
            this._curBranch.content = [content._name];
        } else {
            this._curBranch.content = [content];
        }
        return this;
    },
    
    and(el) {
        this.ensureCurBranch();
        if (!Array.isArray(this._curBranch.content)) {
            this._curBranch.content = [];
        }
        this._curBranch.content.push(el);
        return this;
    },
    
    next() {
        this.ensureCurBranch();
        this._allBranch.push(this._curBranch);
        this._curBranch = null; // 重置当前分支
        return this;
    },
    
    toJSON() {
        return this._allBranch || [];
    }
}

const createBranch = () => {
    const branch = Object.create(BranchOperator);
    branch._allBranch = [];
    return branch;
}

// 建造者模式的Director类（指挥者）[1,4](@ref)
const Director = {
    build(builder) {
        return builder.toJSON();
    }
}

const createBuilder = () => {
    let NestRoot = {};
    
    let builder = (input) => {
        if (typeof input == "string") {
            if (NestRoot[input]) {
                return NestRoot[input];
            }
            let node = NodeOperator.create(input);
            NestRoot[input] = node;
            return node;
        }
        if (input instanceof NodeOperator) {
            return builder(input._name);
        }
        return builder;
    }
    
    builder.toJSON = () => {
        const result = {};
        Object.entries(NestRoot).forEach(([key, value]) => {
            result[key] = Director.build(value); // 使用Director统一构建[1](@ref)
        });
        return result;
    }
    
    builder.root = () => NestRoot;
    
    builder.send = (pathname = "sprawl") => {
        send(pathname, JSON.stringify(builder.toJSON(), null, 2));
        return builder;
    }
    
    builder.tolocal = (pathname = "default") => {
        tolocal(pathname, JSON.stringify(builder.toJSON(), null, 2));
        return builder;
    }
    
    return builder;
}

// 使用示例
const orteil = createBuilder();

// 序列模式示例[4](@ref)
orteil("universe").title("universe").seq([
    repeat([10, 20], "super_cluster")
]);
orteil("universe").seq([
    repeat([10, 20], "galaxy")
]);
// 分支模式示例[1](@ref)
orteil("super_cluster").title("supercluster")
    .branch()
        .weight(1).value([repeat(10, "galaxy")]).next()
        .weight(1).value([repeat(8, "nebula")]).next()
        .weight(2).value([repeat([2, 5], "star_cluster")])
    .over();

// 基础slot模式示例
orteil("galaxy").title("Galaxy").slot(["star_system1", "star_system2"]);
orteil.tolocal();
//branch is wrong. do it later.
export { createBuilder, NodeOperator, repeat, Director };