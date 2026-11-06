import {readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import type {PoolConnection} from 'mysql2/promise';
import {rows} from '../server/db.ts';
const directory = new URL('../db/migrations/',import.meta.url);
export async function migrationCatalog() {
 const names=(await readdir(directory)).filter(n=>/^\d{3}_[a-z_]+\.up\.sql$/.test(n)).sort();
 if(names.some((n,i)=>Number(n.slice(0,3))!==i+1))throw new Error('Catálogo de migrações deve ser contínuo a partir de 001.');
 return Promise.all(names.map(async name=>{
  const version=name.replace('.up.sql','');
  const up=await readFile(new URL(name,directory),'utf8');
  const down=await readFile(new URL(version+'.down.sql',directory),'utf8');
  return {version,up,down,checksum:createHash('sha256').update(up+'\n--DOWN--\n'+down).digest('hex')};
 }));
}
export async function migrate(connection:PoolConnection,direction:string,target?:string) {
 if(!['up','down'].includes(direction)) throw new Error('Use up ou down.');
 const catalog=await migrationCatalog();
 if(target&&!catalog.some(m=>m.version===target)) throw new Error('Versão alvo desconhecida.');
 if(direction==='down'&&process.env.ALLOW_DESTRUCTIVE_ROLLBACK!=='yes')throw new Error('Rollback exige ALLOW_DESTRUCTIVE_ROLLBACK=yes.');
 const lock=await rows<{acquired:number}>("SELECT GET_LOCK(CONCAT(DATABASE(), ':migrations'),10) acquired",[],connection);
 if(lock[0]?.acquired!==1)throw new Error('Migração concorrente.');
 try {
  await connection.execute('CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(40) PRIMARY KEY, dirty BOOLEAN NOT NULL DEFAULT FALSE, checksum CHAR(64) NULL)');
  const columns=await rows('SHOW COLUMNS FROM schema_migrations LIKE ?', ['checksum'],connection);
  if(!columns.length)await connection.execute('ALTER TABLE schema_migrations ADD COLUMN checksum CHAR(64) NULL');
  const applied=await rows<{version:string;dirty:number;checksum:string|null}>('SELECT version,dirty,checksum FROM schema_migrations ORDER BY version',[],connection);
  for(const [i,a] of applied.entries()){
   const source=catalog[i];
   if(a.dirty)throw new Error('Migração incompleta: '+a.version);
   if(!source||source.version!==a.version)throw new Error('Histórico de migrações não sequencial.');
   if(a.checksum===null){
    // Somente a 001 exata, anterior ao mecanismo de checksum, pode ser adotada explicitamente.
    if(a.version!=='001_foundation'||source.checksum!=='5fc7e7f487c5fbb9a51835e0145beae7485b855ce224ce3f8aa2e0254632d910'||process.env.ADOPT_LEGACY_001!=='yes')throw new Error('Adoção explícita da 001 necessária.');
    await connection.execute('UPDATE schema_migrations SET checksum=? WHERE version=?',[source.checksum,a.version]);
   }else if(a.checksum!==source.checksum)throw new Error('Checksum divergente: '+a.version);
  }
  if(direction==='up'&&target&&applied.some(a=>a.version>target))throw new Error('Use down para recuar versão.');
  const todo=direction==='up'?catalog.filter(m=>!applied.some(a=>a.version===m.version)&&(!target||m.version<=target))
   :catalog.filter(m=>applied.some(a=>a.version===m.version)&&(!target||m.version>=target)).reverse();
  for(const m of todo){
   await connection.execute('INSERT INTO schema_migrations(version,dirty,checksum) VALUES (?,TRUE,?) ON DUPLICATE KEY UPDATE dirty=TRUE',[m.version,m.checksum]);
   // SQL de migração controlado; não aceita payload do cliente. Não usar ; dentro de literais.
   for(const statement of (direction==='up'?m.up:m.down).split(';').map(s=>s.trim()).filter(Boolean))await connection.query(statement);
   if(direction==='up')await connection.execute('UPDATE schema_migrations SET dirty=FALSE WHERE version=?',[m.version]);
   else await connection.execute('DELETE FROM schema_migrations WHERE version=?',[m.version]);
   console.log('Migração verificada: '+m.version+' '+direction);
  }
 }finally{await connection.query("SELECT RELEASE_LOCK(CONCAT(DATABASE(), ':migrations'))");}
}

