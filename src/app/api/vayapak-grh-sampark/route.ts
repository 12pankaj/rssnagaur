import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import pool from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'guest') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      districtId,
      tehsilId,
      mandalId,
      total_villages,
      contacted_villages,
      distributed_forms,
      distributed_stickers,
      book_sales,
      contact_teams,
      contact_workers,
      male,
      female,
      yoga,
      special_contacts,
      swayamsevak_houses,
      supporter_houses,
      neutral_houses,
      total_houses,
      contacted_houses
    } = body;

    // Validate required fields
    if (!districtId || !tehsilId || !mandalId) {
      return NextResponse.json({ error: 'District, tehsil, and mandal are required' }, { status: 400 });
    }

    // Insert into database
    const query = `
      INSERT INTO vayapak_grh_sampark (
        user_id, district_id, tehsil_id, mandal_id,
        total_villages, contacted_villages, distributed_forms, distributed_stickers,
        book_sales, contact_teams, contact_workers, male, female, yoga,
        special_contacts, swayamsevak_houses, supporter_houses, neutral_houses,
        total_houses, contacted_houses
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING id
    `;

    const values = [
      decoded.id, districtId, tehsilId, mandalId,
      total_villages, contacted_villages, distributed_forms, distributed_stickers,
      book_sales, contact_teams, contact_workers, male, female, yoga,
      special_contacts, swayamsevak_houses, supporter_houses, neutral_houses,
      total_houses, contacted_houses
    ];

    const result = await pool.query(query, values);
    
    return NextResponse.json({ 
      message: 'Vayapak Grh Sampark data submitted successfully',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Error submitting vayapak grh sampark data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}