'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

const GENRES = [
  { key: 'all', label: 'Tous les styles' },
  { key: 'liquid', label: 'Liquid' },
  { key: 'jumpUp', label: 'Jump Up' },
]

/**
 * Static playlist built from the files in /public.
 * In Next.js we cannot use import.meta.glob, so the tracks are listed explicitly.
 */
const playlist = [
  // ── Jump Up ─────────────────────
  { title: 'Ignition', file: '/jumpUp/Ignition.mp3', genre: 'jumpUp' },
  { title: 'Mapping the Void', file: '/jumpUp/Mapping the Void.mp3', genre: 'jumpUp' },
  { title: 'Overdrive', file: '/jumpUp/Overdrive.mp3', genre: 'jumpUp' },
  { title: 'The Breakdown', file: '/jumpUp/The Breakdown.mp3', genre: 'jumpUp' },
  { title: 'The Signal', file: '/jumpUp/The Signal.mp3', genre: 'jumpUp' },
  { title: 'The fault line', file: '/jumpUp/The fault line.mp3', genre: 'jumpUp' },
  // ── Liquid ──────────────────────
  { title: '3 AM Static', file: '/liquid/3 AM Static.mp3', genre: 'liquid' },
  { title: 'Alone', file: '/liquid/Alone.mp3', genre: 'liquid' },
  { title: 'An old friend', file: '/liquid/An old friend.mp3', genre: 'liquid' },
  { title: 'Broken', file: '/liquid/Broken.mp3', genre: 'liquid' },
  { title: 'Chemical Silence', file: '/liquid/Chemical Silence.mp3', genre: 'liquid' },
  { title: 'Concrete Forest', file: '/liquid/Concrete-Forest.mp3', genre: 'liquid' },
  { title: 'Finally Still', file: '/liquid/Finally-Still.mp3', genre: 'liquid' },
  { title: 'Leaving the Silent Prayer', file: '/liquid/Leaving-the-Silent-Prayer.mp3', genre: 'liquid' },
  { title: 'Lost in the cure', file: '/liquid/Lost-in-the-cure.mp3', genre: 'liquid' },
  { title: 'Social battery low', file: '/liquid/Social-battery-low.mp3', genre: 'liquid' },
  { title: 'The Glass Wall', file: '/liquid/The-Glass-Wall.mp3', genre: 'liquid' },
  { title: 'The Loop', file: '/liquid/The-Loop.mp3', genre: 'liquid' },
  { title: 'The Unlived Life', file: '/liquid/The-Unlived-Life.mp3', genre: 'liquid' },
  { title: 'The silent room', file: '/liquid/The-silent-room.mp3', genre: 'liquid' },
  { title: 'Velvet cage', file: '/liquid/Velvet-cage.mp3', genre: 'liquid' },
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

function computePerimeter(W, H, r) {
  return 2 * (W - 2 * r) + 2 * (H - 2 * r) + 2 * Math.PI * r
}

function App() {
  const [genre, setGenre] = useState('all')
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
  const canvasRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const animFrameRef = useRef(null)
  const panelRef = useRef(null)
  const [panelSize, setPanelSize] = useState({ w: 420, h: 500, r: 18 })
  const prevVolRef = useRef(0.8)

  const filteredPlaylist = genre === 'all'
    ? playlist
    : playlist.filter((t) => t.genre === genre)

  // Re-shuffle when genre changes
  useEffect(() => {
    const newShuffled = shuffleArray(filteredPlaylist)
    setShuffledPlaylist(newShuffled)
    setCurrentIndex(0)
  }, [genre])

  const currentTrack = shuffledPlaylist[currentIndex]
  const hasTracks = shuffledPlaylist.length > 0

  const playNext = useCallback(() => {
    if (!shuffledPlaylist.length) return

    setCurrentIndex((prev) => {
      if (prev >= shuffledPlaylist.length - 1) {
        const newShuffled = shuffleArray(filteredPlaylist)
        setShuffledPlaylist(newShuffled)
        return 0
      }
      return prev + 1
    })
  }, [shuffledPlaylist.length, filteredPlaylist])

  const playPrev = useCallback(() => {
    if (!shuffledPlaylist.length) return

    setCurrentIndex((prev) => {
      if (prev <= 0) return shuffledPlaylist.length - 1
      return prev - 1
    })
  }, [shuffledPlaylist.length])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    audio.src = currentTrack.file
    audio.load()
    if (isPlaying) {
      audio.play().catch(() => {})
    }
  }, [currentTrack])

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

  // Media Session API – next/previous from headset/lock screen
  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: 'Frail Radio',
    })

    navigator.mediaSession.setActionHandler('previoustrack', playPrev)
    navigator.mediaSession.setActionHandler('nexttrack', playNext)

    return () => {
      navigator.mediaSession.setActionHandler('previoustrack', null)
      navigator.mediaSession.setActionHandler('nexttrack', null)
    }
  }, [currentTrack, playNext, playPrev])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Track panel dimensions for SVG border
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const measure = () => {
      const computed = getComputedStyle(panel)
      const br = parseFloat(computed.borderRadius) || 18
      setPanelSize({ w: panel.offsetWidth, h: panel.offsetHeight, r: br })
    }
    const ro = new ResizeObserver(measure)
    ro.observe(panel)
    measure()
    return () => ro.disconnect()
  }, [])

  const strokeW = 6
  const s = strokeW / 2
  const rectX = s
  const rectY = s
  const rectW = panelSize.w - strokeW
  const rectH = panelSize.h - strokeW
  const rectR = Math.max(0, panelSize.r - s)
  const borderPerimeter = computePerimeter(rectW, rectH, rectR)
  // Distance from rect path start (top-left) to bottom center, going clockwise
  const startShift = 1.5 * (rectW - 2 * rectR) + (rectH - 2 * rectR) + Math.PI * rectR

  // Lazy init Web Audio API (must be called from a user gesture)
  const initAudioContext = useCallback(() => {
    const audio = audioRef.current
    if (!audio || audioCtxRef.current) return

    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    audioCtxRef.current = ctx
    const source = ctx.createMediaElementSource(audio)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    analyser.connect(ctx.destination)
    sourceRef.current = source
    analyserRef.current = analyser
  }, [])

  // Circular visualizer drawing loop
  useEffect(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    // Smoothed radii for organic deformation
    const smoothRadii = new Float32Array(bufferLength).fill(0)
    let time = 0

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw)
      time += 0.012

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      const W = rect.width
      const H = rect.height
      const cx = W / 2
      const cy = H / 2
      const baseRadius = Math.min(W, H) * 0.22
      const maxBar = Math.min(W, H) * 0.25
      const deformAmount = baseRadius * 0.7

      ctx.clearRect(0, 0, W, H)
      analyser.getByteFrequencyData(dataArray)

      const bars = bufferLength
      const angleStep = (Math.PI * 2) / bars

      // Remap frequency bins so they're spread evenly around the circle
      const remapped = new Float32Array(bars)
      const usableBins = Math.floor(bufferLength * 0.75)
      for (let i = 0; i < bars; i++) {
        const srcIdx = Math.floor((i / bars) * usableBins)
        remapped[i] = dataArray[srcIdx] / 255
      }

      // Smooth the frequency data for organic blob deformation
      for (let i = 0; i < bars; i++) {
        const target = remapped[i]
        smoothRadii[i] += (target - smoothRadii[i]) * 0.32
      }

      // Build deformed radius per bar
      const deformedRadii = new Float32Array(bars)
      for (let i = 0; i < bars; i++) {
        let sum = 0
        const spread = 3
        for (let j = -spread; j <= spread; j++) {
          sum += smoothRadii[(i + j + bars) % bars]
        }
        const avgVal = sum / (spread * 2 + 1)
        const wobble = Math.sin(time * 4.5 + i * 0.25) * 0.05 +
                       Math.sin(time * 2.3 + i * 0.15) * 0.04 +
                       Math.cos(time * 6.1 + i * 0.4) * 0.03 +
                       Math.sin(time * 1.1 + i * 0.08) * 0.02
        deformedRadii[i] = baseRadius - avgVal * deformAmount + wobble * baseRadius
      }

      // Draw deformed blob outline
      ctx.beginPath()
      for (let i = 0; i <= bars; i++) {
        const idx = i % bars
        const angle = idx * angleStep - Math.PI / 2
        const r = deformedRadii[idx]
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      const avg = remapped.reduce((a, b) => a + b, 0) / bars
      ctx.strokeStyle = `rgba(110, 231, 183, ${0.25 + avg * 0.5})`
      ctx.lineWidth = 2
      ctx.shadowColor = 'rgba(110, 231, 183, 0.6)'
      ctx.shadowBlur = 12 + avg * 20
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw frequency bars from deformed surface (outward)
      for (let i = 0; i < bars; i++) {
        const value = remapped[i]
        const barHeight = value * maxBar + 2
        const angle = i * angleStep - Math.PI / 2
        const r = deformedRadii[i]

        const x1 = cx + Math.cos(angle) * r
        const y1 = cy + Math.sin(angle) * r
        const x2 = cx + Math.cos(angle) * (r + barHeight)
        const y2 = cy + Math.sin(angle) * (r + barHeight)

        const t = i / bars
        const cr = Math.round(110 + t * (59 - 110))
        const cg = Math.round(231 + t * (130 - 231))
        const cb = Math.round(183 + t * (246 - 183))
        const alpha = 0.6 + value * 0.4

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`
        ctx.lineWidth = Math.max(2, (Math.PI * 2 * baseRadius) / bars * 0.7)
        ctx.lineCap = 'round'
        ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, ${0.5 + value * 0.5})`
        ctx.shadowBlur = 4 + value * 14
        ctx.stroke()
      }
      ctx.shadowBlur = 0

      // Inner glow blob
      const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.1, cx, cy, baseRadius * 1.1)
      glowGrad.addColorStop(0, `rgba(110, 231, 183, ${0.12 + avg * 0.25})`)
      glowGrad.addColorStop(0.5, `rgba(59, 130, 246, ${0.06 + avg * 0.15})`)
      glowGrad.addColorStop(1, 'rgba(59, 130, 246, 0)')
      ctx.beginPath()
      for (let i = 0; i <= bars; i++) {
        const idx = i % bars
        const angle = idx * angleStep - Math.PI / 2
        const r = deformedRadii[idx] * 0.98
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fillStyle = glowGrad
      ctx.fill()
    }

    draw()
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlaying])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    initAudioContext()
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume()
    }

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

  // Get volume fraction from cursor position on the panel border
  const getVolumeFromPos = useCallback((clientX, clientY) => {
    const panel = panelRef.current
    if (!panel) return null
    const rect = panel.getBoundingClientRect()
    const px = clientX - rect.left
    const py = clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const angle = Math.atan2(py - cy, px - cx)
    let norm = Math.PI / 2 - angle
    if (norm < 0) norm += 2 * Math.PI
    return norm / (2 * Math.PI)
  }, [])

  const handleBorderPointerDown = useCallback((e) => {
    const panel = panelRef.current
    if (!panel) return
    const rect = panel.getBoundingClientRect()
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    const px = cx - rect.left
    const py = cy - rect.top
    const edgeDist = Math.min(px, py, rect.width - px, rect.height - py)
    if (edgeDist > 18) return

    e.preventDefault()
    e.stopPropagation()

    const vol = getVolumeFromPos(cx, cy)
    if (vol !== null) {
      setVolume(Math.max(0, Math.min(1, vol)))
      prevVolRef.current = vol
    }

    const onMove = (ev) => {
      ev.preventDefault()
      const mx = ev.touches ? ev.touches[0].clientX : ev.clientX
      const my = ev.touches ? ev.touches[0].clientY : ev.clientY
      const rawVol = getVolumeFromPos(mx, my)
      if (rawVol !== null) {
        const diff = rawVol - prevVolRef.current
        const newVol = Math.abs(diff) > 0.4
          ? (diff > 0 ? 0 : 1)
          : rawVol
        setVolume(Math.max(0, Math.min(1, newVol)))
        prevVolRef.current = rawVol
      }
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onUp)
  }, [getVolumeFromPos])

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="app">
      <video
        className="video-bg"
        src="/video/332544.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="overlay" />

      <canvas ref={canvasRef} className="visualizer-canvas" />

      <audio ref={audioRef} preload="metadata" />

      <div
        className="player-panel"
        ref={panelRef}
        onMouseDown={handleBorderPointerDown}
        onTouchStart={handleBorderPointerDown}
      >
        <svg
          className="volume-border-svg"
          viewBox={`0 0 ${panelSize.w} ${panelSize.h}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vol-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <filter id="vol-glow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect
            x={rectX}
            y={rectY}
            width={rectW}
            height={rectH}
            rx={rectR}
            ry={rectR}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeW}
          />
          <rect
            x={rectX}
            y={rectY}
            width={rectW}
            height={rectH}
            rx={rectR}
            ry={rectR}
            fill="none"
            stroke="url(#vol-grad)"
            strokeWidth={strokeW}
            strokeDasharray={`${volume * borderPerimeter} ${(1 - volume) * borderPerimeter}`}
            strokeDashoffset={volume * borderPerimeter - startShift}
            filter="url(#vol-glow)"
            style={{ transition: 'stroke-dasharray 0.15s ease-out, stroke-dashoffset 0.15s ease-out' }}
          />
        </svg>

        <div className="player-header">
          <span className="badge live-badge">
            <span className="live-dot" />
            Frail Radio
          </span>
          <span className="badge track-badge">
            {hasTracks ? currentIndex + 1 : 0} / {shuffledPlaylist.length}
          </span>
          <span
            className="badge volume-badge"
            onClick={(e) => {
              e.stopPropagation()
              setVolume(volume === 0 ? 0.8 : 0)
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              {volume === 0 ? (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              )}
            </svg>
            {Math.round(volume * 100)}%
          </span>
        </div>

        <h1 className="track-title">{currentTrack?.title ?? 'Aucun titre disponible'}</h1>
        <p className="track-subtitle">
          Lecture aléatoire en boucle — Détendez-vous et profitez de la musique.
        </p>

        <div className="playlist-box">
          <div className="playlist-header">
            <span className="playlist-label">Playlist</span>
            <div className="genre-selector">
              {GENRES.map((g) => (
                <button
                  key={g.key}
                  className={`genre-btn ${genre === g.key ? 'active' : ''}`}
                  onClick={() => setGenre(g.key)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div className="playlist-tracks">
            {shuffledPlaylist.map((track, i) => (
              <button
                key={`${track.file}-${i}`}
                className={`playlist-track ${i === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  initAudioContext()
                  if (audioCtxRef.current?.state === 'suspended') {
                    audioCtxRef.current.resume()
                  }
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
              disabled={!hasTracks}
              aria-label="Précédent"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
              </svg>
            </button>
            <button
              className="control-btn play-btn"
              onClick={togglePlay}
              disabled={!hasTracks}
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
              disabled={!hasTracks}
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

        </div>
      </div>
    </div>
  )
}

export default App
