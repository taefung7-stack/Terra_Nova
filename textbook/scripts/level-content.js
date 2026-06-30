/* Terra Nova — shared content-path / level resolver.
 *
 * Browser-safe (no Node deps). Imported by render.js / cover-render.js /
 * supplements-render.js, and re-exported logic is mirrored in
 * tools/_dist-path.mjs (Node side) — keep the suffix→level map in sync.
 *
 * Two content layouts coexist:
 *   - Highschool / legacy: content/passages/<month>/NN.json
 *       month carries the planet suffix in the month string itself
 *       (e.g. "2026-07" = Saturn 고1, "2026-07-Sun" = Sun 고3).
 *   - Elementary (2026-07~): content/<level>/passages/<bareMonth>/NN.json
 *       addressed via a planet-suffixed month arg ("2026-07-Mars",
 *       "2026-07-Venus") that we split into bareMonth + level here.
 *
 * Only the elementary levels (mars, venus) use the per-level directory layout.
 * Everything else falls through to the legacy single-folder path, so the
 * highschool build path is byte-for-byte unchanged.
 */

// month-arg suffix → per-level-directory level. Only levels that live under
// content/<level>/passages/. Highschool suffixes (J, Sun, …) are intentionally
// absent → they keep the legacy content/passages/<month> path.
const DIR_LEVELS = {
  Mars: 'mars',
  Venus: 'venus',
};

/* Parse a month arg like "2026-07-Mars" → { month:"2026-07", level:"mars" }.
   "2026-07" or "2026-07-Sun" → { month:"2026-07"/"2026-07-Sun", level:null }
   (level:null means "use legacy content/passages/<month>"). */
export function resolveContent(monthArg) {
  const m = String(monthArg).match(/^(\d{4}-\d{2})-([A-Za-z]+)$/);
  if (m && DIR_LEVELS[m[2]]) {
    const bareMonth = m[1];
    const level = DIR_LEVELS[m[2]];
    return { month: bareMonth, level, base: `content/${level}/passages/${bareMonth}` };
  }
  // legacy / highschool: month string used verbatim as the folder
  return { month: monthArg, level: null, base: `content/passages/${monthArg}` };
}

/* Path to a single passage JSON for the given (possibly suffixed) month arg. */
export function passagePath(monthArg, seq) {
  return `${resolveContent(monthArg).base}/${seq}.json`;
}

/* Apply data-level on <body>/<html> and inject the per-level stylesheet once.
   Resolves once the stylesheet has actually loaded (so headless PDF capture,
   which waits on data-renderReady, never fires before the level design is
   applied). No-op for legacy/highschool (level === null) so existing books
   are untouched. Returns the level string (or null). */
export async function applyLevelTheme(monthArg) {
  const { level } = resolveContent(monthArg);
  if (!level) return null;
  document.body.setAttribute('data-level', level);
  document.documentElement.setAttribute('data-level', level);
  const href = `styles/${level}.css`;
  const already = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .some(l => l.getAttribute('href') === href);
  if (!already) {
    await new Promise((res) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => res();
      link.onerror = () => res(); // don't hang the build if css is missing
      document.head.appendChild(link);
    });
  }
  return level;
}
