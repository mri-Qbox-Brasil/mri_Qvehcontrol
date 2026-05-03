import { useCarStore } from '../store/useCarStore';

export const DevTools = () => {
  const state = useCarStore();
  
  // Only show in browser
  if ((window as any).invokeNative || (window as any).GetParentResourceName) return null;

  const toggleClass = () => {
    const classes = [0, 8, 12, 17, 20]; // Test cases: Car, Moto, Van, Bus, Commercial
    const currentIndex = classes.indexOf(state.vehicleClass);
    const nextClass = classes[(currentIndex + 1) % classes.length];
    state.updateStats({ vehicleClass: nextClass });
    
    // Auto-update seats for bus test
    if (nextClass === 17 || nextClass === 20) {
      state.updateSeats(Array.from({ length: 16 }, (_, i) => ({ index: i, occupied: i % 3 === 0 })));
    } else if (nextClass === 8) {
      state.updateSeats([{ index: -1, occupied: true }, { index: 0, occupied: false }]);
    } else {
      state.updateSeats([
        { index: -1, occupied: true },
        { index: 0, occupied: false },
        { index: 1, occupied: false },
        { index: 2, occupied: false }
      ]);
    }
  };

  const getClassLabel = (id: number) => {
    const labels: Record<number, string> = {
      0: 'Compact', 1: 'Sedan', 2: 'SUV', 3: 'Coupe', 4: 'Muscle', 
      5: 'Classic', 6: 'Sport', 7: 'Super', 8: 'Moto', 9: 'Offroad', 
      10: 'Indust', 11: 'Utility', 12: 'Van', 13: 'Cycle', 14: 'Boat', 
      15: 'Heli', 16: 'Plane', 17: 'Service', 18: 'Emerg', 19: 'Milit', 
      20: 'Commerc', 21: 'Train', 22: 'OpenW'
    };
    return labels[id] || 'Unknown';
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/80 border border-white/20 p-4 rounded-xl backdrop-blur-md pointer-events-auto flex flex-col gap-2">
      <h4 className="text-white text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 mb-1">UI DevTools</h4>
      
      <button 
        onClick={() => state.setVisible(!state.visible)}
        className="bg-dash-accent text-black text-[10px] font-bold px-3 py-1.5 rounded hover:opacity-80 transition-opacity uppercase"
      >
        Toggle Visibility
      </button>

      <button 
        onClick={toggleClass}
        className="bg-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-white/20 transition-colors uppercase"
      >
        Class: {state.vehicleClass} - {getClassLabel(state.vehicleClass)}
      </button>

      <button 
        onClick={() => state.updateStats({ fuel: Math.max(0, state.fuel - 10) })}
        className="bg-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-white/20 transition-colors uppercase"
      >
        Decrease Fuel
      </button>

      <button 
        onClick={() => state.updateStats({ enable3DViewer: !state.enable3DViewer })}
        className="bg-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-white/20 transition-colors uppercase"
      >
        Toggle 3D Button: {state.enable3DViewer ? 'ON' : 'OFF'}
      </button>

      <div className="flex gap-2">
        <button 
          onClick={() => state.updateStats({ hasHood: !state.hasHood })}
          className="flex-1 bg-white/10 text-white text-[8px] font-bold px-2 py-1 rounded hover:bg-white/20 transition-colors uppercase"
        >
          Hood: {state.hasHood ? 'Y' : 'N'}
        </button>
        <button 
          onClick={() => state.updateStats({ hasTrunk: !state.hasTrunk })}
          className="flex-1 bg-white/10 text-white text-[8px] font-bold px-2 py-1 rounded hover:bg-white/20 transition-colors uppercase"
        >
          Trunk: {state.hasTrunk ? 'Y' : 'N'}
        </button>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => state.updateStats({ engineTemp: Math.min(150, state.engineTemp + 5) })}
          className="flex-1 bg-white/10 text-white text-[8px] font-bold px-2 py-1 rounded hover:bg-white/20 uppercase"
        >
          Temp +
        </button>
        <button 
          onClick={() => state.updateStats({ engineTemp: Math.max(0, state.engineTemp - 5) })}
          className="flex-1 bg-white/10 text-white text-[8px] font-bold px-2 py-1 rounded hover:bg-white/20 uppercase"
        >
          Temp -
        </button>
      </div>

      <button 
        onClick={() => state.updateStats({ street: 'Grove Street', zone: 'Los Santos' })}
        className="bg-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-white/20 uppercase"
      >
        Mock Location
      </button>
      
      <p className="text-[9px] text-zinc-500 mt-2">Browser Mock Mode Active</p>
    </div>
  );
};
