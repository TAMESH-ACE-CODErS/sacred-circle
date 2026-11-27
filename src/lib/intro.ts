const INTRO_KEY = 'sacred-circle-intro-seen'
export const REPLAY_INTRO_EVENT = 'sacred-circle:replay-intro'

export function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_KEY) === 'yes'
  } catch {
    return false
  }
}

export function markIntroSeen(): void {
  try {
    sessionStorage.setItem(INTRO_KEY, 'yes')
  } catch {
    // Browsers with storage disabled simply see the intro once per page load.
  }
}

export function replayIntro(): void {
  try {
    sessionStorage.removeItem(INTRO_KEY)
  } catch {
    // Nothing to clear.
  }
  window.dispatchEvent(new Event(REPLAY_INTRO_EVENT))
}
