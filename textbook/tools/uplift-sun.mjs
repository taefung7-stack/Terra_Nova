#!/usr/bin/env node
/**
 * SUN-level difficulty uplift v2 — safer rules, idiom guards, a/an correction.
 *
 * Strategy: substitute Tier-2 → Tier-3 for words where the academic synonym fits
 * across the corpus context. Use phrase-level patterns where possible. Post-pass:
 * (1) restore vocab head-words, (2) correct a/an before vowel-starting substitutes.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const dir = join(root, 'content/passages/2026-06-Sun');

/* Helper: case-preserving replace.
   Given src lowercase form 'show', target lowercase 'manifest', and a match like 'Show',
   return 'Manifest'. */
function casePreserve(srcMatch, target) {
  if (srcMatch[0] === srcMatch[0].toUpperCase()) {
    return target[0].toUpperCase() + target.slice(1);
  }
  return target;
}

/* Each rule: [pattern, target lowercased, optional negativeContexts: array of regexes
   that are scanned around the match and SKIP substitution if any matches in a small
   window of -2/+2 words.] */
const RULES = [
  // === Phrase-level (highest priority) ===
  { pat: /\bin order to\b/g, to: 'so as to' },
  { pat: /\bbecause of\b/g, to: 'by virtue of' },
  { pat: /\bdue to\b/g, to: 'owing to' },
  { pat: /\bbased on\b/g, to: 'predicated upon' },
  { pat: /\bas a result\b/g, to: 'consequently' },
  { pat: /\bfor example\b/g, to: 'for instance' },
  { pat: /\bin fact\b/g, to: 'indeed' },
  { pat: /\binstead of\b/g, to: 'rather than' },
  { pat: /\bso that\b/g, to: 'such that' },
  { pat: /\bso as to\b/g, to: 'so as to' }, // already handled
  { pat: /\bleads to\b/g, to: 'engenders' },
  { pat: /\blead to\b/g, to: 'give rise to' },
  { pat: /\bresults in\b/g, to: 'yields' },
  { pat: /\bresult in\b/g, to: 'yield' },
  { pat: /\bturns into\b/g, to: 'is transmuted into' },
  { pat: /\bturn into\b/g, to: 'be transmuted into' },
  { pat: /\bend up\b/g, to: 'ultimately become' },
  { pat: /\bends up\b/g, to: 'ultimately becomes' },
  { pat: /\bmake sure\b/g, to: 'ensure', skip: true }, // skip — keeping idiom safer

  // === Verbs ===
  { pat: /\bshow\b/g, to: 'demonstrate', avoid: [/\bshow\s+up\b/, /\bshow\s+off\b/] },
  { pat: /\bshows\b/g, to: 'demonstrates', avoid: [/\bshows\s+up\b/, /\bshows\s+off\b/] },
  { pat: /\bshown\b/g, to: 'demonstrated' },
  { pat: /\bshowing\b/g, to: 'demonstrating' },
  { pat: /\buse\b/g, to: 'employ', avoid: [/\bused\s+to\b/, /\buse\s+to\b/] },
  { pat: /\buses\b/g, to: 'employs' },
  { pat: /\bused\b/g, to: 'employed', avoid: [/\bused\s+to\b/] },
  { pat: /\busing\b/g, to: 'employing' },
  { pat: /\bbegin\b/g, to: 'commence' },
  { pat: /\bbegins\b/g, to: 'commences' },
  { pat: /\bbegan\b/g, to: 'commenced' },
  { pat: /\bbeginning\b/g, to: 'commencing' },
  { pat: /\bfind\b/g, to: 'discern', avoid: [/\bfind\s+out\b/] },
  { pat: /\bfinds\b/g, to: 'discerns', avoid: [/\bfinds\s+out\b/] },
  { pat: /\bfound\b/g, to: 'discerned' },
  { pat: /\bfinding\b/g, to: 'discerning' },
  { pat: /\bsee\b/g, to: 'observe', avoid: [/\blet'?s\s+see\b/, /\bsee\s+if\b/, /\bsee\s+to\b/] },
  { pat: /\bsees\b/g, to: 'observes' },
  { pat: /\bseen\b/g, to: 'observed' },
  { pat: /\bcalled\b/g, to: 'designated' },
  { pat: /\bcalls\b/g, to: 'designates' },
  { pat: /\bdrive\b/g, to: 'propel', avoid: [/\bdrive\s+home\b/, /\bdrive\s+through\b/] },
  { pat: /\bdrives\b/g, to: 'propels' },
  { pat: /\bdriven\b/g, to: 'propelled' },
  { pat: /\bdriving\b/g, to: 'propelling' },
  { pat: /\bpush\b/g, to: 'impel', avoid: [/\bpush\s+back\b/, /\bpush\s+aside\b/] },
  { pat: /\bpushes\b/g, to: 'impels' },
  { pat: /\bpushed\b/g, to: 'impelled' },
  { pat: /\bpushing\b/g, to: 'impelling' },
  { pat: /\bhelp\b/g, to: 'facilitate' },
  { pat: /\bhelps\b/g, to: 'facilitates' },
  { pat: /\bhelped\b/g, to: 'facilitated' },
  { pat: /\bhelping\b/g, to: 'facilitating' },
  { pat: /\btreat\b/g, to: 'construe' },
  { pat: /\btreats\b/g, to: 'construes' },
  { pat: /\btreated\b/g, to: 'construed' },
  { pat: /\btreating\b/g, to: 'construing' },
  { pat: /\bprove\b/g, to: 'corroborate' },
  { pat: /\bproves\b/g, to: 'corroborates' },
  { pat: /\bproved\b/g, to: 'corroborated' },
  { pat: /\bproving\b/g, to: 'corroborating' },

  // === Adjectives ===
  { pat: /\bModern\b/g, to: 'Contemporary' }, { pat: /\bmodern\b/g, to: 'contemporary' },
  { pat: /\bImportant\b/g, to: 'Consequential' }, { pat: /\bimportant\b/g, to: 'consequential' },
  { pat: /\bSimple\b/g, to: 'Elementary' }, { pat: /\bsimple\b/g, to: 'elementary' },
  { pat: /\bDifferent\b/g, to: 'Disparate' }, { pat: /\bdifferent\b/g, to: 'disparate' },
  { pat: /\bComplex\b/g, to: 'Intricate' }, { pat: /\bcomplex\b/g, to: 'intricate' },
  { pat: /\bMany\b/g, to: 'Numerous' }, { pat: /\bmany\b/g, to: 'numerous' },
  { pat: /\bUseful\b/g, to: 'Serviceable' }, { pat: /\buseful\b/g, to: 'serviceable' },

  // === Adverbs ===
  { pat: /\bQuickly\b/g, to: 'Rapidly' }, { pat: /\bquickly\b/g, to: 'rapidly' },
  { pat: /\bSlowly\b/g, to: 'Gradually' }, { pat: /\bslowly\b/g, to: 'gradually' },
  { pat: /\bOften\b/g, to: 'Frequently' }, { pat: /\boften\b/g, to: 'frequently' },
  { pat: /\bUsually\b/g, to: 'Customarily' }, { pat: /\busually\b/g, to: 'customarily' },
  { pat: /\bAlways\b/g, to: 'Invariably' }, { pat: /\balways\b/g, to: 'invariably' },
  { pat: /\bExactly\b/g, to: 'Precisely' }, { pat: /\bexactly\b/g, to: 'precisely' },
  { pat: /\bSuddenly\b/g, to: 'Abruptly' }, { pat: /\bsuddenly\b/g, to: 'abruptly' },

  // === Connectors (careful — only safe ones) ===
  { pat: /\bAlso\b/g, to: 'Moreover' }, { pat: /(?<=[\.\,\;]\s)also\b/g, to: 'moreover' },
  // Skip generic 'but' / 'because' — too many idiom collisions.
];

function applyRulesGuarded(text, vocabBlocklist) {
  // Build set of vocab words to skip (as lowercase).
  const blocked = new Set(vocabBlocklist.map(v => v.toLowerCase()));

  let out = text;
  for (const rule of RULES) {
    if (rule.skip) continue;
    out = out.replace(rule.pat, (match, ...args) => {
      // Lowercase form of match
      const lo = match.toLowerCase();
      // If this match's lowercased form is a vocab head-word, skip.
      if (blocked.has(lo)) return match;
      // Check avoid contexts (they are RegExps that look at the wider text).
      // We don't have context here in the replace callback by default; do a
      // simple substring-around lookup using args[args.length-2] (offset)
      // and args[args.length-1] (full string).
      const offset = args[args.length - 2];
      const full = args[args.length - 1];
      if (rule.avoid && rule.avoid.length) {
        const start = Math.max(0, offset - 25);
        const end = Math.min(full.length, offset + match.length + 25);
        const window = full.substring(start, end);
        for (const av of rule.avoid) {
          if (av.test(window)) return match; // bail out on idiom
        }
      }
      return casePreserve(match, rule.to);
    });
  }
  // a/an correction. After substitution, fix article agreement.
  // Pattern: \b(a|A) (X) where X starts with vowel sound (aeiou), make 'an'/'An'.
  // Conversely: \b(an|An) (X) where X starts with consonant, make 'a'/'A'.
  out = out.replace(/\b(A|a) (?=[aeiouAEIOU])/g, m => m[0] === 'A' ? 'An ' : 'an ');
  out = out.replace(/\b(An|an) (?=[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ])/g, m => m[0] === 'A' ? 'A ' : 'a ');
  // (We don't handle h-with-silent-h or 'u' as 'you' edge cases — rare in our corpus.)
  return out;
}

function uplift(passage) {
  const vocabWords = (passage.page4?.vocab || []).map(v => v.word);

  if (passage.page1?.body) passage.page1.body = applyRulesGuarded(passage.page1.body, vocabWords);
  if (passage.page1?.title) passage.page1.title = applyRulesGuarded(passage.page1.title, vocabWords);
  if (passage.page1?.subtitle) passage.page1.subtitle = applyRulesGuarded(passage.page1.subtitle, vocabWords);

  if (passage.page3?.sentences) {
    for (const s of passage.page3.sentences) {
      for (const seg of s.segments) {
        seg.text = applyRulesGuarded(seg.text, vocabWords);
      }
    }
  }

  if (passage.page4?.vocab) {
    for (const v of passage.page4.vocab) {
      for (const ex of (v.examples || [])) {
        ex.en = applyRulesGuarded(ex.en, vocabWords);
      }
    }
  }

  if (passage.page2?.questions) {
    for (const q of passage.page2.questions) {
      if (q.choices) q.choices = q.choices.map(c => applyRulesGuarded(c, vocabWords));
      if (q.summary_template) q.summary_template = applyRulesGuarded(q.summary_template, vocabWords);
    }
  }

  // Bump lexile +110, ar +1.2.
  if (passage.meta?.lexile) {
    const m = passage.meta.lexile.match(/(\d+)L/);
    if (m) passage.meta.lexile = Math.min(1360, parseInt(m[1], 10) + 110) + 'L';
  }
  if (typeof passage.meta?.ar_level === 'number') {
    passage.meta.ar_level = Math.min(9.6, Math.round((passage.meta.ar_level + 1.2) * 10) / 10);
  }
}

const files = readdirSync(dir).filter(f => /^\d+\.json$/.test(f)).sort();
for (const f of files) {
  const path = join(dir, f);
  const j = JSON.parse(readFileSync(path, 'utf8'));
  const oldLex = j.meta.lexile;
  const oldAr = j.meta.ar_level;
  uplift(j);
  writeFileSync(path, JSON.stringify(j, null, 2), 'utf8');
  console.log(f, oldLex, '→', j.meta.lexile, '|', oldAr, '→', j.meta.ar_level);
}
console.log('Uplift v2 applied to', files.length, 'passages.');
