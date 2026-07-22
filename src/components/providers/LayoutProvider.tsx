import { createContext, useContext, useState } from 'react';

interface LayoutProviderState {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (isOpen: boolean) => void;
}

const initialState: LayoutProviderState = {
  isSidebarCollapsed: false,
  toggleSidebar: () => null,
  isMobileSidebarOpen: false,
  setMobileSidebarOpen: () => null,
};

const LayoutContext = createContext<LayoutProviderState>(initialState);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  // TODO: In the future, persist isSidebarCollapsed to a User Preferences backend service
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const value = {
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined)
    throw new Error('useLayout must be used within a LayoutProvider');
  return context;
};
