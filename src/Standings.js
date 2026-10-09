import React from "react";
import CatTable from "./CatTable";
import StandingsTable from "./StandingsTable";
import { SectionHeading, Icon } from "./UI";

function Standings({ teams, leagueAverage }) {
  return (
    <section className="workspace-section">
      <SectionHeading eyebrow="THE BIG PICTURE" title="League standings" icon="chart">Every team. Every category. See where the advantage is.</SectionHeading>
      <div className="panel averages-panel">
        <div className="panel-heading"><div><span className="small-icon"><Icon name="chart" /></span><h3>League averages</h3></div><span className="badge">The benchmark</span></div>
        <CatTable playerStats={leagueAverage} label="League averages" />
      </div>
      <div className="panel standings-panel">
        <div className="panel-heading"><div><h3>Team comparison</h3><span className="count-badge">{teams.length}</span></div><span className="table-hint"><Icon name="sort" /> Select a category to sort</span></div>
        <StandingsTable teams={teams} leagueAverage={leagueAverage} />
        <div className="panel-footnote"><Icon name="info" /><span>Compare team averages to the league benchmark above. <span className="mobile-scroll-hint">Swipe the table to explore all categories.</span></span></div>
      </div>
    </section>
  );
}

export default Standings;
