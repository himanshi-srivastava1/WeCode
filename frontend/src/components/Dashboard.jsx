import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Code, Users, Settings, Plus, FolderOpen, Server, Flame } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
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
              <div className="flex items-center space-x-3 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 transition-colors duration-300">
                <Avatar className="h-8 w-8 border border-white/20 shadow-sm">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="bg-blue-600 text-white font-medium">
                    {user.username.charAt(0).toUpperCase()}
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
          <CardContent className="pt-8 pb-12">
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
          </CardContent>
        </Card>
      </main>

      {/* Create Project Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-xl bg-white dark:bg-[#151c2e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white transition-colors duration-300">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Create New Project</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              {createStep === 1 ? "Select a template to kickstart your new project." : "Give your project a name and description."}
            </DialogDescription>
          </DialogHeader>

          {createStep === 1 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6">
              {['react', 'next.js', 'express', 'vue', 'hono', 'angular'].map((t) => {
                let IconComponent = Code;
                if (t === 'react') IconComponent = ReactIcon;
                else if (t === 'next.js') IconComponent = NextjsIcon;
                else if (t === 'express') IconComponent = Server;
                else if (t === 'vue') IconComponent = VueIcon;
                else if (t === 'hono') IconComponent = Flame;
                else if (t === 'angular') IconComponent = AngularIcon;

                return (
                  <div
                    key={t}
                    onClick={() => { setSelectedTemplate(t); setCreateStep(2); }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 shadow-sm ${selectedTemplate === t
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-blue-500/20'
                        : 'border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 hover:-translate-y-1'
                      }`}
                  >
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-3 rounded-full">
                      <IconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-semibold capitalize text-gray-800 dark:text-gray-200 text-sm">{t}</span>
                  </div>
                )
              })}
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
                  className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</Label>
                <Input
                  id="description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="A brief description of what this does"
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
              onClick={() => {
                if (createStep === 2) {
                  console.log("Create project with:", selectedTemplate, projectTitle, projectDescription);
                  // we will add functionality later
                  setIsCreateModalOpen(false);
                }
              }}
              disabled={createStep === 2 && !projectTitle.trim()}
              className={createStep === 1 ? "hidden" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 h-10 px-6"}
            >
              Finish & Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
