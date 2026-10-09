import React from "react";
import { lowerIsBetter } from "./statistics";
import { Icon } from "./UI";

function CatTable({ playerStats, difference, label = "Category statistics" }) {
  return (
    <div className="table-scroll" role="region" aria-label={label + ", scroll for more categories"} tabIndex="0">
      <table className="data-table category-table" aria-label={label}>
        <thead><tr>{playerStats.map((stat, i) => <th key={i} scope="col">{stat.name}</th>)}</tr></thead>
        <tbody>
          <tr>{playerStats.map((stat, i) => <td key={i}>{stat.number}</td>)}</tr>
          {difference && <tr className="difference-row">{difference.map((diff, i) => {
            const value = Number(diff);
            const improved = lowerIsBetter(playerStats[i]) ? value < 0 : value > 0;
            return <td key={i} className={value === 0 ? "stat-neutral" : improved ? "stat-positive" : "stat-negative"}><span className="stat-difference">{value !== 0 && <Icon name={improved ? "up" : "down"} />}<span>{diff}</span><span className="sr-only">{value === 0 ? " unchanged" : improved ? " improvement" : " decline"}</span></span></td>;
          })}</tr>}
        </tbody>
      </table>
    </div>
  );
}

export default CatTable;
