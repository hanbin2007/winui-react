import { createContext, useContext } from 'react';
import type { Backdrop, PaneDisplayMode, ThemeMode } from '../lib';

export interface Settings {
  theme: ThemeMode;
  accent: string;
  backdrop: Backdrop;
  paneMode: PaneDisplayMode;
}

export interface AppContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  navigate: (key: string) => void;
  /** Whether a Segoe UI font is installed on this device. */
  fontInstalled: boolean;
  /** Whether the Home page should show the font reminder. */
  fontReminder: boolean;
  /** Bring the font reminder back, even after it was dismissed. */
  showFontReminder: () => void;
  /** Hide the font reminder and remember that on this device. */
  dismissFontReminder: () => void;
}

// Kept apart from the components so hot reload never swaps the context object.
export const AppContext = createContext<AppContextValue | null>(null);
export const useApp = () => useContext(AppContext)!;
