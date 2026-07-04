/**
 * I18n — locale detection + string table skeleton.
 * Minimal implementation: detects browser locale, falls back to 'en',
 * and provides a typed `t()` function for string lookup.
 */

export type Locale = 'en' | 'es' | 'hi' | 'ja';

export interface StringTable {
  readonly [key: string]: string;
}

const tables: Record<Locale, StringTable> = {
  en: {
    'onboarding.title': 'The Dream Sequence',
    'onboarding.complete': 'Calibration complete.',
    'menu.play': 'Play',
    'menu.codex': 'Codex',
    'menu.profile': 'Profile',
    'battle.victory': 'Victory!',
    'battle.defeat': 'Defeated...',
    'codex.empty': 'No entries unlocked yet.',
  },
  es: {
    'onboarding.title': 'La Secuencia del Sueño',
    'onboarding.complete': 'Calibración completa.',
    'menu.play': 'Jugar',
    'menu.codex': 'Códice',
    'menu.profile': 'Perfil',
    'battle.victory': '¡Victoria!',
    'battle.defeat': 'Derrotado...',
    'codex.empty': 'Aún no hay entradas desbloqueadas.',
  },
  hi: {
    'onboarding.title': 'स्वप्न अनुक्रम',
    'onboarding.complete': 'अंशांकन पूर्ण।',
    'menu.play': 'खेलें',
    'menu.codex': 'कोडेक्स',
    'menu.profile': 'प्रोफ़ाइल',
    'battle.victory': 'विजय!',
    'battle.defeat': 'पराजित...',
    'codex.empty': 'अभी तक कोई प्रविष्टि अनलॉक नहीं हुई।',
  },
  ja: {
    'onboarding.title': '夢の序章',
    'onboarding.complete': 'キャリブレーション完了。',
    'menu.play': 'プレイ',
    'menu.codex': 'コデックス',
    'menu.profile': 'プロフィール',
    'battle.victory': '勝利！',
    'battle.defeat': '敗北...',
    'codex.empty': 'まだエントリーがありません。',
  },
};

let currentLocale: Locale = 'en';

export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language?.slice(0, 2) ?? 'en';
  if (lang in tables) return lang as Locale;
  return 'en';
}

export function initI18n(locale?: Locale): void {
  currentLocale = locale ?? detectLocale();
}

export function t(key: string): string {
  return tables[currentLocale]?.[key] ?? tables.en[key] ?? key;
}

export function getLocale(): Locale {
  return currentLocale;
}
