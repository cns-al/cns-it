import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Download, Upload, Trash2, Save, Plus,
  ZoomIn, ZoomOut, Maximize2, Minimize2, Eye,
  Loader2, Copy, AlertCircle, Image as ImageIcon,
  FileText, Code2, ChevronDown, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const DRAWIO_URL = `${(window as any).__BASE_PATH__ || ''}/drawio/?ui=atlas`;

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

export default function DiagramPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [diagramTitle, setDiagramTitle] = useState('Untitled Diagram');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedDiagrams] = useState<Record<string, { xml: string; title: string; savedAt: string }>>({});

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

  // Inject CNS IT branding CSS into the draw.io iframe
  useEffect(() => {
    const injectBranding = () => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument) return;
      const doc = iframe.contentDocument;
      // Inject CSS if not already present
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
          .geTopToolbar > div:first-child { display: none !important; }
          .geToolbar, .geTopToolbar { background: #ffffff !important; border-bottom: 1px solid #e5e7eb !important; }
          .geBtn, .gePrimaryBtn { background: #2563eb !important; border-color: #2563eb !important; }
        `;
        doc.head.appendChild(style);
      }
      // Override title
      doc.title = 'CNS IT — Diagram Editor';
    };
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', injectBranding);
    }
    const interval = setInterval(injectBranding, 2000);
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
    setDiagramTitle('Untitled Diagram');
    toast.success('New diagram created');
  };

  const handleSave = () => {
    sendMessage({ action: 'save' });
    toast.success('Diagram saved');
  };

  const handleExport = (format: ExportFormat) => {
    setShowExport(false);
    sendMessage({ action: 'export', format, spinTitle: 'Exporting...' });
    toast.success(`Exporting as ${format.toUpperCase()}...`);
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
      toast.success('Diagram imported');
    };
    reader.readAsText(file);
  };

  const handleCopyDiagram = () => {
    sendMessage({ action: 'export', format: 'xml' });
    toast.success('Diagram data exported');
  };

  const handleClear = () => {
    if (confirm('Clear the current diagram?')) {
      sendMessage({ action: 'new' });
      setHasUnsaved(false);
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
    { id: 'xml', label: 'XML (draw.io)', icon: Code2 },
    { id: 'json', label: 'JSON', icon: Code2 },
  ];

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-[60] bg-dark-50 dark:bg-dark-950' : 'h-full'}`}>
      {/* Header Toolbar */}
      <div className="flex items-center gap-2 border-b border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 px-4 py-2 shrink-0">
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
        </div>

        <div className="flex-1" />

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-1">
          <ToolbarButton icon={Plus} label="New Diagram" onClick={handleNewDiagram} />
          <ToolbarButton icon={Upload} label="Import Diagram" onClick={() => setShowImport(true)} />
          <ToolbarButton icon={Save} label="Save" onClick={handleSave} />

          {/* Export Dropdown */}
          <div className="relative">
            <ToolbarButton icon={Download} label="Export" onClick={() => setShowExport(!showExport)} />
            {showExport && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 shadow-xl z-50 overflow-hidden">
                {exportFormats.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => handleExport(fmt.id)}
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
                  onClick={handleCopyDiagram}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800"
                >
                  <Copy className="h-4 w-4" /> Copy Diagram Data
                </button>
                <button
                  onClick={() => { setShowMenu(false); setShowImport(true); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800"
                >
                  <Upload className="h-4 w-4" /> Import Diagram
                </button>
                <div className="border-t border-dark-100 dark:border-dark-800" />
                <a
                  href="https://www.drawio.com/doc/faq/advanced-shapes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800"
                >
                  <Eye className="h-4 w-4" /> Shape Library
                </a>
                <a
                  href="https://www.drawio.com/doc/faq/custom-shapes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800"
                >
                  <PanelLeftOpen className="h-4 w-4" /> Custom Shapes
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
    </div>
  );
}

function ToolbarButton({ icon: Icon, label, onClick, variant = 'default' }: {
  icon: typeof X;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors ${
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
