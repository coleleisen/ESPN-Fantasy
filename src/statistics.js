export function lowerIsBetter(stat) {
  return typeof stat.lowerIsBetter === "boolean"
    ? stat.lowerIsBetter
    : ["TO", "GAA", "GA"].includes(stat.name);
}

export function statValue(stats, name) {
  const stat = (stats || []).find(value => value.name === name);
  if (!stat || stat.number === null || stat.number === undefined || String(stat.number).trim() === "") return null;
  const value = Number(stat.number);
  return Number.isFinite(value) ? value : null;
}

export function analysisCategories(leagueAverage = [], teams = [], scoringType) {
  const categories = [];
  [...leagueAverage, ...teams.reduce((all, team) => all.concat(team.catAvg || []), [])].forEach(stat => {
    if (!["MIN", "FGA", "FGM", "FTA", "FTM"].includes(stat.name) && !categories.some(cat => cat.name === stat.name)) {
      categories.push(stat);
    }
  });
  if (scoringType === "points") categories.sort((a, b) => Number(b.name === "FPTS") - Number(a.name === "FPTS"));
  return categories;
}

export function primaryCategory(categories, scoringType) {
  return categories.find(cat => cat.name === (scoringType === "points" ? "FPTS" : "PTS")) || categories[0] || null;
}

export function rankCategory(teams, category) {
  if (!category) return [];
  const entries = teams.map((team, index) => ({ team, index, value: statValue(team.catAvg, category.name) }));
  const available = entries.filter(entry => entry.value !== null).sort((a, b) =>
    (lowerIsBetter(category) ? a.value - b.value : b.value - a.value) || a.index - b.index);
  const ranked = available.map(entry => {
    const first = available.findIndex(other => other.value === entry.value);
    const tiedCount = available.filter(other => other.value === entry.value).length;
    // Midpoint placement keeps a category neutral when every team is tied.
    const strength = available.length > 1 ? 1 - (first + (tiedCount - 1) / 2) / (available.length - 1) : 0.5;
    return { ...entry, rank: first + 1, tied: tiedCount > 1, strength, total: available.length };
  });
  return ranked.concat(entries.filter(entry => entry.value === null).map(entry =>
    ({ ...entry, rank: null, tied: false, strength: null, total: available.length })));
}

export function categoryAverage(teams, category) {
  const values = teams.map(team => statValue(team.catAvg, category.name)).filter(value => value !== null);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

export function formatStat(value) {
  return value === null || value === undefined || !Number.isFinite(Number(value)) ? "—" :
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value);
}

export function formatChange(value) {
  return value === null ? "—" : (value > 0 ? "+" : "") + formatStat(value);
}

export function rankLabel(entry) {
  return !entry || entry.rank === null ? "—" : (entry.tied ? "T" : "#") + entry.rank;
}

export function heatTone(strength) {
  if (strength === null) return "missing";
  return strength >= 0.8 ? "strong" : strength >= 0.6 ? "good" : strength >= 0.4 ? "middle" : strength >= 0.2 ? "weak" : "poor";
}

export function tradeImpacts(teams, categories, indexA, indexB, statsA, statsB) {
  const projected = teams.map((team, index) => index === indexA ? { ...team, catAvg: statsA } :
    index === indexB ? { ...team, catAvg: statsB } : team);
  const rankings = categories.map(category => ({
    category, before: rankCategory(teams, category), after: rankCategory(projected, category)
  }));
  return [indexA, indexB].map(index => ({
    team: teams[index],
    changes: rankings.map(({ category, before, after }) => {
      const original = before.find(entry => entry.index === index);
      const updated = after.find(entry => entry.index === index);
      const delta = original.value === null || updated.value === null ? null : Number((updated.value - original.value).toFixed(3));
      const direction = delta === null ? 0 : Math.sign(delta) * (lowerIsBetter(category) ? -1 : 1);
      return { category, before: original, after: updated, delta, direction };
    })
  }));
}
