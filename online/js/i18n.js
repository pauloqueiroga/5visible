// Translations. Every word the game shows lives in a string table, one per language, in js/strings
// (see docs/online/translation.md in 5visible). English is the source and the fallback: a key missing
// from another table shows in English.
//
// The language follows the browser until the player picks one on the home screen. The pick is saved,
// and picking the browser's own language again goes back to following the browser.
//
// Strings can hold {placeholders}. A string that depends on a number can instead be
// { zero, one, other }, chosen by the {n} placeholder with the language's plural rules.

import en from './strings/en.js';

// each language by its own name; the code is also the file name in js/strings
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'pt-BR', name: 'Português (Brasil)' }
];

const KEY = 'tikitala.online.lang.v1';

let lang = 'en';
let table = en;
let plurals = new Intl.PluralRules('en');

export function language() {
  return lang;
}

// the first of the browser's languages we have: the same region first (pt-BR), then the same language (pt-PT gets pt-BR)
export function browserLanguage(prefs) {
  const nav = typeof navigator === 'undefined' ? null : navigator;
  const list = prefs || (nav && (nav.languages && nav.languages.length ? nav.languages : [nav.language])) || [];
  for (const tag of list) {
    if (!tag) continue;
    const want = tag.toLowerCase();
    const exact = LANGUAGES.find((l) => l.code.toLowerCase() === want);
    if (exact) return exact.code;
    const near = LANGUAGES.find((l) => l.code.split('-')[0].toLowerCase() === want.split('-')[0]);
    if (near) return near.code;
  }
  return 'en';
}

// the player's pick if there is one, otherwise the browser's
export function chosenLanguage() {
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* private window */ }
  return LANGUAGES.some((l) => l.code === saved) ? saved : browserLanguage();
}

export async function chooseLanguage(code) {
  try {
    if (code === browserLanguage()) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, code);
  } catch (e) { /* not saved: the pick lasts until the page closes */ }
  await setLanguage(code);
}

export async function setLanguage(code) {
  if (!LANGUAGES.some((l) => l.code === code)) code = 'en';
  let next = en;
  if (code !== 'en') {
    try { next = (await import('./strings/' + code + '.js')).default; } catch (e) { code = 'en'; }
  }
  lang = code;
  table = next;
  plurals = new Intl.PluralRules(code);
}

// is there a string for this key? (English decides which keys exist)
export function has(key) {
  return key in en;
}

export function t(key, params = {}) {
  let entry = key in table ? table[key] : en[key];
  if (entry === undefined) return key;
  if (typeof entry === 'object') {
    const n = Number(params.n);
    entry = n === 0 && entry.zero !== undefined ? entry.zero : entry[plurals.select(n)] ?? entry.other;
  }
  return entry.replace(/\{(\w+)\}/g, (m, name) => (name in params ? String(params[name]) : m));
}

// fills in the page's fixed words: data-i18n is the text, data-i18n-label the aria-label, data-i18n-alt the alt text
export function translatePage(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-label]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });
  root.querySelectorAll('[data-i18n-alt]').forEach((el) => { el.setAttribute('alt', t(el.dataset.i18nAlt)); });
  document.documentElement.lang = lang;
  document.title = t('meta.title');
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', t('meta.description'));
}
