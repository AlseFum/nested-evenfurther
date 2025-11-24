import { ref } from "vue"
import example from "./assets/example.js"
import { evaluate } from "./genson.js";
export function createContext(ctx = null) {
    return Object.create(ctx)
}
const rand_int=(min,max)=>Math.floor((max-min)*Math.random())+min;
const ifstring=(string,ctx,fn)=>string.startsWith("javascript:")?new Function("ctx","fn",str.slice(11)(ctx,fn)):fn(string);
const doSeq=(seq,ctx,fn)=> seq.map(s=>doTerm(s,ctx,fn)).flat().filter(i=>!i?.shouldSkip);
function doBranch(branches, ctx, fn) {
    if (!branches?.length) return [];
    if (branches.length === 1) return doSeq(branches[0], ctx, fn);
    
    const weightedBranches = branches.map(branch => {
        const weight = Math.max(0, Number(branch?.weight) || Number(branch?.wt)|| 1);
        const content = branch?.content || branch?.branch|| branch?.value|| branch;
        return { content, weight };
    });
    
    const totalWeight = weightedBranches.reduce((sum, b) => sum + b.weight, 0);
    const targetWeight = Math.random() * (totalWeight || weightedBranches.length);
    
    let accumulated = 0;
    const selected = weightedBranches.find(branch => 
        (accumulated += branch.weight) >= targetWeight
    );
    
    return doSeq(selected?.content || weightedBranches[weightedBranches.length - 1].content, ctx, fn);
}
/**
 * match term:
 *   Function -> Result<Function>
 *   String -> Terminal
 *   {repeat,value} -> Array<Terminal,shouldFlat=true>
 *   {ref} -> Terminal
 *   {continue:Function} -> Array<Terminal,shouldFlat=true>
 *   Object -> Copied<Object>
 */
function doTerm(term,ctx,access){
    // function, need to return an array.
    if(typeof term == "function"){
        return term(ctx,access);
    }
    if(typeof term == "string"){
        return ifstring(term,ctx,access);
    }
    if(term == null) return {title:"Null",shouldSkip:true};
    if(typeof term == "object"){
        if(term.repeat){
            let res=[],actualTime=1;
            if(typeof term.repeat == "number"){actualTime=term.repeat;}
            if(Array.isArray(term.repeat) &&term.repeat.every(i=>typeof i == "number") && term.repeat.length ==2){
                actualTime=rand_int(term.repeat[0],term.repeat[1])
            }
            for(let i=0;i<actualTime;i++){
                let res_=doTerm(term.value?.value??term.value,ctx,access)
                res.push(res_)
            }
            res.shouldFlat=true;
            return res;
        }
        if(term.ref){
            return access(term.ref);
        }
        if(typeof term.continue == "function"){
            let res=[];
            let count=0;
            while(term.continue(ctx,count) == true &&count<114 ){ 
                res.push(doTerm(term.value,ctx,access))
            }
            res.shouldFlat=true
            return res;
        }
        return JSON.parse(JSON.stringify(term))
    }
    return [{title:term}]
}

//this should only return layer1 array.
function doSlots(slots, ctx, fn) {
    //this is the very basic mode
    // [key1,key2,key3,keyN...]
    if(Array.isArray(slots) && slots.length > 0 && slots.every(slot=>typeof slot == "string")) {
        return Array(rand_int(1,4)).fill(0).map(() => {
            return fn(slots[rand_int(0, slots.length)]);
        });
    }
    if (typeof slots =='object'){
        //we'll use branch to decide which sequence to use
        if(slots.branch){
            return doBranch(slots.branch,ctx,fn)
        }
        //just use the decided sequence
        if(slots.seq){
            return doSeq(slots.seq,ctx,fn)
        }
    }
    // do it as a single terminal.
    return [doTerm(slots,ctx,fn)].flat();
}
/**
 * these are just loose definition
 * @typedef NestSet Dict<String (key),NestEntry>
 * @typedef NestEntry string|Array<string>|BranchSchema|SeqSchema|Terminal
 * @typedef Terminal {repeat,value}|{continue,value}|{ref}|function
 * @typedef SeqEntry {seq:Seq}
 * @typedef Seq Array<Terminal>
 * @typedef BranchEntry {branch:Branch}
 * @typedef Branch Array<{weight|wt:Number|Object,value:Seq}>
 */
export function makeByJson(json) {
    let mainkey = Object.keys(json)[0];
    let access = (key = mainkey) =>json[key] && {
        title: evaluate(json[key]?.title),
        line: json[key]?.line,
        getProp() { },
        expand(ctx) {
            let newCtx=createContext(ctx);
            newCtx.prop=this.prop;
            return doSlots(json[key]?.slot ?? [], ctx,access)
        }
    } || [{title:"Nope already: "+key}];
    return access();
}
//---------------------------
function getProp(n,ctx){
    return n && typeof n.getProp=="function"?n.getProp(ctx):n.getProp
}
//this function is to make the layer  vue-reactive and gensonified
//and, the insider creator should not concern about the wrap
//res.expand should be a function, return a decltype(res)
export const wrap = (wrapee) =>  ref({
        title: evaluate(wrapee.title),
        line: evaluate(wrapee.line),
        prop: getProp(wrapee),
        expanded: false,
        slot: [],
        expand(ctx) {
            this.expanded=true;
            this.slot.value = wrapee?.expand?.(ctx)?.map?.(i => wrap(i))??[]
        }
    })
export function createNest() {
    return wrap(makeByJson(example))
}
