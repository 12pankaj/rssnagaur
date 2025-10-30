import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    //const userId = searchParams.get('userId');
    //const all = searchParams.get('all');

    const client = await pool.connect();
    try {
      let result;
      
        // Get all data for reports
        result = await client.query(`
          SELECT vs.*, u.name as user_name 
          FROM vitrit_savaymsevak vs 
          LEFT JOIN users u ON vs.user_id = u.id 
          ORDER BY vs.created_at DESC
        `);
      
      
      return NextResponse.json(result.rows || null );
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
    const { 
      name_hindi, 
      location_hindi, 
      phone, 
      age, 
      class_profession_hindi, 
      responsibility_hindi, 
      userId 
    } = await request.json();

    if (!name_hindi || !location_hindi || !phone || !age || !class_profession_hindi || !responsibility_hindi || !userId) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    const client = await pool.connect();
    try {
      // Check if user already has data
      const existingResult = await client.query(
        'SELECT id FROM vitrit_savaymsevak WHERE user_id = $1',
        [userId]
      );

      if (existingResult.rows.length > 0) {
        return NextResponse.json(
          { error: 'Data already exists for this user. Use PUT method to update.' },
          { status: 400 }
        );
      }

      const result = await client.query(
        `INSERT INTO vitrit_savaymsevak 
         (user_id, name_hindi, location_hindi, phone, age, class_profession_hindi, responsibility_hindi) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [userId, name_hindi, location_hindi, phone, age, class_profession_hindi, responsibility_hindi]
      );

      return NextResponse.json({ 
        data: result.rows[0],
        message: 'Data saved successfully' 
      });
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
  try {
    const { 
      name_hindi, 
      location_hindi, 
      phone, 
      age, 
      class_profession_hindi, 
      responsibility_hindi, 
      userId 
    } = await request.json();

    if (!name_hindi || !location_hindi || !phone || !age || !class_profession_hindi || !responsibility_hindi || !userId) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE vitrit_savaymsevak 
         SET name_hindi = $1, location_hindi = $2, phone = $3, age = $4, 
             class_profession_hindi = $5, responsibility_hindi = $6, 
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $7 
         RETURNING *`,
        [name_hindi, location_hindi, phone, age, class_profession_hindi, responsibility_hindi, userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'No data found for this user' },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        data: result.rows[0],
        message: 'Data updated successfully' 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update vitrit savaymsevak error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'No data found for this user' },
          { status: 404 }
        );
      }

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
