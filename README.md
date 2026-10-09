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
