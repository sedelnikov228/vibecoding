import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import worker from './worker.mjs';

const args = process.argv.slice(2);
const lan = args.includes('--lan');
const port = Number(args.find(value => /^\d+$/.test(value)) ?? 8788);
const page = new URL('./index.html', import.meta.url);
const database = new DatabaseSync(fileURLToPath(new URL('./tracker.sqlite', import.meta.url)));
database.exec('PRAGMA journal_mode=WAL');
if (!database.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='records'").get()) {
  const migration = await readFile(new URL('./drizzle/0001_records.sql',import.meta.url),'utf8');
  database.exec('BEGIN');
  try {
    database.exec(migration);
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

database.exec(await readFile(new URL('./drizzle/0002_exercises.sql', import.meta.url), 'utf8'));

const DB = {
  prepare(sql) {
    const statement = database.prepare(sql);
    return {
      bind(...values) {
        return {
          all: () => ({results: statement.all(...values)}),
          run: () => ({meta: statement.run(...values)})
        };
      }
    };
  }
};

const server = createServer(async (incoming, outgoing) => {
  try {
    const headers = new Headers(incoming.headers);
    headers.set('oai-authenticated-user-id','local');
    const origin = 'http://' + headers.get('host');
    const url = new URL(incoming.url,origin);
    if (url.origin !== origin) {
      outgoing.writeHead(400).end();
      return;
    }
    const method = incoming.method;
    if (url.pathname === '/' && (method === 'GET' || method === 'HEAD')) {
      const html = await readFile(page);
      outgoing.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }).end(method === 'HEAD' ? undefined : html);
      return;
    }
    let body;
    if (method === 'PUT' || method === 'DELETE') {
      const chunks = [];
      let length = 0;
      for await (const chunk of incoming) {
        length += chunk.length;
        if (length > 200000) {
          outgoing.writeHead(413).end();
          return;
        }
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    }
    const response = await worker.fetch(new Request(url,{method,headers,body}),{DB});
    outgoing.writeHead(response.status,Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error.message);
    outgoing.writeHead(500).end('Internal server error');
  }
});
server.listen(port,lan?'0.0.0.0':'127.0.0.1',()=>{
  console.log('ПК   http://localhost:'+port);
  if (lan) for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses??[]) {
      if (address.family==='IPv4'&&!address.internal) console.log('Wi-Fi   http://'+address.address+':'+port);
    }
  }
});

