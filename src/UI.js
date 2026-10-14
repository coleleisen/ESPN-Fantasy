import React, { useState } from "react";

const paths = {
  chat: <React.Fragment><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5A8.5 8.5 0 0 1 10.5 3h2A8.5 8.5 0 0 1 21 11.5Z" /><path d="M7 10h9M7 14h6" /></React.Fragment>,
  overview: <React.Fragment><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></React.Fragment>,
  heatmap: <React.Fragment><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18m6-18v18" /><path d="M4 4h4v4H4zm12 6h4v4h-4zm-6 6h4v4h-4z" fill="currentColor" stroke="none" /></React.Fragment>,
  chart: <React.Fragment><path d="M4 20V10m8 10V4m8 16v-7" /><path d="M2 20h20" /></React.Fragment>,
  exchange: <React.Fragment><path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4" /></React.Fragment>,
  matchup: <React.Fragment><path d="m4 4 6 6m4 4 6 6M4 20l6-6m4-4 6-6M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5" /></React.Fragment>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  search: <React.Fragment><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></React.Fragment>,
  chevron: <path d="m6 9 6 6 6-6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  sort: <path d="m8 3-4 4M8 3v18m8 0 4-4m-4 4V3" />,
  up: <path d="M12 20V4m-6 6 6-6 6 6" />,
  down: <path d="M12 4v16m-6-6 6 6 6-6" />,
  trophy: <React.Fragment><path d="M8 3h8v7a4 4 0 0 1-8 0V3ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 14v6m-5 1h10" /></React.Fragment>,
  info: <React.Fragment><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v.01" /></React.Fragment>,
  people: <React.Fragment><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m3 10v-3a6 6 0 0 0-2-4" /></React.Fragment>,
  shield: <React.Fragment><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></React.Fragment>
};

export function Icon({ name, className = "" }) {
  return <svg className={"icon " + className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name] || paths.chart}</svg>;
}

export const teamLabel = name => name.replace(/^\d+\s+/, "");

export function Avatar({ name, src, className = "" }) {
  const [failedSource, setFailedSource] = useState(null);
  const initials = teamLabel(name).split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase();
  return <span className={"avatar " + className} aria-hidden="true">{src && failedSource !== src ? <img src={src} alt="" onError={() => setFailedSource(src)} /> : initials}</span>;
}

export function TeamSelect({ side, teams, value, excluded, onChange }) {
  const id = "team-" + side.toLowerCase();
  return (
    <div className={"team-selector side-" + side.toLowerCase()}>
      <div className="team-selector-heading"><span className="side-marker">{side}</span><label htmlFor={id}>Team {side}</label></div>
      <div className="select-wrap">
        <select id={id} value={value === null ? "" : value} onChange={event => onChange(side, Number(event.target.value))}>
          <option value="" disabled>Select Team {side}</option>
          {teams.map((team, index) => <option key={team.teamName} value={index} disabled={index === excluded}>{teamLabel(team.teamName)}</option>)}
        </select>
        <Icon name="chevron" />
      </div>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, children, icon }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="section-description">{children}</p></div><span className="section-icon"><Icon name={icon} /></span></div>;
}

export function EmptyState({ icon, title, children }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name={icon} /></span><h3>{title}</h3><p>{children}</p></div>;
}
