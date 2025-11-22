import { ref } from "vue"
import example from "./assets/example.js"
import { evaluate } from "./genson.js";
export function createContext(ctx = null) {
    return Object.create(ctx)
}
const rand_int=(min,max)=>Math.floor((max-min)*Math.random())+min;
const ifstring=(string,ctx,fn)=>string.startsWith("javascript:")?new Function("ctx","fn",str.slice(11)(ctx,fn)):fn(string);
const doSeq=(seq,ctx,fn)=> seq.map(s=>doTerm(s,ctx,fn)).flat().filter(i=>!i?.shouldSkip);
function doBranch(branches,ctx,fn){
    /**
     * weight ,content
     */
        if (!branches || branches.length === 0) {
            return Promise.resolve();
        }
        
        if (branches.length === 1) {
            return doSeq(branches[0], ctx, fn);
        }
        
        const weightedBranches = [];
        let totalWeight = 0;
        
        for (const branch of branches) {
            let weight = 1;
            
            if (typeof branch === 'object' && branch !== null) {
                if (branch.weight !== undefined) {
                    weight = Math.max(0, Number(branch.weight) || 1); 
                }
                const branchContent = branch.content || branch.branch || branch;
                weightedBranches.push({ content: branchContent, weight });
            } else {
                weightedBranches.push({ content: branch, weight });
            }
            
            totalWeight += weight;
        }
        
        if (totalWeight === 0) {
            totalWeight = branches.length;
            weightedBranches.forEach(branch => branch.weight = 1);
        }
        
        const random = Math.random() * totalWeight;
        let currentWeight = 0;
        
        for (const branch of weightedBranches) {
            currentWeight += branch.weight;
            if (random <= currentWeight) {
                return doSeq(branch.content, ctx, fn);
            }
        }
        
        return doSeq(weightedBranches[weightedBranches.length - 1].content, ctx, fn);

}
function doTerm(term,ctx,fn){
    // function, need to return an array.
    if(typeof term == "function"){
        return term(ctx,fn);
    }
    if(typeof term == "string"){
        return [ifstring(term,ctx,fn)].flat();
    }
    if(term == null) return {title:"Null",shouldSkip:true};
    if(typeof term == "object"){
        if(term.repeat){
            let res=[]
            for(let i=0;i<term.repeat;i++){
                res.push(doTerm(term.value,ctx,fn))
            }
            res.shouldFlat=true;
            return res;
        }
        if(typeof term.continue == "function"){
            let res=[];
            let count=0;
            while(term.continue(ctx,count) == true &&count<114 ){
                res.push(doTerm(term.value,ctx,fn))
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
export function makeByJson(json) {
    let mainkey = Object.keys(json)[0];
    let access = (key = mainkey) => json[key] && {
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
