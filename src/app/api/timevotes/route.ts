import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { slotId, voterName } = await req.json()
  if (!slotId || !voterName) {
    return NextResponse.json({ error: 'slotId and voterName required' }, { status: 400 })
  }

  const alreadyVoted = await prisma.timeVote.findUnique({
    where: { slotId_voterName: { slotId, voterName } },
  })

  if (alreadyVoted) {
    await prisma.timeVote.delete({ where: { id: alreadyVoted.id } })
    return NextResponse.json({ action: 'removed' })
  }

  const vote = await prisma.timeVote.create({
    data: { slotId, voterName },
  })
  return NextResponse.json({ action: 'added', vote })
}
