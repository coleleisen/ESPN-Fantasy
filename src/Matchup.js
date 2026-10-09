import React, { Component } from "react";
import { TeamSelect, SectionHeading, EmptyState, Avatar, Icon, teamLabel } from "./UI";
import CatTable from "./CatTable";
import { lowerIsBetter } from "./statistics";

class Matchup extends Component {

  constructor(props){
    super(props)
    this.state={
     teamNameA : "",
     teamNameB : "",
     triggerA : false,
     triggerB : false,
     indexA : null,
     indexB: null,
     catAvgA : [],
     catAvgB : [],
     differenceA: [],
     differenceB :[],
     countA : 0,
     countB : 0
    }

  }

  selectTeam = (side, index) => {
    this.setState(previous => {
      const next = { ...previous, ["index" + side]: index, ["trigger" + side]: true,
        ["teamName" + side]: this.props.teams[index].teamName };
      const stats = teamIndex => this.props.teams[teamIndex].catAvg.filter(stat =>
        !["MIN", "FTA", "FTM", "FGA", "FGM"].includes(stat.name));
      next["catAvg" + side] = stats(index);
      next.differenceA = null;
      next.differenceB = null;
      next.countA = 0;
      next.countB = 0;
      if (next.triggerA && next.triggerB) {
        const value = (categories, name) => Number(categories.find(stat => stat.name === name)?.number) || 0;
        next.differenceA = next.catAvgA.map(stat => (Number(stat.number) - value(next.catAvgB, stat.name)).toFixed(2));
        next.differenceB = next.catAvgB.map(stat => (Number(stat.number) - value(next.catAvgA, stat.name)).toFixed(2));
        if (this.props.scoringType === "points") {
          next.countA = value(next.catAvgA, "FPTS");
          next.countB = value(next.catAvgB, "FPTS");
        } else {
          next.catAvgA.forEach(stat => {
            const difference = Number(stat.number) - value(next.catAvgB, stat.name);
            if (!difference) return;
            if (lowerIsBetter(stat) ? difference < 0 : difference > 0) next.countA++;
            else next.countB++;
          });
        }
      }
      return next;
    });
  };


  render() {
    const { teamNameA, teamNameB, indexA, indexB, triggerA, triggerB, countA, countB } = this.state;
    const ready = triggerA && triggerB;
    return (
      <section className="workspace-section">
        <SectionHeading eyebrow="HEAD TO HEAD" title="Matchup analysis" icon="matchup">Pick your opponent. Find your edge in every category.</SectionHeading>
        <div className="team-selection-grid">
          <TeamSelect side="A" teams={this.props.teams} value={indexA} excluded={indexB} onChange={this.selectTeam} />
          <span className="versus-marker">VS</span>
          <TeamSelect side="B" teams={this.props.teams} value={indexB} excluded={indexA} onChange={this.selectTeam} />
        </div>
        <p className="context-note"><Icon name="info" />{this.props.scoringType === "points" ? "Points league: the comparison uses total fantasy points (FPTS)." : "Comparisons use current-roster statistics, excluding IR."}</p>
        {ready && <div className="matchup-result" role="status">
          <span className="result-icon"><Icon name="trophy" /></span>
          <div className="result-copy"><p className="eyebrow">{this.props.scoringType === "points" ? "FANTASY POINTS COMPARISON" : "CATEGORY ADVANTAGE"}</p><h3>{countA === countB ? "Tie" : "Winner : " + teamLabel(countA > countB ? teamNameA : teamNameB)}</h3><p>Based on current averages</p></div>
          <div className="result-score">{Math.max(countA, countB)} - {Math.min(countA, countB)}</div>
        </div>}
        {!triggerA && !triggerB && <EmptyState icon="matchup" title="How do your teams match up?">Select Team A and Team B above to compare their strengths, category by category.</EmptyState>}
        {(triggerA || triggerB) && <div className="matchup-teams">
          {["A", "B"].map(side => {
            const team = this.props.teams[this.state["index" + side]];
            return team ? <article key={side} className={"panel matchup-team side-" + side.toLowerCase()}>
              <div className="panel-heading"><div><Avatar name={team.teamName} src={team.logo} /><div><p className="eyebrow">TEAM {side}</p><h3>{teamLabel(team.teamName)}</h3></div></div><span className="badge">Roster averages</span></div>
              <CatTable playerStats={this.state["catAvg" + side]} difference={this.state["difference" + side]} label={teamLabel(team.teamName) + " matchup statistics"} />
            </article> : <div key={side} className="waiting-team"><Icon name="people" />Select Team {side} above to complete the comparison.</div>;
          })}
        </div>}
        {ready && <div className="stat-legend"><span><span className="legend-dot positive" /> Category advantage</span><span><span className="legend-dot negative" /> Category disadvantage</span><span>Differences are relative to the other team.</span></div>}
      </section>
    );
  }
}

export default Matchup;
