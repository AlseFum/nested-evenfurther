export const parseFlexibleDSL = (line) => {
    const result = { id: "" };
    let remaining = line.trim();

    // 1. 优先匹配分支格式，但允许id中包含其他属性符号
    const branchMatch = remaining.match(/^(.+?)--\(([^)]+)\)>(.+)$/);
    if (branchMatch) {
        const fullId = branchMatch[1].trim();
        
        // 从完整id中提取基础id（去掉标题等属性）
        const baseIdMatch = fullId.match(/^([^#\[\]`=]+)/);
        if (baseIdMatch) {
            result.id = baseIdMatch[1].trim();
        } else {
            result.id = fullId; // 回退方案
        }
        
        result.weight = branchMatch[2].trim();
        result.branch = branchMatch[3].trim();
        result.type = 'branch';
        remaining = fullId; // 剩余部分继续解析基础属性
    } 
    // 2. 尝试匹配槽格式
    else {
        const slotMatch = remaining.match(/^(.+?)=(.+)$/);
        if (slotMatch) {
            const fullId = slotMatch[1].trim();
            
            const baseIdMatch = fullId.match(/^([^#\[\]`=]+)/);
            if (baseIdMatch) {
                result.id = baseIdMatch[1].trim();
            } else {
                result.id = fullId;
            }
            
            result.slot = slotMatch[2].trim();
            result.type = 'slot';
            remaining = fullId;
        } else {
            // 3. 基础格式
            const baseMatch = remaining.match(/^([^#\[\]`=]+)/);
            if (baseMatch) {
                result.id = baseMatch[0].trim();
                result.type = 'base';
                remaining = remaining.substring(result.id.length);
            } else {
                throw new Error(`Invalid DSL format: ${line}`);
            }
        }
    }

    // 4. 解析可选属性
    parseOptionalAttributes(remaining, result);
    
    return result;
};

function parseOptionalAttributes(str, result) {
    let workingStr = str;
    
    // 解析标题 (#title)
    const titleMatch = workingStr.match(/#([^\[`]+)/);
    if (titleMatch) {
        result.title = titleMatch[1].trim();
        workingStr = workingStr.replace(titleMatch[0], '');
    }

    // 解析属性 ([prop1=val1,prop2=val2])
    const propMatch = workingStr.match(/\[([^\]]*)\]/);
    if (propMatch && propMatch[1].trim()) {
        const props = {};
        propMatch[1].split(',').forEach(pair => {
            const [key, value] = pair.split('=').map(s => s.trim());
            if (key && value !== undefined) {
                props[key] = value;
            }
        });
        if (Object.keys(props).length > 0) {
            result.prop = props;
        }
        workingStr = workingStr.replace(propMatch[0], '');
    }

    // 解析描述 (`description`)
    const descMatch = workingStr.match(/`([^`]*)`/);
    if (descMatch) {
        result.description = descMatch[1].trim();
    }
}

const dslLines = [
    'myField',
    'myField#我的标题',
    'myField[[name=test]]',
    'myField#我的标题[name=test,age=30]',
    'myField#我的标题[name=test]`这是一个描述`',
    'myField#我的标题[name=test]`这是一个描述`=slot_content',
    'myField`这是一个描述`--(0.8)>branch_target'
];

const charwise=text=>{
    let state={
        p:0,
        text
    }
    let step=0;
    while(state.p<text.length && step++<text.length*2){
        p++;
    }
}