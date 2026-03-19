/* ── Tab navigation ── */
document.querySelectorAll('nav button[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('nav button[data-tab]').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    btn.closest('.nav-category')?.classList.add('open');
  });
});

function toggleCategory(headerBtn) {
  headerBtn.closest('.nav-category').classList.toggle('open');
}

/* ── Toast ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

/* ── Helpers ── */
function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearIO(inId, outId, errId) {
  document.getElementById(inId).value = '';
  document.getElementById(outId).value = '';
  document.getElementById(inId).classList.remove('error');
  if (errId) setError(errId, '');
}

function swapIO(srcId, destId) {
  const src = document.getElementById(srcId);
  const dest = document.getElementById(destId);
  dest.value = src.value;
  src.value = '';
}

function copyText(id, isPre) {
  const el = document.getElementById(id);
  const text = isPre ? el.textContent : el.value;
  if (!text.trim()) { showToast('Nothing to copy'); return; }
  navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'));
}

/* ── Unicode-safe Base64 ── */
function toBase64(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}

function fromBase64(b64) {
  const raw = atob(b64);
  const bytes = new Uint8Array([...raw].map(c => c.charCodeAt(0)));
  return new TextDecoder().decode(bytes);
}

/* ── Base64 Encode ── */
function b64Encode() {
  const input = document.getElementById('b64enc-in');
  const output = document.getElementById('b64enc-out');
  setError('b64enc-err', '');
  input.classList.remove('error');
  if (!input.value.trim()) { setError('b64enc-err', 'Please enter some text to encode.'); input.classList.add('error'); return; }
  try {
    output.value = toBase64(input.value);
  } catch (e) {
    setError('b64enc-err', 'Encoding failed: ' + e.message);
    input.classList.add('error');
  }
}

/* ── Base64 Decode ── */
function b64Decode() {
  const input = document.getElementById('b64dec-in');
  const output = document.getElementById('b64dec-out');
  setError('b64dec-err', '');
  input.classList.remove('error');
  const val = input.value.trim();
  if (!val) { setError('b64dec-err', 'Please enter a Base64 string to decode.'); input.classList.add('error'); return; }
  try {
    output.value = fromBase64(val);
  } catch (e) {
    setError('b64dec-err', 'Invalid Base64 string. Please check your input.');
    input.classList.add('error');
    output.value = '';
  }
}

/* ── HTML Encode ── */
function htmlEncode() {
  const input = document.getElementById('htmlenc-in');
  const output = document.getElementById('htmlenc-out');
  setError('htmlenc-err', '');
  input.classList.remove('error');
  if (!input.value.trim()) { setError('htmlenc-err', 'Please enter some text to encode.'); input.classList.add('error'); return; }
  output.value = input.value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── HTML Decode ── */
function htmlDecode() {
  const input = document.getElementById('htmldec-in');
  const output = document.getElementById('htmldec-out');
  setError('htmldec-err', '');
  input.classList.remove('error');
  const val = input.value.trim();
  if (!val) { setError('htmldec-err', 'Please enter an HTML-encoded string to decode.'); input.classList.add('error'); return; }
  const txt = document.createElement('textarea');
  txt.innerHTML = val;
  output.value = txt.value;
}

/* ── URL Encode ── */
function urlEncode() {
  const input = document.getElementById('urlenc-in');
  const output = document.getElementById('urlenc-out');
  setError('urlenc-err', '');
  input.classList.remove('error');
  if (!input.value.trim()) { setError('urlenc-err', 'Please enter text to encode.'); input.classList.add('error'); return; }
  output.value = encodeURIComponent(input.value).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

/* ── URL Decode ── */
function urlDecode() {
  const input = document.getElementById('urldec-in');
  const output = document.getElementById('urldec-out');
  setError('urldec-err', '');
  input.classList.remove('error');
  const val = input.value.trim();
  if (!val) { setError('urldec-err', 'Please enter a URL-encoded string to decode.'); input.classList.add('error'); return; }
  try {
    output.value = decodeURIComponent(val);
  } catch (e) {
    setError('urldec-err', 'Invalid URL-encoded string. Please check your input.');
    input.classList.add('error');
    output.value = '';
  }
}

/* ── JWT Decode ── */
function b64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return fromBase64(str);
}

function jwtDecode() {
  const input = document.getElementById('jwt-in');
  setError('jwt-err', '');
  input.classList.remove('error');
  document.getElementById('jwt-panels').style.display = 'none';
  document.getElementById('jwt-status').style.display = 'none';

  const token = input.value.trim();
  if (!token) { setError('jwt-err', 'Please paste a JWT token.'); input.classList.add('error'); return; }

  const parts = token.split('.');
  if (parts.length !== 3) {
    setError('jwt-err', 'Invalid JWT: expected 3 parts separated by dots.');
    input.classList.add('error');
    return;
  }

  let header, payload;
  try {
    header = JSON.parse(b64UrlDecode(parts[0]));
  } catch(e) {
    setError('jwt-err', 'Failed to decode JWT header: ' + e.message);
    input.classList.add('error');
    return;
  }
  try {
    payload = JSON.parse(b64UrlDecode(parts[1]));
  } catch(e) {
    setError('jwt-err', 'Failed to decode JWT payload: ' + e.message);
    input.classList.add('error');
    return;
  }

  document.getElementById('jwt-header-pre').textContent = JSON.stringify(header, null, 2);
  document.getElementById('jwt-payload-pre').textContent = JSON.stringify(payload, null, 2);
  document.getElementById('jwt-sig-pre').textContent = parts[2];

  /* Expiry status */
  const statusEl = document.getElementById('jwt-status');
  if (payload.exp !== undefined) {
    const expDate = new Date(payload.exp * 1000);
    const now = new Date();
    const expired = now > expDate;
    statusEl.className = 'jwt-status ' + (expired ? 'expired' : 'valid');
    statusEl.innerHTML = expired
      ? `✗ Token expired on ${expDate.toLocaleString()}`
      : `✓ Token valid until ${expDate.toLocaleString()}`;
  } else {
    statusEl.className = 'jwt-status no-exp';
    statusEl.innerHTML = 'ℹ No expiry (exp) claim found in payload';
  }

  statusEl.style.display = 'flex';
  document.getElementById('jwt-panels').style.display = 'grid';
}

function clearJwt() {
  document.getElementById('jwt-in').value = '';
  document.getElementById('jwt-in').classList.remove('error');
  setError('jwt-err', '');
  document.getElementById('jwt-panels').style.display = 'none';
  document.getElementById('jwt-status').style.display = 'none';
  document.getElementById('jwt-header-pre').textContent = '';
  document.getElementById('jwt-payload-pre').textContent = '';
  document.getElementById('jwt-sig-pre').textContent = '';
}

/* ── JSON Beautify / Minify ── */
function jsonBeautify() {
  const input = document.getElementById('json-in');
  const output = document.getElementById('json-out');
  const indent = parseInt(document.getElementById('json-indent').value, 10);
  setError('json-err', '');
  input.classList.remove('error');
  const val = input.value.trim();
  if (!val) { output.value = ''; return; }
  try {
    output.value = JSON.stringify(JSON.parse(val), null, indent);
  } catch (e) {
    setError('json-err', 'Invalid JSON: ' + e.message);
    input.classList.add('error');
    output.value = '';
  }
}

function jsonMinify() {
  const input = document.getElementById('json-in');
  const output = document.getElementById('json-out');
  setError('json-err', '');
  input.classList.remove('error');
  const val = input.value.trim();
  if (!val) { output.value = ''; return; }
  try {
    output.value = JSON.stringify(JSON.parse(val));
  } catch (e) {
    setError('json-err', 'Invalid JSON: ' + e.message);
    input.classList.add('error');
    output.value = '';
  }
}

/* ── XML Beautify / Minify ── */
function xmlBeautify() {
  const input = document.getElementById('xml-in');
  const output = document.getElementById('xml-out');
  const indent = parseInt(document.getElementById('xml-indent').value, 10);
  setError('xml-err', '');
  input.classList.remove('error');
  const val = input.value.trim();
  if (!val) { output.value = ''; return; }

  const parser = new DOMParser();
  const doc = parser.parseFromString(val, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    setError('xml-err', 'Invalid XML: ' + parseError.textContent.split('\n')[0]);
    input.classList.add('error');
    output.value = '';
    return;
  }
  output.value = formatXmlNode(doc.documentElement, 0, ' '.repeat(indent));
}

function formatXmlNode(node, depth, pad) {
  const prefix = pad.repeat(depth);
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent.trim();
    return t ? prefix + t : '';
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const tag = node.tagName;
  const attrs = Array.from(node.attributes)
    .map(a => ` ${a.name}="${a.value}"`).join('');

  const children = Array.from(node.childNodes)
    .map(c => formatXmlNode(c, depth + 1, pad))
    .filter(s => s !== '');

  if (children.length === 0) return `${prefix}<${tag}${attrs}/>`;

  // single text child — keep on one line
  if (children.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
    return `${prefix}<${tag}${attrs}>${node.childNodes[0].textContent.trim()}</${tag}>`;
  }

  return `${prefix}<${tag}${attrs}>\n${children.join('\n')}\n${prefix}</${tag}>`;
}

function xmlMinify() {
  const input = document.getElementById('xml-in');
  const output = document.getElementById('xml-out');
  setError('xml-err', '');
  input.classList.remove('error');
  const val = input.value.trim();
  if (!val) { output.value = ''; return; }

  const parser = new DOMParser();
  const doc = parser.parseFromString(val, 'application/xml');
  if (doc.querySelector('parseerror, parsererror')) {
    setError('xml-err', 'Invalid XML: cannot minify.');
    input.classList.add('error');
    output.value = '';
    return;
  }
  output.value = new XMLSerializer().serializeToString(doc)
    .replace(/>\s+</g, '><')
    .trim();
}

/* ── SAML Decode ── */
async function samlDecode() {
  const input = document.getElementById('saml-in');
  const output = document.getElementById('saml-out');
  setError('saml-err', '');
  input.classList.remove('error');
  let val = input.value.trim();
  if (!val) { setError('saml-err', 'Please paste a SAML request or response.'); input.classList.add('error'); return; }

  // URL-decode if needed
  if (val.includes('%')) { try { val = decodeURIComponent(val); } catch(e) {} }

  // Normalise to standard Base64
  val = val.replace(/-/g, '+').replace(/_/g, '/');
  while (val.length % 4) val += '=';

  let bytes;
  try {
    const raw = atob(val);
    bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  } catch(e) {
    setError('saml-err', 'Invalid Base64 encoding.'); input.classList.add('error'); return;
  }

  let xml = '';
  // Try raw-deflate first (HTTP-Redirect binding)
  try {
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();
    writer.write(bytes); writer.close();
    const chunks = [];
    while (true) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); }
    const total = new Uint8Array(chunks.reduce((s, c) => s + c.length, 0));
    let off = 0; for (const c of chunks) { total.set(c, off); off += c.length; }
    xml = new TextDecoder().decode(total);
  } catch(e) {
    // HTTP-POST binding — plain Base64
    xml = new TextDecoder().decode(bytes);
  }

  if (!xml.trim().startsWith('<')) { setError('saml-err', 'Decoded content does not appear to be XML.'); input.classList.add('error'); return; }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  output.value = doc.querySelector('parsererror') ? xml : formatXmlNode(doc.documentElement, 0, '  ');
}

/* ── MD5 pure JS ── */
function md5(str) {
  const b = new TextEncoder().encode(str);
  function add(x,y){const l=(x&0xffff)+(y&0xffff);return((x>>>16)+(y>>>16)+(l>>>16))<<16|l&0xffff}
  function rol(n,s){return n<<s|n>>>32-s}
  function cmn(q,a,b,x,s,t){return add(rol(add(add(a,q),add(x,t)),s),b)}
  function ff(a,b,c,d,x,s,t){return cmn(b&c|~b&d,a,b,x,s,t)}
  function gg(a,b,c,d,x,s,t){return cmn(b&d|c&~d,a,b,x,s,t)}
  function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t)}
  function ii(a,b,c,d,x,s,t){return cmn(c^(b|~d),a,b,x,s,t)}
  const w = new Int32Array(((b.length+8>>6)+1)*16);
  for(let i=0;i<b.length;i++) w[i>>2]|=b[i]<<(i%4)*8;
  w[b.length>>2]|=0x80<<(b.length%4)*8; w[w.length-2]=b.length*8;
  let a=1732584193,bv=-271733879,c=-1732584194,d=271733878;
  for(let i=0;i<w.length;i+=16){
    const[A,B,C,D]=[a,bv,c,d];
    a=ff(a,bv,c,d,w[i],7,-680876936);d=ff(d,a,bv,c,w[i+1],12,-389564586);c=ff(c,d,a,bv,w[i+2],17,606105819);bv=ff(bv,c,d,a,w[i+3],22,-1044525330);
    a=ff(a,bv,c,d,w[i+4],7,-176418897);d=ff(d,a,bv,c,w[i+5],12,1200080426);c=ff(c,d,a,bv,w[i+6],17,-1473231341);bv=ff(bv,c,d,a,w[i+7],22,-45705983);
    a=ff(a,bv,c,d,w[i+8],7,1770035416);d=ff(d,a,bv,c,w[i+9],12,-1958414417);c=ff(c,d,a,bv,w[i+10],17,-42063);bv=ff(bv,c,d,a,w[i+11],22,-1990404162);
    a=ff(a,bv,c,d,w[i+12],7,1804603682);d=ff(d,a,bv,c,w[i+13],12,-40341101);c=ff(c,d,a,bv,w[i+14],17,-1502002290);bv=ff(bv,c,d,a,w[i+15],22,1236535329);
    a=gg(a,bv,c,d,w[i+1],5,-165796510);d=gg(d,a,bv,c,w[i+6],9,-1069501632);c=gg(c,d,a,bv,w[i+11],14,643717713);bv=gg(bv,c,d,a,w[i+0],20,-373897302);
    a=gg(a,bv,c,d,w[i+5],5,-701558691);d=gg(d,a,bv,c,w[i+10],9,38016083);c=gg(c,d,a,bv,w[i+15],14,-660478335);bv=gg(bv,c,d,a,w[i+4],20,-405537848);
    a=gg(a,bv,c,d,w[i+9],5,568446438);d=gg(d,a,bv,c,w[i+14],9,-1019803690);c=gg(c,d,a,bv,w[i+3],14,-187363961);bv=gg(bv,c,d,a,w[i+8],20,1163531501);
    a=gg(a,bv,c,d,w[i+13],5,-1444681467);d=gg(d,a,bv,c,w[i+2],9,-51403784);c=gg(c,d,a,bv,w[i+7],14,1735328473);bv=gg(bv,c,d,a,w[i+12],20,-1926607734);
    a=hh(a,bv,c,d,w[i+5],4,-378558);d=hh(d,a,bv,c,w[i+8],11,-2022574463);c=hh(c,d,a,bv,w[i+11],16,1839030562);bv=hh(bv,c,d,a,w[i+14],23,-35309556);
    a=hh(a,bv,c,d,w[i+1],4,-1530992060);d=hh(d,a,bv,c,w[i+4],11,1272893353);c=hh(c,d,a,bv,w[i+7],16,-155497632);bv=hh(bv,c,d,a,w[i+10],23,-1094730640);
    a=hh(a,bv,c,d,w[i+13],4,681279174);d=hh(d,a,bv,c,w[i+0],11,-358537222);c=hh(c,d,a,bv,w[i+3],16,-722521979);bv=hh(bv,c,d,a,w[i+6],23,76029189);
    a=hh(a,bv,c,d,w[i+9],4,-640364487);d=hh(d,a,bv,c,w[i+12],11,-421815835);c=hh(c,d,a,bv,w[i+15],16,530742520);bv=hh(bv,c,d,a,w[i+2],23,-995338651);
    a=ii(a,bv,c,d,w[i+0],6,-198630844);d=ii(d,a,bv,c,w[i+7],10,1126891415);c=ii(c,d,a,bv,w[i+14],15,-1416354905);bv=ii(bv,c,d,a,w[i+5],21,-57434055);
    a=ii(a,bv,c,d,w[i+12],6,1700485571);d=ii(d,a,bv,c,w[i+3],10,-1894986606);c=ii(c,d,a,bv,w[i+10],15,-1051523);bv=ii(bv,c,d,a,w[i+1],21,-2054922799);
    a=ii(a,bv,c,d,w[i+8],6,1873313359);d=ii(d,a,bv,c,w[i+15],10,-30611744);c=ii(c,d,a,bv,w[i+6],15,-1560198380);bv=ii(bv,c,d,a,w[i+13],21,1309151649);
    a=ii(a,bv,c,d,w[i+4],6,-145523070);d=ii(d,a,bv,c,w[i+11],10,-1120210379);c=ii(c,d,a,bv,w[i+2],15,718787259);bv=ii(bv,c,d,a,w[i+9],21,-343485551);
    a=add(a,A);bv=add(bv,B);c=add(c,C);d=add(d,D);
  }
  return [a,bv,c,d].map(n=>Array.from({length:4},(_,i)=>((n>>i*8)&0xff).toString(16).padStart(2,'0')).join('')).join('');
}

/* ── Hash Generate ── */
async function hashGenerate() {
  const input = document.getElementById('hash-in');
  const resultsEl = document.getElementById('hash-results');
  setError('hash-err', '');
  input.classList.remove('error');
  if (!input.value.trim()) { setError('hash-err', 'Please enter text to hash.'); input.classList.add('error'); return; }

  const val = input.value;
  async function sha(algo) {
    const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(val));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }
  const [h1, h256, h512] = await Promise.all([sha('SHA-1'), sha('SHA-256'), sha('SHA-512')]);
  const rows = [['MD5', md5(val)], ['SHA-1', h1], ['SHA-256', h256], ['SHA-512', h512]];

  resultsEl.innerHTML = rows.map(([algo, hash]) =>
    `<div class="hash-row">
      <span class="hash-algo">${algo}</span>
      <code class="hash-value">${hash}</code>
      <button class="btn btn-secondary" style="padding:2px 10px;font-size:0.7rem;flex-shrink:0;" onclick="copyVal('${hash}')">Copy</button>
    </div>`
  ).join('');
  resultsEl.style.display = 'flex';
}

function clearHash() {
  document.getElementById('hash-in').value = '';
  document.getElementById('hash-in').classList.remove('error');
  setError('hash-err', '');
  const r = document.getElementById('hash-results');
  r.style.display = 'none'; r.innerHTML = '';
}

function copyVal(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
}

/* ── Timestamp Convert ── */
function tsConvert() {
  const input = document.getElementById('ts-in');
  const resultsEl = document.getElementById('ts-results');
  setError('ts-err', '');
  input.classList.remove('error');
  const val = input.value.trim();
  if (!val) { setError('ts-err', 'Please enter a timestamp or date string.'); input.classList.add('error'); return; }

  let date;
  if (/^\d+$/.test(val)) {
    const n = parseInt(val);
    date = new Date(n > 1e11 ? n : n * 1000);
  } else {
    date = new Date(val);
  }
  if (isNaN(date.getTime())) { setError('ts-err', 'Invalid timestamp or date string.'); input.classList.add('error'); return; }

  const sec = Math.floor(date.getTime() / 1000);
  const ms = date.getTime();
  const diff = Date.now() - ms;
  const abs = Math.abs(diff);
  const future = diff < 0;
  const rel = abs < 60000 ? 'just now'
    : abs < 3600000   ? `${Math.round(abs/60000)} min ${future?'from now':'ago'}`
    : abs < 86400000  ? `${Math.round(abs/3600000)} hr ${future?'from now':'ago'}`
    : abs < 2592000000? `${Math.round(abs/86400000)} days ${future?'from now':'ago'}`
    : abs < 31536000000?`${Math.round(abs/2592000000)} months ${future?'from now':'ago'}`
    : `${Math.round(abs/31536000000)} years ${future?'from now':'ago'}`;

  const rows = [
    ['UTC',             date.toUTCString()],
    ['Local',           date.toLocaleString()],
    ['ISO 8601',        date.toISOString()],
    ['Unix (seconds)',  sec.toString()],
    ['Unix (ms)',       ms.toString()],
    ['Relative',        rel],
  ];

  resultsEl.innerHTML = rows.map(([label, value]) =>
    `<div class="ts-row">
      <span class="ts-label">${label}</span>
      <span class="ts-value">${value}</span>
      <button class="btn btn-secondary" style="padding:2px 10px;font-size:0.7rem;flex-shrink:0;" onclick="copyVal(${JSON.stringify(value)})">Copy</button>
    </div>`
  ).join('');
  resultsEl.style.display = 'flex';
}

function tsNow() {
  document.getElementById('ts-in').value = Math.floor(Date.now() / 1000).toString();
  tsConvert();
}

function clearTs() {
  document.getElementById('ts-in').value = '';
  document.getElementById('ts-in').classList.remove('error');
  setError('ts-err', '');
  const r = document.getElementById('ts-results');
  r.style.display = 'none'; r.innerHTML = '';
}

/* ── Diff Viewer ── */
function computeDiff(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, () => new Int32Array(n+1));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);
  const out = []; let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i-1] === b[j-1]) { out.unshift({t:'eq',s:a[i-1]}); i--; j--; }
    else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) { out.unshift({t:'add',s:b[j-1]}); j--; }
    else { out.unshift({t:'del',s:a[i-1]}); i--; }
  }
  return out;
}

function diffCompare() {
  const left = document.getElementById('diff-left').value;
  const right = document.getElementById('diff-right').value;
  setError('diff-err', '');
  if (!left && !right) { setError('diff-err', 'Please enter text in both panels.'); return; }

  const aLines = left.split('\n'), bLines = right.split('\n');
  if (aLines.length > 2000 || bLines.length > 2000) { setError('diff-err', 'Input too large (max 2000 lines each).'); return; }

  const diff = computeDiff(aLines, bLines);
  let added = 0, removed = 0;
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  document.getElementById('diff-pre').innerHTML = diff.map(({t, s}) => {
    if (t === 'add') { added++; return `<span class="diff-add">+ ${esc(s)}</span>`; }
    if (t === 'del') { removed++; return `<span class="diff-del">- ${esc(s)}</span>`; }
    return `<span class="diff-eq">  ${esc(s)}</span>`;
  }).join('\n');

  document.getElementById('diff-stats').innerHTML =
    `<span class="diff-stat-add">+${added} added</span> &nbsp; <span class="diff-stat-del">-${removed} removed</span>`;
  document.getElementById('diff-output').style.display = 'block';
}

function clearDiff() {
  document.getElementById('diff-left').value = '';
  document.getElementById('diff-right').value = '';
  setError('diff-err', '');
  const o = document.getElementById('diff-output');
  o.style.display = 'none';
  document.getElementById('diff-pre').innerHTML = '';
  document.getElementById('diff-stats').innerHTML = '';
}

/* ── Password Generator ── */
function pwGenerate() {
  setError('pwgen-err', '');
  const len = parseInt(document.getElementById('pwgen-len').value);
  const upper   = document.getElementById('pwgen-upper').checked;
  const lower   = document.getElementById('pwgen-lower').checked;
  const numbers = document.getElementById('pwgen-numbers').checked;
  const symbols = document.getElementById('pwgen-symbols').checked;
  if (!upper && !lower && !numbers && !symbols) {
    setError('pwgen-err', 'Select at least one character type.'); return;
  }
  let chars = '';
  if (upper)   chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lower)   chars += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) chars += '0123456789';
  if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  const pwd = Array.from(arr).map(n => chars[n % chars.length]).join('');
  document.getElementById('pwgen-result').value = pwd;

  let score = 0;
  if (len >= 8)  score++;
  if (len >= 12) score++;
  if (len >= 16) score++;
  if (upper && lower) score++;
  if (numbers) score++;
  if (symbols) score++;
  const levels = [
    [16,'str-weak','Very Weak'],[33,'str-weak','Weak'],[50,'str-fair','Fair'],
    [66,'str-good','Good'],[83,'str-strong','Strong'],[100,'str-strong','Very Strong']
  ];
  const [pct, cls, lbl] = levels[Math.min(score, levels.length-1)];
  const fill = document.getElementById('strength-bar-fill');
  fill.style.width = pct + '%';
  fill.className = 'strength-bar-fill ' + cls;
  const sl = document.getElementById('strength-label');
  sl.textContent = lbl; sl.className = 'strength-label ' + cls;
  document.getElementById('pwgen-strength').style.display = 'flex';
}

/* ── Regex Tester ── */
function regexTest() {
  const pattern = document.getElementById('regex-pattern').value;
  const testStr = document.getElementById('regex-test').value;
  setError('regex-err', '');
  if (!pattern) { setError('regex-err', 'Please enter a regex pattern.'); return; }
  const flags = ['g','i','m','s'].filter(f => document.getElementById('re-'+f).checked).join('');
  let re;
  try { re = new RegExp(pattern, flags); }
  catch(e) { setError('regex-err', 'Invalid regex: ' + e.message); return; }

  const matches = [];
  if (flags.includes('g')) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(testStr)) !== null) {
      matches.push({index:m.index, len:m[0].length, val:m[0], groups:m.slice(1)});
      if (m[0].length === 0) re.lastIndex++;
    }
  } else {
    const m = re.exec(testStr);
    if (m) matches.push({index:m.index, len:m[0].length, val:m[0], groups:m.slice(1)});
  }

  document.getElementById('regex-stats').textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''} found`;
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  let hl = ''; let last = 0;
  for (const m of matches) {
    hl += esc(testStr.slice(last, m.index));
    hl += `<mark class="regex-match">${esc(testStr.slice(m.index, m.index + m.len))}</mark>`;
    last = m.index + m.len;
  }
  hl += esc(testStr.slice(last));
  document.getElementById('regex-highlight').innerHTML = hl.replace(/\n/g,'<br>');
  document.getElementById('regex-matches').innerHTML = matches.length === 0
    ? '<span style="color:var(--muted);font-size:0.8rem;">No matches</span>'
    : matches.map((m,i) =>
        `<div class="regex-match-item">
          <span class="regex-match-num">${i+1}</span>
          <code class="regex-match-val">${esc(m.val)}</code>
          <span class="regex-match-idx">at index ${m.index}</span>
          ${m.groups.filter(g=>g!==undefined).map((g,gi)=>`<span class="regex-group">group ${gi+1}: <code>${esc(g||'')}</code></span>`).join('')}
        </div>`
      ).join('');
  document.getElementById('regex-output').style.display = 'block';
}

function clearRegex() {
  document.getElementById('regex-pattern').value = '';
  document.getElementById('regex-test').value = '';
  setError('regex-err', '');
  document.getElementById('regex-output').style.display = 'none';
}

/* ── UUID Generator ── */
function uuidGenerate() {
  setError('uuid-err', '');
  if (!crypto.randomUUID) {
    setError('uuid-err', 'crypto.randomUUID() requires HTTPS or localhost.');
    return;
  }
  const count = Math.min(100, Math.max(1, parseInt(document.getElementById('uuid-count').value) || 1));
  const uuids = Array.from({length: count}, () => crypto.randomUUID());
  const resultsEl = document.getElementById('uuid-results');
  resultsEl.innerHTML = uuids.map(u =>
    `<div class="uuid-row">
      <code class="uuid-value">${u}</code>
      <button class="btn btn-secondary" style="padding:2px 10px;font-size:0.7rem;flex-shrink:0;" onclick="copyVal('${u}')">Copy</button>
    </div>`
  ).join('');
  resultsEl.style.display = 'flex';
  const btn = document.getElementById('uuid-copy-all');
  btn.style.display = count > 1 ? 'flex' : 'none';
  btn.dataset.all = uuids.join('\n');
}

function uuidCopyAll() {
  copyVal(document.getElementById('uuid-copy-all').dataset.all);
}

function clearUuid() {
  setError('uuid-err', '');
  const r = document.getElementById('uuid-results');
  r.style.display = 'none'; r.innerHTML = '';
  document.getElementById('uuid-copy-all').style.display = 'none';
}

/* ── Base64 URL Encode / Decode ── */
function b64urlEncode() {
  const input = document.getElementById('b64urlenc-in');
  const output = document.getElementById('b64urlenc-out');
  setError('b64urlenc-err', '');
  input.classList.remove('error');
  if (!input.value.trim()) { setError('b64urlenc-err', 'Please enter some text to encode.'); input.classList.add('error'); return; }
  try {
    output.value = toBase64(input.value).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  } catch(e) {
    setError('b64urlenc-err', 'Encoding failed: ' + e.message); input.classList.add('error');
  }
}

function b64urlDecode() {
  const input = document.getElementById('b64urldec-in');
  const output = document.getElementById('b64urldec-out');
  setError('b64urldec-err', '');
  input.classList.remove('error');
  const val = input.value.trim();
  if (!val) { setError('b64urldec-err', 'Please enter a Base64 URL string to decode.'); input.classList.add('error'); return; }
  try {
    let b64 = val.replace(/-/g,'+').replace(/_/g,'/');
    while (b64.length % 4) b64 += '=';
    output.value = fromBase64(b64);
  } catch(e) {
    setError('b64urldec-err', 'Invalid Base64 URL string.'); input.classList.add('error'); output.value = '';
  }
}

/* ── HTTP Status Code Reference ── */
const HTTP_CODES = [
  {code:100,name:'Continue',desc:'Request received, please continue.'},
  {code:101,name:'Switching Protocols',desc:'Switching to protocol specified in Upgrade header.'},
  {code:102,name:'Processing',desc:'Server has received and is processing the request (WebDAV).'},
  {code:103,name:'Early Hints',desc:'Used with the Link header to allow preloading resources.'},
  {code:200,name:'OK',desc:'Request succeeded.'},
  {code:201,name:'Created',desc:'Request succeeded and a new resource was created.'},
  {code:202,name:'Accepted',desc:'Request received but not yet acted upon.'},
  {code:203,name:'Non-Authoritative Information',desc:'Returned metadata is from a third-party copy.'},
  {code:204,name:'No Content',desc:'No content to send for this request.'},
  {code:205,name:'Reset Content',desc:'Client should reset the document view.'},
  {code:206,name:'Partial Content',desc:'Only part of the resource is being delivered (range requests).'},
  {code:207,name:'Multi-Status',desc:'Multiple status codes might be appropriate (WebDAV).'},
  {code:208,name:'Already Reported',desc:'Members of a DAV binding already enumerated (WebDAV).'},
  {code:226,name:'IM Used',desc:'Server fulfilled GET using instance manipulations.'},
  {code:300,name:'Multiple Choices',desc:'Multiple options for the resource.'},
  {code:301,name:'Moved Permanently',desc:'Resource has moved permanently to a new URL.'},
  {code:302,name:'Found',desc:'Resource temporarily at a different URI.'},
  {code:303,name:'See Other',desc:'Response to request found at another URI using GET.'},
  {code:304,name:'Not Modified',desc:'Resource has not been modified since last request.'},
  {code:307,name:'Temporary Redirect',desc:'Request should be repeated with another URI using same method.'},
  {code:308,name:'Permanent Redirect',desc:'Resource has moved permanently; repeat with same method.'},
  {code:400,name:'Bad Request',desc:'Server cannot process request due to client error.'},
  {code:401,name:'Unauthorized',desc:'Authentication is required and has failed or not been provided.'},
  {code:402,name:'Payment Required',desc:'Reserved for future use.'},
  {code:403,name:'Forbidden',desc:'Server refuses to authorize the request.'},
  {code:404,name:'Not Found',desc:'Requested resource could not be found.'},
  {code:405,name:'Method Not Allowed',desc:'Request method is not supported for the resource.'},
  {code:406,name:'Not Acceptable',desc:'Response does not match the Accept headers.'},
  {code:407,name:'Proxy Authentication Required',desc:'Client must authenticate with the proxy.'},
  {code:408,name:'Request Timeout',desc:'Server timed out waiting for the request.'},
  {code:409,name:'Conflict',desc:'Request conflict with the current state of the resource.'},
  {code:410,name:'Gone',desc:'Resource requested is no longer available.'},
  {code:411,name:'Length Required',desc:'Content-Length header field required.'},
  {code:412,name:'Precondition Failed',desc:'Client preconditions given in headers not met.'},
  {code:413,name:'Content Too Large',desc:'Request body exceeds server-defined limits.'},
  {code:414,name:'URI Too Long',desc:'URI requested by client is longer than server will process.'},
  {code:415,name:'Unsupported Media Type',desc:'Media format of request data not supported.'},
  {code:416,name:'Range Not Satisfiable',desc:'Range specified by Range header cannot be fulfilled.'},
  {code:417,name:'Expectation Failed',desc:'Expect request-header field cannot be met.'},
  {code:418,name:"I'm a Teapot",desc:'Server refuses to brew coffee because it is a teapot (RFC 2324).'},
  {code:421,name:'Misdirected Request',desc:'Request directed at a server not able to produce a response.'},
  {code:422,name:'Unprocessable Content',desc:'Request well-formed but semantically erroneous (WebDAV).'},
  {code:423,name:'Locked',desc:'Resource being accessed is locked (WebDAV).'},
  {code:424,name:'Failed Dependency',desc:'Request failed due to failure of a previous request (WebDAV).'},
  {code:425,name:'Too Early',desc:'Server unwilling to risk processing a request that might be replayed.'},
  {code:426,name:'Upgrade Required',desc:'Client should switch to a different protocol.'},
  {code:428,name:'Precondition Required',desc:'Origin server requires the request to be conditional.'},
  {code:429,name:'Too Many Requests',desc:'User has sent too many requests in a given amount of time (rate limiting).'},
  {code:431,name:'Request Header Fields Too Large',desc:'Server unwilling to process; header fields too large.'},
  {code:451,name:'Unavailable For Legal Reasons',desc:'Resource unavailable due to legal demands.'},
  {code:500,name:'Internal Server Error',desc:'Generic error when no specific message is suitable.'},
  {code:501,name:'Not Implemented',desc:'Server does not support the functionality required.'},
  {code:502,name:'Bad Gateway',desc:'Server acting as gateway received an invalid response.'},
  {code:503,name:'Service Unavailable',desc:'Server not ready to handle request (down or overloaded).'},
  {code:504,name:'Gateway Timeout',desc:'Server acting as gateway did not get a response in time.'},
  {code:505,name:'HTTP Version Not Supported',desc:'HTTP version used in the request is not supported.'},
  {code:506,name:'Variant Also Negotiates',desc:'Server has an internal configuration error.'},
  {code:507,name:'Insufficient Storage',desc:'Method could not be performed; server storage full (WebDAV).'},
  {code:508,name:'Loop Detected',desc:'Server detected an infinite loop while processing the request (WebDAV).'},
  {code:510,name:'Not Extended',desc:'Further extensions required for the server to fulfil the request.'},
  {code:511,name:'Network Authentication Required',desc:'Client needs to authenticate to gain network access.'},
];

function httpFilter() {
  renderHttpTable(document.getElementById('http-search').value.toLowerCase());
}

function renderHttpTable(q) {
  const cats = {1:'1xx Informational',2:'2xx Success',3:'3xx Redirection',4:'4xx Client Error',5:'5xx Server Error'};
  const clsMap = {1:'http-1xx',2:'http-2xx',3:'http-3xx',4:'http-4xx',5:'http-5xx'};
  const filtered = q ? HTTP_CODES.filter(c =>
    c.code.toString().includes(q) || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
  ) : HTTP_CODES;
  let html = ''; let cur = 0;
  for (const c of filtered) {
    const cat = Math.floor(c.code / 100);
    if (cat !== cur) {
      if (cur) html += '</div>';
      html += `<div class="http-category"><div class="http-cat-label">${cats[cat]}</div>`;
      cur = cat;
    }
    html += `<div class="http-row">
      <span class="http-code ${clsMap[cat]}">${c.code}</span>
      <span class="http-name">${c.name}</span>
      <span class="http-desc">${c.desc}</span>
    </div>`;
  }
  if (cur) html += '</div>';
  if (!filtered.length) html = '<div style="color:var(--muted);padding:12px;font-size:0.85rem;">No matching status codes.</div>';
  document.getElementById('http-table').innerHTML = html;
}

/* ── CORS Header Builder ── */
function corsGenerate() {
  const origin = document.getElementById('cors-origin').value.trim() || '*';
  const methods = ['get','post','put','patch','delete','options','head']
    .filter(m => document.getElementById('cors-'+m).checked)
    .map(m => m.toUpperCase()).join(', ');
  const headers     = document.getElementById('cors-headers').value.trim();
  const expose      = document.getElementById('cors-expose').value.trim();
  const maxAge      = document.getElementById('cors-maxage').value.trim();
  const credentials = document.getElementById('cors-credentials').checked;

  let out = `Access-Control-Allow-Origin: ${origin}\n`;
  if (methods)     out += `Access-Control-Allow-Methods: ${methods}\n`;
  if (headers)     out += `Access-Control-Allow-Headers: ${headers}\n`;
  if (expose)      out += `Access-Control-Expose-Headers: ${expose}\n`;
  if (maxAge)      out += `Access-Control-Max-Age: ${maxAge}\n`;
  if (credentials) out += `Access-Control-Allow-Credentials: true\n`;

  document.getElementById('cors-result').value = out.trim();
  document.getElementById('cors-output').style.display = 'block';
}

/* ── PEM / Certificate Decoder ── */
const PEM = (() => {
  // OID name lookup
  const OID_NAMES = {
    '2.5.4.3': 'CN', '2.5.4.4': 'SN', '2.5.4.5': 'serialNumber',
    '2.5.4.6': 'C', '2.5.4.7': 'L', '2.5.4.8': 'ST',
    '2.5.4.9': 'street', '2.5.4.10': 'O', '2.5.4.11': 'OU',
    '2.5.4.12': 'title', '2.5.4.17': 'postalCode', '2.5.4.42': 'GN',
    '2.5.4.46': 'dnQualifier',
    '1.2.840.113549.1.1.1': 'RSA',
    '1.2.840.113549.1.1.5': 'SHA-1 with RSA',
    '1.2.840.113549.1.1.11': 'SHA-256 with RSA',
    '1.2.840.113549.1.1.12': 'SHA-384 with RSA',
    '1.2.840.113549.1.1.13': 'SHA-512 with RSA',
    '1.2.840.113549.1.1.14': 'SHA-224 with RSA',
    '1.2.840.10045.2.1': 'EC',
    '1.2.840.10045.3.1.7': 'P-256 (secp256r1)',
    '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
    '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
    '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
    '1.3.101.112': 'Ed25519',
    '1.3.101.113': 'Ed448',
    '2.5.29.14': 'Subject Key Identifier',
    '2.5.29.15': 'Key Usage',
    '2.5.29.17': 'Subject Alternative Name',
    '2.5.29.19': 'Basic Constraints',
    '2.5.29.31': 'CRL Distribution Points',
    '2.5.29.32': 'Certificate Policies',
    '2.5.29.35': 'Authority Key Identifier',
    '2.5.29.37': 'Extended Key Usage',
    '1.3.6.1.5.5.7.1.1': 'Authority Information Access',
    '1.3.6.1.5.5.7.3.1': 'TLS Web Server Authentication',
    '1.3.6.1.5.5.7.3.2': 'TLS Web Client Authentication',
    '1.2.840.113549.1.9.1': 'emailAddress',
    '0.9.2342.19200300.100.1.25': 'DC',
  };

  const KEY_USAGE_BITS = [
    'Digital Signature', 'Non Repudiation', 'Key Encipherment',
    'Data Encipherment', 'Key Agreement', 'Key Cert Sign',
    'CRL Sign', 'Encipher Only', 'Decipher Only'
  ];

  function parseDER(bytes, start, end) {
    start = start || 0;
    end = end || bytes.length;
    const nodes = [];
    let pos = start;
    while (pos < end) {
      if (pos >= bytes.length) break;
      const tag = bytes[pos++];
      if (pos >= end) break;
      let len = bytes[pos++];
      if (len & 0x80) {
        const numBytes = len & 0x7f;
        len = 0;
        for (let i = 0; i < numBytes; i++) len = (len << 8) | bytes[pos++];
      }
      const valueStart = pos;
      const valueEnd = pos + len;
      const constructed = !!(tag & 0x20);
      const node = { tag, len, start: valueStart, end: valueEnd, bytes: bytes.slice(valueStart, valueEnd) };
      if (constructed) {
        node.children = parseDER(bytes, valueStart, valueEnd);
      }
      nodes.push(node);
      pos = valueEnd;
    }
    return nodes;
  }

  function readOID(bytes) {
    const parts = [];
    parts.push(Math.floor(bytes[0] / 40));
    parts.push(bytes[0] % 40);
    let val = 0;
    for (let i = 1; i < bytes.length; i++) {
      val = (val << 7) | (bytes[i] & 0x7f);
      if (!(bytes[i] & 0x80)) { parts.push(val); val = 0; }
    }
    return parts.join('.');
  }

  function readInt(bytes) {
    // Return as hex string for large numbers
    if (bytes.length > 6) return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(':');
    let val = 0;
    for (let i = 0; i < bytes.length; i++) val = val * 256 + bytes[i];
    return val;
  }

  function readUTF8(bytes) {
    return new TextDecoder().decode(new Uint8Array(bytes));
  }

  function readTime(node) {
    const s = readUTF8(node.bytes);
    if (node.tag === 0x17) { // UTCTime
      const yy = parseInt(s.slice(0, 2));
      const year = yy >= 50 ? 1900 + yy : 2000 + yy;
      return new Date(`${year}-${s.slice(2,4)}-${s.slice(4,6)}T${s.slice(6,8)}:${s.slice(8,10)}:${s.slice(10,12)}Z`);
    }
    // GeneralizedTime (0x18)
    return new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}T${s.slice(8,10)}:${s.slice(10,12)}:${s.slice(12,14)}Z`);
  }

  function readName(node) {
    // Name = SEQUENCE of SET of SEQUENCE { OID, value }
    // Returns { dn: "CN=..., O=...", fields: { CN: "...", O: "...", ... } }
    if (!node.children) return { dn: '', fields: {} };
    const parts = [];
    const fields = {};
    for (const set of node.children) {
      if (!set.children) continue;
      for (const seq of set.children) {
        if (!seq.children || seq.children.length < 2) continue;
        const oid = readOID(seq.children[0].bytes);
        const valNode = seq.children[1];
        const val = readUTF8(valNode.bytes);
        const name = OID_NAMES[oid] || oid;
        parts.push(name + '=' + val);
        fields[name] = val;
      }
    }
    return { dn: parts.join(', '), fields };
  }

  function readSANs(extValueBytes) {
    // SANs extension value is an OCTET STRING wrapping a SEQUENCE of GeneralNames
    const wrapper = parseDER(extValueBytes, 0, extValueBytes.length);
    if (!wrapper.length || !wrapper[0].children) return [];
    const sans = [];
    for (const gn of wrapper[0].children) {
      const tagNum = gn.tag & 0x1f;
      const val = readUTF8(gn.bytes);
      if (tagNum === 2) sans.push('DNS: ' + val);
      else if (tagNum === 1) sans.push('Email: ' + val);
      else if (tagNum === 6) sans.push('URI: ' + val);
      else if (tagNum === 7) {
        // IP address
        if (gn.bytes.length === 4) {
          sans.push('IP: ' + Array.from(gn.bytes).join('.'));
        } else if (gn.bytes.length === 16) {
          const parts = [];
          for (let i = 0; i < 16; i += 2) parts.push(((gn.bytes[i] << 8) | gn.bytes[i+1]).toString(16));
          sans.push('IP: ' + parts.join(':'));
        }
      } else {
        sans.push('Other(' + tagNum + '): ' + val);
      }
    }
    return sans;
  }

  function readKeyUsage(bytes) {
    // Key Usage is a BIT STRING
    const inner = parseDER(bytes, 0, bytes.length);
    if (!inner.length) return [];
    const bits = inner[0].bytes;
    if (bits.length < 2) return [];
    const unusedBits = bits[0];
    const usages = [];
    for (let i = 1; i < bits.length; i++) {
      for (let b = 7; b >= 0; b--) {
        const bitIndex = (i - 1) * 8 + (7 - b);
        if (bitIndex >= KEY_USAGE_BITS.length) break;
        if (i === bits.length - 1 && (7 - b) >= (8 - unusedBits)) break;
        if (bits[i] & (1 << b)) usages.push(KEY_USAGE_BITS[bitIndex]);
      }
    }
    return usages;
  }

  function readExtKeyUsage(bytes) {
    const inner = parseDER(bytes, 0, bytes.length);
    if (!inner.length || !inner[0].children) return [];
    return inner[0].children.map(c => {
      const oid = readOID(c.bytes);
      return OID_NAMES[oid] || oid;
    });
  }

  function readBasicConstraints(bytes) {
    const inner = parseDER(bytes, 0, bytes.length);
    if (!inner.length || !inner[0].children) return 'CA: false';
    const children = inner[0].children;
    const isCA = children.length > 0 && children[0].tag === 0x01 && children[0].bytes[0] !== 0;
    let pathLen = '';
    if (children.length > 1 && children[1].tag === 0x02) {
      pathLen = ', Path Length: ' + readInt(children[1].bytes);
    }
    return 'CA: ' + isCA + pathLen;
  }

  function getPublicKeyInfo(spki) {
    if (!spki.children || spki.children.length < 2) return { algorithm: 'Unknown', bits: 0 };
    const algoSeq = spki.children[0];
    const keyBits = spki.children[1];
    let algo = 'Unknown';
    let params = '';
    if (algoSeq.children && algoSeq.children.length > 0) {
      const oid = readOID(algoSeq.children[0].bytes);
      algo = OID_NAMES[oid] || oid;
      if (algoSeq.children.length > 1 && algoSeq.children[1].tag === 0x06) {
        params = OID_NAMES[readOID(algoSeq.children[1].bytes)] || '';
      }
    }
    // Key size: bit string length * 8 minus unused bits indicator
    const keySize = keyBits.bytes.length > 0 ? (keyBits.bytes.length - 1) * 8 : 0;
    // For RSA, parse the actual modulus to get bit size
    let bits = keySize;
    if (algo === 'RSA' && keyBits.bytes.length > 1) {
      const inner = parseDER(keyBits.bytes, 1, keyBits.bytes.length);
      if (inner.length && inner[0].children && inner[0].children.length > 0) {
        bits = (inner[0].children[0].bytes.length - (inner[0].children[0].bytes[0] === 0 ? 1 : 0)) * 8;
      }
    }
    return { algorithm: algo + (params ? ' (' + params + ')' : ''), bits };
  }

  async function decode(pem) {
    // Support multiple certs in a chain
    const certBlocks = pem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g);
    if (!certBlocks || certBlocks.length === 0) throw new Error('No PEM certificate found. Expected -----BEGIN CERTIFICATE----- block.');

    const certs = [];
    for (const block of certBlocks) {
      const b64 = block.replace(/-----BEGIN CERTIFICATE-----/, '').replace(/-----END CERTIFICATE-----/, '').replace(/\s/g, '');
      const raw = atob(b64);
      const der = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) der[i] = raw.charCodeAt(i);

      const root = parseDER(der, 0, der.length);
      if (!root.length || !root[0].children || root[0].children.length < 3) throw new Error('Invalid X.509 certificate structure.');

      const cert = root[0];
      const tbs = cert.children[0];
      const sigAlgoNode = cert.children[1];
      // const sigValue = cert.children[2];

      if (!tbs.children || tbs.children.length < 6) throw new Error('Invalid TBSCertificate structure.');

      let idx = 0;
      // Version: [0] EXPLICIT INTEGER
      let version = 1;
      if ((tbs.children[idx].tag & 0xe0) === 0xa0) {
        const versionNode = parseDER(tbs.children[idx].bytes, 0, tbs.children[idx].bytes.length);
        version = versionNode.length ? readInt(versionNode[0].bytes) + 1 : 1;
        idx++;
      }

      const serial = readInt(tbs.children[idx++].bytes);
      idx++; // skip signature algorithm (duplicate of outer)
      const issuer = readName(tbs.children[idx++]);
      const validity = tbs.children[idx++];
      const subject = readName(tbs.children[idx++]);
      const spki = tbs.children[idx++];

      const notBefore = validity.children ? readTime(validity.children[0]) : null;
      const notAfter = validity.children ? readTime(validity.children[1]) : null;

      // Signature algorithm
      let sigAlgo = 'Unknown';
      if (sigAlgoNode.children && sigAlgoNode.children.length > 0) {
        const oid = readOID(sigAlgoNode.children[0].bytes);
        sigAlgo = OID_NAMES[oid] || oid;
      }

      // Public key info
      const pubKeyInfo = getPublicKeyInfo(spki);

      // Extensions
      const extensions = [];
      const sans = [];
      let keyUsage = [];
      let extKeyUsage = [];
      let basicConstraints = '';

      for (let i = idx; i < tbs.children.length; i++) {
        const ext = tbs.children[i];
        if ((ext.tag & 0xe0) === 0xa0 && (ext.tag & 0x1f) === 3) {
          // Extensions wrapper
          const extsSeq = parseDER(ext.bytes, 0, ext.bytes.length);
          if (extsSeq.length && extsSeq[0].children) {
            for (const extEntry of extsSeq[0].children) {
              if (!extEntry.children || extEntry.children.length < 2) continue;
              const extOid = readOID(extEntry.children[0].bytes);
              const extName = OID_NAMES[extOid] || extOid;
              const critical = extEntry.children.length > 2 && extEntry.children[1].tag === 0x01 && extEntry.children[1].bytes[0] !== 0;
              const extValueNode = extEntry.children[extEntry.children.length - 1];

              if (extOid === '2.5.29.17') {
                sans.push(...readSANs(extValueNode.bytes));
              } else if (extOid === '2.5.29.15') {
                keyUsage = readKeyUsage(extValueNode.bytes);
              } else if (extOid === '2.5.29.37') {
                extKeyUsage = readExtKeyUsage(extValueNode.bytes);
              } else if (extOid === '2.5.29.19') {
                basicConstraints = readBasicConstraints(extValueNode.bytes);
              }

              extensions.push({ oid: extOid, name: extName, critical });
            }
          }
        }
      }

      // Fingerprints
      const sha1 = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', der)))
        .map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');
      const sha256 = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', der)))
        .map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');

      const now = new Date();
      const isExpired = notAfter && now > notAfter;
      const isNotYetValid = notBefore && now < notBefore;

      certs.push({
        version, serial, subject, issuer,
        notBefore, notAfter,
        sigAlgo, pubKeyInfo,
        sans, keyUsage, extKeyUsage, basicConstraints,
        extensions, sha1, sha256,
        isExpired, isNotYetValid,
      });
    }
    return certs;
  }

  // Decode raw DER certificate byte arrays (for keystore viewer)
  async function decodeDER(derArrays) {
    const certs = [];
    for (const der of derArrays) {
      const root = parseDER(der, 0, der.length);
      if (!root.length || !root[0].children || root[0].children.length < 3) continue;

      const cert = root[0];
      const tbs = cert.children[0];
      const sigAlgoNode = cert.children[1];

      if (!tbs.children || tbs.children.length < 6) continue;

      let idx = 0;
      let version = 1;
      if ((tbs.children[idx].tag & 0xe0) === 0xa0) {
        const versionNode = parseDER(tbs.children[idx].bytes, 0, tbs.children[idx].bytes.length);
        version = versionNode.length ? readInt(versionNode[0].bytes) + 1 : 1;
        idx++;
      }

      const serial = readInt(tbs.children[idx++].bytes);
      idx++;
      const issuer = readName(tbs.children[idx++]);
      const validity = tbs.children[idx++];
      const subject = readName(tbs.children[idx++]);
      const spki = tbs.children[idx++];

      const notBefore = validity.children ? readTime(validity.children[0]) : null;
      const notAfter = validity.children ? readTime(validity.children[1]) : null;

      let sigAlgo = 'Unknown';
      if (sigAlgoNode.children && sigAlgoNode.children.length > 0) {
        const oid = readOID(sigAlgoNode.children[0].bytes);
        sigAlgo = OID_NAMES[oid] || oid;
      }

      const pubKeyInfo = getPublicKeyInfo(spki);

      const sans = [];
      let keyUsage = [];
      let extKeyUsage = [];
      let basicConstraints = '';

      for (let i = idx; i < tbs.children.length; i++) {
        const ext = tbs.children[i];
        if ((ext.tag & 0xe0) === 0xa0 && (ext.tag & 0x1f) === 3) {
          const extsSeq = parseDER(ext.bytes, 0, ext.bytes.length);
          if (extsSeq.length && extsSeq[0].children) {
            for (const extEntry of extsSeq[0].children) {
              if (!extEntry.children || extEntry.children.length < 2) continue;
              const extOid = readOID(extEntry.children[0].bytes);
              const extValueNode = extEntry.children[extEntry.children.length - 1];
              if (extOid === '2.5.29.17') sans.push(...readSANs(extValueNode.bytes));
              else if (extOid === '2.5.29.15') keyUsage = readKeyUsage(extValueNode.bytes);
              else if (extOid === '2.5.29.37') extKeyUsage = readExtKeyUsage(extValueNode.bytes);
              else if (extOid === '2.5.29.19') basicConstraints = readBasicConstraints(extValueNode.bytes);
            }
          }
        }
      }

      const sha1 = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', der)))
        .map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');
      const sha256 = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', der)))
        .map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');

      const now = new Date();
      certs.push({
        version, serial, subject, issuer,
        notBefore, notAfter, sigAlgo, pubKeyInfo,
        sans, keyUsage, extKeyUsage, basicConstraints,
        sha1, sha256,
        isExpired: notAfter && now > notAfter,
        isNotYetValid: notBefore && now < notBefore,
      });
    }
    return certs;
  }

  return { decode, decodeDER, parseDER, readOID, readUTF8 };
})();

async function pemDecode() {
  const input = document.getElementById('pem-in');
  const resultsEl = document.getElementById('pem-results');
  setError('pem-err', '');
  input.classList.remove('error');
  const val = input.value.trim();
  if (!val) { setError('pem-err', 'Please paste a PEM certificate.'); input.classList.add('error'); return; }

  try {
    const certs = await PEM.decode(val);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const nameFieldLabels = {
      CN: 'Common Name', O: 'Organization', OU: 'Org Unit',
      L: 'Locality', ST: 'State', C: 'Country',
      emailAddress: 'Email', DC: 'Domain Component',
      serialNumber: 'Serial No.', SN: 'Surname', GN: 'Given Name',
      street: 'Street', postalCode: 'Postal Code', title: 'Title',
      dnQualifier: 'DN Qualifier',
    };
    const nameFieldOrder = ['CN', 'O', 'OU', 'L', 'ST', 'C', 'emailAddress', 'DC'];

    function renderNameFields(nameObj) {
      const f = nameObj.fields;
      const allKeys = nameFieldOrder.filter(k => f[k]).concat(Object.keys(f).filter(k => !nameFieldOrder.includes(k)));
      return allKeys.map(k => {
        const label = nameFieldLabels[k] || k;
        return `<div class="pem-field"><span class="pem-label">${esc(label)}</span><span class="pem-value">${esc(f[k])}</span></div>`;
      }).join('');
    }

    resultsEl.innerHTML = certs.map((cert, i) => {
      const statusCls = cert.isExpired ? 'pem-expired' : cert.isNotYetValid ? 'pem-expired' : 'pem-valid';
      const statusMsg = cert.isExpired ? 'EXPIRED' : cert.isNotYetValid ? 'NOT YET VALID' : 'VALID';
      const title = certs.length > 1 ? `<div class="pem-cert-title">Certificate ${i + 1} of ${certs.length}</div>` : '';
      return `${title}<div class="pem-cert">
        <div class="pem-status ${statusCls}">${statusMsg}</div>
        <div class="pem-section">
          <div class="pem-section-title">Subject</div>
          ${renderNameFields(cert.subject)}
        </div>
        ${cert.sans.length ? `<div class="pem-section">
          <div class="pem-section-title">Subject Alternative Names (${cert.sans.length})</div>
          <div class="pem-sans">${cert.sans.map(s => `<span class="pem-san-tag">${esc(s)}</span>`).join('')}</div>
        </div>` : ''}
        <div class="pem-section">
          <div class="pem-section-title">Issuer</div>
          ${renderNameFields(cert.issuer)}
        </div>
        <div class="pem-section">
          <div class="pem-section-title">Validity</div>
          <div class="pem-field"><span class="pem-label">Valid From</span><span class="pem-value">${cert.notBefore ? cert.notBefore.toUTCString() : 'N/A'}</span></div>
          <div class="pem-field"><span class="pem-label">Valid To</span><span class="pem-value">${cert.notAfter ? cert.notAfter.toUTCString() : 'N/A'}</span></div>
        </div>
        <div class="pem-section">
          <div class="pem-section-title">Details</div>
          <div class="pem-field"><span class="pem-label">Version</span><span class="pem-value">V${cert.version}</span></div>
          <div class="pem-field"><span class="pem-label">Serial Number</span><span class="pem-value" style="word-break:break-all;">${esc(String(cert.serial))}</span></div>
          <div class="pem-field"><span class="pem-label">Signature Algo</span><span class="pem-value">${esc(cert.sigAlgo)}</span></div>
          <div class="pem-field"><span class="pem-label">Public Key</span><span class="pem-value">${esc(cert.pubKeyInfo.algorithm)} (${cert.pubKeyInfo.bits} bit)</span></div>
          ${cert.basicConstraints ? `<div class="pem-field"><span class="pem-label">Basic Constraints</span><span class="pem-value">${esc(cert.basicConstraints)}</span></div>` : ''}
          ${cert.keyUsage.length ? `<div class="pem-field"><span class="pem-label">Key Usage</span><span class="pem-value">${cert.keyUsage.map(esc).join(', ')}</span></div>` : ''}
          ${cert.extKeyUsage.length ? `<div class="pem-field"><span class="pem-label">Ext Key Usage</span><span class="pem-value">${cert.extKeyUsage.map(esc).join(', ')}</span></div>` : ''}
        </div>
        <div class="pem-section">
          <div class="pem-section-title">Fingerprints</div>
          <div class="pem-field"><span class="pem-label">SHA-1</span><span class="pem-value pem-hash">${cert.sha1}</span>
            <button class="btn btn-secondary" style="padding:2px 10px;font-size:0.7rem;flex-shrink:0;" onclick="copyVal('${cert.sha1.replace(/'/g, "\\'")}')">Copy</button></div>
          <div class="pem-field"><span class="pem-label">SHA-256</span><span class="pem-value pem-hash">${cert.sha256}</span>
            <button class="btn btn-secondary" style="padding:2px 10px;font-size:0.7rem;flex-shrink:0;" onclick="copyVal('${cert.sha256.replace(/'/g, "\\'")}')">Copy</button></div>
        </div>
      </div>`;
    }).join('');
    resultsEl.style.display = 'flex';
  } catch (e) {
    setError('pem-err', e.message);
    input.classList.add('error');
    resultsEl.style.display = 'none';
  }
}

function clearPem() {
  document.getElementById('pem-in').value = '';
  document.getElementById('pem-in').classList.remove('error');
  setError('pem-err', '');
  const r = document.getElementById('pem-results');
  r.style.display = 'none'; r.innerHTML = '';
}

/* ── Theme toggle ── */
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  const btn = document.getElementById('theme-toggle');
  btn.textContent = isDark ? '🌙 Dark' : '☀️ Light';
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

/* Restore saved theme on load */
(function() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    document.getElementById('theme-toggle').textContent = '☀️ Light';
  }
})();

/* ── Live encode/decode on input ── */
document.getElementById('htmlenc-in').addEventListener('input', htmlEncode);
document.getElementById('htmldec-in').addEventListener('input', htmlDecode);
document.getElementById('b64enc-in').addEventListener('input', b64Encode);
document.getElementById('b64dec-in').addEventListener('input', b64Decode);
document.getElementById('urlenc-in').addEventListener('input', urlEncode);
document.getElementById('urldec-in').addEventListener('input', urlDecode);
document.getElementById('jwt-in').addEventListener('input', jwtDecode);
document.getElementById('json-in').addEventListener('input', jsonBeautify);
document.getElementById('xml-in').addEventListener('input', xmlBeautify);
document.getElementById('saml-in').addEventListener('input', samlDecode);
document.getElementById('ts-in').addEventListener('input', tsConvert);
document.getElementById('b64urlenc-in').addEventListener('input', b64urlEncode);
document.getElementById('b64urldec-in').addEventListener('input', b64urlDecode);
document.getElementById('regex-pattern').addEventListener('input', regexTest);
document.getElementById('regex-test').addEventListener('input', regexTest);
document.getElementById('pem-in').addEventListener('input', pemDecode);
// Init HTTP table on load
renderHttpTable('');
