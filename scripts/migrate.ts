import {pool} from '../server/db.ts';
import {migrate} from './migration-engine.ts';
const connection=await pool.getConnection();
try{await migrate(connection,process.argv[2]??'up',process.argv[3]);}finally{connection.release();await pool.end();}

