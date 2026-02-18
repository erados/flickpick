'use client'

import { useState, useEffect, useCallback } from 'react'

type Vote = { id: string; voterName: string }
type Movie = {
  id: string; title: string; titleEn: string | null
  imageUrl: string | null; addedBy: string; votes: Vote[]
}
type TimeSlot = {
  id: string; proposedDate: string; proposedTime: string
  proposedBy: string; votes: Vote[]
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [voterName, setVoterName] = useState('')
  const [showAddMovie, setShowAddMovie] = useState(false)
  const [showAddTime, setShowAddTime] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTitleEn, setNewTitleEn] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [loading, setLoading] = useState(true)
  const [seeded, setSeeded] = useState(false)

  // Persist voter name
  useEffect(() => {
    const saved = localStorage.getItem('flickpick-name')
    if (saved) setVoterName(saved)
  }, [])

  const saveName = (name: string) => {
    setVoterName(name)
    localStorage.setItem('flickpick-name', name)
  }

  const fetchData = useCallback(async () => {
    const [moviesRes, slotsRes] = await Promise.all([
      fetch('/api/movies'), fetch('/api/timeslots'),
    ])
    setMovies(await moviesRes.json())
    setTimeSlots(await slotsRes.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    // Seed on first load
    if (!seeded) {
      fetch('/api/seed', { method: 'POST' }).then(() => {
        setSeeded(true)
        fetchData()
      })
    }
  }, [seeded, fetchData])

  // Poll every 5s for real-time feel
  useEffect(() => {
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  const voteMovie = async (movieId: string) => {
    if (!voterName.trim()) { alert('이름을 먼저 입력해주세요! 👆'); return }
    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId, voterName: voterName.trim() }),
    })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error)
      return
    }
    fetchData()
  }

  const voteTime = async (slotId: string) => {
    if (!voterName.trim()) { alert('이름을 먼저 입력해주세요! 👆'); return }
    await fetch('/api/timevotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId, voterName: voterName.trim() }),
    })
    fetchData()
  }

  const addMovie = async () => {
    if (!newTitle.trim() || !voterName.trim()) return
    await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, titleEn: newTitleEn || null, addedBy: voterName.trim() }),
    })
    setNewTitle(''); setNewTitleEn(''); setShowAddMovie(false)
    fetchData()
  }

  const addTimeSlot = async () => {
    if (!newDate || !newTime || !voterName.trim()) return
    await fetch('/api/timeslots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposedDate: newDate, proposedTime: newTime, proposedBy: voterName.trim() }),
    })
    setNewDate(''); setNewTime(''); setShowAddTime(false)
    fetchData()
  }

  const maxVotes = Math.max(1, ...movies.map(m => m.votes.length))
  const topMovie = movies.length > 0 ? [...movies].sort((a, b) => b.votes.length - a.votes.length)[0] : null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl animate-pulse">🎬 Loading FlickPick...</div>
      </div>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          🎬 FlickPick
        </h1>
        <p className="text-gray-400 text-lg">영화의 밤 투표</p>
        {topMovie && topMovie.votes.length > 0 && (
          <div className="mt-4 bg-violet-900/30 rounded-xl p-4 border border-violet-700/50">
            <p className="text-sm text-violet-300">🏆 현재 1위</p>
            <p className="text-xl font-bold text-violet-100">{topMovie.title}</p>
            <p className="text-sm text-violet-400">{topMovie.votes.length}표</p>
          </div>
        )}
      </div>

      {/* Name Input */}
      <div className="mb-8 bg-gray-900/80 rounded-xl p-4 border border-gray-800">
        <label className="block text-sm text-gray-400 mb-2">👤 내 이름</label>
        <input
          type="text"
          value={voterName}
          onChange={(e) => saveName(e.target.value)}
          placeholder="이름을 입력하세요"
          className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 border border-gray-700 focus:border-violet-500 focus:outline-none text-lg"
        />
        {voterName && (
          <p className="text-xs text-gray-500 mt-2">
            투표한 영화: {movies.filter(m => m.votes.some(v => v.voterName === voterName.trim())).length}/3
          </p>
        )}
      </div>

      {/* Movie List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">🍿 영화 목록</h2>
          <button
            onClick={() => setShowAddMovie(!showAddMovie)}
            className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + 영화 추가
          </button>
        </div>

        {showAddMovie && (
          <div className="bg-gray-900/80 rounded-xl p-4 mb-4 border border-gray-800 space-y-3">
            <input
              type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              placeholder="영화 제목 (한국어)"
              className="w-full bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 focus:border-violet-500 focus:outline-none"
            />
            <input
              type="text" value={newTitleEn} onChange={(e) => setNewTitleEn(e.target.value)}
              placeholder="English title (optional)"
              className="w-full bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 focus:border-violet-500 focus:outline-none"
            />
            <button onClick={addMovie}
              className="w-full bg-violet-600 hover:bg-violet-700 py-2 rounded-lg font-medium transition">
              추가하기
            </button>
          </div>
        )}

        <div className="space-y-3">
          {movies.map((movie) => {
            const voted = movie.votes.some(v => v.voterName === voterName.trim())
            const pct = maxVotes > 0 ? (movie.votes.length / maxVotes) * 100 : 0
            return (
              <div key={movie.id}
                className={`card-glow rounded-xl p-4 border cursor-pointer transition-all ${
                  voted ? 'bg-violet-900/40 border-violet-500' : 'bg-gray-900/80 border-gray-800 hover:border-gray-600'
                }`}
                onClick={() => voteMovie(movie.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{movie.title}</h3>
                    {movie.titleEn && <p className="text-sm text-gray-400">{movie.titleEn}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${voted ? 'text-violet-300' : 'text-gray-400'}`}>
                      {movie.votes.length}
                    </span>
                    <span className="text-xl">{voted ? '✅' : '🎬'}</span>
                  </div>
                </div>
                {/* Vote bar */}
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="vote-bar h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full"
                    style={{ width: `${pct}%` }} />
                </div>
                {movie.votes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {movie.votes.map(v => v.voterName).join(', ')}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">📅 날짜 투표</h2>
          <button
            onClick={() => setShowAddTime(!showAddTime)}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + 시간 추가
          </button>
        </div>

        {showAddTime && (
          <div className="bg-gray-900/80 rounded-xl p-4 mb-4 border border-gray-800 space-y-3">
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 focus:border-emerald-500 focus:outline-none" />
            <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 border border-gray-700 focus:border-emerald-500 focus:outline-none" />
            <button onClick={addTimeSlot}
              className="w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg font-medium transition">
              추가하기
            </button>
          </div>
        )}

        {timeSlots.length === 0 ? (
          <p className="text-gray-500 text-center py-4">아직 제안된 날짜가 없어요</p>
        ) : (
          <div className="space-y-3">
            {timeSlots.map((slot) => {
              const voted = slot.votes.some(v => v.voterName === voterName.trim())
              return (
                <div key={slot.id}
                  className={`card-glow rounded-xl p-4 border cursor-pointer transition-all ${
                    voted ? 'bg-emerald-900/40 border-emerald-500' : 'bg-gray-900/80 border-gray-800 hover:border-gray-600'
                  }`}
                  onClick={() => voteTime(slot.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">
                        {new Date(slot.proposedDate + 'T00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                      </p>
                      <p className="text-emerald-400">{slot.proposedTime}</p>
                      <p className="text-xs text-gray-500">제안: {slot.proposedBy}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${voted ? 'text-emerald-300' : 'text-gray-400'}`}>
                        {slot.votes.length}
                      </span>
                      <span className="text-xl">{voted ? '✅' : '📅'}</span>
                    </div>
                  </div>
                  {slot.votes.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {slot.votes.map(v => v.voterName).join(', ')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 text-sm py-8">
        <p>FlickPick 🎬 Made with 💜</p>
        <p className="mt-1">영화 클릭 = 투표 / 다시 클릭 = 취소</p>
      </div>
    </main>
  )
}
