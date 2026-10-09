import React from "react";
import CatTable from "./CatTable";
import { Avatar, Icon, teamLabel } from "./UI";

function TradeTable({ catAvg, team, playerName, insertPlayer, removePlayer, difference, side }) {
  const selectId = "player-" + side.toLowerCase();
  return (
    <article className={"panel trade-panel side-" + side.toLowerCase()}>
      <div className="trade-team-heading"><Avatar name={team.teamName} src={team.logo} /><div><p className="eyebrow">TEAM {side}</p><h3>{teamLabel(team.teamName)}</h3></div><span className="count-badge">{playerName.length} out</span></div>
      <div className="player-picker">
        <label htmlFor={selectId}>Add a player to trade</label>
        <div className="select-wrap">
          <select id={selectId} value="" onChange={event => insertPlayer(event.target.value)}>
            <option value="" disabled>{team.players && team.players.length ? "Choose a player…" : "No players available"}</option>
            {(team.players || []).map(player => <option key={player.name} value={player.name} disabled={player.injured || playerName.some(selected => selected.name === player.name)}>{player.name}{player.injured ? " (IR — unavailable)" : ""}</option>)}
          </select>
          <Icon name="chevron" />
        </div>
      </div>
      <div className="selected-players">
        {!playerName.length && <div className="player-placeholder"><Icon name="people" /><p>No players selected</p><span>Add players to see the impact of a trade.</span></div>}
        {playerName.map((selection, index) => {
          const player = team.players[selection.index];
          return <div key={player.name} className="player-card">
            <div className="player-heading"><Avatar name={player.name} src={player.image} className="player-avatar" /><div><h4>{player.name}</h4><span>Outgoing player</span></div><button type="button" className="icon-button" aria-label={"Remove " + player.name} onClick={() => removePlayer(index)}><Icon name="close" /></button></div>
            <CatTable playerStats={player.categories} label={player.name + " statistics"} />
          </div>;
        })}
      </div>
      <div className="trade-stats">
        <div className="panel-heading"><h4>{difference ? "Projected team stats" : "Current team stats"}</h4><span className={"badge" + (difference ? " badge-success" : "")}>{difference ? "After trade" : "Before trade"}</span></div>
        <CatTable playerStats={catAvg} difference={difference} label={teamLabel(team.teamName) + " team statistics"} />
      </div>
    </article>
  );
}

export default TradeTable;
