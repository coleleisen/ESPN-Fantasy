ESPN Fantasy adds roster analysis to saved ESPN basketball and hockey leagues, including category and points scoring. Explore the league overview, sortable standings, team strength heatmap, head-to-head matchups, and trade impact previews. The interface supports desktop and mobile layouts and uses data from the companion ESPN-API project.


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

### Local preview with saved league data

Run the local launcher from this project:

```powershell
npm.cmd run start:local
```

It starts the companion API on port 3002 and the frontend on port 3001 as hidden background processes, and waits for the frontend to respond. It reuses services already started by the launcher and writes logs to the ignored `.local` directory. Run it again after a restart or if the preview reports connection refused. The API project must be in the neighboring `ESPN-API` directory with its dependencies and database configuration in place.

The development server proxies league requests to the local API; it reads the league snapshots already saved in the database. To run the services manually instead:

```powershell
# In C:\Projects\ESPN-API (requires the existing database configuration)
$env:PORT = '3002'
npm.cmd start

# In a second terminal, in C:\Projects\ESPN-Fantasy
$env:PORT = '3001'
npm.cmd start
```

Open `http://localhost:3001/?league=IFHL#/overview` for IFHL or `http://localhost:3001/?league=DGFBL#/overview` for DGFBL. League links load automatically and retain the selected section on refresh. Existing standings links still work. When available, the header shows when the data was last saved; opening a league does not run a new ESPN scrape.

The Overview shows roster counts, a selectable category leaderboard, and category leaders. Points leagues open with fantasy points (FPTS) selected. The Heatmap compares category ranks with a values toggle, team highlighting, and tappable cells that explain the difference from the league average. Equal values share a rank; missing values remain unranked. Lower-is-better statistics honor the scoring metadata, and intermediate shooting totals are excluded from these summaries.

Equal-size trade previews include a Trade impact summary with before/after values, fantasy points for points leagues, improved/declined category counts, and category rank changes. Both participating rosters are updated together when calculating ranks. These are comparisons of saved roster statistics, not official league standings or forecasts of future games.

Production continues to use `https://espnapp.onrender.com`. Set `REACT_APP_API_URL` at build time to use another API host.

### Scraper Agent

Open a league and select **Scraper Agent**, or visit `http://localhost:3001/?league=DGFBL#/scraper-agent`. On the hosted app use `https://www.scraper.bet/?league=DGFBL#/scraper-agent`. Existing `/advisor` links redirect to the new section. Choose your team, enter a prompt, and ask about pickups, trades or roster strengths. The app automatically calls the companion API's `/chat` endpoints using its server-side OpenAI key; users do not enter any credentials. Follow-up messages retain recent conversation during this visit (up to 12 messages and 12,000 characters); changing teams or selecting **New chat** clears it. Online research is off by default; enable it for current news. Researched answers include clickable inline citations and sources.

Configure `OPENAI_API_KEY` and optionally `OPENAI_ADVISOR_MODEL` (default `gpt-6.1-sol`) in the companion **API server's** environment, then restart that server. The old `OPENAI_MODEL` setting no longer controls chat, so deployments automatically switch to the lower-cost default. The OpenAI key stays on the server and is never sent to the browser or included in `REACT_APP_*`. If configuration is missing, the tab explains that the app owner needs to connect OpenAI and disables paid chat requests. Request and concurrency limits remain enforced on the backend.

Each answer displays reported tokens and an estimated USD cost; expand it for model, cached tokens, call counts and pricing assumptions. Known usage from failed requests is also displayed. Estimates use published standard rates and conservatively allow for cache writes; actual billing may differ and incomplete usage is marked. The API retrieves additional player stats on demand and limits each answer to three model calls, four player lookups, two web searches and 4,000 total output tokens. All players remain accessible through paginated lookups.

The context panel shows the dataset timestamp, roster counts and waiver coverage. **Refresh league data** needs `ESPN_ADVISOR_SESSION_FILE` configured on the API server and a verified persistent ESPN session. It refreshes the advisor's complete basketball pool and statistical periods without changing the dashboard's selected stats view. The API README documents setup, supported data, limits and deployment requirements. There is no automatic refresh or automatic roster transaction execution.

Deploy both the API and frontend to make the feature available on the hosted app. Local source changes and a successful frontend build do not update either hosted service.

### Deploy to GitHub Pages

The DGFBL GM reports are published as separate static pages:

- [All-years report](https://www.scraper.bet/reports/dgfbl-all-years/): every available completed season, 2018–19 through 2025–26, including 193 trade records (159 scored after commissioner reversals), 1,208 draft picks and 4,318 pickups.
- [Five-season report](https://www.scraper.bet/reports/dgfbl/): the original 2021–22 through 2025–26 analysis, with unchanged scores.

The site header opens the all-years report, and DGFBL navigation links to both. Each report links to the other and back to the main app. Charts, filters, player details, GM matchups and CSV/JSON downloads work without the league API. GitHub Pages serves each directory's `index.html`, so direct visits and refreshes work without an SPA fallback.

The committed snapshots under `public/reports/` are copied into `build/` by the normal production build. Explicitly import the desired report after building it in the companion ESPN-API project:

```powershell
node scripts/import-gm-report.js C:/Projects/ESPN-API/.backfills/dgfbl-gm-report/dgfbl-gm-report.html
node scripts/import-gm-report.js C:/Projects/ESPN-API/.backfills/dgfbl-all-years-report/dgfbl-gm-report.html --all-years
```

The importer validates the report identity and head-to-head data, preserves the embedded analysis exactly, adds site navigation, and writes a manifest with source/published checksums and coverage counts. It does not connect to MongoDB or run a scrape. Commit the resulting HTML and manifest before deploying; no recurring collection job is installed.

The source code lives on `master`. GitHub Pages serves the compiled files from the root of `gh-pages` at [https://www.scraper.bet/](https://www.scraper.bet/). Pushing to `master` alone does not deploy the site.

From a clean checkout in PowerShell, run each command in order and stop if any command fails:

```powershell
git switch master
git pull --ff-only origin master
npm.cmd ci
npm.cmd test -- --watchAll=false --runInBand
npm.cmd run deploy
```

`npm.cmd run deploy` runs the production build first, then commits and pushes the contents of `build/` to `gh-pages` using your Git credentials. It requires push access to this repository. The `public/CNAME` file is copied into the build to preserve the custom domain on every deployment. Dotfiles are included so the report's `.gitattributes` preserves its checksum when publishing from Windows.

In the repository's **Settings > Pages**, keep **Deploy from a branch**, branch **gh-pages**, folder **/(root)**, and custom domain **www.scraper.bet**. Wait for the Pages deployment to finish, then open the site and refresh. The league API is hosted separately on Render; this command deploys only the frontend.

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
