import { useCarStore } from '../store/useCarStore';
import { fetchNui } from '../NuiListener';

// Door icon paths — index 0-3 use door icons, 4 = hood, 5 = trunk
const DOOR_ICONS: Record<number, string> = {
  0: 'img/doorFrontLeft.png',
  1: 'img/doorFrontRight.png',
  2: 'img/doorRearLeft.png',
  3: 'img/doorRearRight.png',
  4: 'img/frontHood.png',
  5: 'img/rearHood.png',
};

// Door positioning around the vehicle SVG (oriented 270deg = front is right)
// Positions mapped: right = front, left = rear, top = passenger-side, bottom = driver-side
const DOOR_POSITIONS: Record<number, string> = {
  0: 'top-[18%] right-[32%]',        // Driver door (front-left in game = top in UI)
  1: 'bottom-[18%] right-[32%]',     // Passenger door (front-right = bottom in UI)
  2: 'top-[18%] left-[32%]',         // Rear left (top)
  3: 'bottom-[18%] left-[32%]',      // Rear right (bottom)
  4: 'top-1/2 right-[2%] -translate-y-1/2',   // Hood (front)
  5: 'top-1/2 left-[2%] -translate-y-1/2',    // Trunk (rear)
};

const DoorButton = ({ door, onToggle }: { door: { index: number; label: string; open: boolean }; onToggle: (i: number) => void }) => {
  const posClass = DOOR_POSITIONS[door.index] || '';
  const iconSrc = DOOR_ICONS[door.index];

  return (
    <button
      onClick={() => onToggle(door.index)}
      title={door.label}
      className={`absolute ${posClass} z-20 flex items-center justify-center transition-all shadow-lg hover:scale-110 w-8 h-8 rounded-full border ${
        door.open
          ? 'bg-red-500/80 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
          : 'bg-dash-bg/80 border-dash-accent hover:bg-dash-accent/30'
      }`}
    >
      {iconSrc ? (
        <img src={iconSrc} className={`w-5 h-5 transition-transform ${door.open ? 'scale-110' : ''}`} />
      ) : (
        <span className={`text-[8px] font-bold uppercase leading-none ${door.open ? 'text-white' : 'text-dash-accent'}`}>
          {door.label.substring(0, 3)}
        </span>
      )}
    </button>
  );
};

export const VehicleGrid = () => {
  const seats = useCarStore(state => state.seats);
  const doors = useCarStore(state => state.doors);
  const vehicleClass = useCarStore(state => state.vehicleClass);

  const handleSeatClick = (seatIndex: number) => {
    fetchNui('seatchange', { seat: seatIndex });
  };

  const handleDoorClick = (doorIndex: number) => {
    fetchNui('doors', { door: doorIndex });
  };

  const isBus = seats.length > 6 || [10, 11, 12, 17, 20].includes(vehicleClass);
  
  return (
    <div className="relative w-full h-full flex justify-center items-center z-0">
      {/* Background Vehicle Image */}
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
        
        {/* Dynamic Door Buttons */}
        {doors.map(door => (
          <DoorButton key={door.index} door={door} onToggle={handleDoorClick} />
        ))}

        {/* Central Lock */}
        <button onClick={() => fetchNui('toggleLock')} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dash-accent/20 border border-dash-accent hover:bg-dash-accent/50 flex items-center justify-center transition-all shadow-lg z-50 hover:scale-110">
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
