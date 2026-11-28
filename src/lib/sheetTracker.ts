import type {
  DeviceType,
  LanguageCode,
  VisitorEventType,
} from '../types/sheet'

type TrackOptions = {
  eventDetail?: string
  cardsViewedCount?: number
  timeOnBrochureSec?: number
}

const SESSION_KEY = 'sacred-circle-session-id'

function sessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const created =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.sessionStorage.setItem(SESSION_KEY, created)
    return created
  } catch {
    return `${Date.now()}-anonymous`
  }
}

function language(): LanguageCode {
  return document.documentElement.lang === 'hi' ? 'hi' : 'en'
}

function deviceType(): DeviceType {
  const narrow = window.matchMedia?.('(max-width: 900px)').matches
  const coarse = window.matchMedia?.('(pointer: coarse)').matches
  const smallScreen = window.innerWidth <= 900
  return narrow || coarse || smallScreen ? 'mobile' : 'desktop'
}

/** Shared by check-ins and posts so every row uses the same safe values. */
export function currentVisitorContext(): {
  language: LanguageCode
  device_type: DeviceType
} {
  return { language: language(), device_type: deviceType() }
}

/**
 * Fire-and-forget visitor logging. The browser only talks to /api/site;
 * the serverless bridge owns VITE_SHEET_API_URL, so no Apps Script URL or
 * CORS detail leaks into src/.
 */
export function trackVisitorEvent(
  eventType: VisitorEventType,
  options: TrackOptions = {},
): void {
  const body = {
    action: 'visitor_event_create',
    session_id: sessionId(),
    event_type: eventType,
    event_detail: options.eventDetail ?? '',
    cards_viewed_count: options.cardsViewedCount ?? 0,
    time_on_brochure_sec: options.timeOnBrochureSec ?? 0,
    language: language(),
    device_type: deviceType(),
    referrer: document.referrer || '',
  }

  try {
    void fetch('/api/site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {
      // Tracking must never slow down or interrupt a visitor.
    })
  } catch {
    // Offline / privacy-blocked browsers are fine.
  }
}
