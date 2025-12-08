import {parse} from "./parser.js"
export default parse(`
identifierWithslot->option1|option2|option3
fullFormat:完整格式标题->选项1|选项2|选项3
multipleBranches:分支1->opt1|opt2
option1:选项1->multipleBranches
multipleBranches:分支2->opt3|opt4
multipleBranches:分支3->opt5|opt6
"quotedIdentifier":"带引号的标题"->"选项1"|"选项2"
"onlyQuotedIdentifier"
emptyTitle:->option1|option2
emptyslot:标题->
mixed:"混合:标题:测试"->"选项:1"|option2
simpleIdentifier
identifierWithTitle:这是一个标题
`)