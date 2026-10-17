// Explicit one-time import. Normal builds serve the committed snapshot without scraping.
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/import-gm-report.js <absolute path to dgfbl-gm-report.html>');
const input = fs.readFileSync(path.resolve(source), 'utf8');
const match = input.match(/<script type="application\/json" id="report-data">([\s\S]*?)<\/script>/);
if (!match) throw new Error('The source does not contain the report dataset.');
const data = JSON.parse(match[1]), model = data.models && data.models['season totals'];
if (data.leagueName !== 'DGFBL' || !model || model.seasons.length !== 5 || !model.headToHead
  || !input.includes('id="player-dialog"') || !input.includes('createMatchupView'))
  throw new Error('Expected the complete five-season DGFBL report with head-to-head analysis.');
const sourceCounts = model.seasons.reduce((n, s) => ({ trades: n.trades + s.trades.length,
  draftPicks: n.draftPicks + s.drafts.length, pickups: n.pickups + s.pickups.length }), { trades: 0, draftPicks: 0, pickups: 0 });
const navigation = '<nav class="site-return" aria-label="Scraper.bet"><a href="/">← Back to Scraper.bet</a><span>DGFBL / GM report</span></nav>';
const css = '.site-return{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 30px;background:#101217;color:#d5d8e0;font:12px/1.5 system-ui,sans-serif}.site-return a{color:#fff;text-decoration:none}.site-return a:hover{text-decoration:underline}.site-return a:focus-visible{outline:2px solid #f65059;outline-offset:4px}.site-return span{color:#a2a8b5}@media(max-width:600px){.site-return{padding:12px 16px;font-size:11px}}@media print{.site-return{display:none}}';
const metadata = '<link rel="canonical" href="https://www.scraper.bet/reports/dgfbl/"><meta name="description" content="DGFBL’s five-season GM review: trading, drafting, free-agent pickups and GM-vs-GM results, with Basketball Monster values and every calculation.">';
const html = input.replace('</head>', metadata + '<style>' + css + '</style></head>').replace('<body>', '<body>' + navigation);
// Ensure the website wrapper cannot change any of the report data.
if (html.match(/<script type="application\/json" id="report-data">([\s\S]*?)<\/script>/)[1] !== match[1])
  throw new Error('The report dataset changed during import.');
const sha256 = text => createHash('sha256').update(text).digest('hex');
const manifest = { league: data.leagueName, reportGeneratedAt: data.generatedAt,
  seasons: model.seasons.map(s => s.seasonId), primaryBasis: data.primaryBasis,
  ...sourceCounts, managerPairings: model.headToHead.overall.matchupCount,
  sourceHtmlSha256: sha256(input), publishedHtmlSha256: sha256(html) };
const destination = path.resolve(__dirname, '../public/reports/dgfbl');
fs.mkdirSync(destination, { recursive: true });
fs.writeFileSync(path.join(destination, 'index.html'), html);
fs.writeFileSync(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ destination, ...manifest }, null, 2));
