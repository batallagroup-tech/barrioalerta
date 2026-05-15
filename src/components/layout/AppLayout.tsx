import React from 'react';
import { Header } from '../common/Header';
import { BottomNav } from '../common/BottomNav';
import { UserProfile } from '../../types';

interface AppLayoutProps {
  children: React.ReactNode;
  currentUser: UserProfile | null;
  currentView: string;
  setCurrentView: (view: any) => void;
  onOpenZones: () => void;
  onOpenProfile: () => void;
  onOpenSOS: () => void;
  onOpenAlert: () => void;
  hideNavigation?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentUser,
  currentView,
  setCurrentView,
  onOpenZones,
  onOpenProfile,
  onOpenSOS,
  onOpenAlert,
  hideNavigation = false
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden">
      <Header 
        currentUser={currentUser} 
        onOpenZones={onOpenZones} 
        onOpenProfile={onOpenProfile} 
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>

      {!hideNavigation && (
        <BottomNav 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          onOpenSOS={onOpenSOS}
          onOpenAlert={onOpenAlert}
        />
      )}
    </div>
  );
};
