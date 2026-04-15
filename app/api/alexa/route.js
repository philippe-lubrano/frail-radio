import Alexa from 'ask-sdk-core'

/**
 * Playlist exposed to the Alexa Skill via AudioPlayer.
 *
 * IMPORTANT: Alexa AudioPlayer only supports MP3 (up to 256 kbps) and certain
 * HLS streams. WAV files are NOT supported. Before deploying, convert your audio
 * files to MP3 (≤ 50 MB each) and update the URLs below accordingly.
 *
 * In production, set the SITE_URL environment variable to your Vercel domain
 * (e.g. https://frail-radio.vercel.app) so that URLs resolve correctly.
 */
const SITE_URL = process.env.SITE_URL || 'https://frail-radio.vercel.app'

const TRACKS = [
  // ── Jump Up ─────────────────────
  { title: 'Ignition', url: `${SITE_URL}/jumpUp/Ignition.wav` },
  { title: 'Mapping the Void', url: `${SITE_URL}/jumpUp/Mapping%20the%20Void.wav` },
  { title: 'Overdrive', url: `${SITE_URL}/jumpUp/Overdrive.wav` },
  { title: 'The Breakdown', url: `${SITE_URL}/jumpUp/The%20Breakdown.wav` },
  { title: 'The Signal', url: `${SITE_URL}/jumpUp/The%20Signal.wav` },
  { title: 'The fault line', url: `${SITE_URL}/jumpUp/The%20fault%20line.wav` },
  // ── Liquid ──────────────────────
  { title: '3 AM Static', url: `${SITE_URL}/liquid/3%20AM%20Static.wav` },
  { title: 'Alone', url: `${SITE_URL}/liquid/Alone.wav` },
  { title: 'An old friend', url: `${SITE_URL}/liquid/An%20old%20friend.wav` },
  { title: 'Broken', url: `${SITE_URL}/liquid/Broken.wav` },
  { title: 'Chemical Silence', url: `${SITE_URL}/liquid/Chemical%20Silence.wav` },
  { title: 'Concrete Forest', url: `${SITE_URL}/liquid/Concrete%20Forest.wav` },
  { title: 'Finally Still', url: `${SITE_URL}/liquid/Finally%20Still.wav` },
  { title: 'Leaving the Silent Prayer', url: `${SITE_URL}/liquid/Leaving%20the%20Silent%20Prayer.wav` },
  { title: 'Lost in the cure', url: `${SITE_URL}/liquid/Lost%20in%20the%20cure.wav` },
  { title: 'Social battery low', url: `${SITE_URL}/liquid/Social%20battery%20low.wav` },
  { title: 'The Glass Wall', url: `${SITE_URL}/liquid/The%20Glass%20Wall.wav` },
  { title: 'The Loop', url: `${SITE_URL}/liquid/The%20Loop.wav` },
  { title: 'The Unlived Life', url: `${SITE_URL}/liquid/The%20Unlived%20Life.wav` },
  { title: 'The silent room', url: `${SITE_URL}/liquid/The%20silent%20room.wav` },
  { title: 'Velvet cage', url: `${SITE_URL}/liquid/Velvet%20cage.wav` },
]

function getRandomTrack() {
  return TRACKS[Math.floor(Math.random() * TRACKS.length)]
}

/* ──────────── Intent Handlers ──────────── */

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
  },
  handle(handlerInput) {
    const track = getRandomTrack()
    return handlerInput.responseBuilder
      .speak(`Bienvenue sur Frail Radio. Lancement de ${track.title}.`)
      .addAudioPlayerPlayDirective('REPLACE_ALL', track.url, track.url, 0, null, {
        title: track.title,
        subtitle: 'Frail Radio',
      })
      .getResponse()
  },
}

const PlayMusicIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayMusicIntent'
    )
  },
  handle(handlerInput) {
    const track = getRandomTrack()
    return handlerInput.responseBuilder
      .speak(`Lecture de ${track.title} sur Frail Radio.`)
      .addAudioPlayerPlayDirective('REPLACE_ALL', track.url, track.url, 0, null, {
        title: track.title,
        subtitle: 'Frail Radio',
      })
      .getResponse()
  },
}

/* ── AudioPlayer event handlers ── */

const AudioPlayerEventHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope).startsWith('AudioPlayer.')
  },
  handle(handlerInput) {
    const requestType = Alexa.getRequestType(handlerInput.requestEnvelope)

    if (requestType === 'AudioPlayer.PlaybackNearlyFinished') {
      // Enqueue next track for gapless playback
      const track = getRandomTrack()
      return handlerInput.responseBuilder
        .addAudioPlayerPlayDirective('ENQUEUE', track.url, track.url, 0, handlerInput.requestEnvelope.request.token, {
          title: track.title,
          subtitle: 'Frail Radio',
        })
        .getResponse()
    }

    // For other AudioPlayer events (PlaybackStarted, PlaybackStopped, PlaybackFinished, PlaybackFailed)
    return handlerInput.responseBuilder.getResponse()
  },
}

/* ── Built-in intent handlers ── */

const PauseIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent' ||
       Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
       Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent')
    )
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse()
  },
}

const ResumeIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent'
    )
  },
  handle(handlerInput) {
    const track = getRandomTrack()
    return handlerInput.responseBuilder
      .speak('Reprise de la lecture.')
      .addAudioPlayerPlayDirective('REPLACE_ALL', track.url, track.url, 0, null, {
        title: track.title,
        subtitle: 'Frail Radio',
      })
      .getResponse()
  },
}

const NextIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NextIntent'
    )
  },
  handle(handlerInput) {
    const track = getRandomTrack()
    return handlerInput.responseBuilder
      .addAudioPlayerPlayDirective('REPLACE_ALL', track.url, track.url, 0, null, {
        title: track.title,
        subtitle: 'Frail Radio',
      })
      .getResponse()
  },
}

const PreviousIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PreviousIntent'
    )
  },
  handle(handlerInput) {
    const track = getRandomTrack()
    return handlerInput.responseBuilder
      .addAudioPlayerPlayDirective('REPLACE_ALL', track.url, track.url, 0, null, {
        title: track.title,
        subtitle: 'Frail Radio',
      })
      .getResponse()
  },
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    )
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Dites "joue de la musique" pour lancer Frail Radio.')
      .reprompt('Que voulez-vous faire ?')
      .getResponse()
  },
}

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest'
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse()
  },
}

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent'
    )
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Désolé, je n'ai pas compris. Dites \"joue de la musique\" pour commencer.")
      .reprompt('Que voulez-vous faire ?')
      .getResponse()
  },
}

const ErrorHandler = {
  canHandle() {
    return true
  },
  handle(handlerInput, error) {
    console.error('Alexa Skill Error:', error)
    return handlerInput.responseBuilder
      .speak("Désolé, une erreur s'est produite. Veuillez réessayer.")
      .getResponse()
  },
}

/* ──────────── Skill Builder ──────────── */

const skill = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    PlayMusicIntentHandler,
    PauseIntentHandler,
    ResumeIntentHandler,
    NextIntentHandler,
    PreviousIntentHandler,
    HelpIntentHandler,
    FallbackIntentHandler,
    AudioPlayerEventHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .create()

/* ──────────── Next.js Route Handler ──────────── */

export async function POST(request) {
  try {
    const body = await request.json()
    const response = await skill.invoke(body)
    return Response.json(response)
  } catch (error) {
    console.error('Alexa route error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return Response.json({
    status: 'ok',
    message: 'Frail Radio Alexa Skill endpoint. Send POST requests from Amazon Alexa.',
  })
}
