const json = (value, status=200) => Response.json(value,{status,headers:{'Cache-Control':'no-store'}});

async function api(request, db, owner){
  if(!owner) return json({error:'Sign-in required'},401);
  if(request.method==='GET') return list(db,owner);
  if(!['PUT','DELETE'].includes(request.method)) return json({error:'Method not allowed'},405);
  if(request.headers.get('Origin')!==new URL(request.url).origin) return json({error:'Invalid origin'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json')) return json({error:'Expected JSON'},415);
  const raw=await request.text();
  if(raw.length>50000) return json({error:'Request too large'},413);
  let data;
  try {data=JSON.parse(raw);} catch {return json({error:'Invalid JSON'},400);}
  if(!data||typeof data.id!=='string'||!/^[0-9a-f-]{36}$/.test(data.id)||!Number.isSafeInteger(data.revision)||data.revision<0) return json({error:'Invalid record'},400);
  let result;
  if(request.method==='DELETE'){
    result=await db.prepare('DELETE FROM records WHERE owner=? AND id=? AND revision=?').bind(owner,data.id,data.revision).run();
  }else{
    const record=validate(data);
    if(!record) return json({error:'Invalid fields'},400);
    const payload=JSON.stringify(record);
    if(data.revision===0){
      result=await db.prepare('INSERT INTO records(owner,id,day,payload,revision) VALUES(?,?,?,?,1) ON CONFLICT(owner,id) DO NOTHING').bind(owner,data.id,record.day,payload).run();
    }else{
      result=await db.prepare('UPDATE records SET day=?,payload=?,revision=revision+1 WHERE owner=? AND id=? AND revision=?').bind(record.day,payload,owner,data.id,data.revision).run();
    }
  }
  if(!result.meta.changes) return json({error:'Record changed'},409);
  return list(db,owner);
}

async function list(db,owner){
  const {results}=await db.prepare('SELECT id,payload,revision FROM records WHERE owner=? ORDER BY day DESC, rowid DESC').bind(owner).all();
  return json(results.map(row=>({...JSON.parse(row.payload),id:row.id,revision:row.revision})));
}

function validate(data){
  if(!['gym','notes','workout'].includes(data.kind)||typeof data.title!=='string'||!data.title.trim()||data.title.length>120) return;
  if(typeof data.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(data.day)||data.day<'1900-01-01') return;
  const date=new Date(data.day+'T12:00:00Z');
  if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==data.day) return;
  const common={kind:data.kind,title:data.title.trim(),day:data.day};
  if(data.kind==='workout'){
    const {duration, exercises}=data;
    if(!Number.isInteger(duration)||duration<1||duration>1440||
      !Array.isArray(exercises)||!exercises.length||exercises.length>50) return;
    const entries=[];
    for(const exercise of exercises){
      if(typeof exercise?.title!=='string'||!Array.isArray(exercise.sets)||
        !exercise.sets.length||exercise.sets.length>50) return;
      const title=exercise.title.trim().replace(/\s+/gu,' ');
      if(!title||title.length>120) return;
      const sets=[];
      for(const set of exercise.sets){
        if(!Number.isFinite(set?.weight)||set.weight<0||set.weight>9999||
          !Number.isInteger(set.reps)||set.reps<1||set.reps>9999) return;
        sets.push({weight:set.weight,reps:set.reps});
      }
      entries.push({title,key:title.normalize('NFKC').toLocaleLowerCase('ru-RU'),sets});
    }
    return {...common,duration,exercises:entries};
  }
  if(data.kind==='notes'){
    if(typeof data.body!=='string'||data.body.length>20000) return;
    return {...common,body:data.body.trim()};
  }
  const weight=Number(data.weight),reps=Number(data.reps);
  if(typeof data.weight!=='string'||!data.weight.trim()||!Number.isFinite(weight)||weight<0||weight>9999||!Number.isInteger(reps)||reps<1||reps>9999) return;
  return {...common,weight,reps};
}

export default {
  async fetch(request,env){
    const {pathname}=new URL(request.url);
    const owner=request.headers.get('oai-authenticated-user-id');
    if(pathname==='/api/records') return api(request,env.DB,owner);
    if(pathname==='/api/exercises'){
      if(!owner) return json({error:'Sign-in required'},401);
      if(request.method!=='GET') return json({error:'Method not allowed'},405);
      const {results}=await env.DB.prepare('SELECT title FROM exercises WHERE owner=?').bind(owner).all();
      return json(results.map(row=>row.title));
    }
    if(pathname!=='/') return new Response('Not found',{status:404});
    return new Response(HTML,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
  }
};
