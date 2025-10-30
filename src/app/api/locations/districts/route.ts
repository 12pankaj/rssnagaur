import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM districts ORDER BY name');
      return NextResponse.json({ districts: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get districts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO districts (name) VALUES ($1) RETURNING *',
        [name]
      );
      return NextResponse.json({ district: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create district error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID and name are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE districts SET name = $1 WHERE id = $2 RETURNING *',
        [name, id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'District not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ district: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update district error:', error);
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
      // Check if district has tehsils
      const tehsilsResult = await client.query(
        'SELECT COUNT(*) FROM tehsils WHERE district_id = $1',
        [id]
      );

      if (parseInt(tehsilsResult.rows[0].count) > 0) {
        return NextResponse.json(
          { error: 'Cannot delete district with existing tehsils' },
          { status: 400 }
        );
      }

      const result = await client.query(
        'DELETE FROM districts WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'District not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'District deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete district error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
