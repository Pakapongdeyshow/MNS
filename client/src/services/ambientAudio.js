// Pure Web Audio API Nature Sound Synthesizer
// Generates relaxing rain ambiance & nature breeze without external audio files

let audioCtx = null;
let rainNode = null;
let gainNode = null;
let isPlaying = false;

export const ambientAudio = {
  init() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  },

  playNatureAmbiance(volume = 0.25) {
    try {
      this.init();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (isPlaying) return;

      // 1. Pink Noise Buffer for Gentle Rain / Wind
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to simulate soft rainfall & leaves
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, audioCtx.currentTime);

      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      whiteNoise.start(0);
      rainNode = whiteNoise;
      isPlaying = true;
    } catch (e) {
      console.warn('Web Audio synthesis not supported in this environment', e);
    }
  },

  stopNatureAmbiance() {
    if (rainNode && isPlaying) {
      try {
        gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
        setTimeout(() => {
          rainNode.stop();
          rainNode.disconnect();
          rainNode = null;
          isPlaying = false;
        }, 500);
      } catch (e) {
        isPlaying = false;
      }
    }
  },

  toggle(volume = 0.25) {
    if (isPlaying) {
      this.stopNatureAmbiance();
      return false;
    } else {
      this.playNatureAmbiance(volume);
      return true;
    }
  },

  getIsPlaying() {
    return isPlaying;
  }
};
