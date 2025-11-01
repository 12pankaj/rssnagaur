import { NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    
    let query = 'SELECT id, name, district_id FROM tehsils';
    let params: any[] = [];
    
    if (districtId) {
      query += ' WHERE district_id = $1 ORDER BY name';
      params.push(districtId);
    } else {
      query += ' ORDER BY name';
    }
    
    const result = await pool.query(query, params);
    
    // If districtId is provided, also fetch district name for each tehsil
    if (districtId) {
      const tehsilsWithDistrict = await Promise.all(result.rows.map(async (tehsil) => {
        const districtResult = await pool.query('SELECT name FROM districts WHERE id = $1', [tehsil.district_id]);
        return {
          ...tehsil,
          district_name: districtResult.rows[0]?.name || ''
        };
      }));
      
      return NextResponse.json({ tehsils: tehsilsWithDistrict });
    }
    
    return NextResponse.json({ tehsils: result.rows });
  } catch (error) {
    console.error('Error fetching tehsils:', error);
    return NextResponse.json({ error: 'Failed to fetch tehsils' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, district_id } = body;
    
    const result = await pool.query(
      'INSERT INTO tehsils (name, district_id) VALUES ($1, $2) RETURNING id, name, district_id',
      [name, district_id]
    );
    
    // Also fetch district name
    const districtResult = await pool.query('SELECT name FROM districts WHERE id = $1', [district_id]);
    
    const tehsilWithDistrict = {
      ...result.rows[0],
      district_name: districtResult.rows[0]?.name || ''
    };
    
    return NextResponse.json(tehsilWithDistrict, { status: 201 });
  } catch (error) {
    console.error('Error creating tehsil:', error);
    return NextResponse.json({ error: 'Failed to create tehsil' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, district_id } = body;
    
    const result = await pool.query(
      'UPDATE tehsils SET name = $1, district_id = $2 WHERE id = $3 RETURNING id, name, district_id',
      [name, district_id, id]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Tehsil not found' }, { status: 404 });
    }
    
    // Also fetch district name
    const districtResult = await pool.query('SELECT name FROM districts WHERE id = $1', [district_id]);
    
    const tehsilWithDistrict = {
      ...result.rows[0],
      district_name: districtResult.rows[0]?.name || ''
    };
    
    return NextResponse.json(tehsilWithDistrict);
  } catch (error) {
    console.error('Error updating tehsil:', error);
    return NextResponse.json({ error: 'Failed to update tehsil' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const result = await pool.query('DELETE FROM tehsils WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Tehsil not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Tehsil deleted successfully' });
  } catch (error) {
    console.error('Error deleting tehsil:', error);
    return NextResponse.json({ error: 'Failed to delete tehsil' }, { status: 500 });
  }
}