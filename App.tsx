
import React, { useState, useEffect } from 'react';
import { TabType } from './types';
import GradeEntryTab from './components/GradeEntryTab';
import StudentManagementTab from './components/StudentManagementTab';
import ReportsTab from './components/ReportsTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('entry');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const tabs: { id: TabType, label: string, icon: string }[] = [
    { id: 'entry', label: 'Notas', icon: 'fa-pen-to-square' },
    { id: 'students', label: 'Alumnos', icon: 'fa-users' },
    { id: 'reports', label: 'Reportes', icon: 'fa-chart-line' },
  ];

  const handleTabChange = (newTab: TabType) => {
    if (activeTab === newTab) return;
    
    if (isDirty) {
      const confirmLeave = window.confirm("Tienes cambios sin guardar en las calificaciones. ¿Estás seguro de que quieres salir? Se perderán los datos ingresados.");
      if (!confirmLeave) return;
    }
    
    setIsDirty(false); 
    setActiveTab(newTab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-20 md:pb-0">
      {/* Header Responsivo con Branding Completo */}
      <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-40 border-b border-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 md:py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20 hidden sm:flex">
              <i className="fas fa-graduation-cap text-xl md:text-2xl text-white"></i>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-extrabold tracking-tight leading-none mb-0.5">
                EduGrade <span className="text-indigo-200">Pro</span>
              </h1>
              <span className="text-[10px] text-indigo-100/80 font-medium leading-none uppercase tracking-wider mb-0.5">
                Cloud Management
              </span>
              <span className="text-[9px] text-indigo-200/60 font-semibold italic leading-none">
                Design by Mr Iván Lemus
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-white text-indigo-700 shadow-md scale-105' 
                    : 'hover:bg-white/10 text-indigo-50'
                }`}
              >
                <i className={`fas ${tab.icon} text-[10px]`}></i>
                {tab.label.toUpperCase()}
              </button>
            ))}
          </nav>

          {/* Estado de edición en móvil */}
          <div className="md:hidden flex items-center">
            {isDirty && (
              <div className="flex items-center gap-2 bg-amber-400/20 px-2 py-1 rounded-full border border-amber-400/30">
                <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-[8px] font-black text-amber-400 uppercase tracking-tighter">Sin Guardar</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex-grow w-full">
        {activeTab === 'entry' && <GradeEntryTab onNotify={showNotification} onDirtyChange={setIsDirty} />}
        {activeTab === 'students' && <StudentManagementTab onNotify={showNotification} />}
        {activeTab === 'reports' && <ReportsTab onNotify={showNotification} />}
      </main>

      {/* Footer Minimalista */}
      <footer className="hidden md:block w-full py-6 px-4 text-center border-t border-slate-200 bg-white/50">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
          EduGrade Pro &bull; {new Date().getFullYear()} &bull; Secure Academic Cloud
        </p>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-stretch h-16 shadow-[0_-4px_15px_-2px_rgba(0,0,0,0.08)] z-50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 transition-all relative ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            {activeTab === tab.id && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-indigo-600 rounded-b-full shadow-[0_1px_4px_rgba(79,70,229,0.4)]"></span>
            )}
            <i className={`fas ${tab.icon} text-lg mb-1 ${activeTab === tab.id ? 'scale-110' : ''}`}></i>
            <span className={`text-[10px] font-extrabold uppercase tracking-tight ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Notificaciones */}
      {notification && (
        <div className={`fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 px-5 py-3 rounded-2xl shadow-2xl z-50 animate-slideUp flex items-center gap-3 whitespace-nowrap border-b-4 ${
          notification.type === 'success' ? 'bg-indigo-600 text-white border-indigo-800' : 'bg-rose-500 text-white border-rose-700'
        }`}>
          <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span className="text-xs font-black uppercase tracking-widest">{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
