import React from "react";
import { render, fireEvent, cleanup, waitForElement } from "@testing-library/react";
import axios from "axios";
import Advisor, { CitedAnswer, chatHistory } from "./Advisor";

jest.mock("axios", () => ({ get: jest.fn(), post: jest.fn(), isCancel: jest.fn(() => false), CancelToken: { source: () => ({ token: "cancel", cancel: jest.fn() }) } }));
const context = { teamCount: 12, rosteredPlayers: 156, availablePlayers: 939, playerPoolComplete: true,
  seasonId: 2027, asOf: "2026-10-14T12:00:00Z", warnings: [] };
beforeEach(() => {
  axios.get.mockResolvedValue({ data: { configured: true, refreshConfigured: true, context, teams: [{ id: "1", name: "Alpha" }, { id: "2", name: "Beta" }] } });
  axios.post.mockReset();
});
afterEach(cleanup);

test("chat is ready automatically and sends selected league/team and follow-up history without credentials", async () => {
  axios.post.mockResolvedValue({ data: { answer: "Try a guard.", citations: [], webSearchUsed: true, context } });
  const view = render(<Advisor league="DGFBL" />);
  await waitForElement(() => view.getByText("Alpha"));
  expect(view.queryByLabelText("Advisor access code")).not.toBeInTheDocument();
  expect(view.container.querySelector('input[type="password"]')).toBeNull();
  fireEvent.change(view.getByLabelText("My team"), { target: { value: "1" } });
  fireEvent.change(view.getByLabelText("Ask Scraper Agent"), { target: { value: "Who should I add?" } });
  fireEvent.click(view.getByText("Ask agent"));
  await waitForElement(() => view.getByText("Try a guard."));
  const first = axios.post.mock.calls[0];
  expect(first[1]).toEqual({ league: "DGFBL", teamId: "1", message: "Who should I add?", history: [], research: true });
  expect(first[2].headers).toBeUndefined();
  expect(first[1].apiKey).toBeUndefined();
  fireEvent.change(view.getByLabelText("Ask Scraper Agent"), { target: { value: "Why?" } });
  fireEvent.click(view.getByText("Ask agent"));
  await waitForElement(() => view.getByText("Why?"));
  expect(axios.post.mock.calls[1][1].history).toEqual([{ role: "user", content: "Who should I add?" }, { role: "assistant", content: "Try a guard." }]);
  fireEvent.change(view.getByLabelText("My team"), { target: { value: "2" } });
  expect(view.queryByText("Why?")).not.toBeInTheDocument();
});

test("failed requests retain the question and do not add a fabricated assistant response", async () => {
  axios.post.mockRejectedValue({ response: { data: { message: "OpenAI usage limit reached." } } });
  const view = render(<Advisor league="DGFBL" />);
  await waitForElement(() => view.getByText("Alpha"));
  fireEvent.change(view.getByLabelText("Ask Scraper Agent"), { target: { value: "Trade help" } });
  fireEvent.click(view.getByText("Ask agent"));
  await waitForElement(() => view.getByRole("alert"));
  expect(view.getByRole("alert")).toHaveTextContent("OpenAI usage limit reached.");
  expect(view.getByLabelText("Ask Scraper Agent")).toHaveValue("Trade help");
  expect(view.container.querySelector(".advisor-message-assistant")).toBeNull();
});

test("refresh is available without entering any credentials", async () => {
  axios.post.mockResolvedValue({ data: { context: { ...context, availablePlayers: 940 } } });
  const view = render(<Advisor league="DGFBL" />);
  await waitForElement(() => view.getByText("Alpha"));
  expect(view.getByText("Refresh league data")).not.toBeDisabled();
  fireEvent.click(view.getByText("Refresh league data"));
  await waitForElement(() => view.getByText("940 free agents and waiver players indexed"));
  expect(axios.post.mock.calls[0][0]).toMatch(/\/chat\/refresh$/);
  expect(axios.post.mock.calls[0][1]).toEqual({ league: "DGFBL" });
  expect(axios.post.mock.calls[0][2].headers).toBeUndefined();
});

test("citations are clickable inline, Unicode offsets work, and HTML or unsafe links cannot execute", () => {
  const view = render(<CitedAnswer text={"🏀 News [cite] <script>bad()</script>"} citations={[
    { start: 7, end: 13, url: "https://www.espn.com/news", title: "ESPN news" },
    { start: 0, end: 1, url: "javascript:alert(1)", title: "Unsafe" }
  ]} />);
  expect(view.getByText("[1]")).toHaveAttribute("href", "https://www.espn.com/news");
  expect(view.container.querySelector("script")).toBeNull();
  expect(view.queryByText("Unsafe")).not.toBeInTheDocument();
});

test("unconfigured setup disables chat and history stays within the API limits", async () => {
  axios.get.mockResolvedValue({ data: { configured: false, refreshConfigured: false, context, teams: [] } });
  const view = render(<Advisor league="DGFBL" />);
  await waitForElement(() => view.getByText("Connect OpenAI to start chatting"));
  expect(view.getByText("Ask agent")).toBeDisabled();
  const history = chatHistory(Array.from({ length: 30 }, () => ({ role: "assistant", content: "a".repeat(20000) })));
  expect(history.length).toBeLessThanOrEqual(20);
  expect(history.reduce((sum, m) => sum + m.content.length, 0)).toBeLessThanOrEqual(60000);
});
