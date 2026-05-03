import { create } from 'zustand'

export interface Locales {
  vehicle?: string;
  unknown?: string;
  engine?: string;
  emergency?: string;
  lock?: string;
  seat?: string;
  interior_light?: string;
  light?: string;
  lights?: string;
}

export interface SeatInfo {
  index: number; // e.g. -1 for driver, 0 for passenger, etc.
  occupied: boolean;
}

interface CarState {
  visible: boolean;
  locales: Locales;
  fuel: number;
  engineTemp: number;
  street: string;
  zone: string;
  vehName: string;
  hour: string;
  minute: string;
  engineRunning: boolean;
  autopilotActive: boolean;
  hazardActive: boolean;
  vehicleClass: number;
  
  // Dynamic UI state
  doorsOpen: number[];
  doorsLocked: boolean;
  seats: SeatInfo[]; // Dynamically passed from Lua based on vehicle
  
  // Settings
  positionType: string; // 'center', 'top-right', 'bottom-right', 'center-left', 'center-right', 'custom'
  customX: number;
  customY: number;
  isAdmin: boolean;
  enable3DViewer: boolean;
  hasHood: boolean;
  hasTrunk: boolean;

  // Actions
  setVisible: (v: boolean) => void;
  updateStats: (data: Partial<CarState>) => void;
  setLocales: (locales: Locales) => void;
  toggleHazard: () => void;
  toggleDoor: (doorIndex: number) => void;
  updateSeats: (seats: SeatInfo[]) => void;
  setPosition: (type: string, x?: number, y?: number) => void;
}

export const useCarStore = create<CarState>((set) => ({
  visible: false,
  locales: {
    vehicle: "VEÍCULO", unknown: "DESCONHECIDO", engine: "MOTOR", 
    emergency: "EMERGÊNCIA", lock: "TRANCAR", seat: "ASSENTO", 
    interior_light: "INTERNA", light: "LUZ", lights: "FARÓIS"
  },
  fuel: 100,
  engineTemp: 90,
  street: "Unknown",
  zone: "---",
  vehName: "Unknown",
  hour: "12",
  minute: "00",
  engineRunning: false,
  autopilotActive: false,
  hazardActive: false,
  vehicleClass: 0,
  doorsOpen: [],
  doorsLocked: false,
  seats: [
    { index: -1, occupied: false }, // Driver
    { index: 0, occupied: false },  // Pass
    { index: 1, occupied: false },  // Rear L
    { index: 2, occupied: false }   // Rear R
  ],
  positionType: 'center-right',
  customX: 0,
  customY: 0,
  isAdmin: false,
  enable3DViewer: false,
  hasHood: true,
  hasTrunk: true,

  setVisible: (v) => set({ visible: v }),
  updateStats: (data) => set((state) => ({ ...state, ...data })),
  setLocales: (locales) => set({ locales }),
  toggleHazard: () => set((state) => ({ hazardActive: !state.hazardActive })),
  toggleDoor: (doorIndex) => set((state) => {
    const isOpen = state.doorsOpen.includes(doorIndex);
    return {
      doorsOpen: isOpen 
        ? state.doorsOpen.filter(d => d !== doorIndex)
        : [...state.doorsOpen, doorIndex]
    };
  }),
  updateSeats: (seats) => set({ seats }),
  setPosition: (type, x = 0, y = 0) => set({ positionType: type, customX: x, customY: y })
}))
