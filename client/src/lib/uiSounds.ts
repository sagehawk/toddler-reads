import { getSharedAudioContext } from "./sharedAudioContext";

/** Soft "not that one" thud for out-of-order taps in the reading games. */
export const playWrongTapThud = () => {
  const ctx = getSharedAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {}
};

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Short, rotating spoken praise for completed rounds. */
export const PRAISE_LINES = ['Great job!', 'Hooray!', 'You did it!', 'Amazing!', 'Well done!'];

export const randomPraise = () =>
  PRAISE_LINES[Math.floor(Math.random() * PRAISE_LINES.length)];
