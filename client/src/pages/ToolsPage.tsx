import { useState } from 'react';
import { Search, Code2, Hash, Key, Link2, Eye, Zap, Palette, Globe, Terminal, Database, Lock, FileText, Calculator, Copy as CopyIcon, X } from 'lucide-react';
import { toolComponents } from './ToolViewPage';

const toolCategories = [
  {
    id: 'encoding',
    name: 'Encoding / Decoding',
    icon: Hash,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    tools: [
      { id: 'base64', name: 'Base64 Encode/Decode', description: 'Encode and decode Base64 strings' },
      { id: 'url-encode', name: 'URL Encode/Decode', description: 'Encode and decode URLs' },
      { id: 'html-entities', name: 'HTML Entities', description: 'Encode/decode HTML entities' },
      { id: 'binary', name: 'Binary Converter', description: 'Convert text to binary and back' },
      { id: 'hex', name: 'Hex Converter', description: 'Convert text to hex and back' },
      { id: 'unicode', name: 'Unicode Converter', description: 'Convert text to unicode escape sequences' },
    ],
  },
  {
    id: 'conversion',
    name: 'Conversion',
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    tools: [
      { id: 'case', name: 'Case Converter', description: 'Convert text between different cases' },
      { id: 'json-yaml', name: 'JSON / YAML', description: 'Convert between JSON and YAML' },
      { id: 'json-xml', name: 'JSON / XML', description: 'Convert between JSON and XML' },
      { id: 'json-csv', name: 'JSON / CSV', description: 'Convert between JSON and CSV' },
      { id: 'number-base', name: 'Number Base Converter', description: 'Convert between binary, octal, decimal, hex' },
      { id: 'color', name: 'Color Converter', description: 'Convert between color formats' },
      { id: 'date', name: 'Date/Time Converter', description: 'Convert between date formats and timezones' },
      { id: 'temperature', name: 'Temperature Converter', description: 'Convert between temperature units' },
    ],
  },
  {
    id: 'generators',
    name: 'Generators',
    icon: Key,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    tools: [
      { id: 'uuid', name: 'UUID Generator', description: 'Generate UUIDs (v4)' },
      { id: 'password', name: 'Password Generator', description: 'Generate secure passwords' },
      { id: 'lorem', name: 'Lorem Ipsum', description: 'Generate placeholder text' },
      { id: 'hash', name: 'Hash Generator', description: 'Generate MD5, SHA hashes' },
      { id: 'jwt', name: 'JWT Parser', description: 'Parse and decode JWT tokens' },
      { id: 'qr', name: 'QR Code Generator', description: 'Generate QR codes from text or URLs' },
      { id: 'slug', name: 'Slug Generator', description: 'Generate URL-friendly slugs' },
      { id: 'token', name: 'Token Generator', description: 'Generate random tokens' },
    ],
  },
  {
    id: 'formatters',
    name: 'Formatters & Parsers',
    icon: FileText,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    tools: [
      { id: 'json', name: 'JSON Formatter', description: 'Format and validate JSON' },
      { id: 'xml', name: 'XML Formatter', description: 'Format and validate XML' },
      { id: 'sql', name: 'SQL Formatter', description: 'Format and beautify SQL queries' },
      { id: 'yaml', name: 'YAML Viewer', description: 'View and format YAML' },
      { id: 'toml', name: 'TOML Converter', description: 'Convert between TOML and JSON' },
      { id: 'markdown', name: 'Markdown to HTML', description: 'Convert Markdown to HTML' },
      { id: 'regex', name: 'Regex Tester', description: 'Test regular expressions' },
      { id: 'diff', name: 'Text Diff', description: 'Compare two texts and show differences' },
    ],
  },
  {
    id: 'network',
    name: 'Network & IP',
    icon: Globe,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    tools: [
      { id: 'ip-converter', name: 'IP Address Converter', description: 'Convert IP addresses to numbers' },
      { id: 'subnet', name: 'Subnet Calculator', description: 'Calculate IPv4 subnets' },
      { id: 'http-status', name: 'HTTP Status Codes', description: 'Reference for HTTP status codes' },
      { id: 'user-agent', name: 'User Agent Parser', description: 'Parse and analyze user agent strings' },
      { id: 'url-parser', name: 'URL Parser', description: 'Parse and analyze URLs' },
      { id: 'mac', name: 'MAC Address Generator', description: 'Generate random MAC addresses' },
    ],
  },
  {
    id: 'security',
    name: 'Security & Crypto',
    icon: Lock,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    tools: [
      { id: 'bcrypt', name: 'Bcrypt Hash', description: 'Hash passwords with bcrypt' },
      { id: 'hmac', name: 'HMAC Generator', description: 'Generate HMAC signatures' },
      { id: 'basic-auth', name: 'Basic Auth Generator', description: 'Generate Basic Auth headers' },
      { id: 'rsa', name: 'RSA Key Generator', description: 'Generate RSA key pairs' },
      { id: 'password-strength', name: 'Password Strength', description: 'Analyze password strength' },
      { id: 'encryption', name: 'Text Encryption', description: 'Encrypt/decrypt text (AES, DES, etc.)' },
    ],
  },
  {
    id: 'dev',
    name: 'Developer Utilities',
    icon: Terminal,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    tools: [
      { id: 'crontab', name: 'Crontab Generator', description: 'Generate cron expressions' },
      { id: 'chmod', name: 'Chmod Calculator', description: 'Calculate file permissions' },
      { id: 'docker', name: 'Docker to Compose', description: 'Convert docker run to docker-compose' },
      { id: 'git', name: 'Git Cheat Sheet', description: 'Common git commands reference' },
      { id: 'eta', name: 'ETA Calculator', description: 'Calculate estimated time of arrival' },
      { id: 'percentage', name: 'Percentage Calculator', description: 'Calculate percentages' },
      { id: 'math', name: 'Math Evaluator', description: 'Evaluate mathematical expressions' },
    ],
  },
  {
    id: 'text',
    name: 'Text Utilities',
    icon: CopyIcon,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    tools: [
      { id: 'text-stats', name: 'Text Statistics', description: 'Analyze text: words, chars, lines' },
      { id: 'nato', name: 'NATO Alphabet', description: 'Convert text to NATO phonetic alphabet' },
      { id: 'obfuscate', name: 'Text Obfuscator', description: 'Obfuscate text with special characters' },
      { id: 'list', name: 'List Converter', description: 'Convert lists between formats' },
      { id: 'roman', name: 'Roman Numerals', description: 'Convert to/from Roman numerals' },
      { id: 'emoji', name: 'Emoji Picker', description: 'Browse and copy emojis' },
    ],
  },
];

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [activeTool, setActiveTool] = useState<{ id: string; name: string } | null>(null);

  const filteredCategories = toolCategories.map((cat) => ({
    ...cat,
    tools: cat.tools.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.tools.length > 0);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
          <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Developer Tools</h1>
          <p className="text-xs text-dark-400">
            {toolCategories.reduce((acc, cat) => acc + cat.tools.length, 0)} tools available
          </p>
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 pl-9 pr-3 py-2 text-sm text-dark-900 dark:text-dark-100 placeholder-dark-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-8">
          {filteredCategories.map((category) => (
            <div key={category.id}>
              <div className="mb-4 flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${category.bgColor}`}>
                  <category.icon className={`h-4 w-4 ${category.color}`} />
                </div>
                <h2 className="text-sm font-semibold text-dark-900 dark:text-dark-100">
                  {category.name}
                </h2>
                <span className="badge badge-brand">{category.tools.length}</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool({ id: tool.id, name: tool.name })}
                    className="group text-left rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 p-4 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all"
                  >
                    <h3 className="text-sm font-medium text-dark-900 dark:text-dark-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-xs text-dark-400 line-clamp-2">{tool.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Search className="mb-4 h-10 w-10 text-dark-300 dark:text-dark-600" />
              <h3 className="text-lg font-medium text-dark-900 dark:text-dark-100">No tools found</h3>
              <p className="mt-1 text-sm text-dark-400">Try a different search term</p>
            </div>
          )}
        </div>
      </div>

      {/* Tool Modal */}
      {activeTool && (
        <ToolModal toolId={activeTool.id} toolName={activeTool.name} onClose={() => setActiveTool(null)} />
      )}
    </div>
  );
}

function ToolModal({ toolId, toolName, onClose }: { toolId: string; toolName: string; onClose: () => void }) {
  const ToolComponent = toolComponents[toolId]?.component;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 shadow-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 px-6 py-4 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
            <Zap className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </div>
          <h2 className="text-base font-semibold text-dark-900 dark:text-dark-100">{toolName}</h2>
          <div className="flex-1" />
          <button onClick={onClose} className="rounded-lg p-1.5 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {ToolComponent ? <ToolComponent /> : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Zap className="mb-3 h-10 w-10 text-dark-300 dark:text-dark-600" />
              <h3 className="text-lg font-medium text-dark-900 dark:text-dark-100">Coming Soon</h3>
              <p className="mt-1 text-sm text-dark-400">This tool is under development</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
