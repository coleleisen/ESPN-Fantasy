import { analysisCategories, categoryAverage, heatTone, rankCategory, statValue, tradeImpacts, rankLabel } from "./statistics";

const makeTeam = (teamName, values) => ({ teamName, catAvg: Object.keys(values).map(name => ({ name, number: values[name] })) });

test("numeric ranks preserve zero, share tied places, and exclude missing or invalid values", () => {
  const teams = [makeTeam("A", { PTS: "100" }), makeTeam("B", { PTS: 100 }), makeTeam("C", { PTS: "0" }), makeTeam("D", {}), makeTeam("E", { PTS: "unknown" })];
  const ranked = rankCategory(teams, { name: "PTS" });
  expect(ranked.map(entry => entry.rank)).toEqual([1, 1, 3, null, null]);
  expect(ranked.map(entry => rankLabel(entry))).toEqual(["T1", "T1", "#3", "—", "—"]);
  expect(ranked[0].strength).toBe(0.75);
  expect(categoryAverage(teams, { name: "PTS" })).toBeCloseTo(200 / 3);
  expect(statValue([{ name: "PTS", number: "" }], "PTS")).toBeNull();
});

test("lower-is-better categories reverse ranks and explicit scoring metadata takes priority", () => {
  const teams = [makeTeam("A", { GA: 8 }), makeTeam("B", { GA: 2 }), makeTeam("C", { GA: 5 })];
  expect(rankCategory(teams, { name: "GA" }).map(entry => entry.team.teamName)).toEqual(["B", "C", "A"]);
  expect(rankCategory(teams, { name: "GA", lowerIsBetter: false }).map(entry => entry.team.teamName)).toEqual(["A", "C", "B"]);
});

test("all-tied and one-team categories receive neutral heatmap colors", () => {
  const teams = [makeTeam("A", { SO: 0 }), makeTeam("B", { SO: 0 }), makeTeam("C", { SO: 0 })];
  expect(rankCategory(teams, { name: "SO" }).map(entry => heatTone(entry.strength))).toEqual(["middle", "middle", "middle"]);
  expect(rankCategory(teams.slice(0, 1), { name: "SO" })[0].strength).toBe(0.5);
  expect(heatTone(null)).toBe("missing");
});

test("analytics prioritize fantasy points and exclude intermediate shooting totals", () => {
  const categories = ["MIN", "FGM", "FGA", "FTM", "FTA", "FG%", "G", "FPTS"].map(name => ({ name }));
  expect(analysisCategories(categories, [], "points").map(cat => cat.name)).toEqual(["FPTS", "FG%", "G"]);
  expect(analysisCategories([], [makeTeam("A", { FPTS: 10 })], "points").map(cat => cat.name)).toEqual(["FPTS"]);
});

test("trade ranks update both rosters simultaneously without mutating the saved teams", () => {
  const teams = [makeTeam("A", { FPTS: 100, GA: 10 }), makeTeam("B", { FPTS: 110, GA: 8 }), makeTeam("C", { FPTS: 108, GA: 9 })];
  const original = JSON.stringify(teams);
  const impacts = tradeImpacts(teams, [{ name: "FPTS" }, { name: "GA" }], 0, 1, makeTeam("A", { FPTS: 106.25, GA: 7 }).catAvg, makeTeam("B", { FPTS: 103.75, GA: 11 }).catAvg);
  expect(impacts[0].changes[0]).toMatchObject({ delta: 6.25, direction: 1, before: { rank: 3 }, after: { rank: 2 } });
  expect(impacts[1].changes[0]).toMatchObject({ delta: -6.25, direction: -1, before: { rank: 1 }, after: { rank: 3 } });
  expect(impacts[0].changes[1]).toMatchObject({ delta: -3, direction: 1, after: { rank: 1 } });
  expect(JSON.stringify(teams)).toBe(original);
});

test("trade changes keep unavailable categories unranked instead of treating them as zero", () => {
  const teams = [makeTeam("A", { PTS: 5 }), makeTeam("B", { PTS: 10 })];
  const impacts = tradeImpacts(teams, [{ name: "PTS" }, { name: "TO" }], 0, 1, [{ name: "PTS", number: 7.5 }], [{ name: "PTS", number: 7.5 }]);
  expect(impacts[0].changes[0].after).toMatchObject({ rank: 1, tied: true });
  expect(impacts[0].changes[1]).toMatchObject({ delta: null, direction: 0, before: { rank: null }, after: { rank: null } });
});
