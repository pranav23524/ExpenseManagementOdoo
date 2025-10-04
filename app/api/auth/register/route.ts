import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/server/config/database';
import { User } from '@/server/models/User';
import { Company } from '@/server/models/Company';
import { config } from '@/server/config/env';

const JWT_SECRET = config.jwt.secret;

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password, name, role, companyName, currency, approvalThreshold } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    let companyId = '';
    let companyNameFinal = companyName || 'Default Company';

    // If admin, create company
    if (role === 'admin' && companyName) {
      const company = new Company({
        name: companyName,
        currency: currency || 'USD',
        approvalThreshold: approvalThreshold || 1000
      });
      await company.save();
      companyId = company._id.toString();
    } else {
      // For non-admin users, use a default company or require companyId
      const defaultCompany = await Company.findOne();
      if (defaultCompany) {
        companyId = defaultCompany._id.toString();
        companyNameFinal = defaultCompany.name;
      } else {
        return NextResponse.json(
          { error: 'No company found. Please contact an administrator.' },
          { status: 400 }
        );
      }
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      companyId,
      companyName: companyNameFinal
    });

    await user.save();

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

    return NextResponse.json({
      user: userData,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
