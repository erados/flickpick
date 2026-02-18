import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const THREE_HOURS = 3 * 60 * 60 * 1000

export async function GET() {
  // Auto-expire after 3 hours
  await prisma.nowPlaying.deleteMany({
    where: { startedAt: { lt: new Date(Date.now() - THREE_HOURS) } },
  })

  const current = await prisma.nowPlaying.findFirst({
    include: { movie: true },
    orderBy: { startedAt: 'desc' },
  })

  return NextResponse.json(current)
}

export async function POST(req: Request) {
  const { movieId, startedBy } = await req.json()
  if (!movieId || !startedBy) {
    return NextResponse.json({ error: 'movieId and startedBy required' }, { status: 400 })
  }

  // Clear any existing now playing
  await prisma.nowPlaying.deleteMany({})

  const np = await prisma.nowPlaying.create({
    data: { movieId, startedBy, viewers: [startedBy] },
    include: { movie: true },
  })

  return NextResponse.json(np)
}

export async function PUT(req: Request) {
  const { viewerName } = await req.json()
  if (!viewerName) {
    return NextResponse.json({ error: 'viewerName required' }, { status: 400 })
  }

  const current = await prisma.nowPlaying.findFirst()
  if (!current) {
    return NextResponse.json({ error: 'Nothing playing' }, { status: 404 })
  }

  const viewers = current.viewers.includes(viewerName)
    ? current.viewers
    : [...current.viewers, viewerName]

  const updated = await prisma.nowPlaying.update({
    where: { id: current.id },
    data: { viewers },
    include: { movie: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE() {
  await prisma.nowPlaying.deleteMany({})
  return NextResponse.json({ ok: true })
}
