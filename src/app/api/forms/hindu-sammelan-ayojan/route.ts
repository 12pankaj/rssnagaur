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
        const { 
          districtId, 
          tehsilId, 
          mandalId, 
          responsibility,
          name,
          biradari,
          location,
          phone
        } = form;
        
        if (!districtId || !tehsilId || !mandalId || !responsibility || !name || !phone) {
          throw new Error('Required fields missing');
        }

        await client.query(
          `INSERT INTO hindu_sammelan_ayojan (
            user_id, district_id, tehsil_id, mandal_id, 
            responsibility, name, biradari, location, phone
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            decoded.id, 
            districtId, 
            tehsilId, 
            mandalId, 
            responsibility, 
            name, 
            biradari || '', 
            location || '', 
            phone
          ]
        );
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        message: 'Hindu Sammelan Ayojan Samiti forms submitted successfully',
        count: forms.length
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Submit Hindu Sammelan Ayojan Samiti forms error:', error);
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
          hsa.*,
          d.name as district_name,
          t.name as tehsil_name,
          m.name as mandal_name,
          u.name as user_name
        FROM hindu_sammelan_ayojan hsa
        JOIN districts d ON hsa.district_id = d.id
        JOIN tehsils t ON hsa.tehsil_id = t.id
        JOIN mandals m ON hsa.mandal_id = m.id
        JOIN users u ON hsa.user_id = u.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramCount = 1;

      if (districtId) {
        query += ` AND hsa.district_id = $${paramCount}`;
        params.push(districtId);
        paramCount++;
      }

      if (tehsilId) {
        query += ` AND hsa.tehsil_id = $${paramCount}`;
        params.push(tehsilId);
        paramCount++;
      }

      if (mandalId) {
        query += ` AND hsa.mandal_id = $${paramCount}`;
        params.push(mandalId);
        paramCount++;
      }

      query += ' ORDER BY hsa.created_at DESC';

      const result = await client.query(query, params);
      return NextResponse.json({ forms: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get Hindu Sammelan Ayojan Samiti forms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}