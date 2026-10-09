import React from "react";
import { render, fireEvent, wait, cleanup, within } from "@testing-library/react";
import axios from "axios";
import App from "./App";
import Matchup from "./Matchup";
import CatTable from "./CatTable";

jest.mock("axios");

const categories = (pts, turnovers) => [
  { name: "PTS", number: String(pts) },
  { name: "TO", number: String(turnovers) }
];
const makeLeague = (name = "DGFBL") => ({
  leagueName: name,
  catAvg: categories(9.5, 2.5),
  teams: [
    { teamName: "Alpha", logo: "", catAvg: categories(9, 3), players: [
      { name: "Player Alpha", image: "", injured: false, categories: categories(3, 1) }
    ] },
    { teamName: "Beta", logo: "", catAvg: categories(10, 2), players: [
      { name: "Player Beta", image: "", injured: false, categories: categories(5, 2) },
      { name: "Injured Player", image: "", injured: true, categories: categories(1, 1) }
    ] }
  ]
});

let consoleError;
let consoleLog;
beforeEach(() => {
  window.history.replaceState(null, "", "/");
  axios.post.mockReset();
  consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  const errors = consoleError.mock.calls;
  consoleError.mockRestore();
  consoleLog.mockRestore();
  expect(errors).toEqual([]);
});

async function loadLeague(view, league = makeLeague()) {
  axios.post.mockResolvedValueOnce({ data: league });
  fireEvent.click(view.getByLabelText("Find league"));
  await wait(() => expect(view.getByLabelText("League sections")).toBeInTheDocument());
}

function selectTeams(container) {
  fireEvent.change(container.querySelector("#team-a"), { target: { value: "0" } });
  fireEvent.change(container.querySelector("#team-b"), { target: { value: "1" } });
}

test("renders an accessible league form and opens the overview after loading", async () => {
  const view = render(<App />);
  expect(view.container.querySelector("h1")).toHaveTextContent("A clearer view.");
  expect(view.getByLabelText("League name")).toHaveValue("DGFBL");
  await loadLeague(view);
  expect(axios.post).toHaveBeenCalledWith(
    "https://espnapp.onrender.com/fetch", { league: "DGFBL" }, { timeout: 60000 }
  );
  expect(view.getByLabelText("League overview")).toBeInTheDocument();
  expect(new URLSearchParams(window.location.search).get("league")).toBe("DGFBL");
  expect(view.container.querySelector("a button")).toBeNull();
  expect(view.container.querySelector("tr p")).toBeNull();
});

test("opens a league link automatically, keeps its section, and shows the saved date", async () => {
  window.history.replaceState(null, "", "/?league=IFHL#/matchup");
  axios.post.mockResolvedValueOnce({ data: { ...makeLeague("IFHL"), lastUpdate: "2026-10-09T00:41:10.638Z" } });
  const view = render(<App />);
  await wait(() => expect(view.getByLabelText("Team A")).toBeInTheDocument());
  expect(view.container.querySelector("h1")).toHaveTextContent("IFHL");
  expect(view.container.querySelector("time")).toHaveAttribute("datetime", "2026-10-09T00:41:10.638Z");
  expect(window.location.hash).toBe("#/matchup");
  expect(axios.post).toHaveBeenCalledTimes(1);
  expect(axios.post).toHaveBeenCalledWith(
    "https://espnapp.onrender.com/fetch", { league: "IFHL" }, { timeout: 60000 }
  );
});

test("an unavailable league link returns to a usable form and can be retried", async () => {
  window.history.replaceState(null, "", "/?league=IFHL#/standings");
  axios.post.mockRejectedValueOnce(new Error("offline"));
  const view = render(<App />);
  await wait(() => expect(view.getByRole("alert")).toHaveTextContent(/Could not reach/));
  expect(view.getByLabelText("League name")).toHaveValue("IFHL");
  expect(view.getByLabelText("Find league")).not.toBeDisabled();
  await loadLeague(view, makeLeague("IFHL"));
  expect(view.getByLabelText("Team standings")).toBeInTheDocument();
});

test("keeps the form disabled during a pending request", async () => {
  let resolve;
  axios.post.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  const view = render(<App />);
  fireEvent.click(view.getByLabelText("Find league"));
  expect(view.getByLabelText("Find league")).toBeDisabled();
  expect(view.getByRole("status")).toHaveTextContent("Loading league");
  resolve({ data: makeLeague() });
  await wait(() => expect(view.getByLabelText("League sections")).toBeInTheDocument());
});

test.each([
  ["unknown league", { status: "fail" }, /No fantasy league/],
  ["invalid response", {}, /could not be loaded/]
])("shows a useful error for %s", async (label, data, message) => {
  axios.post.mockResolvedValueOnce({ data });
  const view = render(<App />);
  fireEvent.click(view.getByLabelText("Find league"));
  await wait(() => expect(view.getByRole("alert")).toHaveTextContent(message));
  expect(view.getByLabelText("Find league")).not.toBeDisabled();
  expect(view.queryByLabelText("League sections")).toBeNull();
});

test("shows network failures and lets the user retry", async () => {
  axios.post.mockRejectedValueOnce(new Error("offline"));
  const view = render(<App />);
  fireEvent.click(view.getByLabelText("Find league"));
  await wait(() => expect(view.getByRole("alert")).toHaveTextContent(/Could not reach/));
  await loadLeague(view);
  expect(view.queryByRole("alert")).toBeNull();
});

test("sorts numeric standings in both directions without changing team names", async () => {
  const view = render(<App />);
  await loadLeague(view);
  fireEvent.click(view.container.querySelector('a[href="#/standings"]'));
  const table = view.getByLabelText("Team standings");
  const teamNames = () => Array.from(table.querySelectorAll("tbody .team-name")).map(cell => cell.textContent);
  expect(teamNames()).toEqual(["Alpha", "Beta"]);
  fireEvent.click(table.querySelectorAll("thead button")[1]);
  expect(teamNames()).toEqual(["Beta", "Alpha"]);
  fireEvent.click(table.querySelectorAll("thead button")[1]);
  expect(teamNames()).toEqual(["Alpha", "Beta"]);
  expect(table.querySelectorAll("thead th")[1]).toHaveAttribute("aria-sort", "ascending");
});

test("matchup selects teams without rank prefixes and compares numbers numerically", async () => {
  const view = render(<App />);
  await loadLeague(view);
  fireEvent.click(view.container.querySelector('a[href="#/matchup"]'));
  selectTeams(view.container);
  expect(view.getByText("Winner : Beta")).toBeInTheDocument();
  expect(view.getByText("2 - 0")).toBeInTheDocument();
});

test("matchup reports a tie instead of declaring team B the winner", () => {
  const league = makeLeague();
  league.teams[1].catAvg = categories(9, 3);
  const view = render(<Matchup teams={league.teams} />);
  selectTeams(view.container);
  expect(view.getByText("Tie")).toBeInTheDocument();
  expect(view.getByText("0 - 0")).toBeInTheDocument();
});

test("hockey matchups favor lower goals-against averages and show the improvement", () => {
  const league = makeLeague("IFHL");
  league.teams[0].catAvg = [{ name: "GAA", number: "2.1", lowerIsBetter: true }];
  league.teams[1].catAvg = [{ name: "GAA", number: "3.2", lowerIsBetter: true }];
  const view = render(<Matchup teams={league.teams} />);
  selectTeams(view.container);
  expect(view.getByText("Winner : Alpha")).toBeInTheDocument();
  expect(view.getByText("1 - 0")).toBeInTheDocument();
  expect(view.getByText("-1.10").closest("td")).toHaveClass("stat-positive");
});

test("a hockey points league compares fantasy totals even when the other team leads more categories", async () => {
  const league = makeLeague("IFHL");
  league.scoringType = "points";
  league.teams[0].catAvg = [{ name: "G", number: "0" }, { name: "A", number: "1" }, { name: "FPTS", number: "11.55" }];
  league.teams[1].catAvg = [{ name: "G", number: "1" }, { name: "A", number: "2" }, { name: "FPTS", number: "9.25" }];
  const view = render(<App />);
  await loadLeague(view, league);
  fireEvent.click(view.container.querySelector('a[href="#/matchup"]'));
  selectTeams(view.container);
  expect(view.getByText("Winner : Alpha")).toBeInTheDocument();
  expect(view.getByText("11.55 - 9.25")).toBeInTheDocument();
});

test("trade supports player selection, injury restrictions and removal", async () => {
  const view = render(<App />);
  await loadLeague(view);
  fireEvent.click(view.container.querySelector('a[href="#/trade"]'));
  selectTeams(view.container);
  expect(view.getByText("Injured Player (IR — unavailable)")).toBeDisabled();
  fireEvent.change(view.container.querySelector("#player-a"), { target: { value: "Player Alpha" } });
  fireEvent.change(view.container.querySelector("#player-b"), { target: { value: "Player Beta" } });
  expect(view.getByLabelText("Remove Player Alpha")).toBeInTheDocument();
  expect(view.getByLabelText("Remove Player Beta")).toBeInTheDocument();
  expect(within(view.getByLabelText("Alpha team statistics")).getByText("11")).toBeInTheDocument();
  expect(within(view.getByLabelText("Beta team statistics")).getByText("8")).toBeInTheDocument();
  expect(view.getByLabelText("Trade impact summary")).toBeInTheDocument();
  expect(view.getByLabelText("Alpha trade category changes")).toHaveTextContent("#2 → #1");
  fireEvent.click(view.getByLabelText("Remove Player Alpha"));
  expect(view.queryByLabelText("Remove Player Alpha")).toBeNull();
  expect(view.queryByLabelText("Trade impact summary")).toBeNull();
});

test("hockey trades keep fractional points and reset selected players when a team changes", async () => {
  const league = makeLeague("IFHL");
  league.catAvg = [{ name: "FPTS", number: "20" }];
  league.teams.forEach((team, i) => {
    team.catAvg = [{ name: "FPTS", number: "20" }];
    team.players = [{ name: "Goalie " + i, categories: [{ name: "FPTS", number: i ? "5.25" : "3.1" }] }];
  });
  const view = render(<App />);
  await loadLeague(view, league);
  fireEvent.click(view.container.querySelector('a[href="#/trade"]'));
  selectTeams(view.container);
  fireEvent.change(view.container.querySelector("#player-a"), { target: { value: "Goalie 0" } });
  fireEvent.change(view.container.querySelector("#player-b"), { target: { value: "Goalie 1" } });
  expect(within(view.getByLabelText("Alpha team statistics")).getByText("22.15")).toBeInTheDocument();
  expect(within(view.getByLabelText("Beta team statistics")).getByText("17.85")).toBeInTheDocument();
  fireEvent.change(view.container.querySelector("#team-a"), { target: { value: "0" } });
  expect(view.queryByLabelText("Remove Goalie 0")).toBeNull();
  expect(view.queryByLabelText("Remove Goalie 1")).toBeNull();
});

test("changing leagues resets the current page's selected teams", async () => {
  const view = render(<App />);
  await loadLeague(view);
  fireEvent.click(view.container.querySelector('a[href="#/matchup"]'));
  selectTeams(view.container);
  fireEvent.click(view.getByText("Change League"));
  expect(new URLSearchParams(window.location.search).has("league")).toBe(false);
  expect(view.queryByText("Winner : Beta")).toBeNull();
  fireEvent.change(view.getByLabelText("League name"), { target: { value: "Second" } });
  await loadLeague(view, makeLeague("Second"));
  expect(view.getByText("Second")).toBeInTheDocument();
  expect(view.queryByText("Winner : Beta")).toBeNull();
});

test("category tables contain valid cells and no arrows for unchanged values", () => {
  const view = render(<CatTable playerStats={categories(9, 3)} difference={[0, 0]} />);
  expect(view.container.querySelector("tr p")).toBeNull();
  expect(view.container.querySelectorAll("tbody td")).toHaveLength(4);
  expect(view.container.querySelector(".stat-difference svg")).toBeNull();
});
