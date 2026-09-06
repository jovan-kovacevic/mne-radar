/**
 * Two pipelines on purpose: on iOS an <audio> element still plays with the
 * ringer switch off, Web Audio does not. Which one a warning app should use is
 * still open (wayfinder ticket 12) — until it is measured, fire both.
 */
function beepWav(freqHz: number, ms: number): string {
  const rate = 22050
  const n = Math.floor((rate * ms) / 1000)
  const buf = new ArrayBuffer(44 + n * 2)
  const v = new DataView(buf)
  const str = (off: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)) }
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVEfmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true)
  v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  str(36, 'data'); v.setUint32(40, n * 2, true)
  for (let i = 0; i < n; i++) {
    const env = Math.min(1, i / 300) * Math.min(1, (n - i) / 300)
    v.setInt16(44 + i * 2, Math.sin((2 * Math.PI * freqHz * i) / rate) * 21000 * env, true)
  }
  let bin = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!)
  return `data:audio/wav;base64,${btoa(bin)}`
}

export interface Chime {
  /** Must be called inside a user gesture or iOS will refuse to play later. */
  prime(): void
  alert(): void
  enter(): void
}

export function createChime(enabled: () => boolean): Chime {
  let el: HTMLAudioElement | null = null
  let enterEl: HTMLAudioElement | null = null
  let ctx: AudioContext | null = null

  const tone = (freq: number, ms: number) => {
    if (!ctx) return
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = freq
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000)
    o.connect(g); g.connect(ctx.destination)
    o.start(); o.stop(ctx.currentTime + ms / 1000 + 0.02)
  }

  return {
    prime() {
      try {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (AC && !ctx) ctx = new AC()
        if (ctx?.state === 'suspended') void ctx.resume()
        if (!el) { el = new Audio(beepWav(880, 380)); el.preload = 'auto'; el.load() }
        if (!enterEl) { enterEl = new Audio(beepWav(620, 520)); enterEl.preload = 'auto'; enterEl.load() }
      } catch { /* an unavailable pipeline must not stop the drive */ }
    },
    alert() {
      if (!enabled()) return
      try { if (el) { el.currentTime = 0; void el.play().catch(() => {}) } } catch { /* ignore */ }
      tone(880, 380)
      navigator.vibrate?.([260, 90, 260])
    },
    enter() {
      if (!enabled()) return
      try { if (enterEl) { enterEl.currentTime = 0; void enterEl.play().catch(() => {}) } } catch { /* ignore */ }
      tone(620, 520)
      navigator.vibrate?.([400])
    },
  }
}
