import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Code, Star, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { fetchWithAuth } from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';

const AllProjects = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

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
    
    // Optimistic UI update
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
      const res = await fetchWithAuth(`http://localhost:3000/api/v1/project/${projectId}/${endpoint}`, {
        method
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        setUser(user); // Revert on error
      }
    } catch (error) {
      console.error("Failed to toggle star status", error);
      setUser(user);
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
                            <span className="text-xs bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300 font-medium">
                              {project.owner?.username || user?.username}
                            </span>
                          </td>
                          <td className="py-4 px-6 align-middle">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4 px-6 align-middle text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-500/10"
                                onClick={(e) => handleStarProject(e, project._id, isStarred)}
                              >
                                <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-3">
                                Open
                              </Button>
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
    </div>
  );
};

export default AllProjects;
