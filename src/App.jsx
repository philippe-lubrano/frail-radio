import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

const playlist = [
  { title: 'Midnight Drive', file: '/musique/midnight-drive.wav' },
  { title: 'Neon Lights', file: '/musique/neon-lights.wav' },
  { title: 'Ocean Breeze', file: '/musique/ocean-breeze.wav' },
  { title: 'Sunset Vibes', file: '/musique/sunset-vibes.wav' },
  { title: 'Urban Dreams', file: '/musique/urban-dreams.wav' },
]

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function App() {
  const [shuffledPlaylist, setShuffledPlaylist] = useState(() =>
    shuffleArray(playlist)
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const audioRef = useRef(null)
  const progressRef = useRef(null)

  const currentTrack = shuffledPlaylist[currentIndex]

  const playNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= shuffledPlaylist.length - 1) {
        const newShuffled = shuffleArray(playlist)
        setShuffledPlaylist(newShuffled)
        return 0
      }
      return prev + 1
    })
  }, [shuffledPlaylist.length])

  const playPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return shuffledPlaylist.length - 1
      return prev - 1
    })
  }, [shuffledPlaylist.length])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.src = currentTrack.file
    audio.load()
    if (isPlaying) {
      audio.play().catch(() => {})
    }
  }, [currentTrack, isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration)
    const onEnded = () => playNext()

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
    }
  }, [playNext])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  const handleProgressClick = (e) => {
    const audio = audioRef.current
    const bar = progressRef.current
    if (!audio || !bar || !duration) return

    const rect = bar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, x / rect.width))
    audio.currentTime = percent * duration
  }

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value))
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="app">
      <video
        className="video-bg"
        src="https://cdn.pixabay.com/video/2020/02/07/32070-390426400_large.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="overlay" />

      <audio ref={audioRef} preload="metadata" />

      <div className="player-panel">
        <div className="player-header">
          <span className="badge live-badge">
            <span className="live-dot" />
            Frail Radio
          </span>
          <span className="badge track-badge">
            {currentIndex + 1} / {shuffledPlaylist.length}
          </span>
        </div>

        <h1 className="track-title">{currentTrack.title}</h1>
        <p className="track-subtitle">
          Lecture aléatoire en boucle — Détendez-vous et profitez de la musique.
        </p>

        <div className="playlist-box">
          <span className="playlist-label">Playlist</span>
          <div className="playlist-tracks">
            {shuffledPlaylist.map((track, i) => (
              <button
                key={`${track.file}-${i}`}
                className={`playlist-track ${i === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentIndex(i)
                  setIsPlaying(true)
                }}
              >
                <span className="playlist-track-icon">
                  {i === currentIndex && isPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="4" y="2" width="6" height="20" rx="1" />
                      <rect x="14" y="2" width="6" height="20" rx="1" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </span>
                <span className="playlist-track-name">{track.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="controls">
          <div className="controls-buttons">
            <button
              className="control-btn"
              onClick={playPrev}
              aria-label="Précédent"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
              </svg>
            </button>
            <button
              className="control-btn play-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Lecture'}
            >
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              className="control-btn"
              onClick={playNext}
              aria-label="Suivant"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          <div className="progress-section">
            <span className="time">{formatTime(currentTime)}</span>
            <div
              className="progress-bar"
              ref={progressRef}
              onClick={handleProgressClick}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="progress-bg" />
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
              <div
                className="progress-thumb"
                style={{ left: `${progress}%` }}
              />
            </div>
            <span className="time">{formatTime(duration)}</span>
          </div>

          <div className="volume-section">
            <svg
              className="volume-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {volume === 0 ? (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              ) : volume < 0.5 ? (
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              )}
            </svg>
            <input
              type="range"
              className="volume-slider"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
