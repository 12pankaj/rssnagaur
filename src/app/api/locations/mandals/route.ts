import { NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tehsilId = searchParams.get('tehsilId');
    
    let query = 'SELECT id, name, tehsil_id FROM mandals';
    let params: any[] = [];
    
    if (tehsilId) {
      query += ' WHERE tehsil_id = $1 ORDER BY name';
      params.push(tehsilId);
    } else {
      query += ' ORDER BY name';
    }
    
    const result = await pool.query(query, params);
    
    // If tehsilId is provided, also fetch tehsil and district names
    if (tehsilId) {
      const mandalsWithLocations = await Promise.all(result.rows.map(async (mandal) => {
        const tehsilResult = await pool.query('SELECT name, district_id FROM tehsils WHERE id = $1', [mandal.tehsil_id]);
        const tehsil = tehsilResult.rows[0];
        
        if (tehsil) {
          const districtResult = await pool.query('SELECT name FROM districts WHERE id = $1', [tehsil.district_id]);
          return {
            ...mandal,
            tehsil_name: tehsil.name,
            district_name: districtResult.rows[0]?.name || ''
          };
        }
        
        return {
          ...mandal,
          tehsil_name: '',
          district_name: ''
        };
      }));
      
      return NextResponse.json({ mandals: mandalsWithLocations });
    }
    
    return NextResponse.json({ mandals: result.rows });
  } catch (error) {
    console.error('Error fetching mandals:', error);
    return NextResponse.json({ error: 'Failed to fetch mandals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, tehsil_id } = body;
    
    const result = await pool.query(
      'INSERT INTO mandals (name, tehsil_id) VALUES ($1, $2) RETURNING id, name, tehsil_id',
      [name, tehsil_id]
    );
    
    // Also fetch tehsil and district names
    const tehsilResult = await pool.query('SELECT name, district_id FROM tehsils WHERE id = $1', [tehsil_id]);
    const tehsil = tehsilResult.rows[0];
    
    let district_name = '';
    if (tehsil) {
      const districtResult = await pool.query('SELECT name FROM districts WHERE id = $1', [tehsil.district_id]);
      district_name = districtResult.rows[0]?.name || '';
    }
    
    const mandalWithLocations = {
      ...result.rows[0],
      tehsil_name: tehsil?.name || '',
      district_name: district_name
    };
    
    return NextResponse.json(mandalWithLocations, { status: 201 });
  } catch (error) {
    console.error('Error creating mandal:', error);
    return NextResponse.json({ error: 'Failed to create mandal' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, tehsil_id } = body;
    
    const result = await pool.query(
      'UPDATE mandals SET name = $1, tehsil_id = $2 WHERE id = $3 RETURNING id, name, tehsil_id',
      [name, tehsil_id, id]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Mandal not found' }, { status: 404 });
    }
    
    // Also fetch tehsil and district names
    const tehsilResult = await pool.query('SELECT name, district_id FROM tehsils WHERE id = $1', [tehsil_id]);
    const tehsil = tehsilResult.rows[0];
    
    let district_name = '';
    if (tehsil) {
      const districtResult = await pool.query('SELECT name FROM districts WHERE id = $1', [tehsil.district_id]);
      district_name = districtResult.rows[0]?.name || '';
    }
    
    const mandalWithLocations = {
      ...result.rows[0],
      tehsil_name: tehsil?.name || '',
      district_name: district_name
    };
    
    return NextResponse.json(mandalWithLocations);
  } catch (error) {
    console.error('Error updating mandal:', error);
    return NextResponse.json({ error: 'Failed to update mandal' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const result = await pool.query('DELETE FROM mandals WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Mandal not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Mandal deleted successfully' });
  } catch (error) {
    console.error('Error deleting mandal:', error);
    return NextResponse.json({ error: 'Failed to delete mandal' }, { status: 500 });
  }
}