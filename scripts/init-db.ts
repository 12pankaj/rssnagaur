import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'lib', 'database.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    const client = await pool.connect();
    
    try {
      // Execute each statement
      for (const statement of statements) {
        if (statement.trim().length > 0) {
          console.log('Executing:', statement.substring(0, 50) + '...');
          await client.query(statement);
        }
      }
      
      console.log('Database initialized successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();