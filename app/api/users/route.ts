import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const users: any = query(
      `SELECT id, full_name, email, role, status, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, email, password, role } = body;

    // Validate required fields
    if (!full_name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing: any = query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user (use email as username)
    query(
      `INSERT INTO users (username, full_name, email, password, role, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [email, full_name, email, hashedPassword, role]
    );

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, full_name, email, password, role, status } = body;

    if (!id || !full_name || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email exists for other users
    const existing: any = query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Update user
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query(
        `UPDATE users
         SET full_name = ?, email = ?, password = ?, role = ?, status = ?
         WHERE id = ?`,
        [full_name, email, hashedPassword, role, status || 'active', id]
      );
    } else {
      query(
        `UPDATE users
         SET full_name = ?, email = ?, role = ?, status = ?
         WHERE id = ?`,
        [full_name, email, role, status || 'active', id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Don't allow deleting the last admin
    const admins: any = query(
      `SELECT id FROM users WHERE role = 'admin'`
    );

    const userToDelete: any = query(
      `SELECT role FROM users WHERE id = ?`,
      [id]
    );

    if (userToDelete[0]?.role === 'admin' && admins.length === 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the last administrator' },
        { status: 400 }
      );
    }

    query('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
