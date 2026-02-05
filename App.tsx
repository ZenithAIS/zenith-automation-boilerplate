
import React, { useState, useEffect, useCallback } from 'react';
import { FileTree } from './components/FileTree';
import { CodeBlock } from './components/CodeBlock';
import { FileNode, ScaffoldingContext } from './types';
import { DEFAULT_FILES } from './constants';
import { customizeScaffold } from './services/gemini';

const initialContext: ScaffoldingContext = {
  projectName: 'my-automation-service',
  description: 'A microservice for scheduled tasks and data processing.',
  useRedis: true,
  usePostgres: true,
  automationType: 'General Automation',
};

const App: React.FC = () => {
  const [context, setContext] = useState<ScaffoldingContext>(initialContext);
  const [files, setFiles] = useState<Record<string, string>>(DEFAULT_FILES);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('Dockerfile');
  const [isGenerating, setIsGenerating] = useState(false);

  const buildTree = useCallback((flatFiles: Record<string, string>): FileNode[] => {
    const root: FileNode[] = [];
    const map: Record<string, FileNode> = {};

    Object.keys(flatFiles).forEach((path) => {
      const parts = path.split('/');
      let currentPath = '';

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!map[currentPath]) {
          const newNode: FileNode = {
            name: part,
            type: isFile ? 'file' : 'folder',
            path: currentPath,
            children: isFile ? undefined : [],
          };
          map[currentPath] = newNode;

          if (index === 0) {
            root.push(newNode);
          } else {
            map[parentPath].children?.push(newNode);
          }
        }
      });
    });

    // Sorting folders first, then files alphabetically
    const sortNodes = (nodes: FileNode[]) => {
      nodes.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(node => node.children && sortNodes(node.children));
    };
    sortNodes(root);

    return root;
  }, []);

  const [tree, setTree] = useState<FileNode[]>([]);

  useEffect(() => {
    setTree(buildTree(files));
  }, [files, buildTree]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const custom = await customizeScaffold(context);
    if (custom) {
      setFiles((prev) => ({ ...prev, ...custom }));
      // Default to main.py if it was updated
      if (custom['src/main.py']) setSelectedFilePath('src/main.py');
    }
    setIsGenerating(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setContext(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Python Microservice Scaffolder</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => alert("Scaffold ready! You can now copy individual files.")}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Docs
          </button>
          <a href="https://github.com/features/actions" target="_blank" rel="noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">CI/CD Guide</a>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Configuration */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Project Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
                <input
                  name="projectName"
                  value={context.projectName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="my-automation-service"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select
                  name="automationType"
                  value={context.automationType}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>General Automation</option>
                  <option>Web Scraper</option>
                  <option>API Wrapper</option>
                  <option>Data Processor</option>
                  <option>Bot (Telegram/Discord)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={context.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Integrations</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="useRedis"
                  checked={context.useRedis}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300 group-hover:text-white">Redis (Queue/Cache)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="usePostgres"
                  checked={context.usePostgres}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300 group-hover:text-white">PostgreSQL (Database)</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`mt-auto w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              isGenerating 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Customizing...
              </>
            ) : (
              'Customize with Gemini'
            )}
          </button>
        </aside>

        {/* File Explorer */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Explorer</span>
          </div>
          <FileTree 
            nodes={tree} 
            onFileSelect={setSelectedFilePath} 
            selectedPath={selectedFilePath} 
          />
        </div>

        {/* Main Editor View */}
        <section className="flex-1 bg-slate-950 p-6 flex flex-col overflow-hidden">
          {files[selectedFilePath] !== undefined ? (
            <CodeBlock 
              code={files[selectedFilePath]} 
              fileName={selectedFilePath} 
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 italic">
              Select a file to view its content
            </div>
          )}
        </section>
      </main>

      {/* Footer Info */}
      <footer className="h-10 border-t border-slate-800 bg-slate-900/80 px-6 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest">
        <div className="flex gap-4">
          <span>Runtime: Python 3.11</span>
          <span>Orchestration: Docker Compose</span>
        </div>
        <div className="flex gap-4">
          <span>Powered by Gemini 3 Flash</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
