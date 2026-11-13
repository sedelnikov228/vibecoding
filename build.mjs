import { readFile, mkdir, writeFile } from 'node:fs/promises';
const html = await readFile('index.html','utf8');
const worker = await readFile('worker.mjs','utf8');
await mkdir('dist/server',{recursive:true});
await writeFile('dist/server/index.js','const HTML = '+JSON.stringify(html)+';\n'+worker);

