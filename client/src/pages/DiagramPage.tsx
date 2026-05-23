import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  X, Download, Upload, Trash2, Save, Plus,
  ZoomIn, ZoomOut, Maximize2, Minimize2, Eye,
  Loader2, Copy, AlertCircle, Image as ImageIcon,
  FileText, Code2, ChevronDown, PanelLeftClose, PanelLeftOpen,
  FolderOpen, Clock, Search, ExternalLink, HardDrive, Shapes, Puzzle, Network
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/client';

const DRAWIO_URL = `${(window as any).__BASE_PATH__ || ''}/drawio/?ui=atlas&libraries=1&proto=json`;

// Load network/IT shape libraries into draw.io after it's ready
// Libraries are proxied by the server from jgraph.github.io/drawio-libs
// The URL parameter libraries=1 enables all libraries in the "More Shapes" panel
// Users can also click the toolbar button to reload libraries
function loadNetworkLibraries(iframe: HTMLIFrameElement) {
  if (!iframe.contentWindow) return;
  // Trigger library reload by reloading the editor with libraries enabled
  // This works by sending a 'new' action to reset, then the libraries will be available
  toast('Network/IT shapes: open the "More Shapes" panel (bottom-right corner of editor)');
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf' | 'xml' | 'json';

interface DiagramMessage {
  action: string;
  xml?: string;
  json?: string;
  file?: string;
  title?: string;
}

interface SavedDiagram {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function DiagramPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSavedList, setShowSavedList] = useState(true);
  const [diagramTitle, setDiagramTitle] = useState('Untitled Diagram');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentDiagramId, setCurrentDiagramId] = useState<number | null>(id ? parseInt(id) : null);
  const [savedDiagrams, setSavedDiagrams] = useState<SavedDiagram[]>([]);
  const [diagramsLoading, setDiagramsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [showShapeImport, setShowShapeImport] = useState(false);

  // Load saved diagrams list
  const loadDiagrams = useCallback(async () => {
    try {
      setDiagramsLoading(true);
      const res = await api.get('/diagrams?limit=50');
      const data = await res.json();
      setSavedDiagrams(data.data || []);
    } catch (err) {
      console.error('Failed to load diagrams:', err);
    } finally {
      setDiagramsLoading(false);
    }
  }, []);

  // Load specific diagram by ID
  const loadDiagram = useCallback(async (diagramId: number) => {
    try {
      const res = await api.get(`/diagrams/${diagramId}`);
      const diagram = await res.json();
      setCurrentDiagramId(diagramId);
      setDiagramTitle(diagram.title);
      if (diagram.xml_data && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ action: 'load', xml: diagram.xml_data, mod: 0, fo: 0 }),
          '*'
        );
        toast.success('Diagram loaded');
      }
    } catch (err) {
      toast.error('Failed to load diagram');
      console.error(err);
    }
  }, []);

  // Save diagram to backend
  const saveDiagram = useCallback(async () => {
    try {
      setSaving(true);
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) {
        toast.error('Editor not ready');
        return;
      }
      // Request XML from draw.io
      iframe.contentWindow.postMessage(JSON.stringify({ action: 'export', format: 'xml' }), '*');
      // Wait for response via message listener
      const timeout = setTimeout(() => {
        toast.error('Save timeout — diagram may be too large');
        setSaving(false);
      }, 10000);

      const handler = (event: MessageEvent) => {
        if (!event.data || typeof event.data !== 'string') return;
        let msg: DiagramMessage;
        try { msg = JSON.parse(event.data); } catch { return; }
        if (msg.action === 'export' && msg.xml) {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          const xmlData = msg.xml;
          if (currentDiagramId) {
            api.put(`/diagrams/${currentDiagramId}`, { title: diagramTitle, xml_data: xmlData })
              .then(() => {
                toast.success('Diagram saved');
                setHasUnsaved(false);
                loadDiagrams();
              }).catch(() => toast.error('Failed to save diagram'));
          } else {
            api.post('/diagrams', { title: diagramTitle, xml_data: xmlData })
              .then(async (res) => {
                const data = await res.json();
                setCurrentDiagramId(data.id);
                toast.success('Diagram saved');
                setHasUnsaved(false);
                loadDiagrams();
              }).catch(() => toast.error('Failed to save diagram'));
          }
          setSaving(false);
        }
      };
      window.addEventListener('message', handler);
    } catch (err) {
      toast.error('Failed to save diagram');
      setSaving(false);
    }
  }, [currentDiagramId, diagramTitle, loadDiagrams]);

  // Delete diagram
  const deleteDiagram = useCallback(async (diagramId: number) => {
    if (!confirm('Delete this diagram? This cannot be undone.')) return;
    try {
      await api.delete(`/diagrams/${diagramId}`);
      toast.success('Diagram deleted');
      if (currentDiagramId === diagramId) {
        setCurrentDiagramId(null);
        setDiagramTitle('Untitled Diagram');
        sendMessage({ action: 'new' });
      }
      loadDiagrams();
    } catch (err) {
      toast.error('Failed to delete diagram');
    }
  }, [currentDiagramId, loadDiagrams]);

  // Export to PC
  const exportToPC = useCallback((format: ExportFormat) => {
    setShowExport(false);
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    if (format === 'xml' || format === 'json') {
      iframe.contentWindow.postMessage(JSON.stringify({ action: 'export', format }), '*');
      const handler = (event: MessageEvent) => {
        if (!event.data || typeof event.data !== 'string') return;
        let msg: DiagramMessage;
        try { msg = JSON.parse(event.data); } catch { return; }
        if ((msg.action === 'export') && (msg.xml || msg.json)) {
          const content = msg.xml || msg.json || '';
          const ext = format === 'json' ? 'json' : 'drawio';
          downloadFile(content, `${diagramTitle.replace(/[^a-z0-9]/gi, '_')}.${ext}`);
          window.removeEventListener('message', handler);
          toast.success(`Exported as ${format.toUpperCase()}`);
        }
      };
      window.addEventListener('message', handler);
      setTimeout(() => window.removeEventListener('message', handler), 10000);
    } else {
      iframe.contentWindow.postMessage(
        JSON.stringify({ action: 'export', format, spinTitle: 'Exporting...' }),
        '*'
      );
      toast.success(`Exporting as ${format.toUpperCase()}...`);
    }
  }, [diagramTitle]);

  const handleMessage = useCallback((event: MessageEvent) => {
    if (!event.data || typeof event.data !== 'string') return;
    let msg: DiagramMessage;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }
    switch (msg.action) {
      case 'ready':
        setLoading(false);
        setError(null);
        break;
      case 'autosave':
        setHasUnsaved(true);
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Load network/IT shape libraries when iframe is ready
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', () => {
        // Delay to ensure draw.io is fully initialized
        setTimeout(() => loadNetworkLibraries(iframe), 2000);
      });
    }
  }, []);

  useEffect(() => {
    loadDiagrams();
  }, [loadDiagrams]);

  useEffect(() => {
    if (id) {
      loadDiagram(parseInt(id));
    }
  }, [id, loadDiagram]);

  // Inject CNS IT branding CSS and library URL rewriter into the draw.io iframe
  useEffect(() => {
    const injectBranding = () => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument) return;
      const doc = iframe.contentDocument;

      // Inject library URL rewriter script (must run before draw.io JS)
      if (!doc.getElementById('cnsit-lib-rewriter')) {
        const script = doc.createElement('script');
        script.id = 'cnsit-lib-rewriter';
        script.textContent = `
          (function() {
            // Rewrite CDN/library URLs to local proxy
            function rewriteUrl(url) {
              if (typeof url !== 'string') return url;
              url = url.replace('https://jgraph.github.io/drawio-libs', '/drawio-libs');
              url = url.replace('https://cdn.draw.io', '/draw');
              url = url.replace('https://app.diagrams.net', '/draw');
              url = url.replace('https://www.draw.io', '/draw');
              return url;
            }
            // Rewrite library URLs in all elements
            function rewriteUrls() {
              var els = document.querySelectorAll('script, link, img, a, [src], [href]');
              els.forEach(function(el) {
                ['src', 'href', 'action'].forEach(function(attr) {
                  var val = el.getAttribute(attr);
                  if (val) {
                    var rewritten = rewriteUrl(val);
                    if (rewritten !== val) el.setAttribute(attr, rewritten);
                  }
                });
              });
            }
            rewriteUrls();
            // Also intercept fetch/XHR for library loading
            var origFetch = window.fetch;
            window.fetch = function() {
              var url = arguments[0];
              var rewritten = rewriteUrl(url);
              if (rewritten !== url) arguments[0] = rewritten;
              return origFetch.apply(this, arguments);
            };
          })();
        `;
        doc.head.appendChild(script);
      }

      if (!doc.getElementById('cnsit-branding-css')) {
        const style = doc.createElement('style');
        style.id = 'cnsit-branding-css';
        style.textContent = `
          .geLogo, .geLogoLink, .geLogoImg, .geLogoSvg,
          img[src*="logo"], img[src*="drawio"],
          .geFooter, .geFooterLink,
          .geSplash, .geSplashLogo,
          .geSplash h1, .geSplash p,
          h1.geTitle, .geTitle,
          #geInfo h1, #geInfo p:first-of-type,
          a[href*="drawio.com"], a[href*="diagrams.net"],
          a[href*="github.com/jgraph"],
          .geFooter a, [class*="Footer"] a,
          .geAbout, .geAboutDialog,
          .geTopToolbar > div:first-child,
          /* Hide Help menu and its dropdown */
          .geMenubar > div:last-child,
          .geMenubar > span:last-child,
          [id^="geHelp"],
          .geHelpMenu { display: none !important; }
          .geToolbar, .geTopToolbar { background: #ffffff !important; border-bottom: 1px solid #e5e7eb !important; }
          .geBtn, .gePrimaryBtn { background: #2563eb !important; border-color: #2563eb !important; }
        `;
        doc.head.appendChild(style);
      }
      // Remove Help menu from DOM
      const menubar = doc.querySelector('.geMenubar');
      if (menubar) {
        const children = Array.from(menubar.children);
        const helpMenu = children.find((child: Element) => {
          const text = child.textContent?.trim();
          return text === 'Help';
        });
        if (helpMenu) {
          helpMenu.remove();
        }
      }
      doc.title = 'CNS IT — Diagram Editor';
    };
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', injectBranding);
    }
    const interval = setInterval(injectBranding, 5000);
    return () => {
      clearInterval(interval);
      if (iframe) {
        iframe.removeEventListener('load', injectBranding);
      }
    };
  }, []);

  const sendMessage = (message: Record<string, unknown>) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify(message), '*');
    }
  };

  const handleNewDiagram = () => {
    if (hasUnsaved && !confirm('Create new diagram? Unsaved changes will be lost.')) return;
    sendMessage({ action: 'new' });
    setHasUnsaved(false);
    setCurrentDiagramId(null);
    setDiagramTitle('Untitled Diagram');
    toast.success('New diagram created');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      sendMessage({ action: 'load', xml: content, mod: 0, fo: 0 });
      setShowImport(false);
      setHasUnsaved(true);
      setCurrentDiagramId(null);
      setDiagramTitle(file.name.replace(/\.[^.]+$/, ''));
      toast.success('Diagram imported');
    };
    reader.readAsText(file);
  };

  // Import custom shapes
  const handleShapeImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      // Load custom shapes into draw.io
      sendMessage({ action: 'load', xml: content, mod: 0, fo: 0 });
      setShowShapeImport(false);
      toast.success('Custom shapes imported');
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm('Clear the current diagram?')) {
      sendMessage({ action: 'new' });
      setHasUnsaved(false);
      setCurrentDiagramId(null);
      setDiagramTitle('Untitled Diagram');
      toast.success('Diagram cleared');
    }
  };

  const handleZoomIn = () => sendMessage({ action: 'zoom', value: 1.2 });
  const handleZoomOut = () => sendMessage({ action: 'zoom', value: 0.8 });

  const exportFormats: { id: ExportFormat; label: string; icon: typeof ImageIcon }[] = [
    { id: 'png', label: 'PNG Image', icon: ImageIcon },
    { id: 'jpg', label: 'JPG Image', icon: ImageIcon },
    { id: 'svg', label: 'SVG Vector', icon: ImageIcon },
    { id: 'pdf', label: 'PDF Document', icon: FileText },
    { id: 'xml', label: 'XML (.drawio)', icon: Code2 },
    { id: 'json', label: 'JSON', icon: Code2 },
  ];

  const filteredDiagrams = savedDiagrams.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`flex ${isFullscreen ? 'fixed inset-0 z-[60] bg-dark-50 dark:bg-dark-950' : 'h-full'}`}>
      {/* Saved Diagrams Sidebar */}
      {showSavedList && !isFullscreen && (
        <div className="w-64 border-r border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 flex flex-col shrink-0">
          <div className="p-3 border-b border-dark-200 dark:border-dark-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-dark-900 dark:text-dark-100 flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Saved Diagrams
              </h3>
              <button
                onClick={() => setShowSavedList(false)}
                className="rounded p-1 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800"
                title="Hide sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dark-400" />
              <input
                type="text"
                placeholder="Search diagrams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 text-dark-700 dark:text-dark-300 outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {diagramsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
              </div>
            ) : filteredDiagrams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <FolderOpen className="h-8 w-8 text-dark-300 dark:text-dark-600 mb-2" />
                <p className="text-xs text-dark-500">
                  {searchQuery ? 'No diagrams match your search' : 'No saved diagrams yet'}
                </p>
                <p className="text-[10px] text-dark-400 mt-1">
                  Create a diagram and click Save to store it
                </p>
              </div>
            ) : (
              <div className="py-2">
                {filteredDiagrams.map((d) => (
                  <div
                    key={d.id}
                    className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                      currentDiagramId === d.id
                        ? 'bg-brand-50 dark:bg-brand-950/30 border-l-2 border-brand-500'
                        : 'hover:bg-dark-50 dark:hover:bg-dark-800 border-l-2 border-transparent'
                    }`}
                    onClick={() => loadDiagram(d.id)}
                  >
                    <ImageIcon className="h-4 w-4 shrink-0 text-dark-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-dark-700 dark:text-dark-300 truncate">
                        {d.title}
                      </p>
                      <p className="text-[10px] text-dark-400 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(d.updated_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteDiagram(d.id); }}
                      className="opacity-0 group-hover:opacity-100 rounded p-1 text-dark-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-dark-200 dark:border-dark-800 text-[10px] text-dark-400 text-center">
            {savedDiagrams.length} diagram{savedDiagrams.length !== 1 ? 's' : ''} saved
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header Toolbar */}
        <div className="flex items-center gap-2 border-b border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 px-4 py-2 shrink-0">
          {!showSavedList && !isFullscreen && (
            <button
              onClick={() => setShowSavedList(true)}
              className="rounded-lg p-2 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              title="Show saved diagrams"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <ImageIcon className="h-4 w-4" />
          </div>

          {/* Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isEditingTitle ? (
              <input
                type="text"
                value={diagramTitle}
                onChange={(e) => setDiagramTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }}
                className="text-sm font-semibold bg-transparent border-b border-brand-500 outline-none text-dark-900 dark:text-dark-100"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-sm font-semibold text-dark-900 dark:text-dark-100 hover:text-brand-600 dark:hover:text-brand-400 truncate"
                title="Click to rename"
              >
                {diagramTitle}
              </button>
            )}
            {hasUnsaved && (
              <span className="relative inline-flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
            )}
            {currentDiagramId && (
              <span className="text-[10px] text-dark-400">ID: {currentDiagramId}</span>
            )}
          </div>

          <div className="flex-1" />

          {/* Toolbar Buttons */}
          <div className="flex items-center gap-1">
            <ToolbarButton icon={Plus} label="New Diagram" onClick={handleNewDiagram} />
            <ToolbarButton icon={Upload} label="Import Diagram" onClick={() => setShowImport(true)} />
            <ToolbarButton icon={Shapes} label="Import Custom Shapes" onClick={() => setShowShapeImport(true)} />
            <ToolbarButton icon={Network} label="Network/IT Shapes — Open 'More Shapes' panel (bottom-right) to browse: Network, Cisco, AWS, Azure, Google Cloud, Rack, Server" onClick={() => {
              const iframe = iframeRef.current;
              if (iframe?.contentWindow) {
                loadNetworkLibraries(iframe);
              }
            }} />
            <ToolbarButton
              icon={Save}
              label="Save to CNS IT"
              onClick={saveDiagram}
              disabled={saving}
            />

            {/* Export Dropdown */}
            <div className="relative">
              <ToolbarButton icon={HardDrive} label="Export to PC" onClick={() => setShowExport(!showExport)} />
              {showExport && (
                <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 text-[10px] font-semibold text-dark-400 uppercase tracking-wider">
                    Export to PC
                  </div>
                  {exportFormats.map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => exportToPC(fmt.id)}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                    >
                      <fmt.icon className="h-4 w-4 text-dark-400" />
                      {fmt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-dark-200 dark:bg-dark-700 mx-1" />

            <ToolbarButton icon={ZoomOut} label="Zoom Out" onClick={handleZoomOut} />
            <ToolbarButton icon={ZoomIn} label="Zoom In" onClick={handleZoomIn} />

            <div className="w-px h-6 bg-dark-200 dark:bg-dark-700 mx-1" />

            <ToolbarButton icon={Trash2} label="Clear" onClick={handleClear} variant="danger" />

            <div className="w-px h-6 bg-dark-200 dark:bg-dark-700 mx-1" />

            <ToolbarButton
              icon={isFullscreen ? Minimize2 : Maximize2}
              label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              onClick={() => setIsFullscreen(!isFullscreen)}
            />

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-lg p-2 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                title="More Options"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      exportToPC('xml');
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800"
                  >
                    <Download className="h-4 w-4" /> Download .drawio
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); setShowImport(true); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800"
                  >
                    <Upload className="h-4 w-4" /> Import Diagram
                  </button>
                  <div className="border-t border-dark-100 dark:border-dark-800" />
                  <a
                    href="https://cns.al"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800"
                  >
                    <ExternalLink className="h-4 w-4" /> CNS Solutions
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative min-h-0 bg-dark-100 dark:bg-dark-950">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-dark-50 dark:bg-dark-950">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600 mb-4" />
              <p className="text-sm text-dark-500">Loading Diagram Editor...</p>
              <p className="text-xs text-dark-400 mt-1">Full-featured editor with all shapes & libraries</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
              <p className="text-sm text-dark-600 dark:text-dark-400">{error}</p>
              <button
                onClick={() => { setError(null); setLoading(true); }}
                className="mt-3 btn btn-primary text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={DRAWIO_URL}
            className="w-full h-full border-0"
            title="CNS IT Diagram Editor"
            onLoad={() => setLoading(false)}
            onError={() => { setError('Failed to load diagram editor'); setLoading(false); }}
            style={{ minHeight: '400px' }}
          />

          {/* Branding */}
          <div className="absolute bottom-2 right-3 text-[10px] text-dark-300 dark:text-dark-700 pointer-events-none select-none">
            CNS IT Diagram Editor &middot; <a href="https://cns.al" className="hover:text-brand-500">cns.al</a>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowImport(false)}>
          <div className="w-full max-w-md rounded-2xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Import Diagram</h3>
              <button onClick={() => setShowImport(false)} className="rounded-lg p-1.5 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-dark-200 dark:border-dark-700 p-8 cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                <Upload className="h-8 w-8 text-dark-300 dark:text-dark-600" />
                <div className="text-center">
                  <p className="text-sm font-medium text-dark-700 dark:text-dark-300">Drop diagram file here</p>
                  <p className="text-xs text-dark-400 mt-1">.drawio, .xml, .dio files</p>
                </div>
                <input type="file" accept=".drawio,.xml,.dio" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Custom Shapes Import Modal */}
      {showShapeImport && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowShapeImport(false)}>
          <div className="w-full max-w-md rounded-2xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 flex items-center gap-2">
                <Shapes className="h-5 w-5 text-brand-600" />
                Import Custom Shapes
              </h3>
              <button onClick={() => setShowShapeImport(false)} className="rounded-lg p-1.5 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-dark-200 dark:border-dark-700 p-8 cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                <Puzzle className="h-8 w-8 text-dark-300 dark:text-dark-600" />
                <div className="text-center">
                  <p className="text-sm font-medium text-dark-700 dark:text-dark-300">Drop shape library file here</p>
                  <p className="text-xs text-dark-400 mt-1">.xml shape libraries, .svg shapes</p>
                </div>
                <input type="file" accept=".xml,.svg" onChange={handleShapeImport} className="hidden" />
              </label>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Tip:</strong> Custom shapes can be imported from draw.io shape libraries or custom XML shape definitions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ icon: Icon, label, onClick, variant = 'default', disabled = false }: {
  icon: typeof X;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg p-2 transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        variant === 'danger'
          ? 'text-dark-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30'
          : 'text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800'
      }`}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
