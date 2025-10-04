import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/server/config/database';
import { Expense } from '@/server/models/Expense';
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

// GET /api/expenses/[id] - Get a specific expense
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const token = verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expense = await Expense.findById(params.id).populate('approvedBy', 'name email');

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check if user can access this expense
    if (token.role === 'employee' && expense.userId !== token.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ expense });

  } catch (error) {
    console.error('Get expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - Update expense status (approve/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const token = verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only managers and admins can approve/reject
    if (token.role === 'employee') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    
    const { status, rejectionReason } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    const expense = await Expense.findById(params.id);
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Update expense
    expense.status = status;
    expense.approvedBy = token.userId;
    expense.approvedAt = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      expense.rejectionReason = rejectionReason;
    }

    await expense.save();

    return NextResponse.json({ 
      message: `Expense ${status} successfully`,
      expense 
    });

  } catch (error) {
    console.error('Update expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const token = verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expense = await Expense.findById(params.id);
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Only the expense owner or admin can delete
    if (expense.userId !== token.userId && token.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Expense.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Expense deleted successfully' });

  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
