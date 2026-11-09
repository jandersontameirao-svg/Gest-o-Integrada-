import mysql, { type RowDataPacket, type PoolConnection } from 'mysql2/promise';
export const pool = mysql.createPool({
 host: process.env.DB_HOST ?? '127.0.0.1', port: Number(process.env.DB_PORT ?? 3306),
 user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
 connectionLimit: 5, multipleStatements: false, timezone: 'Z',
});
export type SqlParameter = string | number | boolean | Date | Buffer | null;
export async function rows<T>(sql: string, args: SqlParameter[] = [], connection: PoolConnection | typeof pool = pool): Promise<T[]> {
 const [result] = await connection.execute<RowDataPacket[]>(sql, args);
 return result as T[];
}

