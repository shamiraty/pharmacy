import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { checkRateLimit, recordFailedAttempt, resetAttempts } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const identifier = `${email}:${clientIp}`;

    // Check rate limit
    const rateLimitResult = checkRateLimit(identifier);

    if (!rateLimitResult.allowed) {
      const lockedMinutes = rateLimitResult.lockedUntil
        ? Math.ceil((rateLimitResult.lockedUntil - Date.now()) / 60000)
        : 30;

      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Account locked for ${lockedMinutes} minutes.`,
          lockedUntil: rateLimitResult.lockedUntil
        },
        { status: 429 }
      );
    }

    // Get user from database
    const users: any = query(
      'SELECT id, full_name, email, password, role, status FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      recordFailedAttempt(identifier);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'active') {
      recordFailedAttempt(identifier);
      return NextResponse.json(
        { success: false, error: 'Account is inactive' },
        { status: 401 }
      );
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      recordFailedAttempt(identifier);

      // Get updated rate limit info to show remaining attempts
      const updatedLimit = checkRateLimit(identifier);
      const errorMessage = updatedLimit.remainingAttempts !== undefined && updatedLimit.remainingAttempts > 0
        ? `Invalid email or password. ${updatedLimit.remainingAttempts} attempts remaining.`
        : 'Invalid email or password.';

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          remainingAttempts: updatedLimit.remainingAttempts
        },
        { status: 401 }
      );
    }

    // Successful login - reset rate limit attempts
    resetAttempts(identifier);

    // Log the login activity
    try {
      query(
        `INSERT INTO activity_logs (user_id, action, details, ip_address)
         VALUES (?, 'login', 'User logged in successfully', ?)`,
        [user.id, clientIp]
      );
    } catch (logError) {
      // Ignore logging errors in read-only environments (like Vercel)
      console.warn('Failed to log login activity (non-critical):', logError);
    }

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
