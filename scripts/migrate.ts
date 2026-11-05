import {readFile} from 'node:fs/promises';
import {pool,rows} from '../server/db.ts';
// MySQL DDL faz commit implícito. O diário sujo impede continuação silenciosa após falha.
const direction = process.argv[2] ?? 'up';
if (!['up','down'].includes(direction)) throw new Error('Use up ou down.');
const connection = await pool.getConnection();
try {
 const lock = await rows<{acquired:number}>("SELECT GET_LOCK(CONCAT(DATABASE(), ':migrations'),10) acquired",[],connection);
 if (lock[0]?.acquired !== 1) throw new Error('Migração concorrente.');
 await connection.execute('CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(40) PRIMARY KEY, dirty BOOLEAN NOT NULL DEFAULT FALSE)');
 const applied = await rows<{version:string;dirty:number}>('SELECT version,dirty FROM schema_migrations WHERE version=?',['001_foundation'],connection);
 if (applied[0]?.dirty) throw new Error('Migração incompleta: restaure o banco de desenvolvimento antes de continuar.');
 const shouldRun = direction === 'up' ? !applied.length : !!applied.length;
 if (shouldRun) {
  if (direction === 'down' && process.env.ALLOW_DESTRUCTIVE_ROLLBACK !== 'yes') throw new Error('Rollback elimina dados. Defina ALLOW_DESTRUCTIVE_ROLLBACK=yes somente em banco descartável.');
  await connection.execute('INSERT INTO schema_migrations(version,dirty) VALUES (?,TRUE) ON DUPLICATE KEY UPDATE dirty=TRUE',['001_foundation']);
  const sql = await readFile(new URL('../db/migrations/001_foundation.'+direction+'.sql',import.meta.url),'utf8');
  for (const statement of sql.split(';').map(s=>s.trim()).filter(Boolean)) await connection.query(statement);
  if (direction === 'up') await connection.execute('UPDATE schema_migrations SET dirty=FALSE WHERE version=?',['001_foundation']);
  else await connection.execute('DELETE FROM schema_migrations WHERE version=?',['001_foundation']);
 }
 console.log('Migrações verificadas: '+direction);
} finally {
 await connection.query("SELECT RELEASE_LOCK(CONCAT(DATABASE(), ':migrations'))");
 connection.release(); await pool.end();
}
