import React, { Component } from "react";
import axios from "axios";
import Navigator from "./Navigator";
import { Icon } from "./UI";

const apiBaseUrl = (process.env.REACT_APP_API_URL || (process.env.NODE_ENV === "development" ? "" : "https://espnapp.onrender.com")).replace(/\/+$/, "");

class Fetch extends Component {
  leagueFromUrl = (new URLSearchParams(window.location.search).get("league") || "").trim();

  state = {
    catAverage: [],
    teams: [],
    league: this.leagueFromUrl || "DGFBL",
    confirmedLeague: "",
    lastUpdate: null,
    loading: false,
    error: "",
    collapse: false,
    revision: 0
  };

  componentDidMount() {
    if (this.leagueFromUrl) this.loadLeague();
  }

  handleChange = event => this.setState({ league: event.target.value });

  handleSubmit = event => {
    event.preventDefault();
    this.loadLeague();
  };

  updateLeagueUrl = league => {
    const url = new URL(window.location.href);
    if (league) url.searchParams.set("league", league);
    else url.searchParams.delete("league");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  };

  changeLeague = () => {
    this.updateLeagueUrl(null);
    this.setState({ collapse: false, confirmedLeague: "" });
  };

  loadLeague = async () => {
    const league = this.state.league.trim();
    if (!league || this.state.loading) return;
    this.setState({ loading: true, error: "", confirmedLeague: "" });

    try {
      const { data } = await axios.post(apiBaseUrl + "/fetch", { league }, { timeout: 60000 });
      if (data.status === "fail") {
        this.setState({ error: "No fantasy league with that name in our database." });
      } else if (!data.leagueName || !Array.isArray(data.teams) || !Array.isArray(data.catAvg)) {
        this.setState({ error: "The league data could not be loaded. Please try again." });
      } else {
        this.updateLeagueUrl(data.leagueName);
        this.setState(state => ({
          catAverage: data.catAvg,
          teams: data.teams,
          scoringType: data.scoringType,
          confirmedLeague: data.leagueName,
          lastUpdate: data.lastUpdate || data.lastUpdated || null,
          collapse: true,
          revision: state.revision + 1
        }));
      }
    } catch (error) {
      this.setState({ error: "Could not reach the league service. Please try again." });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { collapse, confirmedLeague, loading, league, error, teams, catAverage, scoringType, revision } = this.state;
    const updatedAt = this.state.lastUpdate ? new Date(this.state.lastUpdate) : null;
    return (
      <div>
        {!collapse && <React.Fragment>
          <section className="welcome-grid">
            <div className="welcome-copy">
              <p className="eyebrow"><span className="eyebrow-line" /> THE FANTASY TOOLKIT</p>
              <h1>A clearer view.<br /><span>A better game.</span></h1>
              <p className="welcome-description">Know your league. Find your advantage. Turn the numbers into your next great move.</p>
              <div className="welcome-tags"><span><Icon name="chart" /> Compare teams</span><span><Icon name="exchange" /> Explore trades</span></div>
            </div>
            <div className="connect-card">
              <div className="card-topline"><span className="eyebrow">YOUR NEXT MOVE STARTS HERE</span><Icon name="arrow" /></div>
              <h2>Open your league</h2>
              <p>Your teams, your stats, all in one place.</p>
              <form onSubmit={this.handleSubmit} aria-busy={loading}>
                <label htmlFor="league-name">League name</label>
                <div className="input-wrap"><Icon name="search" /><input id="league-name" type="text" name="league" value={league} onChange={this.handleChange} required disabled={loading} autoComplete="off" spellCheck="false" aria-describedby={error ? "league-error league-hint" : "league-hint"} aria-invalid={Boolean(error)} /></div>
                <button type="submit" className="button button-primary" disabled={loading || !league.trim()} aria-label="Find league">{loading ? <React.Fragment><span className="spinner" /> Loading league...</React.Fragment> : <React.Fragment>Explore league <Icon name="arrow" /></React.Fragment>}</button>
                {error && <p className="notice notice-error" id="league-error" role="alert"><Icon name="info" />{error}</p>}
                {loading && <p className="loading-note" role="status">Loading league… This may take up to a minute.</p>}
                <p className="form-hint" id="league-hint">Use a league in our database. Try <strong>DGFBL</strong> to get started.</p>
              </form>
              <div className="connect-note"><Icon name="shield" /><span>Explore the numbers. Plan your next move.</span></div>
            </div>
          </section>
          <section className="toolkit" aria-label="Your fantasy toolkit">
            <div className="toolkit-heading"><h2>Less guesswork. More game plan.</h2><span>YOUR LEAGUE, FROM EVERY ANGLE.</span></div>
            <div className="feature-grid">
              {[
                { icon: "overview", title: "See where you stand", text: "Start with your league overview, explore the leaders, and compare every team's statistics.", label: "Overview & standings" },
                { icon: "heatmap", title: "Find your advantage", text: "Map each roster's strengths, then go head to head to see where your team has the edge.", label: "Heatmap & matchups" },
                { icon: "exchange", title: "Make a smarter trade", text: "See before-and-after stats, fantasy points, and category ranks for both sides of a trade.", label: "Trade analyzer" }
              ].map((feature, index) => <article className="feature" key={feature.icon}><div className="feature-top"><Icon name={feature.icon} /><span>0{index + 1}</span></div><h3>{feature.title}</h3><p>{feature.text}</p><span className="feature-label">{feature.label}<Icon name="arrow" /></span></article>)}
            </div>
          </section>
        </React.Fragment>}
        {confirmedLeague && <React.Fragment>
          <div className="league-header">
            <div><p className="eyebrow">YOUR LEAGUE WORKSPACE</p><h1>{confirmedLeague}</h1><div className="league-meta"><span><Icon name="people" />{teams.length} teams</span><span>{scoringType === "points" ? "Points scoring" : "Category comparison"}</span>{updatedAt && !Number.isNaN(updatedAt.getTime()) && <span><time dateTime={updatedAt.toISOString()}>Saved {updatedAt.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</time></span>}</div></div>
            <button type="button" className="button button-secondary" onClick={this.changeLeague}><Icon name="exchange" />Change League</button>
          </div>
          <Navigator key={revision} teams={teams} leagueAverage={catAverage} scoringType={scoringType} />
        </React.Fragment>}
      </div>
    );
  }
}

export default Fetch;
