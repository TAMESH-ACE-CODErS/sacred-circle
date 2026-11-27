// A soft, non-startling Aum. We prefer Web Audio synthesis (no download),
// with the bundled gentle WAV as a graceful fallback.
let context: AudioContext | null = null

function getContext(): AudioContext | null {
  const Ctor = window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  context ??= new Ctor()
  return context
}

export function playAum(muted: boolean): void {
  if (muted) return

  const ctx = getContext()
  if (!ctx) return

  void ctx.resume().then(() => {
    const now = ctx.currentTime
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.06, now + 0.6)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 3.2)
    master.connect(ctx.destination)

    // 136.1 Hz "Om" fundamental with two quiet harmonics.
    ;[
      { freq: 136.1, gain: 0.6 },
      { freq: 272.2, gain: 0.22 },
      { freq: 408.3, gain: 0.08 },
    ].forEach(({ freq, gain }) => {
      const osc = ctx.createOscillator()
      const level = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      level.gain.value = gain
      osc.connect(level).connect(master)
      osc.start(now)
      osc.stop(now + 3.4)
    })
  }).catch(() => {
    // Fallback: the local file, kept at a low volume.
    const audio = new Audio('/audio/aum-soft.wav')
    audio.volume = 0.22
    void audio.play().catch(() => undefined)
  })
}
