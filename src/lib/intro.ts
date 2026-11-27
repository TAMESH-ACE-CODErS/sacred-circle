export const REPLAY_INTRO_EVENT = 'sacred-circle:replay-intro'

/** The reel is intentionally shown on every fresh load — no storage gate. */
export function replayIntro(): void {
  window.dispatchEvent(new Event(REPLAY_INTRO_EVENT))
}
