import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../../lib/auth';
import pool from '../../../../../lib/db';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admin can delete users' },
        { status: 403 }
      );
    }

    // Properly await the params promise
    const { id: id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Check if user exists
      const userResult = await client.query('SELECT id, role FROM users WHERE id = $1', [id]);
      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Prevent deletion of super admin users
      if (userResult.rows[0].role === 'super_admin') {
        return NextResponse.json(
          { error: 'Cannot delete super admin user' },
          { status: 403 }
        );
      }

      // Delete user
      await client.query('DELETE FROM users WHERE id = $1', [id]);
    } finally {
      client.release();
    }

    return NextResponse.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}