/*
 * Microsoft Clarity — Terra Nova production tracker.
 * Project: TerraNova / id: wpipn55ohe
 *
 * Single source of truth for the Clarity tag so we only ever swap one file
 * if the ID changes or we migrate to GTM.
 *
 * Privacy notice: Clarity records session replays and heatmaps. Form inputs
 * are masked by default. Disclosure is included in privacy.html and terms.html.
 *
 * Loaded asynchronously; no impact on first paint.
 */
(function (c, l, a, r, i, t, y) {
  c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
  t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
  y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
})(window, document, "clarity", "script", "wpipn55ohe");