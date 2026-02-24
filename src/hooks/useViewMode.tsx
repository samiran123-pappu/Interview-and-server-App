"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type ViewMode = "interviewer" | "candidate" | null;

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isInterviewerView: boolean;
  isCandidateView: boolean;
  hasChosenMode: boolean;
}

const ViewModeContext = createContext<ViewModeContextType>({
  viewMode: null,
  setViewMode: () => {},
  isInterviewerView: false,
  isCandidateView: false,
  hasChosenMode: false,
});

const STORAGE_KEY = "codeinterview-view-mode";

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ViewMode;
    if (stored === "interviewer" || stored === "candidate") {
      setViewModeState(stored);
    }
    setHydrated(true);
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    if (mode) {
      localStorage.setItem(STORAGE_KEY, mode);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Don't render children until hydrated to avoid flash
  if (!hydrated) return null;

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        setViewMode,
        isInterviewerView: viewMode === "interviewer",
        isCandidateView: viewMode === "candidate",
        hasChosenMode: viewMode !== null,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
