import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rsssunghnagaur',
  password: 'root', // Change this to your PostgreSQL password
  port: 5432,
});

export default pool;
