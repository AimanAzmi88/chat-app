import pkg from 'pg';
const { Pool } = pkg;
import chatHistory from '../Model/chatHistory.js';

const connectionString = 'postgresql://postgres.xxudsifdeaologsnlyfi:Aiman4588Aiman@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

export const pool = new Pool({ connectionString });

export const databaseInit = async () => {
    try{
        const dbName = await pool.query('SELECT current_database()');
        const name = dbName.rows[0].current_database;
        const dbRes = await pool.query('SELECT NOW()');
        const time = dbRes.rows[0].now;

        console.log(`Connected to ${name} database at ${time}`);

        await chatHistory();
    }
    catch(err){
        console.error('Error connecting to the database:', err);
    }
}