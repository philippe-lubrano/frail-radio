const SITE_URL = process.env.SITE_URL || 'https://frail-radio.vercel.app'

const PLAYLIST = [
  // jumpUp
  { title: 'Autopilot', file: '/jumpUp/Autopilot.mp3', genre: 'jumpUp' },
  { title: 'Be strong', file: '/jumpUp/Be%20strong.mp3', genre: 'jumpUp' },
  { title: 'Clean', file: '/jumpUp/Clean.mp3', genre: 'jumpUp' },
  { title: 'Dear Nobody', file: '/jumpUp/Dear%20Nobody.mp3', genre: 'jumpUp' },
  { title: 'Down the Spiral', file: '/jumpUp/Down%20the%20Spiral.mp3', genre: 'jumpUp' },
  { title: 'Earthquake', file: '/jumpUp/Earthquake.mp3', genre: 'jumpUp' },
  { title: 'Empty Theater', file: '/jumpUp/Empty%20Theater.mp3', genre: 'jumpUp' },
  { title: 'Frozen Inside', file: '/jumpUp/Frozen%20Inside.mp3', genre: 'jumpUp' },
  { title: 'Ghost in the Smoke', file: '/jumpUp/Ghost%20in%20the%20Smoke.mp3', genre: 'jumpUp' },
  { title: 'Hollow Nights', file: '/jumpUp/Hollow%20Nights.mp3', genre: 'jumpUp' },
  { title: 'Ignition', file: '/jumpUp/Ignition.mp3', genre: 'jumpUp' },
  { title: 'Let it out', file: '/jumpUp/Let%20it%20out.mp3', genre: 'jumpUp' },
  { title: 'Mapping the Void', file: '/jumpUp/Mapping%20the%20Void.mp3', genre: 'jumpUp' },
  { title: 'One More Season', file: '/jumpUp/One%20More%20Season.mp3', genre: 'jumpUp' },
  { title: 'Overdrive', file: '/jumpUp/Overdrive.mp3', genre: 'jumpUp' },
  { title: 'Reconstruction', file: '/jumpUp/Reconstruction.mp3', genre: 'jumpUp' },
  { title: 'Safe', file: '/jumpUp/Safe.mp3', genre: 'jumpUp' },
  { title: 'Secondhand Smoke', file: '/jumpUp/Secondhand%20Smoke.mp3', genre: 'jumpUp' },
  { title: 'Shattered Mirror', file: '/jumpUp/Shattered%20Mirror.mp3', genre: 'jumpUp' },
  { title: 'Signal Lost', file: '/jumpUp/Signal%20Lost.mp3', genre: 'jumpUp' },
  { title: 'Still in control', file: '/jumpUp/Still%20in%20control.mp3', genre: 'jumpUp' },
  { title: 'The Breakdown', file: '/jumpUp/The%20Breakdown.mp3', genre: 'jumpUp' },
  { title: 'The fault line', file: '/jumpUp/The%20fault%20line.mp3', genre: 'jumpUp' },
  { title: 'The Last Bar in Town', file: '/jumpUp/The%20Last%20Bar%20in%20Town.mp3', genre: 'jumpUp' },
  { title: 'The Math Doesn\'t Work', file: '/jumpUp/The%20Math%20Doesn\'t%20Work.mp3', genre: 'jumpUp' },
  { title: 'The Signal', file: '/jumpUp/The%20Signal.mp3', genre: 'jumpUp' },
  { title: 'Underneath the Underneath', file: '/jumpUp/Underneath%20the%20Underneath.mp3', genre: 'jumpUp' },
  { title: 'White Pills, Black Skies', file: '/jumpUp/White%20Pills%2C%20Black%20Skies.mp3', genre: 'jumpUp' },

  // liquid
  { title: '3 AM Static', file: '/liquid/3%20AM%20Static.mp3', genre: 'liquid' },
  { title: 'A Voice of Safety', file: '/liquid/A%20Voice%20of%20Safety.mp3', genre: 'liquid' },
  { title: 'Alone', file: '/liquid/Alone.mp3', genre: 'liquid' },
  { title: 'An old friend', file: '/liquid/An%20old%20friend.mp3', genre: 'liquid' },
  { title: 'Before the Dawn', file: '/liquid/Before%20the%20Dawn.mp3', genre: 'liquid' },
  { title: 'Broken', file: '/liquid/Broken.mp3', genre: 'liquid' },
  { title: 'Chemical Silence', file: '/liquid/Chemical%20Silence.mp3', genre: 'liquid' },
  { title: 'Cold Earth', file: '/liquid/Cold%20Earth.mp3', genre: 'liquid' },
  { title: 'Concrete Forest', file: '/liquid/Concrete-Forest.mp3', genre: 'liquid' },
  { title: 'Crisis', file: '/liquid/Crisis.mp3', genre: 'liquid' },
  { title: 'Fearless', file: '/liquid/Fearless.mp3', genre: 'liquid' },
  { title: 'Finally Still', file: '/liquid/Finally-Still.mp3', genre: 'liquid' },
  { title: 'Golden Days', file: '/liquid/Golden%20Days.mp3', genre: 'liquid' },
  { title: "I'm Here", file: '/liquid/I\'m%20Here.mp3', genre: 'liquid' },
  { title: 'Leaving the Silent Prayer', file: '/liquid/Leaving-the-Silent-Prayer.mp3', genre: 'liquid' },
  { title: 'Lost in the cure', file: '/liquid/Lost-in-the-cure.mp3', genre: 'liquid' },
  { title: 'Safety', file: '/liquid/Safety.mp3', genre: 'liquid' },
  { title: 'Social battery low', file: '/liquid/Social-battery-low.mp3', genre: 'liquid' },
  { title: 'The Glass Wall', file: '/liquid/The-Glass-Wall.mp3', genre: 'liquid' },
  { title: 'The Great Reclamation', file: '/liquid/The%20Great%20Reclamation.mp3', genre: 'liquid' },
  { title: 'The Loop', file: '/liquid/The-Loop.mp3', genre: 'liquid' },
  { title: 'The Unlived Life', file: '/liquid/The-Unlived-Life.mp3', genre: 'liquid' },
  { title: 'The silent room', file: '/liquid/The-silent-room.mp3', genre: 'liquid' },
  { title: 'Velvet cage', file: '/liquid/Velvet-cage.mp3', genre: 'liquid' },

  // instrumental
  { title: 'Bitter Tapwater', file: '/instrumental/Bitter%20Tapwater.mp3', genre: 'instrumental' },
  { title: 'Broken Vial Serenade', file: '/instrumental/Broken%20Vial%20Serenade.mp3', genre: 'instrumental' },
  { title: 'Cicada Chrome', file: '/instrumental/Cicada%20Chrome.mp3', genre: 'instrumental' },
  { title: 'Concrete Synapse', file: '/instrumental/Concrete%20Synapse.mp3', genre: 'instrumental' },
  { title: 'Piano Bruise', file: '/instrumental/Piano%20Bruise.mp3', genre: 'instrumental' },
  { title: 'Piano Silt', file: '/instrumental/Piano%20Silt.mp3', genre: 'instrumental' },
  { title: 'Piano Smoke', file: '/instrumental/Piano%20Smoke.mp3', genre: 'instrumental' },
]

export function getPlaylist() {
  return PLAYLIST
}

export function getTracksWithUrls(siteUrl = SITE_URL) {
  return PLAYLIST.map((t) => ({
    title: t.title,
    url: `${siteUrl}${t.file}`,
    genre: t.genre,
  }))
}
