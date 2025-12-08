export const parse = text => {
  if (!text || typeof text !== 'string') {
      return {};
  }
  
  const result = {};
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // 按标识符分组，收集所有分支
  const branchesByIdentifier = {};
  
  for (const line of lines) {
      try {
          // 解析标识符和标题部分
          const colonIndex = line.indexOf(':');
          const arrowIndex = line.indexOf('->');
          
          let identifier, title, slotOptions;
          
          if (colonIndex === -1 && arrowIndex === -1) {
              // 只有 identifier
              identifier = line.trim();
              title = identifier;
              slotOptions = [];
          } else if (colonIndex === -1 && arrowIndex !== -1) {
              // identifier->option|option 格式
              identifier = line.substring(0, arrowIndex).trim();
              title = identifier;
              const slottr = line.substring(arrowIndex + 2).trim();
              slotOptions = slottr.split('|').map(opt => opt.trim()).filter(opt => opt !== '');
          } else if (colonIndex !== -1 && arrowIndex === -1) {
              // identifier:title 格式
              identifier = line.substring(0, colonIndex).trim();
              title = line.substring(colonIndex + 1).trim();
              slotOptions = [];
          } else {
              // identifier:title->option|option 格式
              identifier = line.substring(0, colonIndex).trim();
              const remaining = line.substring(colonIndex + 1).trim();
              const remainingArrowIndex = remaining.indexOf('->');
              
              if (remainingArrowIndex === -1) {
                  title = remaining;
                  slotOptions = [];
              } else {
                  title = remaining.substring(0, remainingArrowIndex).trim();
                  const slottr = remaining.substring(remainingArrowIndex + 2).trim();
                  slotOptions = slottr.split('|').map(opt => opt.trim()).filter(opt => opt !== '');
              }
          }
          
          // 初始化或获取该标识符的分支数组
          if (!branchesByIdentifier[identifier]) {
              branchesByIdentifier[identifier] = [];
          }
          
          // 创建分支配置
          const branchConfig = {
              content: slotOptions.length > 0 ? slotOptions : [],
              title: title
          };
          
          branchesByIdentifier[identifier].push(branchConfig);
          
      } catch (error) {
          console.warn(`解析行时出错: "${line}"`, error);
          continue;
      }
  }
  
  // 转换为最终的嵌套结构
  for (const [identifier, branches] of Object.entries(branchesByIdentifier)) {
      if (branches.length === 1) {
          // 单个分支，使用 seq 格式
          const branch = branches[0];
          result[identifier] = {
              title: branch.title,
              slot: branch.content.length > 0 ? [ ...branch.content] : []
          };
      } else {
          // 多个分支，使用 branch 格式
          result[identifier] = {
              title: identifier, // 使用标识符作为默认标题
              slot: {
                  branch: branches.map(branch => ({
                      weight: 1,
                      value: branch.content.length > 0 ? ['seq',...branch.content] : ['seq']
                  }))
              }
          };
          
          // 如果所有分支都有相同的标题，使用该标题
          const firstTitle = branches[0].title;
          if (branches.every(branch => branch.title === firstTitle)) {
              result[identifier].title = firstTitle;
          }
      }
  }
  
  return result;
};

// 测试用例
const testText = `
simpleIdentifier
identifierWithTitle:这是一个标题
identifierWithslot->option1|option2|option3
fullFormat:完整格式标题->选项1|选项2|选项3
multipleBranches:分支1->opt1|opt2
multipleBranches:分支2->opt3|opt4
multipleBranches:分支3->opt5|opt6
"quotedIdentifier":"带引号的标题"->"选项1"|"选项2"
"onlyQuotedIdentifier"
emptyTitle:->option1|option2
emptyslot:标题->
mixed:"混合:标题:测试"->"选项:1"|option2
`;

console.log(JSON.stringify(parse(testText), null, 2));