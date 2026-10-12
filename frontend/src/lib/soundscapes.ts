// Web Audio API ambient soundscape generator - 100% offline, zero audio files required
export type SoundscapeType = "RAIN" | "CAFE" | "WHITE_NOISE" | "CAMPFIRE" | "WAVES" | "LOFI" | "SILENT";

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: SoundscapeType = "SILENT";
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private masterGain: GainNode | null = null;
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public getVolume() {
    return this.volume;
  }

  public getCurrentType() {
    return this.currentType;
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {
        // ignore cleanup errors
      }
    });
    this.activeNodes = [];
    this.currentType = "SILENT";
  }

  public play(type: SoundscapeType) {
    this.stop();
    if (type === "SILENT") return;

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.currentType = type;

    switch (type) {
      case "RAIN":
        this.playRain();
        break;
      case "CAFE":
        this.playCafe();
        break;
      case "WHITE_NOISE":
        this.playNoise("brown");
        break;
      case "CAMPFIRE":
        this.playCampfire();
        break;
      case "WAVES":
        this.playWaves();
        break;
      case "LOFI":
        this.playLofi();
        break;
    }
  }

  private createNoiseBuffer(duration = 5): AudioBuffer {
    const ctx = this.ctx!;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink / Brown noise filter
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }
    return buffer;
  }

  private playRain() {
    const ctx = this.ctx!;
    const noiseBuffer = this.createNoiseBuffer(6);

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, ctx.currentTime);

    const highPass = ctx.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.setValueAtTime(300, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, ctx.currentTime);

    source.connect(highPass);
    highPass.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    source.start();
    this.activeNodes.push(source, filter, highPass, gain);
  }

  private playCafe() {
    const ctx = this.ctx!;
    // Multiple warm low oscillators simulating distant conversation resonance
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(140, ctx.currentTime);
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(210, ctx.currentTime);
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(85, ctx.currentTime);

    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(4);
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(450, ctx.currentTime);
    noiseFilter.Q.setValueAtTime(2.0, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);

    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    noise.connect(noiseFilter);
    noiseFilter.connect(gain);

    gain.connect(this.masterGain!);

    osc1.start();
    osc2.start();
    osc3.start();
    noise.start();
    this.activeNodes.push(osc1, osc2, osc3, noise, gain, noiseFilter);
  }

  private playNoise(color: "brown" | "white") {
    const ctx = this.ctx!;
    const source = ctx.createBufferSource();
    source.buffer = this.createNoiseBuffer(5);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = color === "brown" ? "lowpass" : "allpass";
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    source.start();
    this.activeNodes.push(source, filter, gain);
  }

  private playCampfire() {
    const ctx = this.ctx!;
    const source = ctx.createBufferSource();
    source.buffer = this.createNoiseBuffer(4);
    source.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(320, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.75, ctx.currentTime);

    source.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain!);

    source.start();
    this.activeNodes.push(source, lowpass, gain);
  }

  private playWaves() {
    const ctx = this.ctx!;
    const source = ctx.createBufferSource();
    source.buffer = this.createNoiseBuffer(8);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(350, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    // LFO for wave swelling
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec ocean wave cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(250, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.85, ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    source.start();
    lfo.start();
    this.activeNodes.push(source, lfo, lfoGain, filter, gain);
  }

  private playLofi() {
    const ctx = this.ctx!;
    // Dual binaural 432 Hz alpha wave focus tone
    const oscLeft = ctx.createOscillator();
    const oscRight = ctx.createOscillator();

    oscLeft.type = "sine";
    oscLeft.frequency.setValueAtTime(216, ctx.currentTime); // 432 harmonic
    oscRight.type = "sine";
    oscRight.frequency.setValueAtTime(224, ctx.currentTime); // 8 Hz binaural alpha wave beat

    const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);

    if (pannerLeft && pannerRight) {
      pannerLeft.pan.setValueAtTime(-0.8, ctx.currentTime);
      pannerRight.pan.setValueAtTime(0.8, ctx.currentTime);
      oscLeft.connect(pannerLeft);
      pannerLeft.connect(gain);
      oscRight.connect(pannerRight);
      pannerRight.connect(gain);
      this.activeNodes.push(pannerLeft, pannerRight);
    } else {
      oscLeft.connect(gain);
      oscRight.connect(gain);
    }

    gain.connect(this.masterGain!);

    oscLeft.start();
    oscRight.start();
    this.activeNodes.push(oscLeft, oscRight, gain);
  }
}

export const soundEngine = typeof window !== "undefined" ? new AmbientSoundEngine() : ({} as AmbientSoundEngine);
