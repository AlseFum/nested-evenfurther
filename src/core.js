import { ref } from "vue"
import { evaluate } from "./genson.js";
import example from "./assets/default.js"

export const createContext = (ctx = null, param = {}) =>
    Object.assign(Object.create(ctx), param, { _: ctx,prop:{a:(ctx?.prop?.a??-12)+1} });
const rand_int = (min, max) => Math.floor((max - min + 1) * Math.random()) + min;

const run_str = (str, ctx, fn) => {
    //shouldn't
    if (typeof str === "function") {
        return str(ctx, fn);
    }
    if (typeof str !== "string") return;

    if (str.startsWith("js:")) {
        str = str.slice(3);
    } else if (str.startsWith("javascript:")) {
        str = str.slice(11);
    }
    // expose ctx / fn as before
    return new Function("ctx", "fn", str)(ctx, fn);
};
const Roulette = arr => {
    const totalWeight = arr.reduce((sum, n) => sum + n.weight, 0);
    const targetWeight = Math.random() * (totalWeight || arr.length);
    let accumulated = 0;
    return arr.find(n =>
        (accumulated += n.weight) >= targetWeight
    );
}
//-------------------------------------

function dealEnter() { }
function dealLeave() { }

// "enemy*3" / "enemy*[1,3]" 形式的重复语法解析。
function extractSuffixValues(str) {
    const digitMatch = str.match(/^(.*)\*(\d+)$/);
    if (digitMatch) {
        return [digitMatch[1], parseInt(digitMatch[2])];
    }

    const rangeMatch = str.match(/^(.*)\*\[(\d+),(\d+)\]$/);
    if (rangeMatch) {
        return [rangeMatch[1], rand_int(parseInt(rangeMatch[2]), parseInt(rangeMatch[3]))];
    }
    return [str, 1];
}
//return the single thing.
function doTerm(thing, ctx, access) {
    // function, need to return an array.
    if (typeof thing == "function") {
        return thing(ctx, access);
    }
    if (typeof thing == "string") {
        if (thing.startsWith("js:") || thing.startsWith("javascript:")) {
            return run_str(thing, ctx, access);
        }
        
        if (thing.includes("*")) {
            let [refer, time] = extractSuffixValues(thing);
            if (refer.startsWith("#")) {
                return Array(time).fill(0).map(_ => ({ title: refer.slice(1) }));
            } else {
                return Array(time).fill(0).map(_ => access(refer,ctx));
            }
        }
        
        if (thing.startsWith("#")) {
            return { title: thing.slice(1) };
        }
        
        return access(thing,ctx);
    }
    if (thing == null || thing == "nih") return { title: "Null", shouldSkip: true };

    if (typeof thing == "object") {
        return JSON.parse(JSON.stringify(thing))
    }
    return [{ title: thing }]
}

const doArray = (seq, ctx, fn) => seq.map(s => doTerm(s, ctx, fn)).flat(1).filter(i => !i?.shouldSkip)

function doSeq(obj, ctx, fn) {
    let newCtx = createContext(ctx);
    dealEnter(newCtx, ctx, obj.onEnter);
    let res = doArray(obj.seq ?? obj.value, newCtx, fn)
    dealLeave(ctx, newCtx, obj.onLeave);
    return res;
}

function getBranchWeight(branch, ctx) {
    return Math.max(0, Number(branch?.weight) || Number(branch?.wt) || Number(branch?.[0]) || 1);
}
function getBranchContent(branch, ctx) {
    return branch?.content || branch?.branch || branch?.value || branch?.[1] || branch;
}

//branches should be arr.
function doBranch(obj, ctx, fn) {
    let branches = obj.branch ?? obj.value;
    if (!branches?.length) return [{title:"shitbranch"}];
    //useful?
    if (branches.length === 1) {
        let n=getBranchContent(branches[0],ctx)
        return doArray(n, ctx, fn);
    }

    const weightedBranches = branches.map(branch => ({
        content: getBranchContent(branch, ctx),
        weight: getBranchWeight(branch, ctx)
    }));

    const content = (Roulette(weightedBranches) || weightedBranches[weightedBranches.length - 1]).content;
    let newCtx = createContext(ctx);
    dealEnter(newCtx, ctx, obj.onEnter)
    let res = doArray(content, newCtx, fn)
    dealLeave(ctx, newCtx, obj.onLeave)
    return res;
}
function doSlotStr(str, ctx, accessor) {
    return doTerm(str, ctx, accessor);
}
function doSlotArr(arr, ctx, accessor) {
    let newCtx = createContext(ctx);
    dealEnter(newCtx,ctx,null)
    let ret=doArray(arr,newCtx,accessor);
    dealLeave(ctx,newCtx,null);
    return ret
}

function doSlotObj(obj, ctx, accessor) {
    if (obj.branch || obj.type == "branch") {
        return doBranch(obj, ctx, accessor)
    }
    if (obj.seq || obj.type == "seq") {
        return doSeq(obj, ctx, accessor);
    }
    let nc=createContext(ctx);
    dealEnter(ctx,ctx,null)
    let ret=doArray([obj], nc, accessor);
    dealLeave(ctx,ctx,null);
    return ret
}
// slot must return Thing[]
function doSlot(slots, ctx, accessor) {
    if (typeof slots == "function") {
        return slots(ctx, accessor);
    }
    if (typeof slots == "string") {
        return doSlotStr(slots, ctx, accessor);
    }
    if (Array.isArray(slots)) {
        return doSlotArr(slots, ctx, accessor);
    }
    if (typeof slots == "object") {
        return doSlotObj(slots, ctx, accessor);
    }
}

export function makeByJson(json) {
    let firstkey = Object.keys(json)[0];
    let access = (key = firstkey,ctx=null) => {
        let thing = json[key];
        if (!thing) return { title: "No key:" + key }
        let title;
        //special title
        if (typeof thing == "string") {
            return { title: thing }
        }
        title = evaluate(thing?.title) ?? "key" + key
        return {
            title,
            line: thing?.line,
            getProp() { return thing?.prop??{} },
            ctx:{shi:34},
            expand(ctx) {
                return doSlot(thing?.slot ?? thing?.entry ?? [], createContext(ctx, { prop: this.prop }), access)
            }
        }

    };
    return access();
}
//---------------------------
function getProp(n) {
    return n && typeof n.getProp == "function" ? n.getProp() : n.prop
}
//this function is to make the layer  vue-reactive and gensonified
//and, the insider creator should not concern about the wrap
//res.expand should be a function, return a decltype(res)
export const wrap = (wrapee) => ref({
    title: evaluate(wrapee.title),
    line: evaluate(wrapee.line),
    prop: getProp(wrapee),
    slot: [],
    ctx:wrapee?.ctx??{},
    expand(ctx) {
        this.slot.value = wrapee?.expand?.(ctx)?.map?.(i => wrap(i)) ?? []
    }
})
export function createNest() {
    return wrap(makeByJson(example))
}
