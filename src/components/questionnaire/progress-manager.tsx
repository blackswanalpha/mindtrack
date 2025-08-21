'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Clock, 
  RefreshCw, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressData {
  questionnaire_id: number;
  responses: Record<number, any>;
  current_question_index: number;
  completion_percentage: number;
  last_saved: string;
  session_id: string;
  metadata?: {
    time_spent: number;
    questions_answered: number;
    adaptive_score?: number;
    risk_indicators?: number;
  };
}

export interface ProgressManagerProps {
  questionnaireId: number;
  responses: Record<number, any>;
  currentQuestionIndex: number;
  totalQuestions: number;
  onLoadProgress?: (data: ProgressData) => void;
  onClearProgress?: () => void;
  autoSaveInterval?: number; // in milliseconds
  className?: string;
}

export const ProgressManager: React.FC<ProgressManagerProps> = ({
  questionnaireId,
  responses,
  currentQuestionIndex,
  totalQuestions,
  onLoadProgress,
  onClearProgress,
  autoSaveInterval = 30000, // 30 seconds default
  className
}) => {
  const [savedProgress, setSavedProgress] = useState<ProgressData | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [sessionStartTime] = useState<Date>(new Date());
  const [timeSpent, setTimeSpent] = useState(0);

  // Generate session ID
  const [sessionId] = useState(() => 
    `session_${questionnaireId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Update time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Load existing progress on mount
  useEffect(() => {
    loadSavedProgress();
  }, [questionnaireId]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const interval = setInterval(() => {
      if (Object.keys(responses).length > 0) {
        saveProgress(false); // Silent save
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [responses, currentQuestionIndex, autoSaveEnabled, autoSaveInterval]);

  const getStorageKey = (type: 'progress' | 'session') => {
    return `mindtrack_${type}_${questionnaireId}`;
  };

  const loadSavedProgress = () => {
    try {
      const saved = localStorage.getItem(getStorageKey('progress'));
      if (saved) {
        const progressData: ProgressData = JSON.parse(saved);
        setSavedProgress(progressData);
        setLastSaveTime(new Date(progressData.last_saved));
      }
    } catch (error) {
      console.error('Failed to load saved progress:', error);
    }
  };

  const saveProgress = async (showNotification = true) => {
    if (isAutoSaving) return;

    setIsAutoSaving(true);
    try {
      const progressData: ProgressData = {
        questionnaire_id: questionnaireId,
        responses,
        current_question_index: currentQuestionIndex,
        completion_percentage: totalQuestions > 0 ? (Object.keys(responses).length / totalQuestions) * 100 : 0,
        last_saved: new Date().toISOString(),
        session_id: sessionId,
        metadata: {
          time_spent: timeSpent,
          questions_answered: Object.keys(responses).length,
        }
      };

      // Save to localStorage
      localStorage.setItem(getStorageKey('progress'), JSON.stringify(progressData));
      
      // Save session data
      const sessionData = {
        session_id: sessionId,
        started_at: sessionStartTime.toISOString(),
        last_activity: new Date().toISOString(),
        questionnaire_id: questionnaireId
      };
      localStorage.setItem(getStorageKey('session'), JSON.stringify(sessionData));

      // In a real app, also save to server:
      // await fetch('/api/progress/save', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(progressData)
      // });

      setSavedProgress(progressData);
      setLastSaveTime(new Date());

      if (showNotification) {
        // You could show a toast notification here
        console.log('Progress saved successfully');
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const loadProgress = () => {
    if (savedProgress && onLoadProgress) {
      onLoadProgress(savedProgress);
    }
  };

  const clearProgress = () => {
    try {
      localStorage.removeItem(getStorageKey('progress'));
      localStorage.removeItem(getStorageKey('session'));
      setSavedProgress(null);
      setLastSaveTime(null);
      
      if (onClearProgress) {
        onClearProgress();
      }
    } catch (error) {
      console.error('Failed to clear progress:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatLastSaved = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  const currentCompletion = totalQuestions > 0 ? (Object.keys(responses).length / totalQuestions) * 100 : 0;
  const hasUnsavedChanges = savedProgress && (
    savedProgress.current_question_index !== currentQuestionIndex ||
    Object.keys(savedProgress.responses).length !== Object.keys(responses).length
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Session Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Session Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Time Spent</p>
              <p className="font-medium">{formatTime(timeSpent)}</p>
            </div>
            <div>
              <p className="text-gray-500">Completion</p>
              <p className="font-medium">{Math.round(currentCompletion)}%</p>
            </div>
            <div>
              <p className="text-gray-500">Questions</p>
              <p className="font-medium">{Object.keys(responses).length} / {totalQuestions}</p>
            </div>
            <div>
              <p className="text-gray-500">Auto-save</p>
              <div className="flex items-center gap-2">
                <Badge variant={autoSaveEnabled ? "default" : "secondary"} className="text-xs">
                  {autoSaveEnabled ? "On" : "Off"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  className="p-1 h-auto"
                >
                  {autoSaveEnabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => saveProgress(true)}
                disabled={isAutoSaving}
                className="flex items-center gap-2"
                size="sm"
              >
                {isAutoSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Progress
                  </>
                )}
              </Button>
              
              {lastSaveTime && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Last saved: {formatLastSaved(lastSaveTime)}
                </div>
              )}
              
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Unsaved changes
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {savedProgress && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearProgress}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Progress Alert */}
      {savedProgress && savedProgress.current_question_index !== currentQuestionIndex && (
        <Alert className="border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Previous session found</p>
                <p className="text-sm">
                  You were at question {savedProgress.current_question_index + 1} with {Object.keys(savedProgress.responses).length} answers saved.
                  Last saved: {formatLastSaved(new Date(savedProgress.last_saved))}
                </p>
              </div>
              <Button
                onClick={loadProgress}
                size="sm"
                className="ml-4"
              >
                Resume
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Auto-save Status */}
      {autoSaveEnabled && (
        <div className="text-xs text-gray-500 text-center">
          Auto-saving every {Math.round(autoSaveInterval / 1000)} seconds
        </div>
      )}
    </div>
  );
};

// Hook for managing progress in questionnaire components
export const useProgressManager = (questionnaireId: number) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  
  const saveProgress = async (
    responses: Record<number, any>,
    currentQuestionIndex: number,
    totalQuestions: number,
    metadata?: any
  ) => {
    const data: ProgressData = {
      questionnaire_id: questionnaireId,
      responses,
      current_question_index: currentQuestionIndex,
      completion_percentage: totalQuestions > 0 ? (Object.keys(responses).length / totalQuestions) * 100 : 0,
      last_saved: new Date().toISOString(),
      session_id: `session_${questionnaireId}_${Date.now()}`,
      metadata
    };

    try {
      localStorage.setItem(`mindtrack_progress_${questionnaireId}`, JSON.stringify(data));
      setProgressData(data);
      return true;
    } catch (error) {
      console.error('Failed to save progress:', error);
      return false;
    }
  };

  const loadProgress = (): ProgressData | null => {
    try {
      const saved = localStorage.getItem(`mindtrack_progress_${questionnaireId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setProgressData(data);
        return data;
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
    return null;
  };

  const clearProgress = () => {
    try {
      localStorage.removeItem(`mindtrack_progress_${questionnaireId}`);
      setProgressData(null);
      return true;
    } catch (error) {
      console.error('Failed to clear progress:', error);
      return false;
    }
  };

  return {
    progressData,
    saveProgress,
    loadProgress,
    clearProgress
  };
};

export default ProgressManager;
