import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db';
import { verifyToken } from '../../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'guest') {
      return NextResponse.json(
        { error: 'Only guest users can submit this form' },
        { status: 403 }
      );
    }

    const {
      districtId,
      tehsilId,
      mandalId,
      totalMandals,
      totalContactedMandals,
      totalContactedVillages,
      totalBasti,
      totalContactedBasti,
      otherInfo,
      totalDistributedForms,
      totalDistributedStickers,
      totalBookSales,
      totalParticipatingTeams,
      totalParticipatingWorkers,
      maleWorkers,
      femaleWorkers,
      yogaWorkers,
      specialPersonContacts,
      totalHouses,
      totalContactedHouses,
      swayamsevakHouses,
      supporterHouses,
      neutralHouses
    } = await request.json();
    
    if (!districtId || !tehsilId || !mandalId) {
      return NextResponse.json(
        { error: 'Location fields are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query(
        `INSERT INTO hindu_sammelan (
          user_id, district_id, tehsil_id, mandal_id,
          total_mandals, total_contacted_mandals, total_contacted_villages,
          total_basti, total_contacted_basti, other_info,
          total_distributed_forms, total_distributed_stickers, total_book_sales,
          total_participating_teams, total_participating_workers,
          male_workers, female_workers, yoga_workers,
          special_person_contacts,
          total_houses, total_contacted_houses,
          swayamsevak_houses, supporter_houses, neutral_houses
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
        [
          decoded.id,
          districtId,
          tehsilId,
          mandalId,
          totalMandals,
          totalContactedMandals,
          totalContactedVillages,
          totalBasti || 0,
          totalContactedBasti || 0,
          otherInfo || '',
          totalDistributedForms || 0,
          totalDistributedStickers || 0,
          totalBookSales || 0,
          totalParticipatingTeams || 0,
          totalParticipatingWorkers || 0,
          maleWorkers || 0,
          femaleWorkers || 0,
          yogaWorkers || 0,
          specialPersonContacts || 0,
          totalHouses || 0,
          totalContactedHouses || 0,
          swayamsevakHouses || 0,
          supporterHouses || 0,
          neutralHouses || 0
        ]
      );
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        message: 'Hindu Sammelan form submitted successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Submit Hindu Sammelan form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    const tehsilId = searchParams.get('tehsilId');
    const mandalId = searchParams.get('mandalId');

    const client = await pool.connect();
    try {
      let query = `
        SELECT 
          hs.*,
          d.name as district_name,
          t.name as tehsil_name,
          m.name as mandal_name,
          u.name as user_name
        FROM hindu_sammelan hs
        JOIN districts d ON hs.district_id = d.id
        JOIN tehsils t ON hs.tehsil_id = t.id
        JOIN mandals m ON hs.mandal_id = m.id
        JOIN users u ON hs.user_id = u.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramCount = 1;

      if (districtId) {
        query += ` AND hs.district_id = $${paramCount}`;
        params.push(districtId);
        paramCount++;
      }

      if (tehsilId) {
        query += ` AND hs.tehsil_id = $${paramCount}`;
        params.push(tehsilId);
        paramCount++;
      }

      if (mandalId) {
        query += ` AND hs.mandal_id = $${paramCount}`;
        params.push(mandalId);
        paramCount++;
      }

      query += ' ORDER BY hs.created_at DESC';

      const result = await client.query(query, params);
      return NextResponse.json({ events: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get Hindu Sammelan events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}