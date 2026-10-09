import React, { useState } from "react";
import { Avatar, EmptyState, Icon, SectionHeading, teamLabel } from "./UI";
import { analysisCategories, primaryCategory, rankCategory, categoryAverage, formatStat, formatChange, rankLabel, heatTone, lowerIsBetter } from "./statistics";

function Heatmap({ teams, leagueAverage, scoringType }) {
  const categories = analysisCategories(leagueAverage, teams, scoringType);
  const [mode, setMode] = useState("ranks");
  const [sortName, setSortName] = useState("");
  const [focus, setFocus] = useState("");
  const [selection, setSelection] = useState(null);
  const sortCategory = categories.find(cat => cat.name === sortName) || primaryCategory(categories, scoringType);
  if (!teams.length || !sortCategory) return <EmptyState icon="heatmap" title="No statistics to map yet">Team category statistics will appear here once they are available.</EmptyState>;
  const rankings = categories.map(category => ({ category, entries: rankCategory(teams, category) }));
  const ordered = rankCategory(teams, sortCategory);
  const selectedCategory = selection && categories.find(cat => cat.name === selection.category);
  const selectedEntry = selectedCategory && rankings.find(row => row.category.name === selectedCategory.name).entries.find(entry => entry.index === selection.index);
  const average = selectedCategory ? categoryAverage(teams, selectedCategory) : null;
  const lowerCategories = categories.filter(lowerIsBetter).map(cat => cat.name);

  return (
    <section className="workspace-section" aria-label="Team strength heatmap">
      <SectionHeading eyebrow="FIND YOUR ADVANTAGE" title="Team strength heatmap" icon="heatmap">Every team, every category. A quick read on where each roster is strongest.</SectionHeading>
      <div className="heatmap-controls">
        <div><label htmlFor="heatmap-sort">Order teams by</label><div className="select-wrap"><select id="heatmap-sort" value={sortCategory.name} onChange={event => setSortName(event.target.value)}>{categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}{lowerIsBetter(cat) ? " · lower is better" : ""}</option>)}</select><Icon name="chevron" /></div></div>
        <div><label htmlFor="heatmap-focus">Highlight a team</label><div className="select-wrap"><select id="heatmap-focus" value={focus} onChange={event => setFocus(event.target.value)}><option value="">All teams</option>{teams.map((team, index) => <option key={team.teamName} value={index}>{teamLabel(team.teamName)}</option>)}</select><Icon name="chevron" /></div></div>
        <div><span className="control-label">Cell display</span><div className="segmented-control" role="group" aria-label="Heatmap display"><button type="button" aria-pressed={mode === "ranks"} onClick={() => setMode("ranks")}>Ranks</button><button type="button" aria-pressed={mode === "values"} onClick={() => setMode("values")}>Values</button></div></div>
      </div>
      <div className="heatmap-detail" role="status" aria-live="polite" aria-atomic="true">
        {selectedEntry ? <React.Fragment><span className={"detail-marker heat-" + heatTone(selectedEntry.strength)}><Icon name="heatmap" /></span><div><strong>{teamLabel(selectedEntry.team.teamName)} · {selectedCategory.name}</strong><p>{selectedEntry.rank === null ? "No value available in this snapshot." : <React.Fragment>{formatStat(selectedEntry.value)} · {selectedEntry.tied ? "Tied rank " : "Rank "}{selectedEntry.rank} of {selectedEntry.total} · {formatChange(Number((selectedEntry.value - average).toFixed(3)))} vs. league average ({formatStat(average)}). {lowerIsBetter(selectedCategory) ? "Lower is better." : "Higher is better."}</React.Fragment>}</p></div></React.Fragment> : <React.Fragment><Icon name="info" /><p>Tap any cell to see its value, rank, and difference from the league average.</p></React.Fragment>}
      </div>
      <div className="panel heatmap-panel">
        <div className="panel-heading"><div><h3>Roster strengths</h3><span className="count-badge">{teams.length} teams</span></div><div className="heatmap-legend" aria-label="Heatmap color scale"><span className="heat-strong">Stronger</span><span className="heat-middle">Middle</span><span className="heat-poor">Weaker</span></div></div>
        <div className="table-scroll" role="region" aria-label="Scrollable team strength heatmap" tabIndex="0">
          <table className="data-table standings-table heatmap-table" aria-label="Category strength matrix">
            <thead><tr><th scope="col">TEAM</th>{categories.map(cat => <th key={cat.name} scope="col" className={cat.name === "FPTS" && scoringType === "points" ? "points-column" : ""}>{cat.name}{lowerIsBetter(cat) && <React.Fragment><Icon name="down" /><span className="sr-only"> lower is better</span></React.Fragment>}</th>)}</tr></thead>
            <tbody>{ordered.map(({ team, index }) => <tr key={team.teamName} className={focus === "" ? "" : Number(focus) === index ? "focused-team" : "dimmed-team"}>
              <th scope="row"><div className="team-cell"><Avatar name={team.teamName} src={team.logo} /><span className="team-name">{teamLabel(team.teamName)}</span></div></th>
              {rankings.map(({ category, entries }) => {
                const entry = entries.find(value => value.index === index);
                return <td key={category.name}><button type="button" className={"heat-cell heat-" + heatTone(entry.strength)} aria-pressed={Boolean(selection && selection.index === index && selection.category === category.name)} aria-label={teamLabel(team.teamName) + ", " + category.name + ": " + formatStat(entry.value) + (entry.rank === null ? ", no data" : ", " + (entry.tied ? "tied rank " : "rank ") + entry.rank + " of " + entry.total)} onClick={() => setSelection({ index, category: category.name })}>{mode === "ranks" ? rankLabel(entry) : formatStat(entry.value)}</button></td>;
              })}
            </tr>)}</tbody>
          </table>
        </div>
        <div className="panel-footnote"><Icon name="info" /><span>Colors compare ranks within each category. T = tied rank; missing values are unranked. {lowerCategories.length > 0 && "Lower is better for " + lowerCategories.join(", ") + ". "}{scoringType === "points" && "FPTS determines the points comparison. "}<span className="mobile-scroll-hint">Swipe to explore all categories.</span></span></div>
      </div>
    </section>
  );
}

export default Heatmap;
