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

    const { forms } = await request.json();
    
    if (!forms || !Array.isArray(forms) || forms.length === 0) {
      return NextResponse.json(
        { error: 'Forms data is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const form of forms) {
        const { districtId, tehsilId, mandalId, name, mobile, hobby, location } = form;
        
        if (!districtId || !tehsilId || !mandalId || !name || !mobile) {
          throw new Error('Required fields missing');
        }

        await client.query(
          `INSERT INTO grh_sampar_forms (user_id, district_id, tehsil_id, mandal_id, name, mobile, hobby, location) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [decoded.id, districtId, tehsilId, mandalId, name, mobile, hobby || '', location || '']
        );
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        message: 'Forms submitted successfully',
        count: forms.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Submit forms error:', error);
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
          gsf.*,
          d.name as district_name,
          t.name as tehsil_name,
          m.name as mandal_name,
          u.name as user_name
        FROM grh_sampar_forms gsf
        JOIN districts d ON gsf.district_id = d.id
        JOIN tehsils t ON gsf.tehsil_id = t.id
        JOIN mandals m ON gsf.mandal_id = m.id
        JOIN users u ON gsf.user_id = u.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramCount = 1;

      if (districtId) {
        query += ` AND gsf.district_id = $${paramCount}`;
        params.push(districtId);
        paramCount++;
      }

      if (tehsilId) {
        query += ` AND gsf.tehsil_id = $${paramCount}`;
        params.push(tehsilId);
        paramCount++;
      }

      if (mandalId) {
        query += ` AND gsf.mandal_id = $${paramCount}`;
        params.push(mandalId);
        paramCount++;
      }

      query += ' ORDER BY gsf.created_at DESC';

      const result = await client.query(query, params);
      return NextResponse.json({ forms: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get forms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
