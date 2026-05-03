import { useCarStore } from '../store/useCarStore';
import { fetchNui } from '../NuiListener';

export const VehicleGrid = () => {
  const seats = useCarStore(state => state.seats);
  const toggleDoor = useCarStore(state => state.toggleDoor);
  const hasHood = useCarStore(state => state.hasHood);
  const hasTrunk = useCarStore(state => state.hasTrunk);
  const vehicleClass = useCarStore(state => state.vehicleClass);

  const handleSeatClick = (seatIndex: number) => {
    fetchNui('seatchange', { seat: seatIndex });
  };

  const handleDoorClick = (doorIndex: number) => {
    fetchNui('doors', { door: doorIndex });
    toggleDoor(doorIndex);
  };

  const handleRoofLock = () => {
    fetchNui('toggleLock');
  };

  const isBus = seats.length > 6 || [10, 11, 12, 17, 20].includes(vehicleClass);
  
  return (
    <div className="relative w-full h-full flex justify-center items-center z-0">
      {/* Background Vehicle Image or Placeholder */}
      {isBus ? (
        <img 
          alt="Bus Top View" 
          className="w-auto h-[400px] object-contain drop-shadow-2xl rotate-[270deg] pointer-events-none opacity-50 transition-opacity" 
          src="img/bus.png" 
        />
      ) : (
        <img 
          alt="Vehicle Top View" 
          className="w-auto h-[280px] object-contain drop-shadow-2xl rotate-[270deg] pointer-events-none opacity-50 transition-opacity" 
          src="img/carro.png" 
        />
      )}
      
      <div className={`absolute pointer-events-auto z-10 flex items-center justify-center gap-2 ${isBus ? 'w-[400px] h-[80px]' : 'w-[260px] h-[140px] flex-col'}`}>
        
        {/* Hood / Trunk buttons for all cars */}
          <>
            {hasHood && (
              <button onClick={() => handleDoorClick(4)} className="door-btn absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-dash-bg/80 border border-blue-400 hover:bg-blue-400/40 flex items-center justify-center transition-all shadow-lg hover:scale-110 z-50">
                <img src="img/frontHood.png" className="w-5 h-5 opacity-80" />
              </button>
            )}
            {hasTrunk && (
              <button onClick={() => handleDoorClick(5)} className="door-btn absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-dash-bg/80 border border-blue-400 hover:bg-blue-400/40 flex items-center justify-center transition-all shadow-lg hover:scale-110 z-50">
                <img src="img/rearHood.png" className="w-5 h-5 opacity-80" />
              </button>
            )}
          </>
        {/* Central Lock */}
        <button onClick={handleRoofLock} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dash-accent/20 border border-dash-accent hover:bg-dash-accent/50 flex items-center justify-center transition-all shadow-lg z-50 hover:scale-110">
          <svg className="w-5 h-5 text-dash-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zM7 7a3 3 0 016 0v2H7V7z"></path></svg>
        </button>

        {/* Dynamic Seats */}
        <div className={`w-full h-full relative ${isBus ? 'grid grid-rows-2 grid-flow-col gap-x-2 gap-y-6 px-4 overflow-x-auto scrollbar-hide items-center justify-start' : 'flex flex-wrap justify-center gap-4 mt-8'}`}>
          {seats.map((seat, idx) => {
            const isOccupied = seat.occupied;
            const bgClass = isOccupied ? 'bg-red-500/80 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-dash-bg/80 border-dash-accent hover:bg-dash-accent/30';
            
            // For simple cars, we position them absolutely. For buses, let them flow in the grid.
            if (!isBus) {
              const positions = [
                "top-[28%] right-[28%] translate-x-1/2 -translate-y-1/2", // Driver
                "bottom-[28%] right-[28%] translate-x-1/2 translate-y-1/2", // Pass
                "top-[28%] left-[28%] -translate-x-1/2 -translate-y-1/2", // Rear L
                "bottom-[28%] left-[28%] -translate-x-1/2 translate-y-1/2", // Rear R
                "top-[50%] left-[10%] -translate-x-1/2 -translate-y-1/2", // Extra 1
                "bottom-[50%] left-[10%] -translate-x-1/2 translate-y-1/2", // Extra 2
              ];
              const posClass = positions[idx] || "relative";
              
              return (
                <button 
                  key={seat.index}
                  onClick={() => handleSeatClick(seat.index)}
                  title={`Seat ${seat.index}`}
                  className={`absolute ${posClass} w-8 h-8 rounded-full ${bgClass} border flex items-center justify-center transition-all shadow-lg z-10 hover:scale-110`}
                >
                  <img src="img/seatFrontLeft.png" className={`w-5 h-5 opacity-100 transition-transform ${idx % 2 === 0 ? 'scale-x-[-1]' : ''}`} />
                </button>
              );
            }

            // Grid layout for buses
            const busMargin = seat.index >= 1 ? 'ml-6' : '';
            return (
              <button 
                key={seat.index}
                onClick={() => handleSeatClick(seat.index)}
                title={`Seat ${seat.index}`}
                className={`w-7 h-7 mx-auto rounded-full ${bgClass} ${busMargin} border flex items-center justify-center transition-all shadow-lg hover:scale-110 flex-shrink-0`}
              >
                <img src="img/seatFrontLeft.png" className={`w-4 h-4 opacity-100 ${idx % 2 === 1 ? 'scale-x-[-1]' : ''}`} />
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
