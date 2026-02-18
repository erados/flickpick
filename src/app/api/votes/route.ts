import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { movieId, voterName } = await req.json()
  if (!movieId || !voterName) {
    return NextResponse.json({ error: 'movieId and voterName required' }, { status: 400 })
  }

  // Check how many votes this person already has
  const existingVotes = await prisma.movieVote.count({ where: { voterName } })
  
  // Check if already voted for this movie
  const alreadyVoted = await prisma.movieVote.findUnique({
    where: { movieId_voterName: { movieId, voterName } },
  })

  if (alreadyVoted) {
    // Toggle off - remove vote
    await prisma.movieVote.delete({ where: { id: alreadyVoted.id } })
    return NextResponse.json({ action: 'removed' })
  }

  if (existingVotes >= 3) {
    return NextResponse.json({ error: '최대 3개까지 투표할 수 있어요!' }, { status: 400 })
  }

  const vote = await prisma.movieVote.create({
    data: { movieId, voterName },
  })
  return NextResponse.json({ action: 'added', vote })
}
