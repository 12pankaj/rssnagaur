import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const client = await pool.connect();
    try {
      let result;
      
      if (userId) {
        // Get data for specific user
        result = await client.query(`
          SELECT vs.*, u.name as user_name, 
                 d.name as district_name,
                 t.name as tehsil_name,
                 m.name as mandal_name
          FROM vitrit_savaymsevak vs 
          LEFT JOIN users u ON vs.user_id = u.id 
          LEFT JOIN districts d ON vs.district_id = d.id
          LEFT JOIN tehsils t ON vs.tehsil_id = t.id
          LEFT JOIN mandals m ON vs.mandal_id = m.id
          WHERE vs.user_id = $1
          ORDER BY vs.created_at DESC
        `, [userId]);
      } else {
        // Get all data for reports
        result = await client.query(`
          SELECT vs.*, u.name as user_name, 
                 d.name as district_name,
                 t.name as tehsil_name,
                 m.name as mandal_name
          FROM vitrit_savaymsevak vs 
          LEFT JOIN users u ON vs.user_id = u.id 
          LEFT JOIN districts d ON vs.district_id = d.id
          LEFT JOIN tehsils t ON vs.tehsil_id = t.id
          LEFT JOIN mandals m ON vs.mandal_id = m.id
          ORDER BY vs.created_at DESC
        `);
      }
      
      return NextResponse.json(result.rows || []);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get vitrit savaymsevak error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { entries } = await request.json();

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'At least one entry is required' },
        { status: 400 }
      );
    }

    // Validate all entries
    for (const entry of entries) {
      const { 
        name_hindi, 
        location_hindi, 
        phone, 
        age, 
        class_profession_hindi, 
        responsibility_hindi, 
        district_id,
        tehsil_id,
        mandal_id,
        userId 
      } = entry;

      if (!name_hindi || !location_hindi || !phone || !age || !class_profession_hindi || !responsibility_hindi || !district_id || !tehsil_id || !mandal_id || !userId) {
        return NextResponse.json(
          { error: 'All fields are required for each entry' },
          { status: 400 }
        );
      }

      // Validate phone number
      if (!/^\d{10}$/.test(phone)) {
        return NextResponse.json(
          { error: 'Phone number must be 10 digits' },
          { status: 400 }
        );
      }

      // Validate age
      if (age < 1 || age > 100) {
        return NextResponse.json(
          { error: 'Age must be between 1 and 100' },
          { status: 400 }
        );
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing entries for this user
      const userId = entries[0].userId;
      await client.query(
        'DELETE FROM vitrit_savaymsevak WHERE user_id = $1',
        [userId]
      );

      // Insert new entries
      for (const entry of entries) {
        const { 
          name_hindi, 
          location_hindi, 
          phone, 
          age, 
          class_profession_hindi, 
          responsibility_hindi, 
          district_id,
          tehsil_id,
          mandal_id,
          responsibility_details_hindi,
          sangh_shikshan_hindi,
          ganvesh_information,
          userId 
        } = entry;

        await client.query(
          `INSERT INTO vitrit_savaymsevak 
           (user_id, name_hindi, location_hindi, phone, age, class_profession_hindi, responsibility_hindi, district_id, tehsil_id, mandal_id, responsibility_details_hindi, sangh_shikshan_hindi, ganvesh_information) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [userId, name_hindi, location_hindi, phone, age, class_profession_hindi, responsibility_hindi, district_id, tehsil_id, mandal_id, responsibility_details_hindi, sangh_shikshan_hindi, ganvesh_information]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({ 
        message: 'Data saved successfully' 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create vitrit savaymsevak error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // PUT method is no longer needed as we're handling updates through POST
  return NextResponse.json(
    { error: 'Use POST method to update entries' },
    { status: 405 }
  );
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM vitrit_savaymsevak WHERE user_id = $1 RETURNING *',
        [userId]
      );

      return NextResponse.json({ 
        message: 'Data deleted successfully' 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete vitrit savaymsevak error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}