import React from "react";
import Fetch from "./Fetch";
import { Icon } from "./UI";

function Home() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById("main-content").focus(); }}>Skip to content</a>
      <header className="site-header">
        <div className="header-inner">
          <div className="brand"><span className="brand-symbol"><Icon name="chart" /></span><div><span className="brand-name">ESPN <span>Fantasy</span></span><span className="brand-caption">YOUR LEAGUE. YOUR EDGE.</span></div></div>
          <div className="header-actions"><span className="header-label">Fantasy sports, in focus<span className="accent-dot" /></span><a className="button button-secondary report-link" href={process.env.PUBLIC_URL + "/reports/dgfbl-all-years/"} aria-label="DGFBL all-years GM report" title="All-years DGFBL GM report"><Icon name="trophy" />GM reports</a></div>
        </div>
      </header>
      <main id="main-content" className="main-content" tabIndex="-1"><Fetch /></main>
      <footer className="site-footer"><span>Built for the way you play.</span><span>Independent fantasy tools for ESPN leagues.</span></footer>
    </div>
  );
}

export default Home;
