import { parse } from "./parser.js"
let d=parse(`
a--(1)>c,d
a--(2)>d
c#C
d#D
`)
export default {
    main: {
        title: "示例",
        slot: ["#BareTitle*[1,4]", "UseBranch", "AnotherRef*1"],
        prop: { a: 2 }
    },
    AnotherRef: {
        title: "又一个示例",
        slot: ["main","#YetAnotherOnlyTitle for showing seq"]
    },
    UseBranch: {
        title: "Branch示例",
        slot: {
            type: "branch",
            value: [
                [
                    1,
                    ["AnotherRef"]
                ], {
                    weight: 2,
                    value: ["#Ohh,Title",
                        {
                            title: "Object",
                            line: "This is defined just in JSON Object. And slot is unabled",
                            slot: ["main"]
                        }]
                }
            ]

        }
    }
}