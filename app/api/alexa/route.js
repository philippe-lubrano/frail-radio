import { NextResponse } from 'next/server';
import * as Alexa from 'ask-sdk-core';
import { getTracksWithUrls } from '../../lib/tracks';

const SITE_URL = process.env.SITE_URL || 'https://frail-radio.vercel.app';
const TRACKS = getTracksWithUrls(SITE_URL);

function getRandomTrack() {
  return TRACKS[Math.floor(Math.random() * TRACKS.length)];
}

/* ──────────── Intent Handlers ──────────── */

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const track = getRandomTrack();
    return handlerInput.responseBuilder
      .speak(`Bienvenue sur Frail Radio. Lancement de ${track.title}.`)
      .addAudioPlayerPlayDirective('REPLACE_ALL', track.url, track.url, 0, null, {
        title: track.title,
        subtitle: 'Frail Radio',
      })
      .getResponse();
  },
};

const PlayMusicIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayMusicIntent'
    );
  },
  handle(handlerInput) {
    const track = getRandomTrack();
    return handlerInput.responseBuilder
      .speak(`Lecture de ${track.title} sur Frail Radio.`)
      .addAudioPlayerPlayDirective('REPLACE_ALL', track.url, track.url, 0, null, {
        title: track.title,
        subtitle: 'Frail Radio',
      })
      .getResponse();
  },
};

/* ── AudioPlayer event handlers ── */

const AudioPlayerEventHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope).startsWith('AudioPlayer.');
  },
  handle(handlerInput) {
    const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);

    if (requestType === 'AudioPlayer.PlaybackNearlyFinished') {
      // Enqueue next track for gapless playback
      const track = getRandomTrack();
      return handlerInput.responseBuilder
        .addAudioPlayerPlayDirective('ENQUEUE', track.url, track.url, 0, handlerInput.requestEnvelope.request.token, {
          title: track.title,
          subtitle: 'Frail Radio',
        })
        .getResponse();
    }

    return handlerInput.responseBuilder.getResponse();
  },
};

/* ── Built-in intent handlers ── */

const PauseIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent' ||
       Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
       Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent')
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse();
  },
};

const ResumeIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent'
    );
  },
  handle(handlerInput) {
    const track = getRandomTrack();
    return handlerInput.responseBuilder
      .speak('Reprise de la lecture.')
      .addAudioPlayerPlayDirective('REPLACE_ALL', track.url, track.url, 0, null, {
        title: track.title,
        subtitle: 'Frail Radio',
      })
      .getResponse();
  },
};

const NextIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NextIntent'
    );
  },
  handle(handlerInput) {
    const track = getRandomTrack();
    return handlerInput.responseBuilder
      .addAudioPlayerPlayDirective('REPLACE_ALL', track.url, track.url, 0, null, {
        title: track.title,
        subtitle: 'Frail Radio',
      })
      .getResponse();
  },
};

const PreviousIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PreviousIntent'
    );
  },
  handle(handlerInput) {
    const track = getRandomTrack();
    return handlerInput.responseBuilder
      .addAudioPlayerPlayDirective('REPLACE_ALL', track.url, track.url, 0, null, {
        title: track.title,
        subtitle: 'Frail Radio',
      })
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Dites "joue de la musique" pour lancer Frail Radio.')
      .reprompt('Que voulez-vous faire ?')
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent'
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Désolé, je n'ai pas compris. Dites \"joue de la musique\" pour commencer.")
      .reprompt('Que voulez-vous faire ?')
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error('Alexa Skill Error:', error);
    return handlerInput.responseBuilder
      .speak("Désolé, une erreur s'est produite avec Frail Radio. Veuillez réessayer.")
      .getResponse();
  },
};

/* ──────────── Skill Builder & Next.js Routes ──────────── */

// On déclare la variable skill ici, mais on l'instancie dans le POST
let skill;

export async function POST(request) {
  // On crée l'instance au moment de la requête si elle n'existe pas
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
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
      .create();
  }

  try {
    const body = await request.json();
    const response = await skill.invoke(body);
    // C'est ici la magie de Next.js App Router
    return NextResponse.json(response);
  } catch (error) {
    console.error('Alexa route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Toujours pratique de garder ce petit GET pour vérifier que l'URL est bonne dans son navigateur !
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Frail Radio Alexa Skill endpoint is ready to rock !',
  });
}
