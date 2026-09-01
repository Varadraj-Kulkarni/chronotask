import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validationFailedResponse, internalServerErrorResponse } from '@/lib/errors';
import { CreateCategorySchema } from '@/lib/validations/categories';

export async function GET() {
  const path = '/api/categories';
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
    });

    const response = categories.map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.name,
      color: c.color,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error('Error listing categories:', err);
    return internalServerErrorResponse(path);
  }
}

export async function POST(req: NextRequest) {
  const path = '/api/categories';
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return validationFailedResponse('Invalid JSON payload in request body.', path, {
      field: 'body',
      issue: 'Malformed JSON payload.',
    });
  }

  const parsed = CreateCategorySchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path.length > 0 ? issue.path.join('.') : 'body';
    return validationFailedResponse('Validation failed on one or more fields.', path, {
      field,
      issue: issue.message,
    });
  }

  const { name, color } = parsed.data;

  try {
    const category = await db.category.create({
      data: {
        userId: 'user-default',
        name,
        color: color ?? null,
      },
    });

    return NextResponse.json(
      {
        id: category.id,
        userId: category.userId,
        name: category.name,
        color: category.color,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating category:', err);
    return internalServerErrorResponse(path);
  }
}
