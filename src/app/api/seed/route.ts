import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const INITIAL_MOVIES = [
  { title: '드래곤 길들이기 2', titleEn: 'How to Train Your Dragon 2', description: '히컵이 아버지와 드래곤 군대를 이끄는 악당에 맞서 싸운다' },
  { title: '드래곤 길들이기 3', titleEn: 'How to Train Your Dragon 3', description: '투슬리스가 짝을 만나고 드래곤들의 숨겨진 세계를 찾아 떠난다' },
  { title: '호텔 트란실바니아', titleEn: 'Hotel Transylvania', description: '드라큘라가 운영하는 몬스터 전용 호텔에 인간 남자가 찾아온다' },
  { title: '해피 피트 2', titleEn: 'Happy Feet Two', description: '노래 못하는 펭귄 멈블의 아들이 춤도 노래도 못해서 방황한다' },
  { title: '하늘에서 음식이 내린다면', titleEn: 'Cloudy with a Chance of Meatballs', description: '발명가가 만든 기계에서 음식이 하늘에서 비처럼 쏟아진다' },
  { title: '미 비포 유', titleEn: 'Me Before You', description: '사지마비 부자 남자와 그를 돌보는 밝은 여자의 사랑 이야기' },
  { title: '앵그리버드', titleEn: 'The Angry Birds Movie', description: '화 잘 내는 새 레드가 알을 훔친 초록 돼지들에게 복수하러 간다' },
  { title: '어 밀리언 마일즈 어웨이', titleEn: 'A Million Miles Away', description: '멕시코 이민자 농부 아들이 NASA 우주비행사가 되는 실화' },
  { title: '테넷', titleEn: 'Tenet', description: '시간을 거꾸로 되돌리는 기술로 제3차 세계대전을 막는 스파이 액션' },
  { title: '미스터&미세스 스미스', titleEn: 'Mr. & Mrs. Smith', description: '서로 비밀 암살자인 부부가 상대방을 죽이라는 임무를 받는다' },
]

export async function POST() {
  const existing = await prisma.movie.count()
  if (existing > 0) {
    // Update descriptions for existing movies that don't have one
    for (const m of INITIAL_MOVIES) {
      await prisma.movie.updateMany({
        where: { title: m.title, description: null },
        data: { description: m.description },
      })
    }
    return NextResponse.json({ message: 'Already seeded, updated descriptions', count: existing })
  }

  await prisma.movie.createMany({
    data: INITIAL_MOVIES.map((m) => ({
      title: m.title,
      titleEn: m.titleEn,
      description: m.description,
      addedBy: 'System',
    })),
  })

  return NextResponse.json({ message: 'Seeded!', count: INITIAL_MOVIES.length })
}
