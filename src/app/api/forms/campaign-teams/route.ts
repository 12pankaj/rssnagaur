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

    const { teams } = await request.json();
    
    if (!teams || !Array.isArray(teams) || teams.length === 0) {
      return NextResponse.json(
        { error: 'Teams data is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const team of teams) {
        const { 
          districtId, 
          tehsilId, 
          mandalId, 
          location,
          teamNumber,
          teamLeader,
          leaderPhone,
          assistantLeader,
          assistantPhone,
          member1,
          member1Phone,
          member2,
          member2Phone,
          member3,
          member3Phone
        } = team;
        
        if (!districtId || !tehsilId || !mandalId) {
          throw new Error('Required location fields missing');
        }

        await client.query(
          `INSERT INTO campaign_teams (
            user_id, district_id, tehsil_id, mandal_id, location, team_number,
            team_leader, leader_phone, assistant_leader, assistant_phone,
            member1, member1_phone, member2, member2_phone, member3, member3_phone
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            decoded.id, districtId, tehsilId, mandalId, location, teamNumber,
            teamLeader, leaderPhone, assistantLeader, assistantPhone,
            member1, member1Phone, member2, member2Phone, member3, member3Phone
          ]
        );
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        message: 'Campaign teams submitted successfully',
        count: teams.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Submit campaign teams error:', error);
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
          ct.*,
          d.name as district_name,
          t.name as tehsil_name,
          m.name as mandal_name,
          u.name as user_name
        FROM campaign_teams ct
        JOIN districts d ON ct.district_id = d.id
        JOIN tehsils t ON ct.tehsil_id = t.id
        JOIN mandals m ON ct.mandal_id = m.id
        JOIN users u ON ct.user_id = u.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramCount = 1;

      if (districtId) {
        query += ` AND ct.district_id = $${paramCount}`;
        params.push(districtId);
        paramCount++;
      }

      if (tehsilId) {
        query += ` AND ct.tehsil_id = $${paramCount}`;
        params.push(tehsilId);
        paramCount++;
      }

      if (mandalId) {
        query += ` AND ct.mandal_id = $${paramCount}`;
        params.push(mandalId);
        paramCount++;
      }

      query += ' ORDER BY ct.created_at DESC';

      const result = await client.query(query, params);
      return NextResponse.json({ teams: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get campaign teams error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}