// Web Audio API synthesized Slack sound effects

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  // Slack signature pop / message sent sound
  public playSend() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio context might fail on un-interacted DOM
    }
  }

  // Slack signature notification knock / chime
  public playNotification() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      // Double knock/chime
      [0, 0.09].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 0 ? 587.33 : 880, t + delay); // D5 then A5

        gain.gain.setValueAtTime(0.15, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + delay);
        osc.stop(t + delay + 0.14);
      });
    } catch {
      // Ignore
    }
  }

  // Slack Huddle join chime
  public playHuddleJoin() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A major chord arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(0.1, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.25);
      });
    } catch {
      // Ignore
    }
  }

  // Reaction pop
  public playReaction() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundManager();
