import fs from 'fs'
import path from 'path'

/**
 * Scan public/jumpUp, public/liquid, and public/instrumental for .mp3 files and return a playlist
 * array sorted alphabetically within each genre.
 *
 * Each entry: { title: string, file: string, genre: 'jumpUp' | 'liquid' | 'instrumental' }
 *
 * `file` is the public URL path (e.g. "/jumpUp/Overdrive.mp3").
 */
export function getPlaylist() {
  const publicDir = path.join(process.cwd(), 'public')
  const genres = ['jumpUp', 'liquid', 'instrumental']

  const tracks = []

  for (const genre of genres) {
    const dir = path.join(publicDir, genre)
    if (!fs.existsSync(dir)) continue

    const files = fs.readdirSync(dir)
      .filter((f) => f.endsWith('.mp3'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

    for (const file of files) {
      tracks.push({
        title: file.replace(/\.mp3$/, '').replace(/-/g, ' '),
        file: `/${genre}/${encodeURIComponent(file)}`,
        genre,
      })
    }
  }

  return tracks
}

/**
 * Return the same playlist but with full absolute URLs (for Alexa AudioPlayer).
 */
export function getTracksWithUrls(siteUrl) {
  return getPlaylist().map((t) => ({
    title: t.title,
    url: `${siteUrl}${t.file}`,
    genre: t.genre,
  }))
}
