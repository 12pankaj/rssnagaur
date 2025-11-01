import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, updateUserRole, createUser, getUserByEmail, updateUserDetails, deleteUser } from '../../../../lib/auth';
import { verifyToken } from '../../../../lib/auth';
import pool from '../../../../lib/db';

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
    if (decoded.role !== 'super_admin' && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
        { error: 'Only super admin can update user roles' },
        { status: 403 }
      );
    }

    const { userId, role } = await request.json();
    
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    // Check if trying to change super admin role
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT role FROM users WHERE id = $1', [userId]);
      if (result.rows[0]?.role === 'super_admin' && role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Cannot change role of super admin user' },
          { status: 403 }
        );
      }
    } finally {
      client.release();
    }

    await updateUserRole(userId, role);
    
    return NextResponse.json({
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    if (decoded.role !== 'super_admin' && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { name, mobile, email, password, role } = await request.json();
    
    if (!name || !mobile || !password) {
      return NextResponse.json(
        { error: 'Name, mobile, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(mobile);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this mobile number already exists' },
        { status: 400 }
      );
    }

    // Only super admin can create super admin users
    if (role === 'super_admin' && decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admin can create super admin users' },
        { status: 403 }
      );
    }

    const newUser = await createUser(name, mobile, password, email, role);
    
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        mobile: newUser.mobile,
        email: newUser.email,
        role: newUser.role,
        is_verified: newUser.is_verified
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'super_admin' && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id, name, mobile, email, password, role } = await request.json();
    
    if (!id || !name || !mobile) {
      return NextResponse.json(
        { error: 'User ID, name, and mobile are required' },
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

      // Check permissions
      const userRole = userResult.rows[0].role;
      // Only super admin can modify super admin users
      if (userRole === 'super_admin' && decoded.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Only super admin can modify super admin users' },
          { status: 403 }
        );
      }

      // Only super admin can assign super admin role
      if (role === 'super_admin' && decoded.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Only super admin can assign super admin role' },
          { status: 403 }
        );
      }

      // Update user using the new function
      await updateUserDetails(id, name, mobile, email || null, password || null, role);
    } finally {
      client.release();
    }

    return NextResponse.json({
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Check if user exists
      const userResult = await client.query('SELECT id, role FROM users WHERE id = $1', [userId]);
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

      // Delete user using the new function
      await deleteUser(parseInt(userId));
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