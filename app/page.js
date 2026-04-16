import { getPlaylist } from './lib/tracks'
import App from './components/App'

export default function Home() {
  const playlist = getPlaylist()
  return <App playlist={playlist} />
}
