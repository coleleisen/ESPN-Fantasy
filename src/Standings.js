import React, { Component } from "react";
import CatTable from "./CatTable";
import StandingsTable from "./StandingsTable";
 
class Standings extends Component {
  render() {
    let teamer = JSON.parse(JSON.stringify(this.props.teams));
    return (
      <div>
        <h2>Standings</h2>
        <p>Compare your averages to other teams and the league average</p>
        <h3>League Averages</h3>
        <CatTable playerStats = {this.props.leagueAverage}></CatTable>
        <p>Click a category to sort the table by the specified category</p>
        <StandingsTable teams = {teamer} leagueAverage = {this.props.leagueAverage}></StandingsTable>
      </div>
    );
  }
}
 
export default Standings;