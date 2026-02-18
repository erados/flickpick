import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const slots = await prisma.timeSlot.findMany({
    include: { votes: true },
    orderBy: [{ proposedDate: 'asc' }, { proposedTime: 'asc' }],
  })
  return NextResponse.json(slots)
}

export async function POST(req: Request) {
  const { proposedDate, proposedTime, proposedBy } = await req.json()
  if (!proposedDate || !proposedTime || !proposedBy) {
    return NextResponse.json({ error: 'all fields required' }, { status: 400 })
  }
  const slot = await prisma.timeSlot.create({
    data: { proposedDate, proposedTime, proposedBy },
  })
  return NextResponse.json(slot)
}
