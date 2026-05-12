import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import TerminalComponent from './Terminal.jsx';
import { getWebContainer } from '@/lib/webcontainer.js';
import Editor from '@monaco-editor/react';
import {
  Folder, FolderOpen, File as FileIcon, ChevronRight, ChevronDown,
  Save, ArrowLeft, Code, Play, X,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from "@/contexts/ThemeContext";
import { fetchWithAuth } from '@/lib/api';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from "@/components/ui/context-menu";

const FileExplorerNode = ({ name, node, path, activeFilePath, onFileClick, expandedFolders, toggleFolder, selectedNodePath, onNodeSelect, onRenameNode, onDeleteNode }) => {
  const isDir = node.type === 'directory';
  const isExpanded = expandedFolders.has(path);

  if (isDir) {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="select-none">
            <div
              className={`flex items-center gap-1 py-1 px-1 cursor-pointer text-[13px] transition-colors ${selectedNodePath === path
                ? 'bg-blue-100/50 dark:bg-blue-500/30 text-blue-800 dark:text-blue-200'
                : 'hover:bg-gray-200/50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                }`}
              onClick={(e) => { e.stopPropagation(); toggleFolder(path); onNodeSelect(path); }}
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-80" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-80" />}
              {isExpanded ? <FolderOpen className="h-3.5 w-3.5 text-blue-400 shrink-0" /> : <Folder className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
              <span className="truncate ml-0.5 font-medium">{name}</span>
            </div>
            {isExpanded && node.children && (
              <div className="pl-3.5 ml-1.5 border-l border-gray-200 dark:border-white/10">
                {Object.entries(node.children).map(([childName, childNode]) => (
                  <FileExplorerNode
                    key={childName}
                    name={childName}
                    node={childNode}
                    path={`${path}/${childName}`}
                    activeFilePath={activeFilePath}
                    onFileClick={onFileClick}
                    expandedFolders={expandedFolders}
                    toggleFolder={toggleFolder}
                    selectedNodePath={selectedNodePath}
                    onNodeSelect={onNodeSelect}
                    onRenameNode={onRenameNode}
                    onDeleteNode={onDeleteNode}
                  />
                ))}
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onRenameNode(path, name)}>Rename</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onDeleteNode(path)} className="text-red-600 dark:text-red-400">Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  const getLanguageIconColor = (filename) => {
    const name = filename.toLowerCase();

    if (name.endsWith('.js') || name.endsWith('.jsx')) return 'text-yellow-400';
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'text-blue-400';
    if (name.endsWith('.css')) return 'text-sky-400';
    if (name.endsWith('.html')) return 'text-orange-500';
    if (name.endsWith('.json')) return 'text-yellow-600';
    if (name.endsWith('.md')) return 'text-blue-300';

    if (name.endsWith('.vue')) return 'text-emerald-500';

    if (name.includes('.component.') || name.includes('.module.')) return 'text-red-600';

    if (name.includes('hono')) return 'text-orange-400';
    if (name.includes('express')) return 'text-gray-300';

    if (name.startsWith('next.config')) return 'text-black dark:text-white';

    return 'text-gray-400';
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={`flex items-center gap-1.5 py-1 px-1 cursor-pointer text-[13px] transition-colors ${activeFilePath === path
            ? 'bg-blue-100/50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-medium'
            : selectedNodePath === path
              ? 'bg-gray-200/50 dark:bg-white/10 text-gray-700 dark:text-gray-300'
              : 'hover:bg-gray-200/50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
            }`}
          onClick={(e) => { e.stopPropagation(); onFileClick(path); onNodeSelect(path); }}
        >
          <div className="w-3.5 shrink-0" /> {/* Spacer for alignment with folder chevron */}
          <FileIcon className={`h-3.5 w-3.5 ${getLanguageIconColor(name)} shrink-0`} />
          <span className="truncate ml-0.5">{name}</span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onRenameNode(path, name)}>Rename</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onDeleteNode(path)} className="text-red-600 dark:text-red-400">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

const transformTree = (node) => {
  const result = {};
  for (const [key, value] of Object.entries(node)) {
    if (value.type === 'directory') {
      result[key] = {
        directory: transformTree(value.children || {}),
      };
    } else {
      result[key] = {
        file: {
          contents: value.content || '',
        },
      };
    }
  }
  return result;
};

const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [fileTree, setFileTree] = useState({});
  const [activeFilePath, setActiveFilePath] = useState(null);
  const [openedFiles, setOpenedFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src', 'app']));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedNodePath, setSelectedNodePath] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState('file');
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [renamePath, setRenamePath] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameNewName, setRenameNewName] = useState('');
  const serverReadyRegistered = useRef(false);
  const terminalRef = useRef(null);
  const { theme: appTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;

    const syncFilesystem = async () => {
      // Check for both loading finish AND actual data existence
      if (!isLoading && fileTree && Object.keys(fileTree).length > 0) {
        try {
          const container = await getWebContainer();

          if (!isMounted) return;

          const webContainerFiles = transformTree(fileTree);
          await container.mount(webContainerFiles);
          console.log("WebContainer Filesystem Synced successfully");
        } catch (err) {
          // Ignore the "single instance" error if it happens during hot reload
          if (!err.message.includes('single WebContainer instance')) {
            console.error("Mounting failed:", err);
          }
        }
      }
    };

    syncFilesystem();

    return () => { isMounted = false; };
  }, [isLoading, !!fileTree]); // !!fileTree converts the object presence to a boolean

  // Register the server-ready listener ONCE on the WebContainer
  useEffect(() => {
    let isMounted = true;

    const registerServerReady = async () => {
      if (serverReadyRegistered.current) return;
      try {
        const container = await getWebContainer();
        serverReadyRegistered.current = true;
        container.on('server-ready', (port, url) => {
          console.log(`Server ready on port ${port}: ${url}`);
          if (isMounted) {
            setPreviewUrl(url);
            setShowPreview(true);
          }
        });
      } catch (err) {
        console.error('Failed to register server-ready listener:', err);
      }
    };

    registerServerReady();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetchWithAuth(`http://localhost:3000/api/v1/project/${projectId}`);
        const data = await res.json();
        if (data.success) {
          setHasUnsavedChanges(false);
          setProject(data.data);
          setFileTree(data.data.fileTree || {});
          setOpenedFiles(data.data.openedFiles || []);
          if (data.data.openedFiles && data.data.openedFiles.length > 0) {
            setActiveFilePath(data.data.openedFiles[0]);
          }
          else if (data.data.fileTree) {
            const firstFile = findFirstFile(data.data.fileTree, '');
            if (firstFile) setActiveFilePath(firstFile);
          }
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error("Failed to fetch project", err);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (activeFilePath) {
      pushOpenedFile(activeFilePath);
    }
  }, [activeFilePath]);

  const syncOpenedFiles = async (projectId, filesArray) => {
    try {
      const response = await fetchWithAuth(`http://localhost:3000/api/v1/project/${projectId}/opened-files`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ openedFiles: filesArray }),
      });

      const data = await response.json();
      if (!data.success) {
        alert(data.message || 'Failed to sync tabs');
      }
      return data.data;
    } catch (error) {
      console.error("Tab Sync Error:", error);
      alert("Failed to sync tabs");
    }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Do you really want to leave without saving?")) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  const findFirstFile = (node, currentPath) => {
    for (const [key, value] of Object.entries(node)) {
      const newPath = currentPath ? `${currentPath}/${key}` : key;
      if (value.type === 'file') return newPath;
      if (value.type === 'directory' && value.children) {
        const found = findFirstFile(value.children, newPath);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileNode = (tree, path) => {
    const parts = path.split('/');
    let current = { children: tree };
    for (const part of parts) {
      if (!current.children || !current.children[part]) return null;
      current = current.children[part];
    }
    return current;
  };

  const handleEditorChange = async (value) => {
    if (!activeFilePath) return;

    // Deep clone the tree to update it
    const newTree = JSON.parse(JSON.stringify(fileTree));
    const parts = activeFilePath.split('/');
    let current = { children: newTree };

    for (let i = 0; i < parts.length - 1; i++) {
      current = current.children[parts[i]];
    }
    current.children[parts[parts.length - 1]].content = value;

    setFileTree(newTree);
    setHasUnsavedChanges(true);
    try {
      const container = await getWebContainer();
      await container.fs.writeFile(activeFilePath, value);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateNode = async () => {
    if (!newItemName.trim()) return;

    const newTree = JSON.parse(JSON.stringify(fileTree));
    let targetPath = selectedNodePath;

    // Determine target directory
    let parentNode = { children: newTree };
    let parentPath = '';

    if (targetPath) {
      const parts = targetPath.split('/');
      let current = { children: newTree };
      let isTargetFile = false;

      for (let i = 0; i < parts.length; i++) {
        if (!current.children || !current.children[parts[i]]) break;
        if (i === parts.length - 1 && current.children[parts[i]].type === 'file') {
          isTargetFile = true;
        } else {
          current = current.children[parts[i]];
        }
      }

      if (isTargetFile) {
        parts.pop();
        targetPath = parts.join('/');

        current = { children: newTree };
        for (const part of parts) {
          if (part) current = current.children[part];
        }
        parentNode = current;
        parentPath = targetPath;
      } else {
        parentNode = current;
        parentPath = targetPath;
      }
    }

    if (!parentNode.children) parentNode.children = {};

    if (parentNode.children[newItemName]) {
      alert(`A file or folder named ${newItemName} already exists here.`);
      return;
    }

    const fullPath = parentPath ? `${parentPath}/${newItemName}` : newItemName;

    try {
      const container = await getWebContainer();

      if (createType === 'file') {
        parentNode.children[newItemName] = { type: 'file', content: '' };
        await container.fs.writeFile(fullPath, "");
      } else {
        parentNode.children[newItemName] = { type: 'directory', children: {} };
        await container.fs.mkdir(fullPath);
      }
      setFileTree(newTree);
      setHasUnsavedChanges(true);

      if (parentPath) {
        const newExpanded = new Set(expandedFolders);
        let p = '';
        for (const part of parentPath.split('/')) {
          p = p ? `${p}/${part}` : part;
          newExpanded.add(p);
        }
        setExpandedFolders(newExpanded);
      }

      if (createType === 'file') {
        setActiveFilePath(fullPath);
        setSelectedNodePath(fullPath);
      }

      setIsCreateModalOpen(false);
      setNewItemName('');
    } catch (error) {
      console.error('Failed to create node in WebContainer', error);
      alert('Error creating a file in the  virtual file system.');
    }

  };

  const handleRenameClick = (path, currentName) => {
    setRenamePath(path);
    setRenameNewName(currentName);
    setIsRenameModalOpen(true);
  };

  const submitRename = () => {
    if (!renameNewName.trim() || !renamePath) return;

    const newTree = JSON.parse(JSON.stringify(fileTree));
    const parts = renamePath.split('/');
    const oldName = parts.pop();

    if (oldName === renameNewName) {
      setIsRenameModalOpen(false);
      return;
    }

    let current = { children: newTree };
    for (const part of parts) {
      current = current.children[part];
    }

    if (current.children[renameNewName]) {
      alert(`A file or folder named ${renameNewName} already exists here.`);
      return;
    }

    // Preserve the exact node data
    current.children[renameNewName] = current.children[oldName];
    delete current.children[oldName];

    setFileTree(newTree);
    setHasUnsavedChanges(true);

    const newPath = parts.length > 0 ? `${parts.join('/')}/${renameNewName}` : renameNewName;

    if (activeFilePath && activeFilePath.startsWith(renamePath)) {
      setActiveFilePath(activeFilePath.replace(renamePath, newPath));
    }
    if (selectedNodePath && selectedNodePath.startsWith(renamePath)) {
      setSelectedNodePath(selectedNodePath.replace(renamePath, newPath));
    }

    // Update expanded folders to keep it open
    if (expandedFolders.has(renamePath)) {
      const newExpanded = new Set(expandedFolders);
      newExpanded.delete(renamePath);
      newExpanded.add(newPath);
      setExpandedFolders(newExpanded);
    }

    setIsRenameModalOpen(false);
    setRenamePath('');
    setRenameNewName('');
  };

  const handleDeleteNode = (path) => {
    if (window.confirm(`Are you sure you want to delete ${path.split('/').pop()}?`)) {
      const newTree = JSON.parse(JSON.stringify(fileTree));
      const parts = path.split('/');
      let current = { children: newTree };
      for (let i = 0; i < parts.length - 1; i++) {
        current = current.children[parts[i]];
      }
      delete current.children[parts[parts.length - 1]];
      setFileTree(newTree);
      setHasUnsavedChanges(true);

      const updatedOpenedFiles = openedFiles.filter(
        (openedPath) => !openedPath.startsWith(path)
      );

      setOpenedFiles(updatedOpenedFiles);
      syncOpenedFiles(projectId, updatedOpenedFiles);

      if (activeFilePath && activeFilePath.startsWith(path)) {
        setActiveFilePath(null);
      }
      if (selectedNodePath && selectedNodePath.startsWith(path)) {
        setSelectedNodePath('');
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetchWithAuth(`http://localhost:3000/api/v1/project/${projectId}/files`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileTree })
      });
      const data = await res.json();
      if (data.success) {
        setHasUnsavedChanges(false);
      } else {
        alert("Failed to save project files.");
      }
    } catch (err) {
      console.error("Error saving files", err);
      alert("Error saving project files.");
    } finally {
      setIsSaving(false);
    }
  };

  const pushOpenedFile = (filePath) => {
    if (!openedFiles.includes(filePath)) {
      const updatedFiles = [...openedFiles, filePath];
      setOpenedFiles(updatedFiles);
      syncOpenedFiles(projectId, updatedFiles);
    }
  };

  const removeOpenedFile = (pathToRemove) => {
    const newFiles = openedFiles.filter(path => path !== pathToRemove);
    setOpenedFiles(newFiles);
    syncOpenedFiles(projectId, newFiles);
    if (activeFilePath === pathToRemove) {
      setActiveFilePath(newFiles.length > 0 ? newFiles[newFiles.length - 1] : null);
    }
  };

  const runProject = async () => {
    try {
      const container = await getWebContainer();

      // Helper: send a command to the terminal shell
      const runInTerminal = (command) => {
        if (terminalRef.current) {
          terminalRef.current.writeCommand(command);
        } else {
          console.error('Terminal not ready');
        }
      };

      // Helper: find the first existing file from a list of candidates
      const findEntryFile = async (candidates) => {
        for (const candidate of candidates) {
          try {
            await container.fs.readFile(candidate, 'utf-8');
            return candidate;
          } catch {
            // File doesn't exist, try next
          }
        }
        return null;
      };

      // Helper: check if a file exists in the container
      const fileExists = async (path) => {
        try {
          await container.fs.readFile(path, 'utf-8');
          return true;
        } catch {
          return false;
        }
      };

      // Determine if we should use npm or raw node
      const files = await container.fs.readdir('.');
      const hasPackageJson = files.includes('package.json');

      if (hasPackageJson) {
        const pkgRaw = await container.fs.readFile('package.json', 'utf-8');
        let pkg;
        try {
          pkg = JSON.parse(pkgRaw);
        } catch {
          console.error('Failed to parse package.json');
          return;
        }

        const scripts = pkg.scripts || {};
        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        const scriptName = ['dev', 'start', 'serve'].find((s) => scripts[s]);

        // If scripts already exist, just install & run
        if (scriptName) {
          runInTerminal(`npm install && npm run ${scriptName}`);
          return;
        }

        // No scripts found — detect framework and auto-scaffold
        const isReact = 'react' in deps || 'react-dom' in deps;
        const isVue = 'vue' in deps;
        const isNext = 'next' in deps;
        const hasIndexHtml = await fileExists('index.html');

        if (isNext) {
          pkg.scripts = { ...scripts, dev: 'next dev', build: 'next build', start: 'next start' };
          await container.fs.writeFile('package.json', JSON.stringify(pkg, null, 2));
          runInTerminal('npm install && npm run dev');
        } else if (isReact && hasIndexHtml) {
          // React project — scaffold Vite
          pkg.scripts = { ...scripts, dev: 'vite', build: 'vite build' };
          if (!pkg.devDependencies) pkg.devDependencies = {};
          pkg.devDependencies['vite'] = '^5.0.0';
          pkg.devDependencies['@vitejs/plugin-react'] = '^4.2.0';
          await container.fs.writeFile('package.json', JSON.stringify(pkg, null, 2));

          const htmlContent = await container.fs.readFile('index.html', 'utf-8');
          if (!htmlContent.includes('<script type="module"')) {
            const mainEntry = await findEntryFile(['src/main.jsx', 'src/index.jsx', 'src/main.js', 'src/index.js']);
            if (mainEntry) {
              const updatedHtml = htmlContent.replace('</body>', `    <script type="module" src="/${mainEntry}"></script>\n  </body>`);
              await container.fs.writeFile('index.html', updatedHtml);
            }
          }

          if (!(await fileExists('vite.config.js'))) {
            await container.fs.writeFile('vite.config.js',
              `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n});\n`
            );
          }

          runInTerminal('npm install && npm run dev');
        } else if (isVue && hasIndexHtml) {
          // Vue project — scaffold Vite
          pkg.scripts = { ...scripts, dev: 'vite', build: 'vite build' };
          if (!pkg.devDependencies) pkg.devDependencies = {};
          pkg.devDependencies['vite'] = '^5.0.0';
          pkg.devDependencies['@vitejs/plugin-vue'] = '^4.5.0';
          await container.fs.writeFile('package.json', JSON.stringify(pkg, null, 2));

          if (!(await fileExists('vite.config.js'))) {
            await container.fs.writeFile('vite.config.js',
              `import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\n\nexport default defineConfig({\n  plugins: [vue()],\n});\n`
            );
          }

          runInTerminal('npm install && npm run dev');
        } else {
          // Plain Node.js project
          const entryFile = pkg.main
            || await findEntryFile(['index.js', 'src/index.js', 'server.js', 'app.js']);

          if (entryFile) {
            runInTerminal(`npm install && node ${entryFile}`);
          } else if (activeFilePath && (activeFilePath.endsWith('.js') || activeFilePath.endsWith('.mjs'))) {
            runInTerminal(`npm install && node ${activeFilePath}`);
          } else {
            alert('No runnable script or entry file found. Add a "dev" or "start" script to your package.json.');
          }
        }
      } else {
        // No package.json — run the active file or auto-detect index.js
        const entryFile = activeFilePath
          || await findEntryFile(['index.js', 'main.js', 'app.js']);

        if (entryFile) {
          runInTerminal(`node ${entryFile}`);
        } else {
          alert('Please select a file to run');
        }
      }
    } catch (error) {
      console.error('Run Command Error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const activeFileNode = activeFilePath ? getFileNode(fileTree, activeFilePath) : null;

  let language = "javascript"; // Default

  if (activeFilePath) {
    const fileName = activeFilePath.toLowerCase();
    if (fileName.endsWith('.css')) language = "css";
    else if (fileName.endsWith('.html')) language = "html";
    else if (fileName.endsWith('.json')) language = "json";
    else if (fileName.endsWith('.md')) language = "markdown";

    else if (fileName.endsWith('.ts')) language = "typescript";
    else if (fileName.endsWith('.tsx')) language = "typescriptreact";
    else if (fileName.endsWith('.jsx')) language = "javascriptreact";

    else if (fileName.endsWith('.vue')) language = "vue";
    else if (fileName.endsWith('.svelte')) language = "svelte";
    else if (fileName.endsWith('.component.html') || fileName.endsWith('.component.ts')) language = "angular";

    else if (fileName.includes('hono')) language = "typescript"; // Hono is usually TS
    else if (fileName.endsWith('.mjs')) language = "javascript";
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300">
      <header className="h-14 bg-white dark:bg-[#1a2235] border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-md">
              <Code className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-tight">{project?.title || 'Untitled'}</h1>
              <div className="text-[10px] text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2 mr-4">
            <div className="h-7 w-7 rounded-full border-2 border-white dark:border-[#1a2235] bg-blue-500 flex items-center justify-center text-white text-xs font-bold z-10" title="You">
              Y
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 text-xs bg-white dark:bg-[#2d3748] border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>

          <Button size="sm" onClick={runProject} className="h-8 text-xs bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-0 shadow-sm">
            <Play className="h-3.5 w-3.5 mr-1.5" /> Run
          </Button>

          <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1"></div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden relative flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          <ResizablePanel defaultSize={190} minSize={150} maxSize={250} className="bg-gray-50/50 dark:bg-[#111827] border-r border-gray-200 dark:border-white/10 flex flex-col">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-white/10 flex justify-between items-center shrink-0">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Explorer</h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => { setCreateType('file'); setNewItemName(''); setIsCreateModalOpen(true); }}
                >
                  <FileIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => { setCreateType('directory'); setNewItemName(''); setIsCreateModalOpen(true); }}
                >
                  <Folder className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10" onClick={() => setSelectedNodePath('')}>
              {Object.entries(fileTree).map(([name, node]) => (
                <FileExplorerNode
                  key={name}
                  name={name}
                  node={node}
                  path={name}
                  activeFilePath={activeFilePath}
                  onFileClick={setActiveFilePath}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                  selectedNodePath={selectedNodePath}
                  onNodeSelect={setSelectedNodePath}
                  onRenameNode={handleRenameClick}
                  onDeleteNode={handleDeleteNode}
                />
              ))}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="w-1 bg-transparent hover:bg-blue-500/50 active:bg-blue-500 transition-colors cursor-col-resize z-10" />

          {/* Editor & Terminal Area */}
          <ResizablePanel className="flex flex-col bg-white dark:bg-[#0f172a]">
            <ResizablePanelGroup direction="vertical">

              {/* Top Panel: Editor */}
              <ResizablePanel defaultSize={70} minSize={30}>
                <div className="h-full flex flex-col overflow-hidden">
                  {/* Tab Bar */}
                  <div className="h-10 bg-gray-50 dark:bg-[#1a2235] border-b border-gray-200 dark:border-white/10 flex items-center shrink-0 overflow-x-auto hide-scrollbar">
                    {openedFiles.map((filePath) => (
                      <div
                        key={filePath}
                        onClick={() => setActiveFilePath(filePath)}
                        className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm font-medium border-r border-gray-200 dark:border-white/10 transition-colors ${activeFilePath === filePath
                          ? "bg-white dark:bg-[#0f172a] text-blue-600 dark:text-blue-400 border-b-2 border-b-blue-500"
                          : "text-gray-500 hover:bg-gray-100 dark:hover:bg-[#232b3e]"
                          }`}
                      >
                        <FileIcon className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[150px]">{filePath.split('/').pop()}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOpenedFile(filePath);
                          }}
                          className="ml-1 p-0.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Editor Section */}
                  {activeFilePath ? (
                    <div className="flex-1 relative">
                      <Editor
                        height="100%"
                        path={activeFilePath}
                        language={language}
                        theme={appTheme === 'dark' ? 'vs-dark' : 'light'}
                        value={activeFileNode?.content || ''}
                        onChange={handleEditorChange}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          wordWrap: "on",
                          padding: { top: 16, bottom: 16 },
                          scrollBeyondLastLine: false,
                          smoothScrolling: true,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                      <Code className="h-16 w-16 mb-4 opacity-20" />
                      <p>Select a file from the explorer to start coding</p>
                    </div>
                  )}
                </div>
              </ResizablePanel>

              {/* Updated Vertical Handle with Arrow/Drag Icon */}
              <ResizableHandle
                withHandle
                className="h-1.5 bg-gray-200 dark:bg-white/10 hover:bg-blue-500/50 active:bg-blue-500 transition-colors cursor-row-resize"
              />

              {/* Bottom Panel: Terminal */}
              <ResizablePanel defaultSize={30} minSize={10} className="bg-[#1e1e1e] flex flex-col">
                <div className="flex items-center justify-between px-4 py-1.5 bg-[#252526] border-b border-white/5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Terminal</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <TerminalComponent ref={terminalRef} />
                </div>
              </ResizablePanel>
            {/* preview*/}
          {showPreview && (
            <>
              <ResizableHandle withHandle className="w-1 bg-transparent hover:bg-blue-500/50 active:bg-blue-500 transition-colors cursor-col-resize z-10" />
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full flex flex-col bg-white">
                  <div className="h-9 bg-gray-100 dark:bg-[#252526] flex items-center justify-between px-3 border-b border-gray-200 dark:border-white/10 shrink-0">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Browser Preview</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500 hover:text-red-500 hover:bg-red-500/10 dark:text-gray-400 dark:hover:text-red-400"
                      onClick={() => setShowPreview(false)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <iframe src={previewUrl} className="flex-1 w-full border-0" />
                </div>
              </ResizablePanel>
            </>
          )}
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New {createType === 'file' ? 'File' : 'Folder'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-left">
                Name
              </Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={createType === 'file' ? 'e.g. index.js' : 'e.g. components'}
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateNode();
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateNode}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="renameName" className="text-left">
                New Name
              </Label>
              <Input
                id="renameName"
                value={renameNewName}
                onChange={(e) => setRenameNewName(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitRename();
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameModalOpen(false)}>Cancel</Button>
            <Button onClick={submitRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectWorkspace;
