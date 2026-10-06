/**
 * audio.js - Web Audio API Sound Synthesizer
 * Pure vanilla Web Audio API - Zero external audio files required!
 * Created for: ទាញព្រ័ត្រ គណិតវិទ្យា (Tug of War Mathematics)
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.muted = localStorage.getItem('tug_math_muted') === 'true';
  }

  // Initialize or resume AudioContext after user gesture
  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('tug_math_muted', this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // 1. Tactile Click Sound
  playClick() {
    if (this.muted) return;
    this.init();
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Audio click error:', e);
    }
  }

  // 2. Uplifting Correct Chime (Ascending arpeggio: C5, E5, G5, C6)
  playCorrect() {
    if (this.muted) return;
    this.init();
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.audioCtx.currentTime;

      notes.forEach((freq, index) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        const startTime = now + index * 0.07;
        const duration = 0.22;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.02);
      });
    } catch (e) {
      console.warn('Audio correct error:', e);
    }
  }

  // 3. Wrong Buzzer (Low dissonant buzz)
  playWrong() {
    if (this.muted) return;
    this.init();
    try {
      const now = this.audioCtx.currentTime;
      const freqs = [150, 142]; // Dissonant dual pitch

      freqs.forEach(freq => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.28);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch (e) {
      console.warn('Audio wrong error:', e);
    }
  }

  // 4. Heavy Rope Pull / Whoosh Tension Sound
  playPull() {
    if (this.muted) return;
    this.init();
    try {
      const now = this.audioCtx.currentTime;

      // Low grunt/impact tone
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.26);

      // White noise swoosh for rope friction
      const bufferSize = this.audioCtx.sampleRate * 0.25;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.25);
      filter.Q.value = 2.5;

      const noiseGain = this.audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.audioCtx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.26);
    } catch (e) {
      console.warn('Audio pull error:', e);
    }
  }

  // 5. Grand Victory Fanfare (Celebratory melody & chords)
  playVictory() {
    if (this.muted) return;
    this.init();
    try {
      const now = this.audioCtx.currentTime;

      // Fanfare sequence: [frequency, startTimeOffset, duration]
      const notes = [
        [523.25, 0.0, 0.15],   // C5
        [523.25, 0.18, 0.15],  // C5
        [523.25, 0.36, 0.15],  // C5
        [659.25, 0.54, 0.35],  // E5
        [587.33, 0.92, 0.18],  // D5
        [659.25, 1.12, 0.18],  // E5
        [783.99, 1.35, 0.65],  // G5
        [1046.50, 2.05, 1.1]   // C6 high climax
      ];

      notes.forEach(([freq, offset, dur]) => {
        const start = now + offset;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.28, start + 0.03);
        gain.gain.setValueAtTime(0.24, start + dur - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(start);
        osc.stop(start + dur + 0.05);
      });

      // Harmonic chords backing the final C6
      const chordNotes = [523.25, 659.25, 783.99]; // C Major backing
      chordNotes.forEach(freq => {
        const start = now + 2.05;
        const dur = 1.1;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(start);
        osc.stop(start + dur + 0.05);
      });
    } catch (e) {
      console.warn('Audio victory error:', e);
    }
  }
}

// Global Sound Instance
window.soundEngine = new SoundEngine();
