import { Pool } from 'pg';

const pool = new Pool({
      user:'postgres',
      host: '72.60.222.102',
      database: 'rsssunghnagaur',
      password:   'rssnagaur',
      port:5432,
      ssl: {
        rejectUnauthorized: false
      },
    }
);

export default pool;