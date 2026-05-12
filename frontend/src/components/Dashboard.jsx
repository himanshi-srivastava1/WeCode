import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Code, Users, Settings, Plus, FolderOpen, Server, Flame, Search, Star, Edit3, ArrowRight, MoreVertical, Copy, Trash2, Camera, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { fetchWithAuth } from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '@/components/ui/Footer';

const ReactIcon = ({ className }) => (
  <svg className={className} viewBox="-11.5 -10.23174 23 20.46348" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="0" cy="0" r="2.05" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

const NextjsIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m15 15-4.823-6H8v6" />
    <path d="M16 9v6" />
  </svg>
);

const VueIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 4 10 16L22 4" />
    <path d="m6.5 4 5.5 9 5.5-9" />
  </svg>
);

const AngularIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 2 6l1.5 11.5L12 22l8.5-4.5L22 6Z" />
    <path d="m12 2-6 13h12Z" />
    <path d="M8 12h8" />
  </svg>
);
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const templatesData = [
  { id: 'react', name: 'React', type: 'Frontend', description: 'A JavaScript library for building user interfaces with component-based architecture', tags: ['UI', 'Frontend', 'JavaScript'], rating: 5 },
  { id: 'next.js', name: 'Next.js', type: 'Fullstack', description: 'The React framework for production with server-side rendering and static site generation', tags: ['React', 'SSR', 'Fullstack'], rating: 5 },
  { id: 'express', name: 'Express', type: 'Backend', description: 'Fast, unopinionated, minimalist web framework for Node.js to build APIs and web applications', tags: ['Node.js', 'API', 'Backend'], rating: 4 },
  { id: 'vue', name: 'Vue.js', type: 'Frontend', description: 'Progressive JavaScript framework for building user interfaces with an approachable learning curve', tags: ['UI', 'Frontend', 'JavaScript'], rating: 5 },
  { id: 'hono', name: 'Hono', type: 'Backend', description: 'Fast, lightweight, built on Web Standards. Support for any JavaScript runtime.', tags: ['Node.js', 'TypeScript', 'Backend'], rating: 4 },
  { id: 'angular', name: 'Angular', type: 'Fullstack', description: 'Angular is a web framework that empowers developers to build fast, reliable applications.', tags: ['Angular', 'Fullstack', 'TypeScript'], rating: 4 },
];

const Dashboard = () => {
  const { user, setUser } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isEditDescModalOpen, setIsEditDescModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ firstName: '', lastName: '', username: '' });
  const [profileError, setProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isEditTitleModalOpen, setIsEditTitleModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const navigate = useNavigate();

  const filteredTemplates = templatesData.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || t.type === filterType;
    return matchesSearch && matchesFilter;
  });



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
        setIsLoadingProjects(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user?._id]);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Only image files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAvatarError('Image must be less than 10MB.');
      return;
    }

    setAvatarError('');
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async () => {
    const file = avatarInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setAvatarError('');

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetchWithAuth('http://localhost:3000/api/v1/profile/update-avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setUser({ ...user, avatar: data.data.avatar });
        setAvatarPreview(null);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
      } else {
        setAvatarError(data.message || 'Failed to upload picture.');
      }
    } catch (err) {
      setAvatarError('Network error. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError('');

    try {
      const res = await fetchWithAuth('http://localhost:3000/api/v1/auth/update-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editProfileForm)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        setIsEditingProfile(false);
      } else {
        setProfileError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setProfileError('Network error. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleStarProject = async (e, projectId, isCurrentlyStarred) => {
    e.stopPropagation();

    // Optimistic UI update
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
      const res = await fetchWithAuth(`http://localhost:3000/api/v1/project/${projectId}/${endpoint}`, {
        method
      });
      const data = await res.json();
      if (!data.success) {
        setUser(previousUser);
      }
    } catch (error) {
      console.error("Failed to toggle star status", error);
      setUser(previousUser);
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

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <header className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                <Code className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-gray-400">
                WeCode
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <ThemeToggle />
              <div
                className="flex items-center space-x-3 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  setEditProfileForm({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    username: user.username || ''
                  });
                  setProfileError('');
                  setIsEditingProfile(false);
                  setIsProfileModalOpen(true);
                }}
              >
                <Avatar className="h-8 w-8 border border-white/20 shadow-sm">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="bg-blue-600 text-white font-medium">
                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user.username.match(/([a-f0-9]{6})$/i) && user.username.length > 6 ? user.username.slice(0, -6) : user.username}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 text-gray-600 dark:text-gray-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">
              {user.username.match(/([a-f0-9]{6})$/i) && user.username.length > 6 ? user.username.slice(0, -6) : user.username}
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Start coding alone or collaborate with your team in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card
            onClick={() => { setIsCreateModalOpen(true); setCreateStep(1); setSelectedTemplate(''); setProjectTitle(''); setProjectDescription(''); }}
            className="bg-white dark:bg-white/5 backdrop-blur-xl border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-500 cursor-pointer group shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <div className="bg-blue-500/10 p-2 rounded-lg mr-3 group-hover:bg-blue-500/20 transition-colors">
                  <Plus className="h-5 w-5 text-blue-400" />
                </div>
                New Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Create a fresh workspace, invite your teammates, and start building something amazing.
              </p>
              <Button
                onClick={(e) => { e.stopPropagation(); setIsCreateModalOpen(true); setCreateStep(1); setSelectedTemplate(''); setProjectTitle(''); setProjectDescription(''); }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300"
              >
                Create Project
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-white/5 backdrop-blur-xl border-gray-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500/50 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-500 cursor-pointer group shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                <div className="bg-purple-500/10 p-2 rounded-lg mr-3 group-hover:bg-purple-500/20 transition-colors">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
                Join Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Have an invite link? Jump straight into an active coding session with your peers.
              </p>
              <Button variant="outline" className="w-full bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 transition-all duration-300">
                Join Session
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-white/5 backdrop-blur-xl border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-gray-400/50 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-500 cursor-pointer group shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                <div className="bg-gray-500/10 p-2 rounded-lg mr-3 group-hover:bg-gray-500/20 transition-colors">
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                Import GitHub Repo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Connect your GitHub account to import an existing repository and start collaborating immediately.
              </p>
              <Button variant="outline" className="w-full bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 transition-all duration-300">
                Import Repository
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-white/5 backdrop-blur-xl border-gray-200 dark:border-white/10 shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
          <CardHeader className="border-b border-gray-200 dark:border-white/10 pb-4">
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-gray-400" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent className={projects.length > 0 ? "pt-6 pb-6" : "pt-8 pb-12"}>
            {isLoadingProjects ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : projects.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {projects.slice(0, 8).map(project => (
                    <div key={project._id} className="p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 cursor-pointer group shadow-sm flex flex-col h-[180px]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-2.5 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                            <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 title={project.title} className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {project.title}
                            </h4>
                            <span className="text-xs text-gray-500 capitalize block truncate">{project.template || 'react'}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-gray-200 dark:bg-white/10 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300 font-medium shrink-0">
                          {project.owner?.username || user?.username}
                        </span>
                      </div>

                      <div className="mt-3 flex-1 overflow-hidden">
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {project.description || <span className="italic opacity-70 cursor-pointer hover:underline" onClick={(e) => {
                            e.stopPropagation();
                            setEditingProjectId(project._id);
                            setEditingDescription('');
                            setIsEditDescModalOpen(true);
                          }}>Add description</span>}
                        </p>
                      </div>

                      <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-200 dark:border-white/10 shrink-0">
                        <span className="text-[10px] text-gray-500">{new Date(project.lastUpdatedAt || project.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-500/10"
                            onClick={(e) => handleStarProject(e, project._id, user?.starredProjects?.includes(project._id))}
                          >
                            <Star className={`h-4 w-4 ${user?.starredProjects?.includes(project._id) ? 'fill-current' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-2" onClick={(e) => { e.stopPropagation(); navigate(`/project/${project._id}`); }}>Open</Button>

                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/10"
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
                                  <div className="h-px bg-gray-200 dark:bg-white/10 my-0.5" />
                                  <button
                                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setProjectToDelete(project._id); setIsDeleteDialogOpen(true); }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Link to="/projects" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center transition-colors">
                    View all projects <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-full mb-4 border border-gray-200 dark:border-white/10">
                  <Code className="h-10 w-10 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-300 mb-1">No active projects</h3>
                <p className="text-gray-600 dark:text-gray-500 max-w-sm">
                  You haven't created or joined any projects yet. Start a new project to get coding!
                </p>
                <Button
                  onClick={() => { setIsCreateModalOpen(true); setCreateStep(1); setSelectedTemplate(''); setProjectTitle(''); setProjectDescription(''); }}
                  className="mt-6 bg-blue-50 dark:bg-white/10 hover:bg-blue-100 dark:hover:bg-white/20 text-blue-600 dark:text-white border border-blue-200 dark:border-white/20 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-xl bg-white dark:bg-[#151c2e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white transition-colors duration-300">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Create New Project</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              {createStep === 1 ? "Select a template to kickstart your new project." : "Give your project a name and description."}
            </DialogDescription>
          </DialogHeader>

          {createStep === 1 ? (
            <div className="py-4">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-gray-50 dark:bg-[#1a2235] border-gray-200 dark:border-white/10 h-10"
                  />
                </div>
                <div className="flex bg-gray-100 dark:bg-[#1a2235] p-1 rounded-lg border border-gray-200 dark:border-white/10 shrink-0 overflow-x-auto hide-scrollbar">
                  {['All', 'Frontend', 'Backend', 'Fullstack'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${filterType === type
                        ? 'bg-white dark:bg-[#2d3748] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/5'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10">
                {filteredTemplates.map((t) => {
                  let IconComponent = Code;
                  if (t.id === 'react') IconComponent = ReactIcon;
                  else if (t.id === 'next.js') IconComponent = NextjsIcon;
                  else if (t.id === 'express') IconComponent = Server;
                  else if (t.id === 'vue') IconComponent = VueIcon;
                  else if (t.id === 'hono') IconComponent = Flame;
                  else if (t.id === 'angular') IconComponent = AngularIcon;

                  return (
                    <div
                      key={t.id}
                      onClick={() => { setSelectedTemplate(t.id); setCreateStep(2); }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col gap-3 group shadow-sm ${selectedTemplate === t.id
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-blue-500/10'
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 dark:bg-white/5 p-2 rounded-full border border-gray-200 dark:border-white/10 group-hover:scale-105 transition-transform">
                            <IconComponent className={`h-6 w-6 ${t.id === 'angular' ? 'text-red-500' : t.id === 'vue' ? 'text-green-500' : t.id === 'hono' ? 'text-orange-500' : 'text-blue-500'}`} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-gray-900 dark:text-white text-base">{t.name}</h4>
                            <Code className="h-3 w-3 text-blue-500 opacity-80" />
                          </div>
                        </div>

                      </div>

                      <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                        {t.description}
                      </p>

                      <div className="flex gap-1.5 mt-auto pt-1 flex-wrap">
                        {t.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Title</Label>
                <Input
                  id="title"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="My Awesome Project"
                  maxLength={100}
                  className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</Label>
                  <span className="text-xs text-gray-500">{projectDescription.length}/1000</span>
                </div>
                <Input
                  id="description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="A brief description of what this does"
                  maxLength={1000}
                  className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white h-11"
                />
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between items-center mt-2">
            {createStep === 2 ? (
              <Button variant="outline" onClick={() => setCreateStep(1)} className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 h-10 px-6">
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button
              onClick={async () => {
                if (createStep === 2) {
                  setIsSubmitting(true);
                  try {
                    const res = await fetchWithAuth('http://localhost:3000/api/v1/project/create-project', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        title: projectTitle,
                        description: projectDescription,
                        template: selectedTemplate
                      })
                    });
                    const data = await res.json();
                    if (data.success) {
                      setProjects(prev => [data.data, ...prev]);
                      setIsCreateModalOpen(false);
                    } else {
                      alert(data.message || 'Failed to create project');
                    }
                  } catch (err) {
                    console.error("Error creating project", err);
                    alert('An error occurred while creating the project');
                  } finally {
                    setIsSubmitting(false);
                  }
                }
              }}
              disabled={(createStep === 2 && !projectTitle.trim()) || isSubmitting}
              className={createStep === 1 ? "hidden" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 h-10 px-6"}
            >
              {isSubmitting ? 'Creating...' : 'Finish & Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#151c2e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white transition-colors duration-300">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-gray-400">
              {isEditingProfile ? 'Edit Profile' : 'User Profile'}
            </DialogTitle>
            {!isEditingProfile && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)} className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 mr-8">
                <Edit3 className="h-4 w-4 mr-2" /> Edit
              </Button>
            )}
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="relative mb-4 group">
              <Avatar className="h-24 w-24 border-4 border-gray-50 dark:border-[#1a2235] shadow-xl">
                <AvatarImage src={avatarPreview || user.avatar} alt={user.username} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {isEditingProfile && (
                <>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    title="Change profile picture"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Avatar upload controls – only visible in edit mode after picking a file */}
            {isEditingProfile && avatarPreview && (
              <div className="flex flex-col items-center gap-2 mb-3 w-full">
                {avatarError && (
                  <p className="text-xs text-red-500 dark:text-red-400">{avatarError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setAvatarPreview(null); if (avatarInputRef.current) avatarInputRef.current.value = ''; setAvatarError(''); }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadAvatar}
                    disabled={isUploadingAvatar}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isUploadingAvatar ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</>
                    ) : (
                      <><Camera className="h-3 w-3" /> Save Photo</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Non-edit-mode avatar error */}
            {isEditingProfile && !avatarPreview && avatarError && (
              <p className="text-xs text-red-500 dark:text-red-400 mb-2">{avatarError}</p>
            )}

            {/* Hint text when in edit mode but no preview yet */}
            {isEditingProfile && !avatarPreview && !avatarError && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Hover avatar to change photo</p>
            )}


            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="w-full space-y-4 mb-6">
                {profileError && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm px-3 py-2 rounded-lg">
                    {profileError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">First Name</label>
                    <Input
                      value={editProfileForm.firstName}
                      onChange={e => setEditProfileForm({ ...editProfileForm, firstName: e.target.value })}
                      required
                      className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Last Name</label>
                    <Input
                      value={editProfileForm.lastName}
                      onChange={e => setEditProfileForm({ ...editProfileForm, lastName: e.target.value })}
                      className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Username</label>
                  <Input
                    value={editProfileForm.username}
                    onChange={e => setEditProfileForm({ ...editProfileForm, username: e.target.value })}
                    required
                    maxLength={15}
                    className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setAvatarPreview(null);
                      setAvatarError('');
                      if (avatarInputRef.current) avatarInputRef.current.value = '';
                    }}
                    className="flex-1 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSavingProfile} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                    {isSavingProfile ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full mb-6 border border-gray-200 dark:border-white/10">
                  @{user.username.match(/([a-f0-9]{6})$/i) && user.username.length > 6 ? user.username.slice(0, -6) : user.username}
                </span>
              </>
            )}

            <div className="w-full grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {projects.length}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Projects<br />Worked On</span>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-yellow-500 dark:text-yellow-400 mb-1">
                  {user.starredProjects?.length || 0}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Starred<br />Projects</span>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {projects.filter(p => p.owner?._id === user._id || p.owner === user._id || p.owner?.username === user.username).length}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Projects as<br />Owner</span>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {projects.filter(p => p.collaborators?.includes(user._id) || (p.owner?._id !== user._id && p.owner !== user._id && p.owner?.username !== user.username)).length}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Projects as<br />Collaborator</span>
              </div>
            </div>
          </div>
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
      <Footer />
    </div>
  );
};

export default Dashboard;
