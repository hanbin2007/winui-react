/** Microsoft's own download of Segoe UI Variable (a zip with the font and its licence). */
export const SEGOE_DOWNLOAD_URL = 'https://aka.ms/SegoeUIVariable';

const DISMISS_KEY = 'wui-gallery-font-reminder';

/**
 * Whether a font family is installed on this device. A missing family falls back
 * to the generic one, so the text measures exactly the same as the generic alone.
 */
export function isFontAvailable(family: string): boolean {
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return true;
    const sample = 'mmmmmmmmmmlliWW@#0123456789';
    const width = (font: string) => {
      ctx.font = `72px ${font}`;
      return ctx.measureText(sample).width;
    };
    return ['monospace', 'serif'].some((generic) => width(`"${family}", ${generic}`) !== width(generic));
  } catch {
    return true;
  }
}

/** True when any Segoe UI family (the Windows UI font) is installed. */
export function hasSegoe(): boolean {
  return ['Segoe UI Variable', 'Segoe UI Variable Text', 'Segoe UI'].some(isFontAvailable);
}

export function isReminderDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === 'dismissed';
  } catch {
    return false;
  }
}

export function setReminderDismissed(dismissed: boolean) {
  try {
    if (dismissed) localStorage.setItem(DISMISS_KEY, 'dismissed');
    else localStorage.removeItem(DISMISS_KEY);
  } catch {
    // Storage can be blocked; the reminder then simply shows again next visit.
  }
}
