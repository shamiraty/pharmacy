import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const categories = query('SELECT * FROM medicine_categories ORDER BY name');

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const result: any = query(
      'INSERT INTO medicine_categories (name, description) VALUES (?, ?)',
      [name, description]
    );

    return NextResponse.json({
      success: true,
      message: 'Category added successfully',
      id: result[0].insertId,
    });
  } catch (error: any) {
    console.error('Error adding category:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
