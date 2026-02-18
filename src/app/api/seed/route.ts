import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const INITIAL_MOVIES = [
  { title: '드래곤 길들이기 2', titleEn: 'How to Train Your Dragon 2' },
  { title: '드래곤 길들이기 3', titleEn: 'How to Train Your Dragon 3' },
  { title: '호텔 트란실바니아', titleEn: 'Hotel Transylvania' },
  { title: '해피 피트 2', titleEn: 'Happy Feet Two' },
  { title: '하늘에서 음식이 내린다면', titleEn: 'Cloudy with a Chance of Meatballs' },
  { title: '미 비포 유', titleEn: 'Me Before You' },
  { title: '앵그리버드', titleEn: 'The Angry Birds Movie' },
  { title: '어 밀리언 마일즈 어웨이', titleEn: 'A Million Miles Away' },
  { title: '테넷', titleEn: 'Tenet' },
  { title: '미스터&미세스 스미스', titleEn: 'Mr. & Mrs. Smith' },
]

export async function POST() {
  const existing = await prisma.movie.count()
  if (existing > 0) {
    return NextResponse.json({ message: 'Already seeded', count: existing })
  }

  await prisma.movie.createMany({
    data: INITIAL_MOVIES.map((m) => ({
      title: m.title,
      titleEn: m.titleEn,
      addedBy: 'System',
    })),
  })

  return NextResponse.json({ message: 'Seeded!', count: INITIAL_MOVIES.length })
}
