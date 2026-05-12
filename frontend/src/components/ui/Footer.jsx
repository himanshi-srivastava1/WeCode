import { Code } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left — branding */}
          <div className="flex flex-col items-center sm:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-md shadow-md shadow-blue-500/20">
                <Code className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-gray-400">
                WeCode
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Real-time collaborative code editor
            </p>
          </div>

          {/* Right — developer credits */}
          <div className="flex flex-col items-center sm:items-end gap-0.5 text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Developed by{' '}
              <span className="font-semibold text-gray-800 dark:text-white">
                Himanshi Srivastava
              </span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              himansri04@gmail.com
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              © {new Date().getFullYear()} WeCode. Open Source.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
