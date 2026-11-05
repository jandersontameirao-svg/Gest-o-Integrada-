import {createApp} from './app.ts';
import {pool} from './db.ts';
const server = createApp().listen(Number(process.env.PORT ?? 3001),'127.0.0.1',()=>console.log('Gestão Integrada: API iniciada.'));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>{void pool.end().then(()=>process.exit(0));}));
