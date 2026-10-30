// Tests for the online game's translations: the string tables (js/strings), i18n.js, and that no
// visible words are left in index.html, app.js, lessons.js or computer.js (all in the gh-pages "online" folder).
//
// Run with Node 18 or later, from the 5visible folder:
//   node --test tests/online/i18n.test.mjs
// Set TIKITALA_ONLINE to the online folder if the two checkouts are not side by side.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const folder = [
  process.env.TIKITALA_ONLINE,
  resolve(here, '../../../tikitala.com/online'),
  resolve(here, '../../../online'),
].filter(Boolean).find((p) => existsSync(join(p, 'js', 'i18n.js')));
if (!folder) throw new Error('Cannot find the online folder. Set TIKITALA_ONLINE.');
const load = (file) => import(pathToFileURL(join(folder, 'js', file)).href);
const I = await load('i18n.js');
const { LESSONS } = await load('lessons.js');
const C = await load('computer.js');
const en = (await load('strings/en.js')).default;
const tables = {};
for (const l of I.LANGUAGES) tables[l.code] = (await load('strings/' + l.code + '.js')).default;
const html = readFileSync(join(folder, 'index.html'), 'utf8');
const appJs = readFileSync(join(folder, 'js', 'app.js'), 'utf8');

const PLURAL_FORMS = ['zero', 'one', 'two', 'few', 'many', 'other'];
const placeholders = (s) => new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]));
const forms = (entry) => (typeof entry === 'string' ? [entry] : Object.values(entry));
const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

// keys app.js builds from parts, so they never appear whole in its source
const WHO = ['you', 'computer', 'player'];
const built = [
  ...C.LEVEL_IDS.map((id) => 'level.' + id + '.name'),
  ...['live.moved.', 'live.uncovered.', 'live.win.', 'live.next.', 'passed.'].flatMap((k) => WHO.map((w) => k + w)),
  ...['yours', 'theirs'].flatMap((w) => ['FromTable', 'FromStack'].map((f) => 'hand.' + w + f))
];
const LESSON_PARTS = ['title', 'body', 'pick', 'place', 'pickBubble', 'placeBubble', 'tag', 'doneTitle', 'doneText'];
const lessonKeys = LESSONS.flatMap((L) => LESSON_PARTS.map((p) => 'lesson.' + L.id + '.' + p).filter((k) => k in en));
const htmlKeys = [...html.matchAll(/data-i18n(?:-label|-alt)?="([^"]+)"/g)].map((m) => m[1]);
const namespaces = new Set(Object.keys(en).map((k) => k.split('.')[0]));
const appLiterals = [...appJs.matchAll(/'([^'\n]*)'/g)].map((m) => m[1]);

test('there is a string table for every language, and English is first', () => {
  assert.equal(I.LANGUAGES[0].code, 'en');
  for (const l of I.LANGUAGES) {
    assert.ok(tables[l.code], 'missing js/strings/' + l.code + '.js');
    assert.ok(l.name, l.code + ' needs its own name for the language picker');
  }
});

for (const [code, table] of Object.entries(tables)) {
  test(code + ': same keys as English', () => {
    const missing = Object.keys(en).filter((k) => !(k in table));
    const extra = Object.keys(table).filter((k) => !(k in en));
    assert.deepEqual(missing, [], 'missing from ' + code);
    assert.deepEqual(extra, [], 'not in English (typo, or a key English no longer has)');
  });

  test(code + ': same placeholders as English, and well-formed plurals', () => {
    for (const [key, entry] of Object.entries(table)) {
      const want = new Set(forms(en[key]).flatMap((s) => [...placeholders(s)]));
      if (typeof entry === 'string') {
        assert.ok(entry.trim(), key + ' is empty');
        assert.ok(sameSet(placeholders(entry), want), key + ': placeholders ' + [...placeholders(entry)] + ', English has ' + [...want]);
      } else {
        assert.ok(entry && typeof entry.other === 'string', key + ': a plural needs an "other" form');
        for (const [form, s] of Object.entries(entry)) {
          assert.ok(PLURAL_FORMS.includes(form), key + ': unknown plural form ' + form);
          assert.ok(s.trim(), key + '.' + form + ' is empty');
          for (const p of placeholders(s)) assert.ok(want.has(p), key + '.' + form + ': unknown placeholder {' + p + '}');
        }
        // the "other" form says everything; zero and one may leave out {n}
        for (const p of want) assert.ok(placeholders(entry.other).has(p), key + '.other is missing {' + p + '}');
        assert.ok(want.has('n'), key + ': plurals are chosen by {n}, which the English does not have');
      }
    }
  });
}

test('every key the page uses is in English', () => {
  const missing = htmlKeys.filter((k) => !(k in en));
  assert.deepEqual(missing, [], 'index.html uses keys that do not exist');
});

test('every key app.js uses is in English', () => {
  const keyLike = appLiterals.filter((s) => /^[a-z]+(\.[a-zA-Z]+)+$/.test(s) && namespaces.has(s.split('.')[0]));
  const missing = [...keyLike, ...built].filter((k) => !(k in en));
  assert.deepEqual(missing, [], 'app.js uses keys that do not exist');
});

test('every lesson has its words', () => {
  for (const L of LESSONS) {
    for (const part of ['title', 'body', 'doneTitle', 'doneText']) assert.ok(('lesson.' + L.id + '.' + part) in en, L.id + ' has no ' + part);
    for (const part of ['pickBubble', 'placeBubble', 'tag']) {
      assert.equal(('lesson.' + L.id + '.' + part) in en, !!L[part], L.id + ': ' + part + ' in lessons.js and in the strings must match');
    }
  }
});

test('every string is used', () => {
  const used = new Set([...htmlKeys, ...built, ...lessonKeys, ...appLiterals, 'meta.title', 'meta.description']);
  const unused = Object.keys(en).filter((k) => !used.has(k));
  assert.deepEqual(unused, [], 'strings nothing shows');
});

test('index.html has no words of its own', () => {
  const body = html.slice(html.indexOf('<body'))
    .replace(/<noscript>[\s\S]*?<\/noscript>/g, '')     // shown only without JavaScript, so it cannot be translated
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const text = body.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').split(/\s+/).filter(Boolean);
  assert.deepEqual(text.filter((w) => w !== 'TIKITALA'), [], 'text in index.html: move it to the string tables');
  const tags = body.match(/<[^>]+>/g);
  for (const tag of tags) {
    for (const [, attr, value] of tag.matchAll(/\s(aria-label|alt|title|placeholder)="([^"]*)"/g)) {
      const translated = new RegExp('data-i18n-' + (attr === 'aria-label' ? 'label' : attr) + '=').test(tag);
      assert.ok(translated || value === '' || value === 'TIKITALA', attr + '="' + value + '" needs a data-i18n attribute: ' + tag);
    }
  }
});

test('lessons.js and computer.js hold no words', () => {
  const allowed = new Set(['id', 'spots', 'allowFrom', 'allowTo', 'pickBubble', 'placeBubble', 'tag', 'last']);
  for (const L of LESSONS) for (const k of Object.keys(L)) assert.ok(allowed.has(k), 'lesson ' + L.id + ' has ' + k + ': words belong in the string tables');
  for (const [id, level] of Object.entries(C.LEVELS)) {
    for (const [k, v] of Object.entries(level)) assert.ok(typeof v !== 'string' || ['none', 'safety', 'full'].includes(v), 'level ' + id + '.' + k + ' is text: words belong in the string tables');
  }
});

test('browser language: same region first, then same language, then English', () => {
  assert.equal(I.browserLanguage(['pt-BR']), 'pt-BR');
  assert.equal(I.browserLanguage(['pt-PT', 'en']), 'pt-BR', 'pt-PT gets Brazilian Portuguese until it has its own table');
  assert.equal(I.browserLanguage(['pt']), 'pt-BR');
  assert.equal(I.browserLanguage(['PT-br']), 'pt-BR', 'tags are not case sensitive');
  assert.equal(I.browserLanguage(['en-GB', 'pt-BR']), 'en', 'the first language the browser lists wins');
  assert.equal(I.browserLanguage(['de-DE', 'pt-BR']), 'pt-BR', 'a language we lack is skipped');
  assert.equal(I.browserLanguage(['de-DE']), 'en');
  assert.equal(I.browserLanguage([]), 'en');
});

test('t(): placeholders, plurals and the English fallback', async () => {
  await I.setLanguage('en');
  assert.equal(I.t('turn.player', { p: 1 }), 'Player 1’s move');
  assert.equal(I.t('panel.otherStash', { n: 0 }), 'No chips left in stash');
  assert.equal(I.t('panel.otherStash', { n: 1 }), '1 chip left in stash');
  assert.equal(I.t('panel.otherStash', { n: 6 }), '6 chips left in stash');
  assert.equal(I.t('no.such.key'), 'no.such.key');

  await I.setLanguage('pt-BR');
  assert.equal(I.language(), 'pt-BR');
  assert.equal(I.t('turn.player', { p: 1 }), 'Vez do Jogador 1');
  assert.equal(I.t('stash.left', { n: 1 }), 'Resta 1');
  assert.equal(I.t('stash.left', { n: 5 }), 'Restam 5');
  assert.equal(I.t('panel.otherStash', { n: 0 }), 'Nenhuma peça na reserva');
  assert.equal(I.t('panel.otherStash', { n: 1 }), '1 peça na reserva');
  assert.equal(I.t('over.tag', { n: 23 }), 'FIM DE JOGO · 23 JOGADAS');
  assert.equal(I.t('share.youWon', { a: 5, b: 3, level: I.t('level.clever.name') }), 'Ganhei de 5 a 3 do computador Esperto no TIKITALA. Cinco no topo ganha!');

  await I.setLanguage('xx');
  assert.equal(I.language(), 'en', 'an unknown language falls back to English');
});
