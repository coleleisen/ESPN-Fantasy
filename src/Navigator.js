import React, { Component } from "react";
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Scrape from "./Scrape";
import Fetch from "./Fetch";
import Trade from "./Trade";
import Standings from "./Standings";
import Matchup from "./Matchup";

class Navigator extends Component {
  render() {
    return (
      
    <HashRouter>
       
          <NavLink to="/standings" >
      <button type="button" className="btn-lg" style = {{width : "30%", backgroundColor : "rgb(24, 26, 27)",borderColor : "rgb(24, 26, 27)", color : "white"}}>
            Standings
     </button>
          </NavLink>   
          <NavLink to="/trade" >
     
      <button type="button" className="btn-lg" style = {{width : "30%", backgroundColor : "rgb(24, 26, 27)",borderColor : "rgb(24, 26, 27)", color : "white"}}>    
            Trade
     </button>
     
          </NavLink> 
          <NavLink to="/matchup" >
     
      <button type="button" className="btn-lg" style = {{width : "30%", backgroundColor : "rgb(24, 26, 27)",borderColor : "rgb(24, 26, 27)", color : "white"}}>    
            Matchup
     </button>
     
          </NavLink> 
      <Route path="/trade"  render={(props) => <Trade {...props} teams={this.props.teams} leagueAverage ={this.props.leagueAverage} />}/>
      <Route path="/standings"  render={(props) => <Standings {...props} teams={this.props.teams} leagueAverage ={this.props.leagueAverage} />} />
      <Route path="/matchup"  render={(props) => <Matchup {...props} teams={this.props.teams} leagueAverage ={this.props.leagueAverage} />}/>
    </HashRouter>
    )}
}
 
export default Navigator;