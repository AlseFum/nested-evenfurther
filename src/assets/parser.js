// import {parseFlexibleDSL as parseDSLLine} from "./line.js"
import {parse as parseDSLLine} from "./anotherline.mjs"
export const split_text=text=>{
    if (!text || typeof text !== 'string') {
        return {};
    }
    const lines = text.split('\n').filter(line => line.trim() !== '');
    let mergedLines = [];
    let pendingLine = '';

    for (let line of lines) {
        if (pendingLine.endsWith('\\')) {
            pendingLine = pendingLine.slice(0, -1) + line;
        } else {
            if (pendingLine !== '') {
                mergedLines.push(pendingLine);
            }
            pendingLine = line;
        }
    }
    if (pendingLine !== '') {
        mergedLines.push(pendingLine);
    }
    return mergedLines;
}
const isSeq=Symbol();
const isBranch=Symbol();
const tryParseJSON=t=>{
    try{
        return JSON.parse(t)
    }catch(e){
        let splitted=t.split(/[ ]*,[ ]*/)
        return splitted.length>1?splitted:[t];
    }
}
export const doNext=(obj,com)=>{

    if(com.seq){
        if(!obj[isSeq] &&!obj[isBranch]){
            obj[isSeq]=true;
            obj.type="seq"
            obj.value=tryParseJSON(com.seq)
        }
        else if(obj[isSeq]){
            obj.value=tryParseJSON(com.seq)
        }
        else if(obj[isBranch]){
            obj.value.push({content:tryParseJSON(com.seq),weight:1})
        }
        
    }
    else if(com.branch){
        if(!obj[isSeq] &&!obj[isBranch]){
            obj[isBranch]=true;
            obj.type="branch"
            obj.value=[{content:tryParseJSON(com.branch),weight:com.weight}]
        }
        else if(obj[isBranch]){
            obj.value.push({content:tryParseJSON(com.branch),weight:com.weight})
        }
        else if(obj[isSeq]){
            delete obj[isSeq];
            obj[isBranch]=true;
            obj.type="branch"
            let oldseq=obj.value
            obj.value=[{content:oldseq,weight:1},{content:tryParseJSON(com.branch),weight:com.weight}]
        }
    }
}
export const parse = text => {
    let result={};
    let coms=split_text(text).map(t=>console.log("doing",t)||parseDSLLine(t));
    for(let com of coms){
        
        if(!result[com.id]){
            result[com.id]={prop:{}}
        }
        
        let old=result[com.id];
        if(!old.prop){
            old.prop={}
        }
        if(!old.slot){
            old.slot={}
        }
        //unique part
        old.title=com.title??com.id
        old.line=com.description;
        Object.assign(old.prop,com.prop)
        doNext(old.slot,com)
        result[com.id]=old;
    }
    for(let r of Object.values(result)){
        if(typeof r.slot == "object" && Object.entries(r.slot) <=0){
            delete r.slot
        }
    }
    return result;
};  