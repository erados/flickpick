import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const movies = await prisma.movie.findMany({
    include: { votes: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(movies)
}

export async function POST(req: Request) {
  const { title, titleEn, imageUrl, addedBy, description } = await req.json()
  if (!title || !addedBy) {
    return NextResponse.json({ error: 'title and addedBy required' }, { status: 400 })
  }
  const movie = await prisma.movie.create({
    data: { title, titleEn, imageUrl, addedBy, description: description || null },
  })
  return NextResponse.json(movie)
}
