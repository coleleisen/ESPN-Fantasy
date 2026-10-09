import React from "react";
import { Avatar, Icon, teamLabel } from "./UI";
import { analysisCategories, tradeImpacts, formatStat, formatChange, rankLabel } from "./statistics";

function TradeImpact({ teams, leagueAverage, scoringType, indexA, indexB, statsA, statsB }) {
  const categories = analysisCategories(leagueAverage, teams, scoringType);
  const impacts = tradeImpacts(teams, categories, indexA, indexB, statsA, statsB);
  const isPoints = scoringType === "points";
  return (
    <section className="trade-impact" aria-label="Trade impact summary">
      <div className="impact-heading"><div><p className="eyebrow">THE BEFORE & AFTER</p><h3>Trade impact</h3></div><span className="badge">Snapshot preview</span></div>
      <div className="impact-grid">{impacts.map(({ team, changes }, index) => {
        const points = changes.find(change => change.category.name === "FPTS");
        const breakdown = changes.filter(change => !isPoints || change.category.name !== "FPTS");
        const improved = breakdown.filter(change => change.direction > 0).length;
        const declined = breakdown.filter(change => change.direction < 0).length;
        return <article key={team.teamName} className={"panel impact-card side-" + (index ? "b" : "a")} aria-label={"Trade impact for " + teamLabel(team.teamName)}>
          <div className="trade-team-heading"><Avatar name={team.teamName} src={team.logo} /><div><p className="eyebrow">TEAM {index ? "B" : "A"}</p><h4>{teamLabel(team.teamName)}</h4></div></div>
          {isPoints && <div className="points-impact">
            <p className="metric-label">Fantasy points (FPTS)</p>
            <div className="impact-score"><div><span>Before</span><strong>{formatStat(points ? points.before.value : null)}</strong></div><Icon name="arrow" /><div><span>After trade</span><strong>{formatStat(points ? points.after.value : null)}</strong></div></div>
            <div className={"impact-delta " + (!points || !points.direction ? "stat-neutral" : points.direction > 0 ? "stat-positive" : "stat-negative")}>{points && points.delta !== null ? formatChange(points.delta) + " FPTS" : "Fantasy points unavailable"}</div>
            {points && <p className="impact-rank" aria-label="Fantasy points rank">Roster points rank <strong>{rankLabel(points.before)} → {rankLabel(points.after)}</strong></p>}
          </div>}
          <div className="impact-counts"><div><strong className="stat-positive">{improved}</strong><span>Categories improve</span></div><div><strong className="stat-negative">{declined}</strong><span>Categories decline</span></div></div>
          <details className="impact-details"><summary>View all {changes.length} category changes<Icon name="chevron" /></summary>
            <div className="table-scroll" role="region" aria-label={teamLabel(team.teamName) + " trade changes, scroll for more"} tabIndex="0">
              <table className="data-table impact-table" aria-label={teamLabel(team.teamName) + " trade category changes"}>
                <thead><tr><th scope="col">CATEGORY</th><th scope="col">BEFORE</th><th scope="col">AFTER</th><th scope="col">CHANGE</th><th scope="col">RANK BEFORE → AFTER</th></tr></thead>
                <tbody>{changes.map(change => <tr key={change.category.name}>
                  <th scope="row">{change.category.name}</th><td>{formatStat(change.before.value)}</td><td>{formatStat(change.after.value)}</td>
                  <td className={change.direction > 0 ? "stat-positive" : change.direction < 0 ? "stat-negative" : "stat-neutral"}>{formatChange(change.delta)}<span className="sr-only">{change.delta === null ? " unavailable" : change.direction > 0 ? " improvement" : change.direction < 0 ? " decline" : " unchanged"}</span></td>
                  <td>{rankLabel(change.before)} → {rankLabel(change.after)}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </details>
        </article>;
      })}</div>
      <p className="context-note"><Icon name="info" /><span>Ranks include both updated rosters. T = tied rank. Comparisons use saved player stats, exclude IR, and do not predict future games or official standings.</span></p>
    </section>
  );
}

export default TradeImpact;
