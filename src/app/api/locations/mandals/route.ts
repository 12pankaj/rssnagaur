import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tehsilId = searchParams.get('tehsilId');

    const client = await pool.connect();
    try {
      let query, params;
      if (tehsilId) {
        query = `
          SELECT m.*, t.name as tehsil_name, d.name as district_name 
          FROM mandals m 
          LEFT JOIN tehsils t ON m.tehsil_id = t.id 
          LEFT JOIN districts d ON t.district_id = d.id 
          WHERE m.tehsil_id = $1 
          ORDER BY m.name
        `;
        params = [tehsilId];
      } else {
        query = `
          SELECT m.*, t.name as tehsil_name, d.name as district_name 
          FROM mandals m 
          LEFT JOIN tehsils t ON m.tehsil_id = t.id 
          LEFT JOIN districts d ON t.district_id = d.id 
          ORDER BY m.name
        `;
        params = [];
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

export async function POST(request: NextRequest) {
  try {
    const { name, tehsil_id } = await request.json();

    if (!name || !tehsil_id) {
      return NextResponse.json(
        { error: 'Name and tehsil_id are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO mandals (name, tehsil_id) VALUES ($1, $2) RETURNING *',
        [name, tehsil_id]
      );
      return NextResponse.json({ mandal: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create mandal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, tehsil_id } = await request.json();

    if (!id || !name || !tehsil_id) {
      return NextResponse.json(
        { error: 'ID, name, and tehsil_id are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE mandals SET name = $1, tehsil_id = $2 WHERE id = $3 RETURNING *',
        [name, tehsil_id, id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Mandal not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ mandal: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update mandal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM mandals WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Mandal not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Mandal deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete mandal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
