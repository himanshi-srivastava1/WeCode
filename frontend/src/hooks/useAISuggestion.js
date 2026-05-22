import { useState, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { toast } from 'sonner';

export const useAISuggestion = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const getCompletion = useCallback(async (prefix, suffix, language) => {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/v1/ai/code-completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, suffix, language })
      });
      const data = await res.json();
      if (data.success) {
        return data.data.completion;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch AI completion:', err);
      return null;
    }
  }, []);

  const getSuggestion = useCallback(async (code, prompt, language) => {
    setIsGenerating(true);
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/v1/ai/code-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, prompt, language })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("AI suggestion generated!");
        return data.data.suggestion;
      } else {
        toast.error(data.message || "Failed to generate suggestion.");
        return null;
      }
    } catch (err) {
      console.error('Failed to fetch AI suggestion:', err);
      toast.error("Failed to connect to AI service.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { getCompletion, getSuggestion, isGenerating };
};
