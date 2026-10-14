import React from "react";
import { Route, NavLink, HashRouter, Switch, Redirect } from "react-router-dom";
import Trade from "./Trade";
import Standings from "./Standings";
import Matchup from "./Matchup";
import Overview from "./Overview";
import Heatmap from "./Heatmap";
import Advisor from "./Advisor";
import { Icon } from "./UI";

function Navigator({ league, teams, leagueAverage, scoringType }) {
  return (
    <HashRouter>
      <nav className="league-navigation" aria-label="League sections">
        <NavLink to="/overview"><Icon name="overview" />Overview</NavLink>
        <NavLink to="/standings"><Icon name="chart" />Standings</NavLink>
        <NavLink to="/heatmap"><Icon name="heatmap" />Heatmap</NavLink>
        <NavLink to="/matchup"><Icon name="matchup" />Matchup</NavLink>
        <NavLink to="/trade"><Icon name="exchange" />Trade<span className="nav-long-label"> analyzer</span></NavLink>
        <NavLink to="/scraper-agent"><Icon name="chat" />Scraper Agent</NavLink>
      </nav>
      <Switch>
        <Route path="/scraper-agent" render={() => <Advisor key={league} league={league} />} />
        <Redirect from="/advisor" to="/scraper-agent" />
        <Route path="/overview" render={() => <Overview teams={teams} leagueAverage={leagueAverage} scoringType={scoringType} />} />
        <Route path="/heatmap" render={() => <Heatmap teams={teams} leagueAverage={leagueAverage} scoringType={scoringType} />} />
        <Route path="/trade" render={() => <Trade teams={teams} leagueAverage={leagueAverage} scoringType={scoringType} />} />
        <Route path="/standings" render={() => <Standings teams={teams} leagueAverage={leagueAverage} />} />
        <Route path="/matchup" render={() => <Matchup teams={teams} leagueAverage={leagueAverage} scoringType={scoringType} />} />
        <Redirect to="/overview" />
      </Switch>
    </HashRouter>
  );
}

export default Navigator;
