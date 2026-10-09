import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, EmptyState, Icon, SectionHeading, teamLabel } from "./UI";
import { analysisCategories, primaryCategory, rankCategory, categoryAverage, formatStat, rankLabel, lowerIsBetter } from "./statistics";

function Overview({ teams, leagueAverage, scoringType }) {
  const categories = analysisCategories(leagueAverage, teams, scoringType);
  const [selected, setSelected] = useState("");
  const category = categories.find(cat => cat.name === selected) || primaryCategory(categories, scoringType);
  if (!teams.length || !category) {
    return <EmptyState icon="chart" title="Your league overview is waiting">This saved league has no team statistics to compare yet.</EmptyState>;
  }
  const ranking = rankCategory(teams, category).filter(entry => entry.rank !== null);
  const leaders = ranking.filter(entry => entry.rank === 1);
  const playerCount = teams.reduce((count, team) => count + (team.players || []).length, 0);
  const average = categoryAverage(teams, category);
  const leaderCategories = categories.filter(cat => cat.name !== "FPTS");

  return (
    <section className="workspace-section" aria-label="League overview">
      <SectionHeading eyebrow="YOUR LEAGUE AT A GLANCE" title="League overview" icon="overview">
        {scoringType === "points" ? "Fantasy points up front. The story behind every roster underneath." : "See the leaders, explore the categories, and find your next advantage."}
      </SectionHeading>
      <div className="overview-metrics">
        <div className="metric-card"><span className="metric-label"><Icon name="people" />Teams</span><strong>{teams.length}</strong><span>In your league</span></div>
        <div className="metric-card"><span className="metric-label"><Icon name="people" />Rostered players</span><strong>{playerCount}</strong><span>Across all teams, including IR</span></div>
        <div className="metric-card"><span className="metric-label"><Icon name="chart" />{category.name} benchmark</span><strong>{formatStat(average)}</strong><span>Average across available teams</span></div>
        <div className="metric-card metric-accent"><span className="metric-label"><Icon name="trophy" />{category.name} {leaders.length > 1 ? "shared lead" : "leader"}</span><strong>{formatStat(leaders.length ? leaders[0].value : null)}</strong><span>{leaders.length ? teamLabel(leaders[0].team.teamName) + (leaders.length > 1 ? " + " + (leaders.length - 1) + " tied" : "") : "No statistics available"}</span></div>
      </div>

      <div className="overview-grid">
        <section className="panel leaderboard-panel" aria-label="Category leaderboard">
          <div className="panel-heading"><div><h3>{category.name === "FPTS" ? "Fantasy points" : category.name} leaderboard</h3></div><span className="badge">Roster comparison</span></div>
          <div className="leaderboard-controls"><label htmlFor="overview-category">Compare a category</label><div className="select-wrap"><select id="overview-category" value={category.name} onChange={event => setSelected(event.target.value)}>{categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}{lowerIsBetter(cat) ? " · lower is better" : ""}</option>)}</select><Icon name="chevron" /></div></div>
          <ol className="leaderboard" aria-label={category.name + " leaders"}>
            {ranking.slice(0, 5).map(entry => <li key={entry.team.teamName}>
              <span className="leader-rank">{rankLabel(entry)}</span><Avatar name={entry.team.teamName} src={entry.team.logo} />
              <div className="leader-detail"><div><span>{teamLabel(entry.team.teamName)}</span><strong>{formatStat(entry.value)}</strong></div><div className="leader-track" aria-hidden="true"><span style={{ width: (ranking.length - entry.rank + 1) / ranking.length * 100 + "%" }} /></div></div>
            </li>)}
          </ol>
          {!ranking.length && <p className="analytics-note">No values are available for this category.</p>}
          <div className="panel-footnote"><Icon name="info" /><span>Top {Math.min(5, ranking.length)} by saved roster stats. Bars show rank. {lowerIsBetter(category) ? "Lower values rank higher. " : "Higher values rank higher. "}T = tied rank. These are roster comparisons, not official league standings.</span></div>
        </section>
        <aside className="overview-actions">
          <div className="overview-feature"><span className="eyebrow">SEE THE WHOLE FIELD</span><Icon name="heatmap" /><h3>Where is the edge?</h3><p>Explore every team's strengths in one view. Compare ranks or raw values, then tap a category for the details.</p><Link className="button button-primary" to="/heatmap">Explore the heatmap<Icon name="arrow" /></Link></div>
          <div className="panel overview-next"><Icon name="exchange" /><div><h3>Put a move to the test</h3><p>See how a trade changes both rosters and their category ranks.</p><Link to="/trade">Build a trade<Icon name="arrow" /></Link></div></div>
          <Link className="text-link" to="/standings">View every team and statistic<Icon name="arrow" /></Link>
        </aside>
      </div>

      {leaderCategories.length > 0 && <section className="category-leaders" aria-label="Category leaders">
        <div className="panel-heading"><div><h3>Around the league</h3></div><span className="table-hint">Leaders by category</span></div>
        <div className="category-leader-grid">{leaderCategories.map(cat => {
          const best = rankCategory(teams, cat).filter(entry => entry.rank === 1);
          return <button type="button" key={cat.name} className="category-leader" aria-pressed={category.name === cat.name} onClick={() => setSelected(cat.name)}>
            <span className="category-leader-label">{cat.name}<Icon name={lowerIsBetter(cat) ? "down" : "up"} /></span>
            <strong>{formatStat(best.length ? best[0].value : null)}</strong>
            <span>{best.length ? teamLabel(best[0].team.teamName) : "No data"}</span>
            {best.length > 1 && <small>+ {best.length - 1} tied at the top</small>}
          </button>;
        })}</div>
      </section>}
    </section>
  );
}

export default Overview;
