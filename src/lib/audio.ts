/**
 * A warm, distant singing-bowl Aum — pure sine partials only, no buzz or edge.
 * Web Audio synthesis keeps the site free of audio downloads and API costs;
 * the bundled soft WAV remains a graceful fallback.
 */
const FUNDAMENTAL = 136.1
const MASTER_GAIN = 0.14
const ATTACK = 0.5
const SUSTAIN = 1.2
const RELEASE = 2.0
const VIBRATO_RATE = 0.4
const VIBRATO_DEPTH = 1.2 // Hz — barely perceptible
const TOTAL = ATTACK + SUSTAIN + RELEASE

const PARTIALS = [
  { frequency: FUNDAMENTAL, gain: 1 },
  { frequency: 204.15, gain: 0.25 },
  { frequency: 272.2, gain: 0.15 },
]

let context: AudioContext | null = null
let lastPlayedAt = 0

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  context ??= new Ctor()
  return context
}

function playFallback() {
  const audio = new Audio('/audio/aum-soft.wav')
  audio.volume = MASTER_GAIN
  void audio.play().catch(() => undefined)
}

export function playAum(): void {
  // Avoid stacking voices on a fast double tap.
  if (Date.now() - lastPlayedAt < 700) return
  lastPlayedAt = Date.now()

  const ctx = getContext()
  if (!ctx) {
    playFallback()
    return
  }

  void ctx
    .resume()
    .then(() => {
      const now = ctx.currentTime

      const master = ctx.createGain()
      master.gain.setValueAtTime(0.0001, now)
      master.gain.exponentialRampToValueAtTime(MASTER_GAIN, now + ATTACK)
      master.gain.setValueAtTime(MASTER_GAIN, now + ATTACK + SUSTAIN)
      master.gain.exponentialRampToValueAtTime(0.0001, now + TOTAL)

      // A gentle lowpass rounds off the harmonics like a temple resonance.
      const warmth = ctx.createBiquadFilter()
      warmth.type = 'lowpass'
      warmth.frequency.value = 550
      warmth.Q.value = 0.7
      master.connect(warmth).connect(ctx.destination)

      const vibrato = ctx.createOscillator()
      vibrato.type = 'sine'
      vibrato.frequency.value = VIBRATO_RATE
      const vibratoDepth = ctx.createGain()
      vibratoDepth.gain.value = VIBRATO_DEPTH
      vibrato.connect(vibratoDepth)

      PARTIALS.forEach(({ frequency, gain }) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = frequency
        vibratoDepth.connect(osc.frequency)

        const level = ctx.createGain()
        level.gain.value = gain
        osc.connect(level).connect(master)
        osc.start(now)
        osc.stop(now + TOTAL + 0.1)
      })

      vibrato.start(now)
      vibrato.stop(now + TOTAL + 0.1)
    })
    .catch(playFallback)
}
