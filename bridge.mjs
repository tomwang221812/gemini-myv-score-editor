#!/usr/bin/env node
/* MYV score editor bridge: Gemini CLI talks to MCP servers it starts itself (stdio). This tiny program forwards each message to the member's own
   score-editor link (MCP over HTTPS) and prints the answers. No dependencies; Node 18+. The link comes from the extension setting MYV_SCORE_LINK. */
const raw = (process.env.MYV_SCORE_LINK || '').trim().replace(/\/sse\/?$/, '').replace(/\/+$/, '');
if (!/^(https:\/\/[^/]+|http:\/\/(127\.0\.0\.1|localhost)(:\d+)?)\/mcp\/score\/ai2\.[^/\s]+$/.test(raw)) { /* (http only for this machine, tests) */
  process.stderr.write('MYV_SCORE_LINK is missing or not a score-editor link. In the editor press AI, copy the link, then run: gemini extensions config myv-score-editor\n');
  process.exit(1);
}
const URL_ = raw;
const NOTE = 'Open the score editor (myv.tomwang221812.com/tools/score/), press AI and copy the link again (after "Renew link" the old one stops working).';
function out(obj) { process.stdout.write(JSON.stringify(obj) + '\n'); }
function fail(id, code, message) { if (id !== undefined && id !== null) { out({ jsonrpc: '2.0', id, error: { code, message } }); } else { process.stderr.write(message + '\n'); } }
function sseData(text) { /* an answer that came as an event stream: the data: lines of the "message" events */
  const msgs = []; for (const block of text.split(/\n\n+/)) { const d = block.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trimStart()).join('\n'); if (d) { try { msgs.push(JSON.parse(d)); } catch { /* not JSON */ } } } return msgs;
}
async function forward(msg) {
  const ids = (Array.isArray(msg) ? msg : [msg]).map(m => m && m.id).filter(i => i !== undefined && i !== null);
  const firstId = ids.length ? ids[0] : undefined;
  let res;
  try {
    res = await fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' }, body: JSON.stringify(msg), signal: AbortSignal.timeout(60000) });
  } catch (e) { return fail(firstId, -32000, 'Could not reach the score editor service: ' + (e && e.message)); }
  if (res.status === 401) { return fail(firstId, -32001, 'The score editor link is not valid any more. ' + NOTE); }
  if (res.status === 202 || res.status === 204) { return; }
  if (!res.ok) { return fail(firstId, -32000, 'The score editor service answered HTTP ' + res.status + '.'); }
  const text = await res.text(); const type = res.headers.get('content-type') || '';
  let answers;
  if (type.includes('text/event-stream')) { answers = sseData(text); } else { try { const j = JSON.parse(text); answers = Array.isArray(j) ? j : [j]; } catch { return fail(firstId, -32603, 'The score editor service sent something that is not JSON.'); } }
  for (const a of answers) { out(a); }
}
let buf = ''; let pending = 0, ended = false;
function done() { if (ended && pending === 0) { process.exit(0); } }
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  buf += chunk; let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!line) { continue; }
    let msg; try { msg = JSON.parse(line); } catch { process.stderr.write('ignored a line that is not JSON\n'); continue; }
    pending++; forward(msg).catch(e => process.stderr.write(String(e) + '\n')).finally(() => { pending--; done(); });
  }
});
process.stdin.on('end', () => { ended = true; done(); });
