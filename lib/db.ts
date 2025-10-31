import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: '72.60.222.102',
  database: 'rsssunghnagaur',
  password: 'rssnagaur', // Change this to your PostgreSQL password
  port: 5432,
});

export default pool;
