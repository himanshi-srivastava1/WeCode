import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ToggleAIButton = ({ isAIEnabled, toggleAI, className }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleAI}
      className={cn(
        "relative overflow-hidden transition-all duration-300 gap-2 border shadow-sm",
        isAIEnabled 
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-indigo-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
          : "bg-white dark:bg-transparent border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5",
        className
      )}
      title={isAIEnabled ? "Disable AI Assistant" : "Enable AI Assistant"}
    >
      {isAIEnabled ? (
        <>
          <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400 animate-pulse" />
          <span className="font-medium text-xs tracking-wide">AI Enabled</span>
          <span className="absolute inset-0 rounded-md ring-1 ring-inset ring-blue-500/20 animate-pulse pointer-events-none"></span>
        </>
      ) : (
        <>
          <BrainCircuit className="h-4 w-4" />
          <span className="font-medium text-xs tracking-wide">AI Disabled</span>
        </>
      )}
    </Button>
  );
};
