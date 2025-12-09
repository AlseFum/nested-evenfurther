DSL按行来，"\"表示换行
每行以下成分：
id#Title[Property1=Value1,Property2=Value2,...]`lines`=[slot]
或者
id#Title[Property1=Value1,Property2=Value2,...]`lines`--(weight)>[slot]

其中id必不可少，其他成分都可选。
可选部分：
- #Title 标题
- [Property...] property对
- `lines` 描述行
- =[slotcontent] seq形式
- --(weight)>[slotcontent] branch形式

slotcontent可以是合法的JSON，也可以是字符串形式的简单的Terminal，以逗号分开，允许左右两侧的空格。