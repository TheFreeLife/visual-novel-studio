import { BgmMood, SoundEffectType } from '../types/novel';

class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmInterval: number | null = null;
  private isBgmPlaying = false;
  private masterGain: GainNode | null = null;
  private currentMood: BgmMood = 'peaceful';
  private volume = 0.6;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // Typewriter soft blip
  public playTypewriterBlip(freq = 640) {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    // slight subtle random pitch variation like classic visual novel text blips
    const randomFreq = freq + (Math.random() * 60 - 30);
    osc.frequency.setValueAtTime(randomFreq, ctx.currentTime);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // Dialog advance click
  public playAdvanceClick() {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  // Specific sound effects
  public playEffect(effect: SoundEffectType) {
    if (effect === 'none') return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    switch (effect) {
      case 'click':
      case 'page':
        this.playAdvanceClick();
        break;

      case 'surprise': {
        // High double-tone alert
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.setValueAtTime(880, now + 0.08); // A5

        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start(now);
        osc1.stop(now + 0.32);
        break;
      }

      case 'chime': {
        // Celestial / happy bell chime
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.06);

          gain.gain.setValueAtTime(0.15, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.8);

          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.85);
        });
        break;
      }

      case 'door': {
        // Low wooden creak
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.25);
        osc.frequency.linearRampToValueAtTime(130, now + 0.4);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }

      case 'heartbeat': {
        // Double thump
        [0, 0.2].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(65, now + offset);
          osc.frequency.exponentialRampToValueAtTime(35, now + offset + 0.15);

          gain.gain.setValueAtTime(0.28, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);

          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(now + offset);
          osc.stop(now + offset + 0.18);
        });
        break;
      }
    }
  }

  // Ambient procedural visual novel BGM
  public startBgm(mood: BgmMood = 'peaceful') {
    if (mood === 'none') {
      this.stopBgm();
      return;
    }
    const ctx = this.initContext();
    if (!ctx) return;

    this.currentMood = mood;
    if (this.isBgmPlaying) {
      return;
    }
    this.isBgmPlaying = true;

    // Peaceful visual novel chord progressions (frequencies in Hz)
    const chordsMap: Record<BgmMood, number[][]> = {
      peaceful: [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 392.00], // G
      ],
      romantic: [
        [349.23, 440.00, 523.25, 659.25], // Fmaj7
        [329.63, 392.00, 493.88, 587.33], // Em7
        [293.66, 349.23, 440.00, 523.25], // Dm7
        [261.63, 329.63, 392.00, 523.25], // C
      ],
      mystery: [
        [220.00, 261.63, 311.13, 392.00], // Adim7
        [207.65, 261.63, 311.13, 415.30], // G#dim
        [196.00, 233.08, 293.66, 349.23], // Gm7
        [185.00, 220.00, 277.18, 329.63], // F#m7
      ],
      none: []
    };

    let step = 0;
    const playChordStep = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.masterGain) return;
      const chords = chordsMap[this.currentMood] || chordsMap.peaceful;
      const chord = chords[step % chords.length];
      step++;

      const now = this.ctx.currentTime;
      // Soft arpeggiated electric piano / warm synth pad
      chord.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);

        gain.gain.setValueAtTime(0.0001, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.04, now + i * 0.15 + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.15 + 2.4);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 2.5);
      });
    };

    playChordStep();
    this.bgmInterval = window.setInterval(playChordStep, 2800);
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public toggleBgm(mood: BgmMood = 'peaceful') {
    if (this.isBgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm(mood);
      return true;
    }
  }

  public isPlayingBgm() {
    return this.isBgmPlaying;
  }
}

export const soundService = new SoundManager();
