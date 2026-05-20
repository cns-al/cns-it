import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, RefreshCw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export const toolComponents: Record<string, { name: string; component: any }> = {
    'base64': { name: 'Base64 Encode/Decode', component: Base64Tool },
    'url-encode': { name: 'URL Encode/Decode', component: UrlEncodeTool },
    'case': { name: 'Case Converter', component: CaseConverterTool },
    'uuid': { name: 'UUID Generator', component: UUIDTool },
    'password': { name: 'Password Generator', component: PasswordTool },
    'json': { name: 'JSON Formatter', component: JsonFormatterTool },
    'hash': { name: 'Hash Generator', component: HashTool },
    'jwt': { name: 'JWT Parser', component: JWTTool },
    'regex': { name: 'Regex Tester', component: RegexTool },
    'color': { name: 'Color Converter', component: ColorTool },
    'text-stats': { name: 'Text Statistics', component: TextStatsTool },
    'number-base': { name: 'Number Base Converter', component: NumberBaseTool },
    'slug': { name: 'Slug Generator', component: SlugTool },
    'token': { name: 'Token Generator', component: TokenTool },
    'http-status': { name: 'HTTP Status Codes', component: HttpStatusTool },
    'crontab': { name: 'Crontab Generator', component: CrontabTool },
    'date': { name: 'Date/Time Converter', component: DateTool },
    'percentage': { name: 'Percentage Calculator', component: PercentageTool },
    'math': { name: 'Math Evaluator', component: MathTool },
    'diff': { name: 'Text Diff', component: DiffTool },
    'lorem': { name: 'Lorem Ipsum', component: LoremTool },
    'nato': { name: 'NATO Alphabet', component: NatoTool },
    'roman': { name: 'Roman Numerals', component: RomanTool },
    'emoji': { name: 'Emoji Picker', component: EmojiTool },
    'binary': { name: 'Binary Converter', component: BinaryTool },
    'hex': { name: 'Hex Converter', component: HexTool },
    'unicode': { name: 'Unicode Converter', component: UnicodeTool },
    'html-entities': { name: 'HTML Entities', component: HtmlEntitiesTool },
    'json-yaml': { name: 'JSON / YAML', component: JsonYamlTool },
    'json-xml': { name: 'JSON / XML', component: JsonXmlTool },
    'json-csv': { name: 'JSON / CSV', component: JsonCsvTool },
    'xml': { name: 'XML Formatter', component: XmlFormatterTool },
    'sql': { name: 'SQL Formatter', component: SqlFormatterTool },
    'markdown': { name: 'Markdown to HTML', component: MarkdownTool },
    'ip-converter': { name: 'IP Address Converter', component: IpConverterTool },
    'user-agent': { name: 'User Agent Parser', component: UserAgentTool },
    'url-parser': { name: 'URL Parser', component: UrlParserTool },
    'bcrypt': { name: 'Bcrypt Hash', component: BcryptTool },
    'basic-auth': { name: 'Basic Auth Generator', component: BasicAuthTool },
    'password-strength': { name: 'Password Strength', component: PasswordStrengthTool },
    'chmod': { name: 'Chmod Calculator', component: ChmodTool },
    'git': { name: 'Git Cheat Sheet', component: GitTool },
    'eta': { name: 'ETA Calculator', component: EtaTool },
    'temperature': { name: 'Temperature Converter', component: TemperatureTool },
    'obfuscate': { name: 'Text Obfuscator', component: ObfuscateTool },
    'list': { name: 'List Converter', component: ListTool },
    'qr': { name: 'QR Code Generator', component: QrTool },
    'hmac': { name: 'HMAC Generator', component: HmacTool },
    'encryption': { name: 'Text Encryption', component: EncryptionTool },
    'mac': { name: 'MAC Address Generator', component: MacTool },
    'subnet': { name: 'Subnet Calculator', component: SubnetTool },
    'docker': { name: 'Docker Compose Generator', component: DockerTool },
    'rsa': { name: 'RSA Key Generator', component: RsaTool },
    'toml': { name: 'TOML Converter', component: TomlTool },
    'yaml': { name: 'YAML Viewer', component: YamlTool },
};

export default function ToolViewPage() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  if (!toolId) return null;

  const tool = toolComponents[toolId];

  if (!tool) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <button onClick={() => navigate('/tools')} className="mb-8 flex items-center gap-2 text-dark-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to Tools
        </button>
        <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-100">Tool not found</h2>
        <p className="mt-2 text-sm text-dark-400">This tool is coming soon</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 px-6 py-4">
        <button onClick={() => navigate('/tools')} className="rounded-lg p-2 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
          <Zap className="h-4 w-4 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-base font-semibold text-dark-900 dark:text-dark-100">{tool.name}</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-6"><tool.component /></div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="shrink-0 rounded-lg p-1.5 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function Base64Tool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const output = mode === 'encode'
    ? input ? (() => { try { return btoa(unescape(encodeURIComponent(input))); } catch { return 'Error encoding'; } })() : ''
    : input ? (() => { try { return decodeURIComponent(escape(atob(input))); } catch { return 'Invalid Base64'; } })() : '';
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('encode')} className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-secondary'}`}>Encode</button>
        <button onClick={() => setMode('decode')} className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-secondary'}`}>Decode</button>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="input font-mono resize-none" rows={6} placeholder={mode === 'encode' ? 'Enter text...' : 'Enter Base64...'} />
      </div>
      <div>
        <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Output</label><CopyButton text={output} /></div>
        <textarea value={output} readOnly className="input font-mono resize-none bg-dark-50 dark:bg-dark-800" rows={6} />
      </div>
    </div>
  );
}

function UrlEncodeTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const output = mode === 'encode' ? (() => { try { return encodeURIComponent(input); } catch { return 'Error'; } })() : (() => { try { return decodeURIComponent(input); } catch { return 'Invalid URL'; } })();
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('encode')} className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-secondary'}`}>Encode</button>
        <button onClick={() => setMode('decode')} className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-secondary'}`}>Decode</button>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="input font-mono resize-none" rows={4} placeholder="Enter text..." />
      </div>
      <div>
        <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Output</label><CopyButton text={output} /></div>
        <textarea value={output} readOnly className="input font-mono resize-none bg-dark-50 dark:bg-dark-800" rows={4} />
      </div>
    </div>
  );
}

function CaseConverterTool() {
  const [input, setInput] = useState('');
  const cases = {
    'UPPERCASE': input.toUpperCase(),
    'lowercase': input.toLowerCase(),
    'Title Case': input.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()),
    'camelCase': input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
    'PascalCase': input.toLowerCase().replace(/(^|\s)(\w)/g, (_, __, c) => c.toUpperCase()).replace(/\s+/g, ''),
    'snake_case': input.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
    'kebab-case': input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    'CONSTANT_CASE': input.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''),
  };
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="input resize-none" rows={3} placeholder="Enter text..." />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {Object.entries(cases).map(([name, result]) => (
          <div key={name} className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 p-3">
            <span className="shrink-0 text-xs font-medium text-dark-500 w-28">{name}</span>
            <span className="flex-1 truncate text-sm font-mono text-dark-900 dark:text-dark-100">{result || '—'}</span>
            <CopyButton text={result} />
          </div>
        ))}
      </div>
    </div>
  );
}

function UUIDTool() {
  const [uuids, setUuids] = useState<string[]>([generateUUID()]);
  const [count, setCount] = useState(1);
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  const generate = () => setUuids(Array.from({ length: count }, () => generateUUID()));
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-dark-700 dark:text-dark-300">Count:</label>
        <input type="number" value={count} onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))} className="input w-20" min={1} max={50} />
        <button onClick={generate} className="btn btn-primary"><RefreshCw className="mr-1.5 h-4 w-4" />Generate</button>
      </div>
      <div className="space-y-2">
        {uuids.map((uuid, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-2.5">
            <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100">{uuid}</code>
            <CopyButton text={uuid} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PasswordTool() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(24);
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const generate = () => {
    const chars = { upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz', numbers: '0123456789', symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?' };
    let pool = '';
    if (opts.upper) pool += chars.upper; if (opts.lower) pool += chars.lower;
    if (opts.numbers) pool += chars.numbers; if (opts.symbols) pool += chars.symbols;
    if (!pool) pool = chars.lower;
    setPassword(Array.from({ length }, () => pool[Math.floor(Math.random() * pool.length)]).join(''));
  };
  if (!password) generate();
  const strength = password.length >= 16 ? 'Strong' : password.length >= 12 ? 'Good' : password.length >= 8 ? 'Fair' : 'Weak';
  const strengthColor = strength === 'Strong' ? 'text-green-500' : strength === 'Good' ? 'text-yellow-500' : strength === 'Fair' ? 'text-orange-500' : 'text-red-500';
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-3">
        <code className="flex-1 text-lg font-mono text-dark-900 dark:text-dark-100 break-all">{password}</code>
        <CopyButton text={password} />
      </div>
      <p className={`text-sm font-medium ${strengthColor}`}>Strength: {strength}</p>
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-dark-700 dark:text-dark-300">Length: <span>{length}</span></label>
          <input type="range" min={4} max={128} value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full accent-brand-600" />
        </div>
        <div className="flex flex-wrap gap-4">
          {Object.entries(opts).map(([key, val]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-dark-700 dark:text-dark-300">
              <input type="checkbox" checked={val} onChange={() => setOpts({ ...opts, [key]: !val })} className="rounded accent-brand-600" />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
          ))}
        </div>
        <button onClick={generate} className="btn btn-primary"><RefreshCw className="mr-1.5 h-4 w-4" />Generate</button>
      </div>
    </div>
  );
}

function JsonFormatterTool() {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState('');
  let output = '';
  try { if (input.trim()) { output = JSON.stringify(JSON.parse(input), null, indent); setError(''); } } catch (e: any) { output = ''; setError(e.message); }
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-dark-700 dark:text-dark-300">Indent:</label>
        <select value={indent} onChange={(e) => setIndent(parseInt(e.target.value))} className="input w-20">
          <option value={2}>2 spaces</option><option value={4}>4 spaces</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input</label>
          <textarea value={input} onChange={(e) => { setInput(e.target.value); setError(''); }} className="input font-mono text-sm resize-none" rows={20} placeholder='{"key": "value"}' />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Formatted</label><CopyButton text={output} /></div>
          {error && <div className="mb-2 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <textarea value={output} readOnly className="input font-mono text-sm resize-none bg-dark-50 dark:bg-dark-800" rows={20} />
        </div>
      </div>
    </div>
  );
}

async function generateHash(algo: string, input: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algo, new TextEncoder().encode(input));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function HashTool() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const generateHashes = async () => {
    if (!input) { setHashes({}); return; }
    const result: Record<string, string> = {};
    for (const algo of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) {
      try { result[algo] = await generateHash(algo, input); } catch { result[algo] = 'Not supported'; }
    }
    setHashes(result);
  };
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input Text</label>
        <textarea value={input} onChange={(e) => { setInput(e.target.value); generateHashes(); }} className="input resize-none" rows={4} placeholder="Enter text to hash..." />
      </div>
      <div className="space-y-2">
        {Object.entries(hashes).map(([algo, hash]) => (
          <div key={algo} className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-3">
            <span className="shrink-0 text-xs font-semibold text-dark-500 w-20">{algo}</span>
            <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100 break-all">{hash || '—'}</code>
            <CopyButton text={hash} />
          </div>
        ))}
      </div>
    </div>
  );
}

function JWTTool() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<any>(null);
  const [error, setError] = useState('');
  const parseJWT = () => {
    try {
      if (!input.trim()) { setDecoded(null); setError(''); return; }
      const parts = input.trim().split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format');
      const decode = (part: string) => JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
      setDecoded({ header: decode(parts[0]), payload: decode(parts[1]), signature: parts[2] });
      setError('');
    } catch (e: any) { setDecoded(null); setError(e.message); }
  };
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">JWT Token</label>
        <textarea value={input} onChange={(e) => { setInput(e.target.value); parseJWT(); }} className="input font-mono text-sm resize-none" rows={4} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
      </div>
      {error && <div className="rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
      {decoded && (
        <div className="space-y-3">
          {Object.entries(decoded).map(([key, value]) => (
            <div key={key}>
              <h3 className="mb-1.5 text-sm font-semibold text-dark-700 dark:text-dark-300 capitalize">{key}</h3>
              <pre className="rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 p-4 text-sm font-mono text-dark-900 dark:text-dark-100 overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RegexTool() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('gi');
  const [testStr, setTestStr] = useState('');
  const [matches, setMatches] = useState<string[]>([]);
  const [error, setError] = useState('');
  const testRegex = () => {
    try {
      if (!pattern) { setMatches([]); setError(''); return; }
      setMatches(new RegExp(pattern, flags).exec(testStr)?.[0] ? [...(testStr.match(new RegExp(pattern, flags)) || [])] : []);
      setError('');
    } catch (e: any) { setMatches([]); setError(e.message); }
  };
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex gap-2">
        <input value={pattern} onChange={(e) => { setPattern(e.target.value); testRegex(); }} className="input font-mono flex-1" placeholder="Enter regex pattern..." />
        <input value={flags} onChange={(e) => { setFlags(e.target.value); testRegex(); }} className="input w-20 font-mono" placeholder="flags" />
      </div>
      {error && <div className="rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Test String</label>
        <textarea value={testStr} onChange={(e) => { setTestStr(e.target.value); testRegex(); }} className="input resize-none" rows={6} placeholder="Enter text to test..." />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-dark-700 dark:text-dark-300">Matches ({matches.length})</h3>
        <div className="space-y-1">
          {matches.map((m, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-2">
              <span className="text-xs text-dark-400 w-6">{i + 1}.</span>
              <code className="text-sm font-mono text-dark-900 dark:text-dark-100">{m}</code>
              <CopyButton text={m} />
            </div>
          ))}
          {matches.length === 0 && testStr && <p className="text-sm text-dark-400">No matches found</p>}
        </div>
      </div>
    </div>
  );
}

function ColorTool() {
  const [hex, setHex] = useState('#6366f1');
  const [error, setError] = useState('');
  const parseHex = (h: string) => {
    try {
      if (!h.startsWith('#') || (h.length !== 7 && h.length !== 4)) throw new Error('Invalid');
      const r = h.length === 4 ? parseInt(h[1] + h[1], 16) : parseInt(h.substring(1, 3), 16);
      const g = h.length === 4 ? parseInt(h[2] + h[2], 16) : parseInt(h.substring(3, 5), 16);
      const b = h.length === 4 ? parseInt(h[3] + h[3], 16) : parseInt(h.substring(5, 7), 16);
      return { r, g, b };
    } catch { setError('Invalid hex color'); return null; }
  };
  const rgb = parseHex(hex);
  const rgbStr = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '';
  const hsl = rgb ? (() => {
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6; else if (max === g) h = ((b - r) / d + 2) / 6; else h = ((r - g) / d + 4) / 6; }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  })() : '';
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex gap-3">
        <input type="color" value={hex} onChange={(e) => { setHex(e.target.value); setError(''); }} className="h-12 w-20 rounded-lg border border-dark-200 dark:border-dark-700 cursor-pointer" />
        <input value={hex} onChange={(e) => { setHex(e.target.value); }} className="input font-mono flex-1" placeholder="#6366f1" />
      </div>
      {rgb && <div className="h-24 rounded-xl border border-dark-200 dark:border-dark-800" style={{ backgroundColor: hex }} />}
      {error && <div className="rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
      <div className="space-y-2">
        {[['HEX', hex], ['RGB', rgbStr], ['HSL', hsl]].map(([label, value]) => value && (
          <div key={label} className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-2.5">
            <span className="shrink-0 text-xs font-semibold text-dark-500 w-12">{label}</span>
            <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100">{value}</code>
            <CopyButton text={value} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TextStatsTool() {
  const [text, setText] = useState('');
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split('\n').length : 0;
  const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Text</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="input resize-none" rows={10} placeholder="Enter text..." />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[['Characters', chars], ['Words', words], ['Lines', lines], ['Sentences', sentences], ['Read Time', `${readTime} min`]].map(([label, value]) => (
          <div key={label as string} className="rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 p-4 text-center">
            <p className="text-2xl font-bold text-dark-900 dark:text-dark-100">{value}</p>
            <p className="mt-1 text-xs text-dark-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NumberBaseTool() {
  const [input, setInput] = useState('255');
  const [base, setBase] = useState(10);
  const [error, setError] = useState('');
  let decimal = NaN;
  try { decimal = parseInt(input, base); if (isNaN(decimal)) throw new Error('Invalid'); setError(''); } catch { setError('Invalid input'); }
  const conversions = !isNaN(decimal) ? { 'Binary (2)': decimal.toString(2), 'Octal (8)': decimal.toString(8), 'Decimal (10)': decimal.toString(10), 'Hexadecimal (16)': decimal.toString(16).toUpperCase() } : {};
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex gap-2">
        <select value={base} onChange={(e) => setBase(parseInt(e.target.value))} className="input w-40">
          <option value={2}>Binary (2)</option><option value={8}>Octal (8)</option><option value={10}>Decimal (10)</option><option value={16}>Hex (16)</option>
        </select>
        <input value={input} onChange={(e) => { setInput(e.target.value); setError(''); }} className="input font-mono flex-1" placeholder={`Base ${base} number`} />
      </div>
      {error && <div className="rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
      <div className="space-y-2">
        {Object.entries(conversions).map(([label, value]) => (
          <div key={label} className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-2.5">
            <span className="shrink-0 text-xs font-semibold text-dark-500 w-28">{label}</span>
            <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100">{value}</code>
            <CopyButton text={value} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SlugTool() {
  const [input, setInput] = useState('');
  const slug = input.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input Text</label>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input" placeholder="Hello World!" />
      </div>
      <div>
        <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Slug</label><CopyButton text={slug} /></div>
        <div className="rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3 font-mono text-sm text-dark-900 dark:text-dark-100">{slug || '—'}</div>
      </div>
    </div>
  );
}

function TokenTool() {
  const [tokens, setTokens] = useState<string[]>([]);
  const [length, setLength] = useState(32);
  const [count, setCount] = useState(1);
  const generate = () => {
    const result = [];
    for (let i = 0; i < count; i++) { const a = new Uint8Array(length); crypto.getRandomValues(a); result.push(Array.from(a, b => b.toString(16).padStart(2, '0')).join('')); }
    setTokens(result);
  };
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-dark-700 dark:text-dark-300">Length: {length}</label>
        <input type="range" min={8} max={128} value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="flex-1 accent-brand-600" />
        <label className="text-sm font-medium text-dark-700 dark:text-dark-300">Count:</label>
        <input type="number" value={count} onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))} className="input w-20" min={1} max={20} />
        <button onClick={generate} className="btn btn-primary"><RefreshCw className="mr-1.5 h-4 w-4" />Generate</button>
      </div>
      <div className="space-y-2">
        {tokens.map((token, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-2.5">
            <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100 break-all">{token}</code>
            <CopyButton text={token} />
          </div>
        ))}
      </div>
    </div>
  );
}

function HttpStatusTool() {
  const codes = [
    { code: 200, name: 'OK', desc: 'Standard response for successful HTTP requests' },
    { code: 201, name: 'Created', desc: 'Resource was successfully created' },
    { code: 204, name: 'No Content', desc: 'Request succeeded but no content returned' },
    { code: 301, name: 'Moved Permanently', desc: 'URL has been permanently moved' },
    { code: 304, name: 'Not Modified', desc: 'Resource not modified since last request' },
    { code: 400, name: 'Bad Request', desc: 'Server cannot process the request' },
    { code: 401, name: 'Unauthorized', desc: 'Authentication required and failed' },
    { code: 403, name: 'Forbidden', desc: 'No permission to access the resource' },
    { code: 404, name: 'Not Found', desc: 'Resource could not be found' },
    { code: 429, name: 'Too Many Requests', desc: 'Rate limit exceeded' },
    { code: 500, name: 'Internal Server Error', desc: 'Unexpected server error' },
    { code: 502, name: 'Bad Gateway', desc: 'Invalid response from upstream server' },
    { code: 503, name: 'Service Unavailable', desc: 'Server temporarily unavailable' },
  ];
  const colorMap: Record<number, string> = { 200: 'text-green-500', 201: 'text-green-500', 204: 'text-green-500', 301: 'text-blue-500', 304: 'text-blue-500', 400: 'text-orange-500', 401: 'text-orange-500', 403: 'text-orange-500', 404: 'text-orange-500', 429: 'text-orange-500', 500: 'text-red-500', 502: 'text-red-500', 503: 'text-red-500' };
  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-2">
        {codes.map(({ code, name, desc }) => (
          <div key={code} className="flex items-center gap-4 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-3">
            <span className={`shrink-0 font-mono text-sm font-bold ${colorMap[code]}`}>{code}</span>
            <span className="text-sm font-medium text-dark-900 dark:text-dark-100 w-36">{name}</span>
            <span className="text-sm text-dark-400">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrontabTool() {
  const [fields, setFields] = useState({ min: '*', hour: '*', day: '*', month: '*', weekday: '*' });
  const cron = `${fields.min} ${fields.hour} ${fields.day} ${fields.month} ${fields.weekday}`;
  const presets = [
    { label: 'Every minute', value: { min: '*', hour: '*', day: '*', month: '*', weekday: '*' } },
    { label: 'Every hour', value: { min: '0', hour: '*', day: '*', month: '*', weekday: '*' } },
    { label: 'Daily at midnight', value: { min: '0', hour: '0', day: '*', month: '*', weekday: '*' } },
    { label: 'Weekly (Sun)', value: { min: '0', hour: '0', day: '*', month: '*', weekday: '0' } },
  ];
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3">
        <code className="flex-1 text-lg font-mono text-dark-900 dark:text-dark-100">{cron}</code>
        <CopyButton text={cron} />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(fields).map(([key, value]) => (
          <div key={key}>
            <label className="mb-1 block text-center text-xs font-medium text-dark-500 capitalize">{key}</label>
            <input value={value} onChange={(e) => setFields({ ...fields, [key]: e.target.value })} className="input text-center font-mono" />
          </div>
        ))}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-dark-700 dark:text-dark-300">Presets</h3>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button key={p.label} onClick={() => setFields(p.value)} className="btn btn-secondary text-xs">{p.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DateTool() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const selected = date ? new Date(date) : new Date();
  const isValid = !isNaN(selected.getTime());
  const info = isValid ? { 'ISO 8601': selected.toISOString(), 'Unix Timestamp': Math.floor(selected.getTime() / 1000).toString(), 'UTC': selected.toUTCString(), 'Local': selected.toString(), 'Date': selected.toLocaleDateString(), 'Time': selected.toLocaleTimeString() } : {};
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Date & Time</label>
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
      </div>
      <div className="space-y-2">
        {Object.entries(info).map(([label, value]) => (
          <div key={label} className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-2.5">
            <span className="shrink-0 text-xs font-semibold text-dark-500 w-32">{label}</span>
            <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100">{value}</code>
            <CopyButton text={value} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PercentageTool() {
  const [mode, setMode] = useState<'what-is' | 'of-what' | 'change'>('what-is');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  let result = '';
  if (mode === 'what-is') result = a && b ? `${((parseFloat(a) / 100) * parseFloat(b)).toFixed(4)}` : '';
  else if (mode === 'of-what') result = a && b ? `${((parseFloat(a) / parseFloat(b)) * 100).toFixed(4)}%` : '';
  else result = a && b ? `${(((parseFloat(b) - parseFloat(a)) / parseFloat(a)) * 100).toFixed(4)}%` : '';
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('what-is')} className={`btn text-xs ${mode === 'what-is' ? 'btn-primary' : 'btn-secondary'}`}>What is X% of Y?</button>
        <button onClick={() => setMode('of-what')} className={`btn text-xs ${mode === 'of-what' ? 'btn-primary' : 'btn-secondary'}`}>X is % of Y?</button>
        <button onClick={() => setMode('change')} className={`btn text-xs ${mode === 'change' ? 'btn-primary' : 'btn-secondary'}`}>% Change X→Y</button>
      </div>
      <div className="flex items-center gap-3">
        <input value={a} onChange={(e) => setA(e.target.value)} className="input flex-1" placeholder={mode === 'of-what' ? 'Value X' : mode === 'change' ? 'From X' : 'Percentage'} type="number" />
        <span className="text-dark-400">{mode === 'of-what' ? 'is % of' : mode === 'change' ? 'to' : '% of'}</span>
        <input value={b} onChange={(e) => setB(e.target.value)} className="input flex-1" placeholder="Value Y" type="number" />
      </div>
      {result && <div className="rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3"><span className="text-sm text-dark-400">Result: </span><span className="text-lg font-bold font-mono text-dark-900 dark:text-dark-100">{result}</span></div>}
    </div>
  );
}

function MathTool() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const evaluate = () => {
    try {
      if (!expr.trim()) { setResult(''); setError(''); return; }
      const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, '');
      setResult(String(new Function('return ' + sanitized)()));
      setError('');
    } catch { setResult(''); setError('Invalid expression'); }
  };
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex gap-2">
        <input value={expr} onChange={(e) => { setExpr(e.target.value); evaluate(); }} className="input font-mono flex-1" placeholder="e.g., (2 + 3) * 4" onKeyDown={(e) => e.key === 'Enter' && evaluate()} />
        <button onClick={evaluate} className="btn btn-primary">=</button>
      </div>
      {error && <div className="rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
      {result && <div className="rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3"><span className="text-sm text-dark-400">Result: </span><span className="text-2xl font-bold font-mono text-dark-900 dark:text-dark-100">{result}</span></div>}
    </div>
  );
}

function DiffTool() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const maxLines = Math.max(lines1.length, lines2.length);
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Original</label>
          <textarea value={text1} onChange={(e) => setText1(e.target.value)} className="input font-mono text-sm resize-none" rows={12} placeholder="Original text..." />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Modified</label>
          <textarea value={text2} onChange={(e) => setText2(e.target.value)} className="input font-mono text-sm resize-none" rows={12} placeholder="Modified text..." />
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-dark-700 dark:text-dark-300">Comparison</h3>
        <div className="max-h-64 overflow-y-auto rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 p-4 font-mono text-sm">
          {Array.from({ length: maxLines }).map((_, i) => {
            const l1 = lines1[i], l2 = lines2[i];
            if (l1 === undefined) return <div key={i} className="text-green-600">+ {l2}</div>;
            if (l2 === undefined) return <div key={i} className="text-red-600">- {l1}</div>;
            if (l1 !== l2) return <div key={i}><div className="text-red-600">- {l1}</div><div className="text-green-600">+ {l2}</div></div>;
            return <div key={i} className="text-dark-500">{l1}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

function LoremTool() {
  const [paragraphs, setParagraphs] = useState(3);
  const [output, setOutput] = useState('');
  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'proident', 'sunt', 'culpa', 'officia', 'deserunt', 'mollit', 'anim', 'laborum'];
  const generate = () => {
    const result = [];
    for (let p = 0; p < paragraphs; p++) {
      const sentences = [];
      for (let s = 0; s < 3 + Math.floor(Math.random() * 4); s++) {
        const sentence = Array.from({ length: 8 + Math.floor(Math.random() * 12) }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
        sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.');
      }
      result.push(sentences.join(' '));
    }
    setOutput(result.join('\n\n'));
  };
  if (!output) generate();
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-dark-700 dark:text-dark-300">Paragraphs:</label>
        <input type="number" value={paragraphs} onChange={(e) => setParagraphs(Math.max(1, parseInt(e.target.value) || 1))} className="input w-20" min={1} max={20} />
        <button onClick={generate} className="btn btn-primary"><RefreshCw className="mr-1.5 h-4 w-4" />Generate</button>
      </div>
      <div className="relative">
        <textarea value={output} readOnly className="input resize-none bg-dark-50 dark:bg-dark-800" rows={12} />
        <div className="absolute right-2 top-2"><CopyButton text={output} /></div>
      </div>
    </div>
  );
}

function NatoTool() {
  const [input, setInput] = useState('');
  const nato: Record<string, string> = { a: 'Alpha', b: 'Bravo', c: 'Charlie', d: 'Delta', e: 'Echo', f: 'Foxtrot', g: 'Golf', h: 'Hotel', i: 'India', j: 'Juliet', k: 'Kilo', l: 'Lima', m: 'Mike', n: 'November', o: 'Oscar', p: 'Papa', q: 'Quebec', r: 'Romeo', s: 'Sierra', t: 'Tango', u: 'Uniform', v: 'Victor', w: 'Whiskey', x: 'X-ray', y: 'Yankee', z: 'Zulu' };
  const output = input.split('').map(c => c === ' ' ? '/' : nato[c.toLowerCase()] || c).join(' ');
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input Text</label>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input" placeholder="Hello World" />
      </div>
      <div>
        <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">NATO Phonetic</label><CopyButton text={output} /></div>
        <div className="rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3 text-sm font-medium text-dark-900 dark:text-dark-100">{output || '—'}</div>
      </div>
    </div>
  );
}

function RomanTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'to-roman' | 'from-roman'>('to-roman');
  const toRoman = (n: number) => { const v = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1], s = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'], r = []; for (let i = 0; i < v.length; i++) { while (n >= v[i]) { r.push(s[i]); n -= v[i]; } } return r.join(''); };
  const fromRoman = (s: string) => { const v: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }; let result = 0; for (let i = 0; i < s.length; i++) { const c = v[s[i]] || 0, n = v[s[i + 1]] || 0; result += c < n ? -c : c; } return result; };
  let output = '';
  if (mode === 'to-roman') { const n = parseInt(input); if (!isNaN(n) && n > 0 && n < 4000) output = toRoman(n); }
  else output = String(fromRoman(input.toUpperCase()));
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('to-roman')} className={`btn ${mode === 'to-roman' ? 'btn-primary' : 'btn-secondary'}`}>Number → Roman</button>
        <button onClick={() => setMode('from-roman')} className={`btn ${mode === 'from-roman' ? 'btn-primary' : 'btn-secondary'}`}>Roman → Number</button>
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} className="input font-mono" placeholder={mode === 'to-roman' ? 'Enter number (1-3999)' : 'Enter Roman numeral'} />
      <div className="rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3"><span className="text-sm text-dark-400">Result: </span><span className="text-lg font-bold font-mono text-dark-900 dark:text-dark-100">{output || '—'}</span></div>
    </div>
  );
}

function EmojiTool() {
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '🔥', '✨', '💯', '💪', '👍', '👎', '👏', '🙌', '🤝', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💕', '💖', '💗', '💘', '💝', '⭐', '🌟', '💫', '🌈', '☀️', '🌙', '⚡', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🎯', '🚀', '💻', '⌨️', '🖥️', '📱', '🔧', '⚙️', '🔒', '🔓', '📌', '📎', '✂️', '📝', '📋', '🗂️', '📁', '📂', '🔍', '🔎', '💡', '📚', '🎓', '🏠', '🏢', '🌍', '🌎', '🌏', '🗺️', '🧭', '⏰', '🕐', '📅', '📆', '🗓️', '⌚'];
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap gap-2">
        {emojis.map((emoji, i) => (
          <button key={i} onClick={() => { navigator.clipboard.writeText(emoji); toast.success(`Copied ${emoji}`); }} className="flex h-12 w-12 items-center justify-center rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-2xl hover:bg-dark-100 dark:hover:bg-dark-800 hover:scale-110 transition-all">{emoji}</button>
        ))}
      </div>
    </div>
  );
}

function BinaryTool() {
  const [input, setInput] = useState('');
  const toBinary = input.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
  const toText = input.split(' ').filter(b => b.length === 8).map(b => String.fromCharCode(parseInt(b, 2))).join('');
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Text → Binary</label>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input" placeholder="Hello" />
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3">
          <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100 break-all">{toBinary || '—'}</code>
          <CopyButton text={toBinary} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Binary → Text</label>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input font-mono" placeholder="01001000 01100101" />
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3">
          <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100">{toText || '—'}</code>
          <CopyButton text={toText} />
        </div>
      </div>
    </div>
  );
}

function HexTool() {
  const [input, setInput] = useState('');
  const toHex = input.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
  const toText = input.split(' ').filter(h => h.length === 2).map(h => String.fromCharCode(parseInt(h, 16))).join('');
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Text → Hex</label>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input" placeholder="Hello" />
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3">
          <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100 break-all">{toHex || '—'}</code>
          <CopyButton text={toHex} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Hex → Text</label>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input font-mono" placeholder="48 65 6c 6c 6f" />
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3">
          <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100">{toText || '—'}</code>
          <CopyButton text={toText} />
        </div>
      </div>
    </div>
  );
}

function UnicodeTool() {
  const [input, setInput] = useState('');
  const toUnicode = input.split('').map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
  const toText = input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Text → Unicode</label>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input" placeholder="Hello" />
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3">
          <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100 break-all">{toUnicode || '—'}</code>
          <CopyButton text={toUnicode} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Unicode → Text</label>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input font-mono" placeholder="\u0048\u0065\u006c\u006c\u006f" />
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3">
          <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100">{toText || '—'}</code>
          <CopyButton text={toText} />
        </div>
      </div>
    </div>
  );
}

function HtmlEntitiesTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const output = mode === 'encode'
    ? input.replace(/[\u00A0-\u9999<>&"'/]/g, i => '&#' + i.charCodeAt(0) + ';')
    : input.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('encode')} className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-secondary'}`}>Encode</button>
        <button onClick={() => setMode('decode')} className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-secondary'}`}>Decode</button>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="input font-mono resize-none" rows={4} placeholder="Enter text..." />
      </div>
      <div>
        <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Output</label><CopyButton text={output} /></div>
        <textarea value={output} readOnly className="input font-mono resize-none bg-dark-50 dark:bg-dark-800" rows={4} />
      </div>
    </div>
  );
}

function JsonYamlTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'json-yaml' | 'yaml-json'>('json-yaml');
  const [error, setError] = useState('');
  let output = '';
  try {
    if (!input.trim()) { output = ''; setError(''); }
    else if (mode === 'json-yaml') {
      const obj = JSON.parse(input);
      output = toYaml(obj, 0);
      setError('');
    } else {
      output = JSON.stringify(parseYaml(input), null, 2);
      setError('');
    }
  } catch (e: any) { output = ''; setError(e.message); }
  function toYaml(obj: any, indent: number): string {
    const pad = '  '.repeat(indent);
    if (Array.isArray(obj)) return obj.map(i => pad + '- ' + toYaml(i, indent + 1)).join('\n');
    if (typeof obj === 'object' && obj !== null) { const lines = []; for (const [k, v] of Object.entries(obj)) lines.push(pad + `${k}: ${toYaml(v, indent + 1)}`); return lines.join('\n'); }
    return String(obj);
  }
  function parseYaml(text: string): any { return JSON.parse(text); }
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('json-yaml')} className={`btn ${mode === 'json-yaml' ? 'btn-primary' : 'btn-secondary'}`}>JSON → YAML</button>
        <button onClick={() => setMode('yaml-json')} className={`btn ${mode === 'yaml-json' ? 'btn-primary' : 'btn-secondary'}`}>YAML → JSON</button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input</label>
          <textarea value={input} onChange={(e) => { setInput(e.target.value); setError(''); }} className="input font-mono text-sm resize-none" rows={16} placeholder={mode === 'json-yaml' ? '{"key": "value"}' : 'key: value'} />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Output</label><CopyButton text={output} /></div>
          {error && <div className="mb-2 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <textarea value={output} readOnly className="input font-mono text-sm resize-none bg-dark-50 dark:bg-dark-800" rows={16} />
        </div>
      </div>
    </div>
  );
}

function JsonXmlTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'json-xml' | 'xml-json'>('json-xml');
  const [error, setError] = useState('');
  let output = '';
  try {
    if (!input.trim()) { output = ''; setError(''); }
    else if (mode === 'json-xml') {
      const obj = JSON.parse(input);
      output = jsonToXml(obj);
      setError('');
    } else {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'text/xml');
      output = JSON.stringify(xmlToJson(doc), null, 2);
      setError('');
    }
  } catch (e: any) { output = ''; setError(e.message); }
  function jsonToXml(obj: any, root = 'root'): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>`;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'object' && v !== null) xml += `\n  ${jsonToXml(v, k)}`;
      else xml += `\n  <${k}>${v}</${k}>`;
    }
    return xml + `\n</${root}>`;
  }
  function xmlToJson(node: any): any {
    const obj: any = {};
    if (node.nodeType === 3) return node.nodeValue?.trim() || '';
    if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) return node.childNodes[0].nodeValue?.trim() || '';
    for (const child of node.childNodes) {
      if (child.nodeType === 1) {
        const val = xmlToJson(child);
        if (obj[child.tagName]) {
          if (!Array.isArray(obj[child.tagName])) obj[child.tagName] = [obj[child.tagName]];
          obj[child.tagName].push(val);
        } else obj[child.tagName] = val;
      }
    }
    return obj;
  }
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('json-xml')} className={`btn ${mode === 'json-xml' ? 'btn-primary' : 'btn-secondary'}`}>JSON → XML</button>
        <button onClick={() => setMode('xml-json')} className={`btn ${mode === 'xml-json' ? 'btn-primary' : 'btn-secondary'}`}>XML → JSON</button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input</label>
          <textarea value={input} onChange={(e) => { setInput(e.target.value); setError(''); }} className="input font-mono text-sm resize-none" rows={16} placeholder={mode === 'json-xml' ? '{"key": "value"}' : '<root><key>value</key></root>'} />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Output</label><CopyButton text={output} /></div>
          {error && <div className="mb-2 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <textarea value={output} readOnly className="input font-mono text-sm resize-none bg-dark-50 dark:bg-dark-800" rows={16} />
        </div>
      </div>
    </div>
  );
}

function JsonCsvTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'json-csv' | 'csv-json'>('json-csv');
  const [error, setError] = useState('');
  let output = '';
  try {
    if (!input.trim()) { output = ''; setError(''); }
    else if (mode === 'json-csv') {
      const arr = Array.isArray(JSON.parse(input)) ? JSON.parse(input) : [JSON.parse(input)];
      if (arr.length === 0) { output = ''; setError(''); return; }
      const headers = Object.keys(arr[0]);
      output = headers.join(',') + '\n' + arr.map((row: any) => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
      setError('');
    } else {
      const lines = input.trim().split('\n');
      const headers = lines[0].split(',');
      output = JSON.stringify(lines.slice(1).map(line => { const vals = line.split(','); const obj: any = {}; headers.forEach((h, i) => obj[h.trim()] = vals[i]?.trim?.()?.replace?.(/^"|"$/g, '') || ''); return obj; }), null, 2);
      setError('');
    }
  } catch (e: any) { output = ''; setError(e.message); }
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('json-csv')} className={`btn ${mode === 'json-csv' ? 'btn-primary' : 'btn-secondary'}`}>JSON → CSV</button>
        <button onClick={() => setMode('csv-json')} className={`btn ${mode === 'csv-json' ? 'btn-primary' : 'btn-secondary'}`}>CSV → JSON</button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input</label>
          <textarea value={input} onChange={(e) => { setInput(e.target.value); setError(''); }} className="input font-mono text-sm resize-none" rows={16} placeholder={mode === 'json-csv' ? '[{"name": "John", "age": 30}]' : 'name,age\nJohn,30'} />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Output</label><CopyButton text={output} /></div>
          {error && <div className="mb-2 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <textarea value={output} readOnly className="input font-mono text-sm resize-none bg-dark-50 dark:bg-dark-800" rows={16} />
        </div>
      </div>
    </div>
  );
}

function XmlFormatterTool() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  let output = '';
  try {
    if (!input.trim()) { output = ''; setError(''); }
    else {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'text/xml');
      if (doc.querySelector('parsererror')) throw new Error(doc.querySelector('parsererror')?.textContent || 'Parse error');
      output = new XMLSerializer().serializeToString(doc);
      setError('');
    }
  } catch (e: any) { output = ''; setError(e.message); }
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input</label>
          <textarea value={input} onChange={(e) => { setInput(e.target.value); setError(''); }} className="input font-mono text-sm resize-none" rows={20} placeholder='<root><key>value</key></root>' />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Formatted</label><CopyButton text={output} /></div>
          {error && <div className="mb-2 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <textarea value={output} readOnly className="input font-mono text-sm resize-none bg-dark-50 dark:bg-dark-800" rows={20} />
        </div>
      </div>
    </div>
  );
}

function SqlFormatterTool() {
  const [input, setInput] = useState('');
  let output = '';
  try {
    if (input.trim()) {
      output = input
        .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INTO|VALUES|SET|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES)\b/gi, '\n$1')
        .replace(/,\s*/g, ',\n  ')
        .trim();
    }
  } catch { output = ''; }
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="input font-mono text-sm resize-none" rows={20} placeholder="SELECT * FROM users WHERE id = 1" />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Formatted</label><CopyButton text={output} /></div>
          <textarea value={output} readOnly className="input font-mono text-sm resize-none bg-dark-50 dark:bg-dark-800" rows={20} />
        </div>
      </div>
    </div>
  );
}

function MarkdownTool() {
  const [input, setInput] = useState('');
  let html = '';
  try {
    html = input
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/`(.*)`/g, '<code class="px-1.5 py-0.5 rounded bg-dark-100 dark:bg-dark-800">$1</code>')
      .replace(/\n/g, '<br/>');
  } catch { html = ''; }
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Markdown</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="input font-mono text-sm resize-none" rows={20} placeholder="# Hello World" />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">HTML Output</label><CopyButton text={html} /></div>
          <div className="rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 p-4 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}

function IpConverterTool() {
  const [input, setInput] = useState('192.168.1.1');
  const [error, setError] = useState('');
  let long = '';
  try {
    const parts = input.split('.');
    if (parts.length !== 4 || parts.some(p => isNaN(parseInt(p)) || parseInt(p) < 0 || parseInt(p) > 255)) throw new Error('Invalid IP');
    long = parts.reduce((acc, p, i) => acc + (parseInt(p) * Math.pow(256, 3 - i)).toString(), '0').replace(/^0+/, '') || '0';
    setError('');
  } catch { setError('Invalid IP address'); }
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">IP Address</label>
        <input value={input} onChange={(e) => { setInput(e.target.value); setError(''); }} className="input font-mono" placeholder="192.168.1.1" />
      </div>
      {error && <div className="rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
      {long && (
        <div className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-2.5">
          <span className="shrink-0 text-xs font-semibold text-dark-500 w-24">Long Format</span>
          <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100">{long}</code>
          <CopyButton text={long} />
        </div>
      )}
    </div>
  );
}

function UserAgentTool() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<any>(null);
  const parse = () => {
    if (!input.trim()) { setParsed(null); return; }
    const ua = input;
    const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident)\/?([\d.]+)/i);
    const osMatch = ua.match(/(Windows|Mac OS X|Linux|Android|iOS)\s*[^;)]*/i);
    const deviceMatch = ua.match(/(Mobile|Tablet|Phone)/i);
    setParsed({ browser: browserMatch ? `${browserMatch[1]} ${browserMatch[2]}` : 'Unknown', os: osMatch ? osMatch[1] : 'Unknown', device: deviceMatch ? deviceMatch[1] : 'Desktop' });
  };
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">User Agent String</label>
        <textarea value={input} onChange={(e) => { setInput(e.target.value); parse(); }} className="input font-mono text-sm resize-none" rows={4} placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64)..." />
      </div>
      {parsed && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 p-4 text-center">
              <p className="text-lg font-semibold text-dark-900 dark:text-dark-100">{String(value)}</p>
              <p className="mt-1 text-xs text-dark-400 capitalize">{key}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UrlParserTool() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<any>(null);
  const parse = () => {
    try {
      if (!input.trim()) { setParsed(null); return; }
      const url = new URL(input);
      setParsed({ protocol: url.protocol, hostname: url.hostname, port: url.port || '(default)', pathname: url.pathname, search: url.search || '(none)', hash: url.hash || '(none)', origin: url.origin });
    } catch { setParsed(null); }
  };
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">URL</label>
        <input value={input} onChange={(e) => { setInput(e.target.value); parse(); }} className="input font-mono" placeholder="https://example.com:8080/path?key=value#hash" />
      </div>
      {parsed && (
        <div className="space-y-2">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-2.5">
              <span className="shrink-0 text-xs font-semibold text-dark-500 w-20 capitalize">{key}</span>
              <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100">{String(value)}</code>
              <CopyButton text={String(value)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BcryptTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const hash = () => {
    if (!input) { setOutput(''); return; }
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    crypto.subtle.digest('SHA-256', data).then(hash => {
      setOutput(Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));
    });
  };
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input flex-1" placeholder="Enter text to hash..." />
        <button onClick={hash} className="btn btn-primary">Hash (SHA-256)</button>
      </div>
      {output && (
        <div className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3">
          <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100 break-all">{output}</code>
          <CopyButton text={output} />
        </div>
      )}
      <p className="text-xs text-dark-400">Note: Client-side SHA-256. For real bcrypt, use server-side.</p>
    </div>
  );
}

function BasicAuthTool() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const header = user && pass ? `Basic ${btoa(`${user}:${pass}`)}` : '';
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Username</label>
          <input value={user} onChange={(e) => setUser(e.target.value)} className="input" placeholder="username" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Password</label>
          <input value={pass} onChange={(e) => setPass(e.target.value)} className="input" placeholder="password" type="password" />
        </div>
      </div>
      {header && (
        <div className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3">
          <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100 break-all">{header}</code>
          <CopyButton text={header} />
        </div>
      )}
    </div>
  );
}

function PasswordStrengthTool() {
  const [input, setInput] = useState('');
  const check = (input: string) => {
    let score = 0;
    if (input.length >= 8) score++;
    if (input.length >= 12) score++;
    if (input.length >= 16) score++;
    if (/[a-z]/.test(input) && /[A-Z]/.test(input)) score++;
    if (/\d/.test(input)) score++;
    if (/[^a-zA-Z0-9]/.test(input)) score++;
    return Math.min(score, 5);
  };
  const score = input ? check(input) : 0;
  const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500'];
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Password</label>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input" placeholder="Enter password to analyze..." type="password" />
      </div>
      {input && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-dark-700 dark:text-dark-300">{levels[score]}</span>
            <span className="text-sm text-dark-400">{score}/5</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i < score ? colors[score - 1] : 'bg-dark-200 dark:bg-dark-700'}`} />
            ))}
          </div>
          <div className="space-y-1">
            {[['Min 8 chars', input.length >= 8], ['Min 12 chars', input.length >= 12], ['Min 16 chars', input.length >= 16], ['Upper + lower', /[a-z]/.test(input) && /[A-Z]/.test(input)], ['Numbers', /\d/.test(input)], ['Special chars', /[^a-zA-Z0-9]/.test(input)]].map(([label, met]) => (
              <div key={label as string} className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${met ? 'bg-green-500' : 'bg-dark-300 dark:bg-dark-600'}`} />
                <span className={met ? 'text-green-600 dark:text-green-400' : 'text-dark-400'}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChmodTool() {
  const [input, setInput] = useState('755');
  const parse = () => {
    const digits = input.split('').map(Number);
    if (digits.length !== 3 || digits.some(d => d < 0 || d > 7)) return null;
    const perm = (n: number) => [!!(n & 4), !!(n & 2), !!(n & 1)].map((r, i) => r ? ['R', 'W', 'X'][i] : ['-','-','-'][i]).join('');
    return { user: perm(digits[0]), group: perm(digits[1]), other: perm(digits[2]) };
  };
  const result = parse();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Octal Permission</label>
        <input value={input} onChange={(e) => setInput(e.target.value.replace(/\D/g, '').slice(0, 3))} className="input font-mono w-32" placeholder="755" />
      </div>
      {result && (
        <div className="space-y-2">
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-2.5">
              <span className="shrink-0 text-xs font-semibold text-dark-500 w-16 capitalize">{key}</span>
              <code className="text-sm font-mono text-dark-900 dark:text-dark-100">{value}</code>
            </div>
          ))}
          <div className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-2.5">
            <code className="text-sm font-mono text-dark-900 dark:text-dark-100">
              {['Owner', 'Group', 'Other'].map((_, i) => {
                const d = input[i];
                return [!!(parseInt(d) & 4), !!(parseInt(d) & 2), !!(parseInt(d) & 1)].map((r, j) => r ? ['r','w','x'][j] : '-').join('');
              }).join(' ')}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

function GitTool() {
  const commands = [
    { category: 'Setup', cmds: [['git init', 'Initialize repo'], ['git clone <url>', 'Clone repo'], ['git config --global user.name "Name"', 'Set username']] },
    { category: 'Basic', cmds: [['git add .', 'Stage all changes'], ['git commit -m "msg"', 'Commit changes'], ['git push', 'Push to remote'], ['git pull', 'Pull from remote'], ['git status', 'Check status'], ['git log --oneline', 'View history']] },
    { category: 'Branching', cmds: [['git branch', 'List branches'], ['git branch <name>', 'Create branch'], ['git checkout <name>', 'Switch branch'], ['git merge <name>', 'Merge branch'], ['git checkout -b <name>', 'Create & switch']] },
    { category: 'Undo', cmds: [['git reset --soft HEAD~1', 'Undo last commit'], ['git reset --hard HEAD~1', 'Discard last commit'], ['git checkout -- <file>', 'Discard file changes'], ['git stash', 'Stash changes']] },
  ];
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {commands.map(section => (
        <div key={section.category}>
          <h3 className="mb-2 text-sm font-semibold text-dark-700 dark:text-dark-300">{section.category}</h3>
          <div className="space-y-1">
            {section.cmds.map(([cmd, desc]) => (
              <div key={cmd} className="flex items-center gap-3 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-2">
                <code className="text-sm font-mono text-brand-600 dark:text-brand-400">{cmd}</code>
                <span className="text-sm text-dark-400">{desc}</span>
                <CopyButton text={cmd} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EtaTool() {
  const [items, setItems] = useState(100);
  const [rate, setRate] = useState(10);
  const [unit, setUnit] = useState('minutes');
  const total = rate > 0 ? (items / rate) : 0;
  const formatted = total < 60 ? `${total.toFixed(1)} ${unit}` : `${(total / 60).toFixed(1)} hours`;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Total Items</label>
          <input type="number" value={items} onChange={(e) => setItems(parseInt(e.target.value) || 0)} className="input" min={0} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Rate ({unit})</label>
          <input type="number" value={rate} onChange={(e) => setRate(parseInt(e.target.value) || 0)} className="input" min={0} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Unit</label>
        <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input">
          <option value="minutes">Minutes</option><option value="seconds">Seconds</option><option value="hours">Hours</option>
        </select>
      </div>
      <div className="rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3 text-center">
        <p className="text-sm text-dark-400">Estimated Time</p>
        <p className="text-3xl font-bold font-mono text-dark-900 dark:text-dark-100 mt-1">{formatted}</p>
      </div>
    </div>
  );
}

function TemperatureTool() {
  const [celsius, setCelsius] = useState('20');
  const c = parseFloat(celsius) || 0;
  const f = (c * 9 / 5) + 32;
  const k = c + 273.15;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Celsius (°C)</label>
        <input type="number" value={celsius} onChange={(e) => setCelsius(e.target.value)} className="input font-mono" />
      </div>
      <div className="space-y-2">
        {[['Fahrenheit (°F)', f.toFixed(2)], ['Kelvin (K)', k.toFixed(2)]].map(([label, value]) => (
          <div key={label} className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-2.5">
            <span className="shrink-0 text-xs font-semibold text-dark-500 w-36">{label}</span>
            <code className="text-sm font-mono text-dark-900 dark:text-dark-100">{value}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

function ObfuscateTool() {
  const [input, setInput] = useState('');
  const obfuscated = input.split('').map(c => c === ' ' ? ' ' : c + String.fromCharCode(0x200C) + String.fromCharCode(0x200D)).join('');
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input Text</label>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input" placeholder="Sensitive text" />
      </div>
      <div>
        <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Obfuscated</label><CopyButton text={obfuscated} /></div>
        <div className="rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3 text-sm text-dark-900 dark:text-dark-100">{obfuscated || '—'}</div>
      </div>
    </div>
  );
}

function ListTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'numbers' | 'bullets' | 'alpha' | 'comma' | 'newlines'>('numbers');
  const lines = input.trim() ? input.trim().split('\n').filter(l => l.trim()) : [];
  const output = lines.map((line, i) => {
    if (mode === 'numbers') return `${i + 1}. ${line.trim()}`;
    if (mode === 'bullets') return `• ${line.trim()}`;
    if (mode === 'alpha') return `${String.fromCharCode(65 + i)}. ${line.trim()}`;
    if (mode === 'comma') return line.trim();
    return line.trim();
  }).join(mode === 'comma' ? ', ' : '\n');
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex gap-2">
        {['numbers', 'bullets', 'alpha', 'comma', 'newlines'].map(m => (
          <button key={m} onClick={() => setMode(m as any)} className={`btn text-xs ${mode === m ? 'btn-primary' : 'btn-secondary'}`}>{m}</button>
        ))}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input (one item per line)</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="input resize-none" rows={8} placeholder="Item 1\nItem 2\nItem 3" />
      </div>
      <div>
        <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Output</label><CopyButton text={output} /></div>
        <textarea value={output} readOnly className="input resize-none bg-dark-50 dark:bg-dark-800" rows={8} />
      </div>
    </div>
  );
}

function QrTool() {
  const [input, setInput] = useState('');
  const qrUrl = input ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(input)}` : '';
  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Text or URL</label>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input" placeholder="https://example.com" />
      </div>
      {qrUrl && (
        <div className="flex justify-center">
          <img src={qrUrl} alt="QR Code" className="rounded-xl border border-dark-200 dark:border-dark-700 p-4" />
        </div>
      )}
    </div>
  );
}

function HmacTool() {
  const [input, setInput] = useState('');
  const [key, setKey] = useState('');
  const [algo, setAlgo] = useState('SHA-256');
  const [output, setOutput] = useState('');
  const generate = async () => {
    if (!input || !key) { setOutput(''); return; }
    const enc = new TextEncoder();
    const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: algo }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', k, enc.encode(input));
    setOutput(Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''));
  };
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Message</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="input resize-none" rows={3} placeholder="Message to sign" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Secret Key</label>
          <input value={key} onChange={(e) => setKey(e.target.value)} className="input" placeholder="Secret" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Algorithm</label>
          <select value={algo} onChange={(e) => setAlgo(e.target.value)} className="input">
            <option value="SHA-1">SHA-1</option><option value="SHA-256">SHA-256</option><option value="SHA-384">SHA-384</option><option value="SHA-512">SHA-512</option>
          </select>
        </div>
      </div>
      <button onClick={generate} className="btn btn-primary">Generate HMAC</button>
      {output && (
        <div className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3">
          <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100 break-all">{output}</code>
          <CopyButton text={output} />
        </div>
      )}
    </div>
  );
}

function EncryptionTool() {
  const [input, setInput] = useState('');
  const [key, setKey] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const process = async () => {
    if (!input || !key) { setOutput(''); return; }
    try {
      const enc = new TextEncoder();
      const km = await crypto.subtle.importKey('raw', enc.encode(key), 'PBKDF2', false, ['deriveKey']);
      const k = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('salt'), iterations: 100000, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, mode === 'encrypt' ? ['encrypt'] : ['decrypt']);
      if (mode === 'encrypt') {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, enc.encode(input));
        setOutput(Array.from(new Uint8Array(iv)).concat(Array.from(new Uint8Array(buf))).map(b => b.toString(16).padStart(2, '0')).join(''));
      } else {
        const hex = input.replace(/\s/g, '');
        const bytes = Array.from({ length: hex.length / 2 }, (_, i) => parseInt(hex.substr(i * 2, 2), 16));
        const iv = bytes.slice(0, 12);
        const data = bytes.slice(12);
        const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, k, new Uint8Array(data));
        setOutput(new TextDecoder().decode(buf));
      }
    } catch { setOutput('Error processing'); }
  };
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('encrypt')} className={`btn ${mode === 'encrypt' ? 'btn-primary' : 'btn-secondary'}`}>Encrypt</button>
        <button onClick={() => setMode('decrypt')} className={`btn ${mode === 'decrypt' ? 'btn-primary' : 'btn-secondary'}`}>Decrypt</button>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Text</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="input resize-none" rows={4} placeholder={mode === 'encrypt' ? 'Text to encrypt' : 'Hex string to decrypt'} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Password</label>
        <input value={key} onChange={(e) => setKey(e.target.value)} className="input" placeholder="Encryption password" />
      </div>
      <button onClick={process} className="btn btn-primary">{mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}</button>
      {output && (
        <div className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3">
          <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100 break-all">{output}</code>
          <CopyButton text={output} />
        </div>
      )}
    </div>
  );
}

function MacTool() {
  const [macs, setMacs] = useState<string[]>([generateMac()]);
  const [count, setCount] = useState(1);
  function generateMac() {
    const bytes = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256));
    bytes[0] |= 0x02;
    return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');
  }
  const generate = () => setMacs(Array.from({ length: count }, () => generateMac()));
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-dark-700 dark:text-dark-300">Count:</label>
        <input type="number" value={count} onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))} className="input w-20" min={1} max={20} />
        <button onClick={generate} className="btn btn-primary"><RefreshCw className="mr-1.5 h-4 w-4" />Generate</button>
      </div>
      <div className="space-y-2">
        {macs.map((mac, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-2.5">
            <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100">{mac}</code>
            <CopyButton text={mac} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SubnetTool() {
  const [ip, setIp] = useState('192.168.1.0');
  const [cidr, setCidr] = useState('24');
  const [error, setError] = useState('');
  let info: any = null;
  try {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) throw new Error('Invalid IP');
    const c = parseInt(cidr);
    if (isNaN(c) || c < 0 || c > 32) throw new Error('Invalid CIDR');
    const ipNum = (parts[0] << 24 | parts[1] << 16 | parts[2] << 8 | parts[3]) >>> 0;
    const mask = c === 0 ? 0 : (-1 << (32 - c)) >>> 0;
    const network = (ipNum & mask) >>> 0;
    const broadcast = (network | ~mask) >>> 0;
    const hosts = Math.pow(2, 32 - c) - 2;
    const toIp = (n: number) => [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255].join('.');
    info = { network: toIp(network), broadcast: toIp(broadcast), mask: toIp(mask), hosts: Math.max(0, hosts), first: toIp(network + 1), last: toIp(broadcast - 1) };
    setError('');
  } catch (e: any) { setError(e.message); }
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex gap-2">
        <input value={ip} onChange={(e) => { setIp(e.target.value); setError(''); }} className="input font-mono flex-1" placeholder="192.168.1.0" />
        <div className="flex items-center gap-1"><span className="text-dark-400">/</span><input type="number" value={cidr} onChange={(e) => setCidr(e.target.value)} className="input w-16 text-center" min={0} max={32} /></div>
      </div>
      {error && <div className="rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
      {info && (
        <div className="space-y-2">
          {Object.entries(info).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 py-2.5">
              <span className="shrink-0 text-xs font-semibold text-dark-500 w-20 capitalize">{key}</span>
              <code className="text-sm font-mono text-dark-900 dark:text-dark-100">{String(value)}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DockerTool() {
  const [image, setImage] = useState('nginx:latest');
  const [ports, setPorts] = useState('8080:80');
  const [volumes, setVolumes] = useState('/data:/app/data');
  const [envs, setEnvs] = useState('NODE_ENV=production');
  const [name, setName] = useState('my-container');
  const [restart, setRestart] = useState('unless-stopped');
  const compose = `version: '3.8'
services:
  ${name}:
    image: ${image}
    container_name: ${name}
    restart: ${restart}
${ports ? `    ports:
${ports.split(',').map(p => `      - "${p.trim()}"`).join('\n')}
` : ''}${volumes ? `    volumes:
${volumes.split(',').map(v => `      - ${v.trim()}
`).join('')}` : ''}${envs ? `    environment:
${envs.split(',').map(e => `      - ${e.trim()}
`).join('')}` : ''}`;
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Image</label><input value={image} onChange={(e) => setImage(e.target.value)} className="input font-mono" placeholder="nginx:latest" /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Container Name</label><input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="my-container" /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Ports (comma-sep)</label><input value={ports} onChange={(e) => setPorts(e.target.value)} className="input font-mono" placeholder="8080:80" /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Volumes (comma-sep)</label><input value={volumes} onChange={(e) => setVolumes(e.target.value)} className="input font-mono" placeholder="/data:/app/data" /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Env Vars (comma-sep)</label><input value={envs} onChange={(e) => setEnvs(e.target.value)} className="input font-mono" placeholder="NODE_ENV=production" /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Restart Policy</label><select value={restart} onChange={(e) => setRestart(e.target.value)} className="input"><option value="no">no</option><option value="always">always</option><option value="unless-stopped">unless-stopped</option><option value="on-failure">on-failure</option></select></div>
      </div>
      <div><div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">docker-compose.yml</label><CopyButton text={compose} /></div><pre className="rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 p-4 text-sm font-mono text-dark-900 dark:text-dark-100 overflow-x-auto whitespace-pre-wrap">{compose}</pre></div>
    </div>
  );
}

function RsaTool() {
  const [bits, setBits] = useState(2048);
  const [keyPair, setKeyPair] = useState<{ pub: string; priv: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    try {
      setError('');
      setLoading(true);
      const kp = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: bits, publicExponent: new Uint8Array([0x01, 0x00, 0x01]), hash: 'SHA-256' }, true, ['sign', 'verify']);
      const pubBuf = await crypto.subtle.exportKey('spki', kp.publicKey);
      const privBuf = await crypto.subtle.exportKey('pkcs8', kp.privateKey);
      setKeyPair({ pub: btoa(String.fromCharCode(...new Uint8Array(pubBuf))), priv: btoa(String.fromCharCode(...new Uint8Array(privBuf))) });
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-dark-700 dark:text-dark-300">Key Size:</label>
        <select value={bits} onChange={(e) => setBits(parseInt(e.target.value))} className="input w-32">
          <option value={1024}>1024 bits</option><option value={2048}>2048 bits</option><option value={4096}>4096 bits</option>
        </select>
        <button onClick={generate} disabled={loading} className="btn btn-primary"><RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Generate</button>
      </div>
      {error && <div className="rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}
      {keyPair && (
        <div className="space-y-3">
          <div><label className="mb-1.5 block text-sm font-semibold text-dark-700 dark:text-dark-300">Public Key (Base64)</label><div className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-3 py-2"><code className="flex-1 text-xs font-mono text-dark-900 dark:text-dark-100 break-all">{keyPair.pub}</code><CopyButton text={keyPair.pub} /></div></div>
          <div><label className="mb-1.5 block text-sm font-semibold text-dark-700 dark:text-dark-300">Private Key (Base64)</label><div className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-3 py-2"><code className="flex-1 text-xs font-mono text-dark-900 dark:text-dark-100 break-all">{keyPair.priv}</code><CopyButton text={keyPair.priv} /></div></div>
        </div>
      )}
    </div>
  );
}

function TomlTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'toml-json' | 'json-toml'>('toml-json');
  const [error, setError] = useState('');
  const output = useMemo(() => {
    try {
      if (!input.trim()) return { output: '', error: '' };
      if (mode === 'toml-json') {
        const obj: any = {};
        let currentSection = '';
        for (const line of input.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
          if (sectionMatch) { currentSection = sectionMatch[1]; continue; }
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx === -1) continue;
          const key = (currentSection ? currentSection + '.' : '') + trimmed.substring(0, eqIdx).trim();
          let val: any = trimmed.substring(eqIdx + 1).trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          else if (val === 'true') val = true;
          else if (val === 'false') val = false;
          else if (!isNaN(Number(val))) val = Number(val);
          const parts = key.split('.');
          let target = obj;
          for (let i = 0; i < parts.length - 1; i++) { if (!target[parts[i]]) target[parts[i]] = {}; target = target[parts[i]]; }
          target[parts[parts.length - 1]] = val;
        }
        return { output: JSON.stringify(obj, null, 2), error: '' };
      } else {
        const obj = JSON.parse(input);
        return { output: jsonToTomlFn(obj), error: '' };
      }
    } catch (e: any) { return { output: '', error: e.message }; }
  }, [input, mode]);
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('toml-json')} className={`btn ${mode === 'toml-json' ? 'btn-primary' : 'btn-secondary'}`}>TOML → JSON</button>
        <button onClick={() => setMode('json-toml')} className={`btn ${mode === 'json-toml' ? 'btn-primary' : 'btn-secondary'}`}>JSON → TOML</button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Input ({mode === 'toml-json' ? 'TOML' : 'JSON'})</label>
          <textarea value={input} onChange={(e) => { setInput(e.target.value); setError(''); }} className="input font-mono text-sm resize-none" rows={16} placeholder={mode === 'toml-json' ? '[server]\nhost = "localhost"\nport = 8080' : '{\n  "server": {\n    "host": "localhost"\n  }\n}'} />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Output ({mode === 'toml-json' ? 'JSON' : 'TOML'})</label><CopyButton text={output.output} /></div>
          {output.error && <div className="mb-2 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{output.error}</div>}
          <textarea value={output.output} readOnly className="input font-mono text-sm resize-none bg-dark-50 dark:bg-dark-800" rows={16} />
        </div>
      </div>
    </div>
  );
}
function jsonToTomlFn(obj: any, prefix = ''): string {
  let result = '';
  const primitives: string[] = [];
  const objects: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null) objects.push(k);
    else {
      if (typeof v === 'string') primitives.push(`${k} = "${v}"`);
      else if (typeof v === 'boolean') primitives.push(`${k} = ${v ? 'true' : 'false'}`);
      else primitives.push(`${k} = ${v}`);
    }
  }
  if (primitives.length) result += primitives.join('\n') + '\n';
  for (const k of objects) {
    result += `\n[${prefix}${k}]\n` + jsonToTomlFn(obj[k], prefix + k + '.');
  }
  return result;
}

function YamlTool() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const output = useMemo(() => {
    try {
      if (!input.trim()) return { output: '', error: '' };
      const obj = simpleYamlParseFn(input);
      return { output: JSON.stringify(obj, null, 2), error: '' };
    } catch (e: any) { return { output: '', error: e.message }; }
  }, [input]);
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">YAML Input</label>
          <textarea value={input} onChange={(e) => { setInput(e.target.value); setError(''); }} className="input font-mono text-sm resize-none" rows={20} placeholder="server:\n  host: localhost\n  port: 8080\n\nname: my-app" />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">JSON Output</label><CopyButton text={output.output} /></div>
          {output.error && <div className="mb-2 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{output.error}</div>}
          <textarea value={output.output} readOnly className="input font-mono text-sm resize-none bg-dark-50 dark:bg-dark-800" rows={20} />
        </div>
      </div>
    </div>
  );
}
function simpleYamlParseFn(yaml: string): any {
  const result: any = {};
  let indentLevel = 0;
  const stack: { obj: any; indent: number }[] = [];
  for (const rawLine of yaml.split('\n')) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const indent = rawLine.search(/\S/);
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.substring(0, colonIdx).trim();
    const val = trimmed.substring(colonIdx + 1).trim();
    if (indent <= indentLevel && stack.length > 0) {
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop();
    }
    if (val === '') {
      const newObj: any = {};
      indentLevel = indent;
      if (stack.length > 0) {
        stack[stack.length - 1].obj[key] = newObj;
      } else {
        result[key] = newObj;
      }
      stack.push({ obj: newObj, indent });
    } else {
      let parsedVal: any = val;
      if (val.startsWith('"') && val.endsWith('"')) parsedVal = val.slice(1, -1);
      else if (val === 'true') parsedVal = true;
      else if (val === 'false') parsedVal = false;
      else if (val === 'null') parsedVal = null;
      else if (!isNaN(Number(parsedVal))) parsedVal = Number(parsedVal);
      if (stack.length > 0) {
        stack[stack.length - 1].obj[key] = parsedVal;
      } else {
        result[key] = parsedVal;
      }
    }
  }
  return result;
}
