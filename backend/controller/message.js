import { pool } from "../database/connection.js";

export const getMessage = async () => {
    try {
      const res = await pool.query('SELECT name, message FROM messages ORDER BY created_at ASC');
      return res.rows;
    } catch (err) {
      console.error('Error fetching messages from database:', err);
      return [];
    }
  };

  export const saveMessage = async (name, message) => {
    if (!name || !message) {
      console.error('Invalid name or message:', { name, message });
      return; // Exit early if either name or message is invalid
    }
  
    try {
      await pool.query(
        'INSERT INTO messages (name, message) VALUES ($1, $2)',
        [name, message]
      );
    } catch (err) {
      console.error('Error saving message to database:', err);
    }
  };
  