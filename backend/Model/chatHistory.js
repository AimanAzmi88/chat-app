import { pool } from '../database/connection.js'

const query =`
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

`;


const createTable = async () => {
    try {
        await pool.query(query);
        console.log('Table created successfully');
    } catch (error) {
        console.error('Error creating table:', error);
    }
}

export default createTable