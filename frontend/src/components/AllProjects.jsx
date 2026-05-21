import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Code, Star, ArrowLeft, MoreVertical, Copy, Trash2, Edit3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { fetchWithAuth } from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';

const AllProjects = () => {
  const { user, setUser } = useUser();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isEditTitleModalOpen, setIsEditTitleModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [isEditDescModalOpen, setIsEditDescModalOpen] = useState(false);
  const [editingDescription, setEditingDescription] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);



  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetchWithAuth('http://localhost:3000/api/v1/project/get-all-projects');
        const data = await res.json();
        if (data.success) {
          setProjects(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleStarProject = async (e, projectId, isCurrentlyStarred) => {
    e.stopPropagation();

    const previousUser = user;
    const updatedUser = { ...user };
    if (!updatedUser.starredProjects) updatedUser.starredProjects = [];

    if (isCurrentlyStarred) {
      updatedUser.starredProjects = updatedUser.starredProjects.filter(id => id !== projectId);
    } else {
      updatedUser.starredProjects = [...updatedUser.starredProjects, projectId];
    }
    setUser(updatedUser);

    try {
      const endpoint = isCurrentlyStarred ? 'unstar' : 'star';
      const method = isCurrentlyStarred ? 'DELETE' : 'POST';
      const res = await fetchWithAuth(`http://localhost:3000/api/v1/project/${projectId}/${endpoint}`, { method });
      const data = await res.json();
      if (!data.success) {
        setUser(previousUser);
      }
    } catch (error) {
      console.error("Failed to toggle star status", error);
      setUser(previousUser);
    }
  };

  const handleDuplicateProject = async (e, projectId) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(`http://localhost:3000/api/v1/project/${projectId}/duplicate`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => [data.data, ...prev]);
      } else {
        alert(data.message || 'Failed to duplicate project');
      }
    } catch (err) {
      console.error("Error duplicating project", err);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(`http://localhost:3000/api/v1/project/${projectToDelete}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.filter(p => p._id !== projectToDelete));
        setIsDeleteDialogOpen(false);
        setProjectToDelete(null);
      } else {
        alert(data.message || 'Failed to delete project');
      }
    } catch (err) {
      console.error("Error deleting project", err);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTitle = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(`http://localhost:3000/api/v1/project/${editingProjectId}/title`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editingTitle })
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.map(p => p._id === editingProjectId ? { ...p, title: editingTitle } : p));
        setIsEditTitleModalOpen(false);
      } else {
        alert(data.message || 'Failed to update title');
      }
    } catch (error) {
      console.error('Error updating title', error);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDescription = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(`http://localhost:3000/api/v1/project/${editingProjectId}/description`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: editingDescription })
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.map(p => p._id === editingProjectId ? { ...p, description: editingDescription } : p));
        setIsEditDescModalOpen(false);
      } else {
        alert(data.message || 'Failed to update description');
      }
    } catch (error) {
      console.error('Error updating description', error);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <header className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="mr-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-gray-400">
                  WeCode
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">All Projects</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage all your workspaces.</p>
        </div>

        <Card className="bg-white dark:bg-white/5 backdrop-blur-xl border-gray-200 dark:border-white/10 shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : projects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                      <th className="py-4 px-6 font-medium text-sm text-gray-500 dark:text-gray-400">Project Name</th>
                      <th className="py-4 px-6 font-medium text-sm text-gray-500 dark:text-gray-400">Owner</th>
                      <th className="py-4 px-6 font-medium text-sm text-gray-500 dark:text-gray-400">Created</th>
                      <th className="py-4 px-6 font-medium text-sm text-gray-500 dark:text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(project => {
                      const isStarred = user?.starredProjects?.includes(project._id);
                      return (
                        <tr key={project._id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                          <td className="py-4 px-6 align-middle">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-2 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                                <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-[300px] md:max-w-md lg:max-w-lg" title={project.title}>
                                  {project.title}
                                </div>
                                <span className="text-xs text-gray-500 capitalize">{project.template || 'react'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 align-middle">
                            <div className="flex -space-x-1.5 shrink-0 hover:z-10 relative">
                              <div className="h-6 w-6 rounded-full border-2 border-gray-50 dark:border-[#1a2235] bg-gray-200 flex items-center justify-center relative group z-10 overflow-hidden cursor-pointer" title={`Owner: ${project.owner?.username || user?.username}`}>
                                <img crossOrigin="anonymous" src={project.owner?.avatar || user?.avatar} alt={project.owner?.username} className="w-full h-full object-cover" />
                              </div>
                              {project.collaborators?.slice(0, 3).map((collab, i) => (
                                <div key={collab._id || i} className="h-6 w-6 rounded-full border-2 border-gray-50 dark:border-[#1a2235] bg-gray-200 flex items-center justify-center relative group overflow-hidden cursor-pointer" style={{ zIndex: 9 - i }} title={collab.username}>
                                  <img crossOrigin="anonymous" src={collab.avatar} alt={collab.username} className="w-full h-full object-cover" />
                                </div>
                              ))}
                              {project.collaborators?.length > 3 && (
                                <div className="h-6 w-6 rounded-full border-2 border-gray-50 dark:border-[#1a2235] bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-300 flex items-center justify-center relative group cursor-pointer" style={{ zIndex: 5 }}>
                                  +{project.collaborators.length - 3}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 align-middle">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4 px-6 align-middle text-right">
                            <div className="flex items-center justify-end gap-2 relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-500/10"
                                onClick={(e) => handleStarProject(e, project._id, isStarred)}
                              >
                                <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-3" onClick={(e) => { e.stopPropagation(); navigate(`/project/${project._id}`); }}>
                                Open
                              </Button>

                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/10"
                                  onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === project._id ? null : project._id); }}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                                {openDropdownId === project._id && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} />
                                    <div className="absolute right-0 bottom-full mb-1 w-44 bg-white dark:bg-[#1a2235] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20 overflow-hidden text-sm">
                                      <button
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors"
                                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setEditingProjectId(project._id); setEditingTitle(project.title); setIsEditTitleModalOpen(true); }}
                                      >
                                        <Edit3 className="h-3.5 w-3.5" /> Edit Title
                                      </button>
                                      <button
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors"
                                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setEditingProjectId(project._id); setEditingDescription(project.description || ''); setIsEditDescModalOpen(true); }}
                                      >
                                        <Edit3 className="h-3.5 w-3.5" /> Edit Description
                                      </button>
                                      <button
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors"
                                        onClick={(e) => handleDuplicateProject(e, project._id)}
                                      >
                                        <Copy className="h-3.5 w-3.5" /> Duplicate
                                      </button>
                                      <button
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors"
                                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleStarProject(e, project._id, user?.starredProjects?.includes(project._id)); }}
                                      >
                                        <Star className={`h-3.5 w-3.5 ${user?.starredProjects?.includes(project._id) ? 'fill-current text-yellow-500' : ''}`} />
                                        {user?.starredProjects?.includes(project._id) ? 'Remove Star' : 'Add to Starred'}
                                      </button>
                                      {project.owner?._id === user._id && (
                                        <>
                                          <div className="h-px bg-gray-200 dark:bg-white/10 my-0.5" />
                                          <button
                                            className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors"
                                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setProjectToDelete(project._id); setIsDeleteDialogOpen(true); }}
                                          >
                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-full mb-4 border border-gray-200 dark:border-white/10">
                  <FolderOpen className="h-10 w-10 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-300 mb-1">No projects found</h3>
                <p className="text-gray-600 dark:text-gray-500 max-w-sm">
                  You don't have any projects yet. Go back to the dashboard to create one.
                </p>
                <Button onClick={() => navigate('/dashboard')} className="mt-6 bg-blue-50 dark:bg-white/10 hover:bg-blue-100 dark:hover:bg-white/20 text-blue-600 dark:text-white border border-blue-200 dark:border-white/20 transition-all duration-300">
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Title Modal */}
      <Dialog open={isEditTitleModalOpen} onOpenChange={setIsEditTitleModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#151c2e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white transition-colors duration-300">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-gray-400">Edit Title</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-between mb-2">
              <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</Label>
              <span className="text-xs text-gray-500">{editingTitle.length}/100</span>
            </div>
            <Input
              id="edit-title"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              placeholder="Project Title"
              maxLength={100}
              className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTitleModalOpen(false)} className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10">
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTitle}
              disabled={isSubmitting || !editingTitle.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Save Title'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Description Modal */}
      <Dialog open={isEditDescModalOpen} onOpenChange={setIsEditDescModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#151c2e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white transition-colors duration-300">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-gray-400">Add Description</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-between mb-2">
              <Label htmlFor="edit-desc" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
              <span className="text-xs text-gray-500">{editingDescription.length}/1000</span>
            </div>
            <Input
              id="edit-desc"
              value={editingDescription}
              onChange={(e) => setEditingDescription(e.target.value)}
              placeholder="A brief description of what this project does"
              maxLength={1000}
              className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDescModalOpen(false)} className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10">
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDescription}
              disabled={isSubmitting || !editingDescription.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Save Description'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#151c2e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white transition-colors duration-300">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">Delete Project</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteProject}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllProjects;
