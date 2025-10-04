import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/server/config/database';
import { User } from '@/server/models/User';
import { config } from '@/server/config/env';

const JWT_SECRET = config.jwt.secret;

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/auth/login - Starting request');
    await connectDB();
    console.log('Database connected successfully');
    
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('JSON parsing error:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { email, password } = body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    console.log('Looking for user with email:', email.toLowerCase());
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('User found:', user.email, 'role:', user.role);

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Password verified successfully');

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        companyId: user.companyId 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('JWT token generated');

    // Return user data without password
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      companyName: user.companyName,
      managerId: user.managerId
    };

    console.log('Login successful for user:', userData.email);
    return NextResponse.json({
      user: userData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
