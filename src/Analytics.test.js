import React from "react";
import { render, fireEvent, cleanup, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Overview from "./Overview";
import Heatmap from "./Heatmap";
import TradeImpact from "./TradeImpact";

const cats = (points, turnovers) => [{ name: "FPTS", number: points }, { name: "TO", number: turnovers }];
const teams = [
  { teamName: "Alpha", catAvg: cats(100, 2), players: [{ name: "One" }] },
  { teamName: "Beta", catAvg: cats(110, 6), players: [{ name: "Two" }, { name: "Three", injured: true }] },
  { teamName: "Gamma", catAvg: cats(108, 4), players: [] }
];
const props = { teams, leagueAverage: cats(106, 4), scoringType: "points" };
afterEach(cleanup);

test("overview emphasizes fantasy points and changes leaders correctly for lower-is-better stats", () => {
  const view = render(<MemoryRouter><Overview {...props} /></MemoryRouter>);
  expect(view.getByLabelText("Compare a category")).toHaveValue("FPTS");
  expect(view.getByLabelText("FPTS leaders").querySelector("li")).toHaveTextContent("Beta");
  fireEvent.change(view.getByLabelText("Compare a category"), { target: { value: "TO" } });
  expect(view.getByLabelText("TO leaders").querySelector("li")).toHaveTextContent("Alpha");
  expect(view.getByText("Explore the heatmap")).toHaveAttribute("href", "/heatmap");
});

test("heatmap cells work with touch or keyboard and explain ranks after switching modes and sort order", () => {
  const view = render(<Heatmap {...props} />);
  const alphaTO = view.getByLabelText("Alpha, TO: 2, rank 1 of 3");
  expect(alphaTO).toHaveClass("heat-strong");
  expect(alphaTO).toHaveTextContent("#1");
  fireEvent.click(alphaTO);
  expect(view.getByRole("status")).toHaveTextContent("Alpha · TO");
  expect(view.getByRole("status")).toHaveTextContent("-2 vs. league average (4). Lower is better.");
  fireEvent.click(view.getByText("Values"));
  expect(alphaTO).toHaveTextContent("2");
  fireEvent.change(view.getByLabelText("Order teams by"), { target: { value: "TO" } });
  expect(view.getByLabelText("Category strength matrix").querySelector("tbody th")).toHaveTextContent("Alpha");
  expect(view.getByRole("status")).toHaveTextContent("Alpha · TO");
  fireEvent.change(view.getByLabelText("Highlight a team"), { target: { value: "0" } });
  expect(view.container.querySelectorAll(".focused-team")).toHaveLength(1);
});

test("points trade cards show both rank movements, signed point changes, and lower-is-better improvements", () => {
  const view = render(<TradeImpact {...props} indexA={0} indexB={1} statsA={cats(106.25, 1)} statsB={cats(103.75, 7)} />);
  const alpha = within(view.getByLabelText("Trade impact for Alpha"));
  expect(alpha.getByText("+6.25 FPTS")).toBeInTheDocument();
  expect(alpha.getByLabelText("Fantasy points rank")).toHaveTextContent("#3 → #2");
  const beta = within(view.getByLabelText("Trade impact for Beta"));
  expect(beta.getByText("-6.25 FPTS")).toBeInTheDocument();
  expect(beta.getByLabelText("Fantasy points rank")).toHaveTextContent("#1 → #3");
  expect(alpha.getByText("-1", { exact: false }).closest("td")).toHaveClass("stat-positive");
});

test("empty datasets show useful states without inventing ranks or leaders", () => {
  const view = render(<MemoryRouter><Overview teams={[]} leagueAverage={[]} /><Heatmap teams={[]} leagueAverage={[]} /></MemoryRouter>);
  expect(view.getByText("Your league overview is waiting")).toBeInTheDocument();
  expect(view.getByText("No statistics to map yet")).toBeInTheDocument();
});
