import React, { Component } from "react";
import { TeamSelect, SectionHeading, EmptyState, Icon } from "./UI";
import TradeTable from "./TradeTable";
import TradeImpact from "./TradeImpact";

class Trade extends Component {

 constructor(props){
   super(props)
   this.state={
    teamNameA : "",
    teamNameB : "",
    triggerA : false,
    triggerB : false,
    indexA : null,
    indexB : null,
    catAvgA : [],
    catAvgB : [],
    OgCatAvgA : [],
    OgCatAvgB : [],
    playersA : [],
    playersB : [],
    differenceA: [],
    differenceB : []
   }

   this.insertPlayerA = this.insertPlayerA.bind(this);
   this.insertPlayerB = this.insertPlayerB.bind(this);
   this.removePlayerB = this.removePlayerB.bind(this);
   this.removePlayerA = this.removePlayerA.bind(this);

 }

  calculateTrade = (playersA, playersB, indexA = this.state.indexA, indexB = this.state.indexB) => {
    const teamA = this.props.teams[indexA];
    const teamB = this.props.teams[indexB];
    const catAvgA = teamA ? teamA.catAvg.map(stat => ({ ...stat })) : [];
    const catAvgB = teamB ? teamB.catAvg.map(stat => ({ ...stat })) : [];
    const result = { playersA, playersB, catAvgA, catAvgB, differenceA: null, differenceB: null };
    if (!teamA || !teamB || !playersA.length || playersA.length !== playersB.length) return result;
    const total = (team, selected, name) => selected.reduce((sum, selection) => sum +
      (Number(team.players[selection.index].categories.find(stat => stat.name === name)?.number) || 0), 0);
    const adjust = (categories, outgoingTeam, outgoing, incomingTeam, incoming) => {
      categories.forEach(stat => {
        if (["FG%", "FT%"].includes(stat.name)) return;
        stat.number = Number((Number(stat.number) - total(outgoingTeam, outgoing, stat.name) + total(incomingTeam, incoming, stat.name)).toFixed(3));
      });
      categories.filter(stat => ["FG%", "FT%"].includes(stat.name)).forEach(stat => {
        const prefix = stat.name.slice(0, 2);
        const made = Number(categories.find(value => value.name === prefix + "M")?.number) || 0;
        const attempts = Number(categories.find(value => value.name === prefix + "A")?.number) || 0;
        stat.number = attempts ? Number((made / attempts).toFixed(3)) : 0;
      });
    };
    adjust(catAvgA, teamA, playersA, teamB, playersB);
    adjust(catAvgB, teamB, playersB, teamA, playersA);
    const differences = (categories, original) => categories.map(stat => Number((Number(stat.number) - Number(original.find(value => value.name === stat.name)?.number || 0)).toFixed(3)));
    result.differenceA = differences(catAvgA, teamA.catAvg);
    result.differenceB = differences(catAvgB, teamB.catAvg);
    return result;
  };

  insertPlayer = (side, name) => {
    const players = this.props.teams[this.state["index" + side]].players;
    const index = players.findIndex(player => player.name === name);
    const selected = this.state["players" + side];
    if (index < 0 || players[index].injured || selected.some(player => player.index === index)) return;
    const next = [...selected, { name, index }];
    this.setState(this.calculateTrade(side === "A" ? next : this.state.playersA, side === "B" ? next : this.state.playersB));
  };
  insertPlayerA = name => this.insertPlayer("A", name);
  insertPlayerB = name => this.insertPlayer("B", name);
  removePlayerA = index => this.setState(this.calculateTrade(this.state.playersA.filter((_, i) => i !== index), this.state.playersB));
  removePlayerB = index => this.setState(this.calculateTrade(this.state.playersA, this.state.playersB.filter((_, i) => i !== index)));

  selectTeam = (side, index) => {
    const indexA = side === "A" ? index : this.state.indexA;
    const indexB = side === "B" ? index : this.state.indexB;
    this.setState({ ...this.calculateTrade([], [], indexA, indexB),
      ["teamName" + side]: this.props.teams[index].teamName,
      ["trigger" + side]: true, ["index" + side]: index });
  };

  render() {
    const { indexA, indexB, triggerA, triggerB, playersA, playersB } = this.state;
    const ready = triggerA && triggerB;
    const balanced = playersA.length > 0 && playersA.length === playersB.length;
    return (
      <section className="workspace-section">
        <SectionHeading eyebrow="MAKE YOUR NEXT MOVE" title="Trade analyzer" icon="exchange">Build a potential trade. See the impact on both sides.</SectionHeading>
        <div className="team-selection-grid">
          <TeamSelect side="A" teams={this.props.teams} value={indexA} excluded={indexB} onChange={this.selectTeam} />
          <span className="versus-marker"><Icon name="exchange" /></span>
          <TeamSelect side="B" teams={this.props.teams} value={indexB} excluded={indexA} onChange={this.selectTeam} />
        </div>
        <div className={"trade-status" + (ready && balanced ? " trade-ready" : "")} role="status"><Icon name={ready && balanced ? "exchange" : "info"} /><span>{!ready ? "Choose two teams to start building a trade." : balanced ? "Trade preview ready. Review the projected stats for each team below." : playersA.length || playersB.length ? "Select the same number of players from each team to see the trade impact." : "Add players from each team. Equal-size trades update automatically."}</span>{ready && <span className="trade-count">{playersA.length} for {playersB.length}</span>}</div>
        {!triggerA && !triggerB && <EmptyState icon="exchange" title="A good trade starts with the numbers.">Select two teams above, then choose the players you want to exchange. See how the move changes each roster.</EmptyState>}
        {ready && balanced && <TradeImpact teams={this.props.teams} leagueAverage={this.props.leagueAverage} scoringType={this.props.scoringType} indexA={indexA} indexB={indexB} statsA={this.state.catAvgA} statsB={this.state.catAvgB} />}
        {(triggerA || triggerB) && <div className="trade-grid">
          {["A", "B"].map(side => this.state["trigger" + side] ? <TradeTable key={side} side={side} catAvg={this.state["catAvg" + side]} team={this.props.teams[this.state["index" + side]]} playerName={this.state["players" + side]} insertPlayer={this["insertPlayer" + side]} removePlayer={this["removePlayer" + side]} difference={this.state["difference" + side]} /> : <div key={side} className="waiting-team"><Icon name="people" />Select Team {side} above to add their players.</div>)}
        </div>}
        {ready && <div className="stat-legend"><span><span className="legend-dot positive" /> Improvement</span><span><span className="legend-dot negative" /> Decline</span><span>Preview only. Your actual rosters stay as they are.</span></div>}
      </section>
    );
  }
}

export default Trade;
