import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/config/database';
import { Expense } from '@/server/models/Expense';
import { User } from '@/server/models/User';
import jwt from 'jsonwebtoken';
import { config } from '@/server/config/env';

const JWT_SECRET = config.jwt.secret;

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  console.log('Authorization header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid authorization header found');
    return null;
  }
  
  const token = authHeader.substring(7);
  console.log('Token extracted:', token.substring(0, 20) + '...');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Token verified successfully:', decoded);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// GET /api/expenses - Get all expenses for a user or all expenses for managers/admins
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/expenses - Starting request');
    await connectDB();
    console.log('Database connected successfully');
    
    const token = verifyToken(request);
    if (!token) {
      console.log('No valid token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Token verified for user:', token.userId, 'role:', token.role);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let query: any = {};

    // If requesting specific user's expenses or user is employee, filter by userId
    if (userId || token.role === 'employee') {
      query.userId = userId || token.userId;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    console.log('Query:', query);
    const expenses = await Expense.find(query)
      .sort({ submittedAt: -1 })
      .populate('approvedBy', 'name email');

    console.log('Found expenses:', expenses.length);
    return NextResponse.json({ expenses });

  } catch (error) {
    console.error('Get expenses error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const token = verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let expenseData;
    try {
      expenseData = await request.json();
    } catch (error) {
      console.error('JSON parsing error:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    const { amount, currency, category, description, merchant, date, receiptUrl, receiptName } = expenseData;

    if (!amount || !category || !description || !merchant || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await User.findById(token.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const expense = new Expense({
      userId: token.userId,
      userName: user.name,
      amount,
      currency: currency || 'USD',
      category,
      description,
      merchant,
      date: new Date(date),
      status: 'pending',
      receiptUrl,
      receiptName,
      submittedAt: new Date()
    });

    await expense.save();

    return NextResponse.json({ 
      message: 'Expense created successfully',
      expense 
    });

  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
