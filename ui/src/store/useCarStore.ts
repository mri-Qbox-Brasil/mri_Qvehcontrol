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
  index: number;
  occupied: boolean;
}

export interface DoorInfo {
  index: number;
  label: string;
  open: boolean;
}

export interface ExtraInfo {
  id: number;
  enabled: boolean;
}

export interface LiveryInfo {
  id: number;
  active: boolean;
}

type TabView = 'main' | 'customize';

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
  seats: SeatInfo[];
  doors: DoorInfo[];
  extras: ExtraInfo[];
  liveries: LiveryInfo[];
  
  // Feature flags
  enableExtras: boolean;
  enableLiveries: boolean;
  
  // Tab navigation
  activeTab: TabView;
  
  // Settings
  positionType: string;
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
  initDoors: (doors: { index: number; label: string; open: boolean }[]) => void;
  updateDoorStates: (doors: { index: number; open: boolean }[]) => void;
  initExtras: (extras: ExtraInfo[]) => void;
  toggleExtra: (id: number) => void;
  initLiveries: (liveries: LiveryInfo[]) => void;
  setActiveLivery: (id: number) => void;
  setActiveTab: (tab: TabView) => void;
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
    { index: -1, occupied: false },
    { index: 0, occupied: false },
    { index: 1, occupied: false },
    { index: 2, occupied: false }
  ],
  doors: [],
  extras: [],
  liveries: [],
  enableExtras: false,
  enableLiveries: false,
  activeTab: 'main',
  positionType: 'center-right',
  customX: 0,
  customY: 0,
  isAdmin: false,
  enable3DViewer: false,
  hasHood: true,
  hasTrunk: true,

  setVisible: (v) => set({ visible: v, activeTab: v ? 'main' : 'main' }),
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
  setPosition: (type, x = 0, y = 0) => set({ positionType: type, customX: x, customY: y }),
  initDoors: (doors) => set({ doors: doors.map(d => ({ index: d.index, label: d.label, open: d.open })) }),
  updateDoorStates: (doors) => set((state) => ({
    doors: state.doors.map(d => {
      const updated = doors.find(u => u.index === d.index);
      return updated ? { ...d, open: updated.open } : d;
    })
  })),
  initExtras: (extras) => set({ extras }),
  toggleExtra: (id) => set((state) => ({
    extras: state.extras.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e)
  })),
  initLiveries: (liveries) => set({ liveries }),
  setActiveLivery: (id) => set((state) => ({
    liveries: state.liveries.map(l => ({
      ...l,
      active: l.id === id ? !l.active : false
    }))
  })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
