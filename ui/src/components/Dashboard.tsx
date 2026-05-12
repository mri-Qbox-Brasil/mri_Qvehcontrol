import { useState, useRef, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useCarStore } from '../store/useCarStore';
import { fetchNui } from '../NuiListener';
import { VehicleGrid } from './VehicleGrid';
import { ExtrasPanel } from './ExtrasPanel';
import { Toast } from './Toast';

export const Dashboard = () => {
  const visible = useCarStore(state => state.visible);
  const positionType = useCarStore(state => state.positionType);
  const customX = useCarStore(state => state.customX);
  const customY = useCarStore(state => state.customY);
  const setPosition = useCarStore(state => state.setPosition);
  const isAdmin = useCarStore(state => state.isAdmin);
  const activeTab = useCarStore(state => state.activeTab);
  const setActiveTab = useCarStore(state => state.setActiveTab);
  const enableExtras = useCarStore(state => state.enableExtras);
  const enableLiveries = useCarStore(state => state.enableLiveries);
  const extras = useCarStore(state => state.extras);
  const liveries = useCarStore(state => state.liveries);
  const showCustomizeTab = (enableExtras && extras.length > 0) || (enableLiveries && liveries.length > 0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const scalerRef = useRef<HTMLElement>(null);
  const livePos = useRef({ x: customX, y: customY });

  // Sync livePos when store changes (load/preset)
  useEffect(() => {
    if (!isDragging) {
      livePos.current = { x: customX, y: customY };
      if (scalerRef.current && positionType === 'custom') {
        scalerRef.current.style.left = `${customX}px`;
        scalerRef.current.style.top = `${customY}px`;
      }
    }
  }, [customX, customY, isDragging, positionType]);

  // Handle Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || positionType !== 'custom') return;
      
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      
      livePos.current = { x: newX, y: newY };
      if (scalerRef.current) {
        scalerRef.current.style.left = `${newX}px`;
        scalerRef.current.style.top = `${newY}px`;
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        const { x, y } = livePos.current;
        setPosition('custom', x, y);
        fetchNui('savePosition', { type: 'custom', x, y });
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, positionType, setPosition]);

  const startDrag = (e: ReactMouseEvent) => {
    if (positionType !== 'custom') return;
    
    if (scalerRef.current) {
      const rect = scalerRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      setIsDragging(true);
    }
  };

  const selectPreset = (preset: string) => {
    if (preset === 'custom') {
      if (scalerRef.current) {
        const rect = scalerRef.current.getBoundingClientRect();
        setPosition('custom', rect.left, rect.top);
        fetchNui('savePosition', { type: 'custom', x: rect.left, y: rect.top });
      }
    } else {
      setPosition(preset, 0, 0);
      fetchNui('savePosition', { type: preset, x: 0, y: 0 });
      setMenuOpen(false);
    }
  };

  const saveGlobal = () => {
    fetchNui('setGlobalPosition', { type: positionType, x: customX, y: customY });
    setMenuOpen(false);
  };

  if (!visible) return null;

  // Position Styling
  let posStyle: React.CSSProperties = { position: 'absolute' };
  switch (positionType) {
    case 'center': posStyle = { ...posStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }; break;
    case 'center-left': posStyle = { ...posStyle, top: '50%', left: '20px', transform: 'translateY(-50%)' }; break;
    case 'center-right': posStyle = { ...posStyle, top: '50%', right: '20px', transform: 'translateY(-50%)' }; break;
    case 'bottom-right': posStyle = { ...posStyle, bottom: '20px', right: '20px' }; break;
    case 'top-right': posStyle = { ...posStyle, top: '20px', right: '20px' }; break;
    case 'bottom-left': posStyle = { ...posStyle, bottom: '20px', left: '20px' }; break;
    case 'top-left': posStyle = { ...posStyle, top: '20px', left: '20px' }; break;
    case 'custom': posStyle = { ...posStyle, top: `${livePos.current.y}px`, left: `${livePos.current.x}px` }; break;
    default: posStyle = { ...posStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }; break;
  }

  return (
    <div className="absolute inset-0 pointer-events-none w-screen h-screen">
      <main 
        ref={scalerRef}
        style={{
          ...posStyle,
          willChange: isDragging ? 'top, left' : 'auto',
          opacity: isDragging ? 0.9 : 1,
          transform: `${posStyle.transform || ''} scale(${isDragging ? 1.02 : 1}) translate3d(0,0,0)`,
          transition: isDragging ? 'none' : 'top 0.3s, left 0.3s, transform 0.3s, opacity 0.3s'
        }}
        className={`dashboard-scaler-shadow ${isDragging ? 'cursor-grabbing' : ''}`}
      >
        <div style={{backgroundColor: viewMode === '3d' ? 'rgba(17, 17, 17, 0.4)' : '#111111'}} className="dashboard-scaler-inner">
        
        <aside className="w-16 bg-dash-sidebar flex flex-col items-center py-6 border-r border-zinc-800 pointer-events-auto z-50 rounded-l-[13px]">
          <DashboardTime />
          <nav className="flex flex-col gap-4 text-zinc-500 relative mt-4">
            <button
              onClick={() => setActiveTab('main')}
              className={`p-2 rounded-xl transition-colors hover:bg-white/10 ${activeTab === 'main' ? 'bg-dash-accent/20 text-dash-accent' : ''}`}
              title="Tela Inicial"
            >
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-car-icon lucide-car"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
            </button>
            {showCustomizeTab && (
              <button
                onClick={() => setActiveTab('customize')}
                className={`p-2 rounded-xl transition-colors hover:bg-white/10 ${activeTab === 'customize' ? 'bg-dash-accent/20 text-dash-accent' : ''}`}
                title="Extras & Plotagens"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              </button>
            )}
          </nav>
          
          <div className="mt-auto relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 rounded-xl transition-colors hover:bg-white/10 text-zinc-500 ${menuOpen ? 'bg-white/10 text-white' : ''}`}
              title="Configurações"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute left-[110%] bottom-0 bg-[#1a1a1a] border border-zinc-700/50 rounded-xl p-3 shadow-2xl w-48 z-[100]">
                <h3 className="text-white text-xs font-bold uppercase mb-2 tracking-widest border-b border-zinc-800 pb-1">Position</h3>
                <div className="flex flex-col gap-1">
                  {['center', 'center-right', 'center-left', 'bottom-right', 'top-right', 'bottom-left', 'top-left'].map(p => (
                    <button key={p} onClick={() => selectPreset(p)} className={`text-left text-xs px-2 py-1.5 rounded-md hover:bg-dash-accent/20 transition-colors ${positionType === p ? 'bg-dash-accent/30 text-dash-accent' : 'text-zinc-400'}`}>
                      {p.replace('-', ' ').toUpperCase()}
                    </button>
                  ))}
                  <button onClick={() => selectPreset('custom')} className={`text-left text-xs px-2 py-1.5 rounded-md hover:bg-dash-accent/20 transition-colors ${positionType === 'custom' ? 'bg-dash-accent/30 text-dash-accent' : 'text-zinc-400'}`}>
                    CUSTOM (DRAG HEADER)
                  </button>
                </div>
                {isAdmin && (
                  <div className="mt-3 pt-2 border-t border-zinc-800">
                    <button onClick={saveGlobal} className="w-full bg-red-500/20 text-red-500 hover:bg-red-500/40 text-xs font-bold px-2 py-2 rounded-md transition-colors uppercase">
                      Set Global Default
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        <section className="flex-1 p-4 pb-6 flex flex-col relative pointer-events-auto">
          <Toast />
          <header className={`flex justify-between items-start mb-4 ${positionType === 'custom' ? 'cursor-grab active:cursor-grabbing' : ''}`} onMouseDown={startDrag}>
            <DashboardHeader />
          </header>
          {activeTab === 'main' ? (
            <DashboardContent viewMode={viewMode} setViewMode={setViewMode} />
          ) : (
            <ExtrasPanel />
          )}
        </section>
        
        </div>
      </main>
    </div>
  );
};

const DashboardTime = () => {
  const hour = useCarStore(state => state.hour);
  const minute = useCarStore(state => state.minute);
  return (
    <div className="flex flex-col items-center gap-1 mb-8">
      <span className="text-2xl font-bold text-white">{hour}</span>
      <span className="text-2xl font-bold opacity-80 text-white">{minute}</span>
    </div>
  );
};

const DashboardHeader = () => {
  const vehName = useCarStore(state => state.vehName);
  const locales = useCarStore(state => state.locales);
  const autopilotActive = useCarStore(state => state.autopilotActive);

  return (
    <>
      <div className="flex items-center gap-3">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
        </svg>
        <div className="custom-tooltip" data-tooltip={vehName}>
          <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest leading-none">{locales.vehicle}</p>
          <p className="text-sm font-bold uppercase text-white">{vehName}</p>
        </div>
      </div>
      {autopilotActive && (
        <div className="flex items-center gap-2 px-3 py-1 bg-dash-accent/20 border border-dash-accent rounded-full animate-pulse pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-dash-accent"></div>
          <span className="text-xs font-bold text-dash-accent uppercase tracking-widest">Autopilot</span>
        </div>
      )}
    </>
  );
};

const DashboardContent = ({ viewMode, setViewMode }: { viewMode: '2d' | '3d', setViewMode: (m: '2d' | '3d') => void }) => {
  const state = useCarStore();
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <div className="flex gap-1.5 z-50 pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
          <button 
            onClick={() => { setViewMode('2d'); fetchNui('setCamera', { mode: '2d' }); }}
            className={`w-8 h-4 rounded-sm border text-[8px] font-bold flex items-center justify-center transition-all ${viewMode === '2d' ? 'bg-dash-accent border-dash-accent text-black' : 'bg-transparent border-zinc-600 text-zinc-500 hover:text-white'}`}
          >
            2D
          </button>
          {state.enable3DViewer && (
            <button 
              onClick={() => { setViewMode('3d'); fetchNui('setCamera', { mode: '3d' }); }}
              className={`w-8 h-4 rounded-sm border text-[8px] font-bold flex items-center justify-center transition-all ${viewMode === '3d' ? 'bg-dash-accent border-dash-accent text-black' : 'bg-transparent border-zinc-600 text-zinc-500 hover:text-white'}`}
            >
              3D
            </button>
          )}
        </div>
      </div>

      <div className={`h-[320px] relative flex items-center justify-center transition-opacity duration-300 ${viewMode === '3d' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <VehicleGrid />
        <div className="absolute right-4 flex flex-col items-center gap-2 z-20">
          <div className="fuel-gauge-container">
            <div className="fuel-level" style={{ height: `${state.fuel}%` }}></div>
          </div>
          <svg className="w-4 h-4 text-dash-accent" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.85 14.85l-1.41-1.41L15.59 15.3l-1.41-1.42 1.85-1.85a3.13 3.13 0 000-4.42L11 2.59a.9.9 0 00-1.27 0L4.85 7.46a3.13 3.13 0 000 4.42L6.71 13.7l-1.41 1.41 1.85 1.85a.9.9 0 001.27 0l2.58-2.58 1.42 1.41 1.85 1.85a.9.9 0 001.27 0zM10.3 5.41l3.59 3.59a1.13 1.13 0 010 1.59L10.3 14.18 6.71 10.59a1.13 1.13 0 010-1.59zM19 18h-4v2h4v-2z"></path>
          </svg>
        </div>
      </div>

      <nav className="grid grid-cols-5 gap-1.5 mb-3 z-20">
        <button onClick={() => fetchNui('autopilot')} className={`glass-button rounded-lg h-10 flex flex-col items-center justify-center gap-1 hover:ring-1 transition-all ${state.autopilotActive ? 'ring-dash-accent text-dash-accent bg-dash-accent/10' : 'ring-dash-accent/50 text-zinc-400'}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          <span className="font-bold text-[8px] uppercase">Auto</span>
        </button>
        <button onClick={() => fetchNui('ignition')} className={`glass-button rounded-lg h-10 flex items-center justify-center gap-1.5 hover:ring-1 ring-dash-accent/50 transition-all ${state.engineRunning ? 'text-dash-accent' : 'text-zinc-400'}`}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 13h1v1h-1v-1zm10 0h1v1h-1v-1zm-6-2h2v2h-2v-2zm-4 4h1v1h-1v-1zm10 0h1v1h-1v-1zm-1-8v-1h-1v1h1zm-10 0v-1h1v1h-1zm5 0h2v1h-2v-1z"></path></svg>
          <span className="font-bold text-[9px] uppercase">{state.locales.engine}</span>
        </button>
        <button onClick={() => fetchNui('interiorLight')} className="glass-button rounded-xl h-12 flex flex-col items-center justify-center leading-tight hover:ring-1 ring-dash-accent/50 transition-all text-zinc-400">
          <svg className="w-4 h-4 mb-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.243 3.05a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM17 10a1 1 0 011 1h1a1 1 0 110 2h-1a1 1 0 110-2h1V10zM10 18a1 1 0 011-1v-1a1 1 0 11-2 0v1a1 1 0 011 1zM5.05 14.243a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zm1.414-8.486a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 7a3 3 0 100 6 3 3 0 000-6z"></path></svg>
          <span className="font-bold text-[8px] uppercase">{state.locales.interior_light}</span>
        </button>
        <button onClick={() => fetchNui('toggleLights')} className="glass-button rounded-lg h-10 flex items-center justify-center gap-1.5 hover:ring-1 ring-dash-accent/50 transition-all text-zinc-400">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 13h7v-2h-7v2zm0 4h7v-2h-7v2zm0-8h7V7h-7v2zM2 12c0 3.31 2.69 6 6 6h2v-2H8c-2.21 0-4-1.79-4-4s1.79-4 4-4h2V6H8c-3.31 0-6 2.69-6 6z"></path></svg>
          <span className="font-bold text-[9px] uppercase">{state.locales.lights}</span>
        </button>
        <button onClick={() => fetchNui('windows', { window: 0, door: 0 })} className="glass-button rounded-lg h-10 flex items-center justify-center gap-1.5 hover:ring-1 ring-dash-accent/50 transition-all text-zinc-400">
          <img src="img/windowFrontLeft.png" className="w-4 h-4 opacity-70" />
          <span className="font-bold text-[9px] uppercase">Win</span>
        </button>
      </nav>

      <footer className="grid grid-cols-3 gap-2 z-20">
        <div className="bg-dash-card rounded-xl p-2.5 flex items-center gap-2 border border-zinc-800/50 shadow-inner group transition-all hover:ring-1 hover:ring-dash-accent/30">
          <div className="bg-dash-accent text-black p-2 rounded-lg group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" fillRule="evenodd"></path></svg>
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <div className="custom-tooltip" data-tooltip={state.street}>
              <p className="text-zinc-500 font-bold text-[8px] truncate">{state.street}</p>
            </div>
            <div className="custom-tooltip" data-tooltip={state.zone}>
              <p className="text-lg font-black truncate leading-tight text-white">{state.zone}</p>
            </div>
          </div>
        </div>
        <div className="bg-dash-card rounded-xl p-2.5 flex items-center justify-center gap-2 border border-zinc-800/50 shadow-inner">
          <div className="flex items-center gap-2">
            <svg className={`w-6 h-6 ${state.engineRunning ? 'text-dash-accent' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-2V5c0-.55.45-1 1-1s1 .45 1 1v6h-2z"></path>
            </svg>
            <div className="flex flex-col">
              <span className="text-[8px] font-bold uppercase text-zinc-500 flex items-center">
                <span className="mr-1">◀</span> <span>{state.locales.engine}</span>
              </span>
              <span className="text-lg font-black leading-none text-white">{Math.round(state.engineTemp)}<span className="text-xs ml-0.5 font-medium text-zinc-500">°</span></span>
            </div>
          </div>
        </div>
        <div className="bg-dash-card rounded-xl p-2.5 flex items-center justify-between border border-zinc-800/50 shadow-inner">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <div className={`p-1.5 rotate-45 rounded-md flex items-center justify-center transition-all duration-300 flex-shrink-0 ${state.hazardActive ? 'bg-red-600 animate-pulse' : 'bg-zinc-800'}`}>
              <svg className="w-3 h-3 text-white -rotate-45" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span className="font-bold text-[8px] uppercase text-zinc-300 truncate">{state.locales.emergency}</span>
          </div>
          <label className="switch scale-[0.6] transform origin-right flex-shrink-0 pointer-events-auto">
            <input type="checkbox" checked={state.hazardActive} onChange={(e) => {
              state.toggleHazard();
              fetchNui('toggleHazard', { state: e.target.checked });
            }} />
            <span className="slider"></span>
          </label>
        </div>
      </footer>
    </>
  );
};
