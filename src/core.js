import { ref } from "vue"
import { evaluate } from "./genson.js";
import example from "./assets/default.js"

export function createContext(ctx = null) {
    let nextLayer = Object.create(ctx)
    nextLayer._ = ctx;
    return nextLayer
}
const rand_int = (min, max) => Math.floor((max - min + 1) * Math.random()) + min;
const run_str = (str, ctx, fn) => {
    if (str.startsWith("js:")) {
        str.splice(3);
    }
    if (str.startsWith("javascript:")) {
        str.splice(3);
    }
    try {
        return new Function("ctx", "fn", str.slice(11))(ctx, fn)
    } catch (e) {
        fn(string)
    }

}
const doSeqArray = (seq, ctx, fn) => {
    let newctx = createContext(ctx);
    run_str(seq.onEnter, newctx, fn);
    return seq.map(s => doTerm(s, newctx, fn)).flat(1).filter(i => !i?.shouldSkip);
};

function doBranch(branches, ctx, fn) {
    if (!branches?.length) return [];
    if (branches.length === 1) {
        return doSeqArray(branches[0].content, ctx, fn);
    }

    const weightedBranches = branches.map(branch => {
        const weight = Math.max(0, Number(branch?.weight) || Number(branch?.wt) || Number(branch?.[0]) || 1);
        const content = branch?.content || branch?.branch || branch?.value || branch?.[1] || branch;
        return { content, weight };
    });

    const totalWeight = weightedBranches.reduce((sum, b) => sum + b.weight, 0);
    const targetWeight = Math.random() * (totalWeight || weightedBranches.length);

    let accumulated = 0;
    const selected = weightedBranches.find(branch =>
        (accumulated += branch.weight) >= targetWeight
    );
    let newctx = createContext(ctx);
    run_str(branches.onEnter, newctx, fn);
    return doSeqArray(selected?.content || weightedBranches[weightedBranches.length - 1].content, ctx, fn);
}

function extractSuffixValues(str) {
    const digitMatch = str.match(/^(.*)\*(\d+)$/);
    if (digitMatch) {
        return [digitMatch[1], parseInt(digitMatch[2])];
    }

    const rangeMatch = str.match(/^(.*)\*\[(\d+),(\d+)\]$/);
    if (rangeMatch) {
        return [rangeMatch[1], [parseInt(rangeMatch[2]), parseInt(rangeMatch[3])]];
    }
    return [str, 1];
}
function doTerm(term, ctx, access) {
    // function, need to return an array.
    if (typeof term == "function") {
        return term(ctx, access);
    }
    if (typeof term == "string") {
        if (term.startsWith("js:") || term.startsWith("javascript:")) {
            return run_str(term, ctx, access);
        }
        if (typeof slots == "string") {
            let [refer, time_] = extractSuffixValues(slots);
            let time = time_ == null
                ? 1
                : typeof time_ == "number"
                    ? time_
                    : rand_int(time_[0], time_[1]);
            return Array(time).fill(0).map(i => access(refer))
        }
    }
    if (term == null) return { title: "Null", shouldSkip: true };
    if (typeof term == "object") {
        if (term.repeat) {
            let res = [], actualTime = 1;
            if (typeof term.repeat == "number") { actualTime = term.repeat; }
            if (Array.isArray(term.repeat) && term.repeat.every(i => typeof i == "number") && term.repeat.length == 2) {
                actualTime = rand_int(term.repeat[0], term.repeat[1])
            }
            for (let i = 0; i < actualTime; i++) {
                let res_ = doTerm(term.value?.value ?? term.value, ctx, access)
                res.push(res_)
            }
            res.shouldFlat = true;
            return res;
        }
        if (term.ref) {
            return access(term.ref);
        }
        if (typeof term.continue == "function") {
            let res = [];
            let count = 0;
            while (term.continue(ctx, count) == true && count < 114) {
                res.push(doTerm(term.value, ctx, access))
            }
            res.shouldFlat = true
            return res;
        }
        return JSON.parse(JSON.stringify(term))
    }
    return [{ title: term }]
}

function doEntry(slots, ctx, accessor) {
    if (typeof slots != "object") {
        return [doTerm(slots, ctx, accessor)].flat();
    }
    if (Array.isArray(slots) && slots.length > 0 && slots.every(slot => typeof slot == "string")) {
        if (slots[0] == "seq") {
            return doSeqArray(slots.slice(1), ctx, accessor);
        };
        if (slots[0] == "branch") {
            return doBranch(slots.slice(1), ctx, accessor);
        }
        return Array(rand_int(1, 4)).fill(0).map(() => {
            return accessor(slots[rand_int(0, slots.length)]);
        });
    }
    if (slots.branch) {
        return doBranch(slots.branch, ctx, accessor)
    }
    //just use the decided sequence
    if (slots.seq) {
        return doSeqArray(slots.seq, ctx, accessor)
    }

}

export function makeByJson(json) {
    let mainkey = Object.keys(json)[0];
    let access = (key = mainkey) => json[key] && {
        title: typeof json[key] == "string"
            ? json[key]
            : evaluate(json[key]?.title) != ""
                ? evaluate(json[key]?.title)
                : "key" + key,
        line: json[key]?.line,
        getProp() { return json[key]?.prop },
        prop: {},
        expand(ctx) {
            let newCtx = createContext(ctx);
            newCtx.prop = this.prop;
            return doEntry(json[key]?.slot ?? json[key]?.entry ?? [], ctx, access)
        }
    } || [{ title: "No key:" + key }];
    return access();
}
//---------------------------
function getProp(n, ctx) {
    return n && typeof n.getProp == "function" ? n.getProp(ctx) : n.prop
}
//this function is to make the layer  vue-reactive and gensonified
//and, the insider creator should not concern about the wrap
//res.expand should be a function, return a decltype(res)
export const wrap = (wrapee) => ref({
    title: evaluate(wrapee.title),
    line: evaluate(wrapee.line),
    prop: getProp(wrapee),
    slot: [],
    expand(ctx) {
        this.slot.value = wrapee?.expand?.(ctx)?.map?.(i => wrap(i)) ?? []
    }
})
export function createNest() {
    return wrap(makeByJson(example))
}
