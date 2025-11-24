import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const tolocal = async (name, value) => {
  const fileName = name.endsWith('.js') ? name : `${name}.js`;
  const assetsDir = path.join(__dirname, '../assets');
  const filePath = path.join(assetsDir, fileName);
  await mkdir(assetsDir, { recursive: true });
    const content = typeof value === 'string' ? value : `export default ${JSON.stringify(value, null, 2)};`;
    await writeFile(filePath, "export default "+content, 'utf8');
};