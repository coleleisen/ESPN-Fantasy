import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { apiBaseUrl } from "./api";
import { Icon, SectionHeading } from "./UI";
import "./Advisor.css";

const prompts = [
  ["Find my next pickup", "Which available players best improve my team? Compare my weakest categories, suggest three pickups and explain who I could drop."],
  ["Find a trade partner", "Suggest two realistic trades with other teams in our league. Explain how each side benefits and the categories I would gain or lose."],
  ["Read my roster", "Analyze my team's strengths, weaknesses and biggest risks using our league's scoring rules. What should I prioritize next?"]
];
const validUrl = value => { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch (error) { return false; } };

export function CitedAnswer({ text, citations = [] }) {
  // React escapes all text. Only validated http(s) citation links become anchors.
  const characters = Array.from(text);
  const fragments = [];
  let cursor = 0;
  const safe = citations.filter(c => validUrl(c.url));
  safe.slice().sort((a, b) => a.start - b.start).forEach((citation, index) => {
    if (!Number.isInteger(citation.start) || !Number.isInteger(citation.end)
      || citation.start < cursor || citation.end <= citation.start || citation.end > characters.length) return;
    fragments.push(characters.slice(cursor, citation.start).join(""));
    fragments.push(<a key={"citation-" + index} href={citation.url} target="_blank" rel="noopener noreferrer" title={citation.title}>[{index + 1}]</a>);
    cursor = citation.end;
  });
  fragments.push(characters.slice(cursor).join(""));
  return <React.Fragment><div className="advisor-answer">{fragments}</div>
    {safe.length > 0 && <ul className="advisor-sources" aria-label="Research sources">
      {safe.filter((c, i) => safe.findIndex(other => other.url === c.url) === i).map(c => <li key={c.url}><a href={c.url} target="_blank" rel="noopener noreferrer">{c.title || new URL(c.url).hostname}<Icon name="arrow" /></a></li>)}
    </ul>}
  </React.Fragment>;
}

export function chatHistory(messages) {
  const history = [];
  let size = 0;
  for (const message of messages.slice(-20).reverse()) {
    const content = message.content.slice(0, 12000);
    if (size + content.length > 60000) break;
    history.unshift({ role: message.role, content });
    size += content.length;
  }
  return history;
}

export default function Advisor({ league }) {
  const [status, setStatus] = useState(null);
  const [teamId, setTeamId] = useState("");
  const [research, setResearch] = useState(true);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const alive = useRef(true);
  const inFlight = useRef(false);
  const cancel = useRef(null);
  const end = useRef(null);

  useEffect(() => {
    alive.current = true;
    const source = axios.CancelToken.source();
    axios.get(apiBaseUrl + "/chat/status", { params: { league }, timeout: 20000, cancelToken: source.token })
      .then(result => { if (alive.current) setStatus(result.data); })
      .catch(e => { if (alive.current && !axios.isCancel(e)) setError("Scraper Agent could not be loaded. Reload this tab to try again."); });
    return () => { alive.current = false; source.cancel(); if (cancel.current) cancel.current.cancel(); };
  }, [league]);

  useEffect(() => { if (end.current && end.current.scrollIntoView) end.current.scrollIntoView({ block: "nearest" }); }, [messages, busy]);

  const canAsk = Boolean(status && status.configured && !busy && !refreshing);
  const errorText = e => (e.response && e.response.data && e.response.data.message) || "Scraper Agent could not respond. Your question is still here; please retry.";

  async function send(event) {
    event.preventDefault();
    if (!canAsk || !question.trim() || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    cancel.current = axios.CancelToken.source();
    const message = question.trim();
    const history = chatHistory(messages);
    try {
      const { data } = await axios.post(apiBaseUrl + "/chat", { league, teamId, message, history, research },
        { timeout: 190000, cancelToken: cancel.current.token });
      if (!alive.current) return;
      setMessages(previous => previous.concat({ role: "user", content: message }, { role: "assistant", content: data.answer,
        citations: data.citations, researched: data.webSearchUsed, context: data.context }));
      setQuestion("");
      setStatus(previous => ({ ...previous, context: data.context }));
    } catch (e) { if (alive.current && !axios.isCancel(e)) setError(errorText(e)); }
    finally { inFlight.current = false; if (alive.current) setBusy(false); }
  }

  async function refresh() {
    if (inFlight.current || !status || !status.refreshConfigured) return;
    inFlight.current = true;
    setRefreshing(true);
    setError("");
    cancel.current = axios.CancelToken.source();
    try {
      const { data } = await axios.post(apiBaseUrl + "/chat/refresh", { league },
        { timeout: 240000, cancelToken: cancel.current.token });
      if (alive.current) setStatus(previous => ({ ...previous, context: data.context }));
    } catch (e) { if (alive.current && !axios.isCancel(e)) setError(errorText(e)); }
    finally { inFlight.current = false; if (alive.current) setRefreshing(false); }
  }

  const context = status && status.context;
  return <section className="advisor">
    <SectionHeading eyebrow="YOUR NEXT MOVE" title="Scraper Agent" icon="chat">Ask about pickups, trades and your team's next move. Every answer starts with your league's rosters and stats.</SectionHeading>
    <div className="advisor-layout">
      <aside className="advisor-sidebar">
        <div className="advisor-control"><label htmlFor="advisor-team">My team</label>
          <select id="advisor-team" value={teamId} disabled={busy || refreshing} onChange={event => { setTeamId(event.target.value); setMessages([]); setError(""); }}>
            <option value="">Whole league</option>{status && status.teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select><p>Choose a team for pickup and trade advice. Changing teams starts a new chat.</p>
        </div>
        <label className="advisor-research"><input type="checkbox" checked={research} onChange={event => setResearch(event.target.checked)} disabled={busy} /><span>Research online<small>Recent injuries, roles and schedules</small></span></label>
        <div className="advisor-data"><span className="eyebrow">LEAGUE CONTEXT</span>
          {context ? <React.Fragment><strong>{context.teamCount} teams · {context.rosteredPlayers} rostered players</strong>
            <p>{context.playerPoolComplete ? context.availablePlayers + " free agents and waiver players indexed" : "Saved rosters loaded. Waiver pool not synced."}</p>
            <p>{context.asOf ? "Updated " + new Date(context.asOf).toLocaleString() : "Update time unavailable"}</p>
            {context.seasonId && <p>ESPN season {context.seasonId}</p>}
          </React.Fragment> : <p>Loading league context…</p>}
          <button type="button" className="button button-secondary" onClick={refresh} disabled={!status || !status.refreshConfigured || busy || refreshing}>{refreshing ? "Refreshing ESPN data…" : "Refresh league data"}</button>
          {status && !status.refreshConfigured && <p>The app owner can connect an ESPN session to enable refresh.</p>}
        </div>
      </aside>
      <div className="advisor-main">
        {status && !status.configured && <div className="advisor-setup" role="status"><Icon name="info" /><div><strong>Connect OpenAI to start chatting</strong><p>The app owner needs to connect OpenAI on the server. Once connected, everyone can chat here automatically.</p></div></div>}
        {context && context.warnings.map(warning => <p className="advisor-warning" key={warning}><Icon name="info" />{warning}</p>)}
        <div className="advisor-conversation" role="log" aria-label="Scraper Agent conversation" aria-live="polite" aria-busy={busy}>
          {!messages.length && <div className="advisor-intro"><span className="advisor-mark"><Icon name="chat" /></span><h3>A second opinion, grounded in your league.</h3><p>Find a category to target. Weigh a waiver claim. Work out a trade that makes sense for both sides.</p>
            <div className="advisor-prompts">{prompts.map(([label, prompt]) => <button type="button" key={label} disabled={busy || refreshing} onClick={() => setQuestion(prompt)}>{label}<Icon name="arrow" /></button>)}</div>
          </div>}
          {messages.map((message, index) => <article className={"advisor-message advisor-message-" + message.role} key={index}>
            <span className="advisor-speaker">{message.role === "user" ? "You" : "Scraper Agent"}</span>
            {message.role === "assistant" ? <React.Fragment><CitedAnswer text={message.content} citations={message.citations} /><p className="advisor-message-meta">{message.researched ? "League data + web research" : "League data · no web search used"}{message.context && message.context.asOf ? " · Data as of " + new Date(message.context.asOf).toLocaleString() : ""}</p></React.Fragment> : <p className="advisor-answer">{message.content}</p>}
          </article>)}
          {busy && <div className="advisor-thinking" role="status"><span className="spinner" />Reviewing your league{research ? " and researching your question" : ""}…</div>}
          <div ref={end} />
        </div>
        {error && <p className="notice notice-error" role="alert"><Icon name="info" />{error}</p>}
        <form className="advisor-compose" onSubmit={send}>
          <label className="sr-only" htmlFor="advisor-question">Ask Scraper Agent</label>
          <textarea id="advisor-question" value={question} maxLength={4000} rows={3} placeholder="Who could help my team win assists without hurting turnovers?" disabled={busy || refreshing} onChange={event => setQuestion(event.target.value)} />
          <div className="advisor-compose-actions"><button type="button" className="advisor-reset" disabled={!messages.length || busy || refreshing} onClick={() => { setMessages([]); setError(""); }}>New chat</button><span>{question.length}/4000</span><button type="submit" className="button button-primary" disabled={!canAsk || !question.trim()}>{busy ? "Thinking…" : "Ask agent"}<Icon name="arrow" /></button></div>
        </form>
        <p className="advisor-footer">Advice uses the saved league data shown here. Refresh before making a move. Chats last for this visit.</p>
      </div>
    </div>
  </section>;
}
