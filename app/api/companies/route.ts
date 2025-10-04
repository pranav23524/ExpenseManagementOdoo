import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/config/database';
import { Company } from '@/server/models/Company';
import jwt from 'jsonwebtoken';
import { config } from '@/server/config/env';

const JWT_SECRET = config.jwt.secret;

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

// GET /api/companies - Get company information
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const company = await Company.findById(token.companyId);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ company });

  } catch (error) {
    console.error('Get company error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/companies - Update company information
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const token = verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can update company
    if (token.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, currency, approvalThreshold } = await request.json();

    const company = await Company.findById(token.companyId);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Update company fields
    if (name) company.name = name;
    if (currency) company.currency = currency;
    if (approvalThreshold !== undefined) company.approvalThreshold = approvalThreshold;

    await company.save();

    return NextResponse.json({
      message: 'Company updated successfully',
      company
    });

  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
