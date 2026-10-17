// Explicit one-time import. Normal builds serve the committed snapshot without scraping.
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const { parseArgs } = require('util');
const { values, positionals } = parseArgs({ options: { 'all-years': { type: 'boolean' } }, allowPositionals: true });
const source = positionals[0], allYears = !!values['all-years'];
if (!source || positionals.length !== 1) throw new Error('Usage: node scripts/import-gm-report.js <report.html> [--all-years]');
const input = fs.readFileSync(path.resolve(source), 'utf8');
const match = input.match(/<script type="application\/json" id="report-data">([\s\S]*?)<\/script>/);
if (!match) throw new Error('The source does not contain the report dataset.');
const data = JSON.parse(match[1]), model = data.models && data.models['season totals'];
if (data.leagueName !== 'DGFBL' || !model || !model.seasons.length || !model.headToHead
  || (allYears ? data.reportScope !== 'all-years' : model.seasons.length !== 5 || data.reportScope === 'all-years')
  || new Set(model.seasons.map(s => s.seasonId)).size !== model.seasons.length
  || !input.includes('id="player-dialog"') || !input.includes('createMatchupView'))
  throw new Error('Expected a complete DGFBL report with head-to-head analysis matching the requested scope.');
const sourceCounts = model.seasons.reduce((n, s) => ({ trades: n.trades + s.trades.length,
  draftPicks: n.draftPicks + s.drafts.length, pickups: n.pickups + s.pickups.length }), { trades: 0, draftPicks: 0, pickups: 0 });
const slug = allYears ? 'dgfbl-all-years' : 'dgfbl';
const scope = allYears ? 'all-years' : 'five-seasons';
const navigation = `<nav class="site-return" aria-label="Scraper.bet reports"><a href="/">← Back to Scraper.bet</a><div><a href="/reports/dgfbl-all-years/"${allYears ? ' aria-current="page"' : ''}>All-years report</a><a href="/reports/dgfbl/"${!allYears ? ' aria-current="page"' : ''}>Five-season report</a></div></nav>`;
const css = '.site-return{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;padding:12px 30px;background:#101217;color:#d5d8e0;font:12px/1.5 system-ui,sans-serif}.site-return div{display:flex;gap:20px}.site-return a{color:#fff;text-decoration:none}.site-return a:hover{text-decoration:underline}.site-return a[aria-current]{color:#83e0d9;text-decoration:underline;text-underline-offset:4px}.site-return a:focus-visible{outline:2px solid #f65059;outline-offset:4px}@media(max-width:600px){.site-return{padding:12px 16px;font-size:11px}}@media print{.site-return{display:none}}';
const metadata = `<link rel="canonical" href="https://www.scraper.bet/reports/${slug}/"><meta name="description" content="DGFBL ${allYears ? 'all-years' : 'five-season'} GM review: trading, drafting, free-agent pickups and GM-vs-GM results, with Basketball Monster values and every calculation.">`;
const html = input.replace('</head>', metadata + '<style>' + css + '</style></head>').replace('<body>', '<body>' + navigation);
// Ensure the website wrapper cannot change any of the report data.
if (html.match(/<script type="application\/json" id="report-data">([\s\S]*?)<\/script>/)[1] !== match[1])
  throw new Error('The report dataset changed during import.');
const sha256 = text => createHash('sha256').update(text).digest('hex');
const manifest = { league: data.leagueName, scope, reportGeneratedAt: data.generatedAt,
  seasons: model.seasons.map(s => s.seasonId), primaryBasis: data.primaryBasis,
  ...sourceCounts, scoredTrades: model.headToHead.overall.tradeCount, managers: data.managerDirectory.length,
  managerPairings: model.headToHead.overall.matchupCount,
  sourceHtmlSha256: sha256(input), publishedHtmlSha256: sha256(html) };
const destination = path.resolve(__dirname, '../public/reports', slug);
fs.mkdirSync(destination, { recursive: true });
fs.writeFileSync(path.join(destination, 'index.html'), html);
fs.writeFileSync(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ destination, ...manifest }, null, 2));
