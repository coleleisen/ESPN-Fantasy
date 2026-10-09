import React, { Component } from "react";
import { Avatar, Icon, teamLabel } from "./UI";

class StandingsTable extends Component {
  state = { selected: null, ascending: false };

  sortTable = index => {
    this.setState(state => ({
      selected: index,
      ascending: state.selected === index ? !state.ascending : false
    }));
  };

  render() {
    const { selected, ascending } = this.state;
    const teams = [...this.props.teams];
    if (selected !== null) {
      teams.sort((a, b) => {
        const category = this.props.leagueAverage[selected].name;
        const aStat = a.catAvg.find(cat => cat.name === category);
        const bStat = b.catAvg.find(cat => cat.name === category);
        return ((Number(bStat && bStat.number) || 0) - (Number(aStat && aStat.number) || 0)) * (ascending ? -1 : 1);
      });
    }
    return (
      <div className="table-scroll" role="region" aria-label="Scrollable team standings" tabIndex="0">
        <table className="data-table standings-table" aria-label="Team standings">
          <thead>
            <tr>
              <th scope="col"><button className="stat-sort team-sort" type="button" onClick={() => this.sortTable(null)}>TEAM <Icon name="sort" /></button></th>
              {this.props.leagueAverage.map((cat, i) => (
                <th key={cat.name} scope="col" aria-sort={selected === i ? ascending ? "ascending" : "descending" : "none"} className={selected === i ? "selected-column" : ""}>
                  <button className="stat-sort" type="button" onClick={() => this.sortTable(i)}>{cat.name} <Icon name={selected === i ? ascending ? "up" : "down" : "sort"} /></button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map(team => (
              <tr key={team.teamName}>
                <th scope="row"><div className="team-cell"><Avatar name={team.teamName} src={team.logo} /><span className="team-name">{teamLabel(team.teamName)}</span></div></th>
                {this.props.leagueAverage.map((cat, i) => {
                  const stat = team.catAvg.find(value => value.name === cat.name);
                  return <td key={cat.name} className={selected === i ? "selected-column" : ""}>{stat ? stat.number : "--"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default StandingsTable;
