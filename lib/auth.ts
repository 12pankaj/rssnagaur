import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  password: string;
  role: 'super_admin' | 'admin' | 'guest';
  is_verified: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, mobile: user.mobile, role: user.role },
    JWT_SECRET,
    { expiresIn: '365d' }
  );
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

export async function getUserByEmail(mobile: string): Promise<User | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, name, mobile,password, email, role, is_verified FROM users WHERE email = $1',
      [mobile]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createUser(name: string, mobile: string, password: string, email?: string, role: string = 'guest'): Promise<User> {
  const client = await pool.connect();
  try {
    const hashedPassword = await hashPassword(password);
    const result = await client.query(
      'INSERT INTO users (name, mobile, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, mobile, email, role, is_verified',
      [name, mobile, email, hashedPassword, role]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function updateUserRole(userId: number, role: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [role, userId]
    );
  } finally {
    client.release();
  }
}

export async function getAllUsers(): Promise<User[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, name, mobile, email, role, is_verified, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// New function to update user details
export async function updateUserDetails(userId: number, name: string, mobile: string, email: string | null, password: string | null, role: string): Promise<void> {
  const client = await pool.connect();
  try {
    let query = 'UPDATE users SET name = $1, mobile = $2, email = $3, role = $4, updated_at = CURRENT_TIMESTAMP';
    let params: any[] = [name, mobile, email, role];
    
    if (password) {
      const hashedPassword = await hashPassword(password);
      query += `, password = $${params.length + 1}`;
      params.push(hashedPassword);
    }
    
    query += ` WHERE id = $${params.length + 1}`;
    params.push(userId.toString());
    
    await client.query(query, params);
  } finally {
    client.release();
  }
}

// New function to delete a user
export async function deleteUser(userId: number): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM users WHERE id = $1', [userId.toString()]);
  } finally {
    client.release();
  }
}