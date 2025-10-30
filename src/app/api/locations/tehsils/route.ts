import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');

    const client = await pool.connect();
    try {
      let query, params;
      if (districtId) {
        query = `
          SELECT t.*, d.name as district_name 
          FROM tehsils t 
          LEFT JOIN districts d ON t.district_id = d.id 
          WHERE t.district_id = $1 
          ORDER BY t.name
        `;
        params = [districtId];
      } else {
        query = `
          SELECT t.*, d.name as district_name 
          FROM tehsils t 
          LEFT JOIN districts d ON t.district_id = d.id 
          ORDER BY t.name
        `;
        params = [];
      }

      const result = await client.query(query, params);
      return NextResponse.json({ tehsils: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get tehsils error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, district_id } = await request.json();

    if (!name || !district_id) {
      return NextResponse.json(
        { error: 'Name and district_id are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO tehsils (name, district_id) VALUES ($1, $2) RETURNING *',
        [name, district_id]
      );
      return NextResponse.json({ tehsil: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create tehsil error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, district_id } = await request.json();

    if (!id || !name || !district_id) {
      return NextResponse.json(
        { error: 'ID, name, and district_id are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE tehsils SET name = $1, district_id = $2 WHERE id = $3 RETURNING *',
        [name, district_id, id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Tehsil not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ tehsil: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update tehsil error:', error);
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
      // Check if tehsil has mandals
      const mandalsResult = await client.query(
        'SELECT COUNT(*) FROM mandals WHERE tehsil_id = $1',
        [id]
      );

      if (parseInt(mandalsResult.rows[0].count) > 0) {
        return NextResponse.json(
          { error: 'Cannot delete tehsil with existing mandals' },
          { status: 400 }
        );
      }

      const result = await client.query(
        'DELETE FROM tehsils WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Tehsil not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Tehsil deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete tehsil error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
