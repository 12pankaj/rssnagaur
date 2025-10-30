import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tehsilId = searchParams.get('tehsilId');

    const client = await pool.connect();
    try {
      let query: string;
      let params: (string | number)[] = []; // ✅ explicitly typed

      if (tehsilId) {
        query = `
          SELECT m.*, t.name AS tehsil_name, d.name AS district_name 
          FROM mandals m 
          LEFT JOIN tehsils t ON m.tehsil_id = t.id 
          LEFT JOIN districts d ON t.district_id = d.id 
          WHERE m.tehsil_id = $1 
          ORDER BY m.name
        `;
        params = [tehsilId];
      } else {
        query = `
          SELECT m.*, t.name AS tehsil_name, d.name AS district_name 
          FROM mandals m 
          LEFT JOIN tehsils t ON m.tehsil_id = t.id 
          LEFT JOIN districts d ON t.district_id = d.id 
          ORDER BY m.name
        `;
      }

      const result = await client.query(query, params);
      return NextResponse.json({ mandals: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get mandals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
