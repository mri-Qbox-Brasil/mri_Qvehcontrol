import { useEffect } from 'react';
import { useCarStore } from './store/useCarStore';

export const NuiListener = () => {
  const setVisible = useCarStore(state => state.setVisible);
  const setLocales = useCarStore(state => state.setLocales);
  const updateStats = useCarStore(state => state.updateStats);
  const updateSeats = useCarStore(state => state.updateSeats);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const { type, ...data } = event.data;

      if (type === 'openGeneral') {
        setVisible(true);
        if (data.locales) {
          setLocales(data.locales);
        }
      } else if (type === 'closeAll') {
        setVisible(false);
      } else if (type === 'initSettings') {
        const store = useCarStore.getState();
        store.setPosition(data.positionType || 'center', data.customX || 0, data.customY || 0);
        updateStats({ 
          isAdmin: data.isAdmin === true,
          enable3DViewer: data.enable3DViewer === true,
          hasHood: data.hasHood !== false,
          hasTrunk: data.hasTrunk !== false,
          enableExtras: data.enableExtras === true,
          enableLiveries: data.enableLiveries === true,
        });
        // Initialize dynamic doors
        if (data.doors) {
          store.initDoors(data.doors);
        }
        // Initialize extras
        if (data.extras && data.extras.length > 0) {
          store.initExtras(data.extras);
        } else {
          store.initExtras([]);
        }
        // Initialize liveries
        if (data.liveries && data.liveries.length > 0) {
          store.initLiveries(data.liveries);
        } else {
          store.initLiveries([]);
        }
      } else if (type === 'updateStats') {
        updateStats({
          fuel: data.fuel,
          engineTemp: data.engineTemp,
          street: data.street,
          zone: data.zone,
          vehName: data.vehName,
          hour: data.hour,
          minute: data.minute,
          engineRunning: data.engineRunning,
          vehicleClass: data.vehicleClass
        });
      } else if (type === 'updateAutopilot') {
        updateStats({ autopilotActive: data.active });
      } else if (type === 'updateDynamicVehicle') {
        if (data.seats) {
          updateSeats(data.seats);
        }
      } else if (type === 'updateDoors') {
        if (data.doors) {
          useCarStore.getState().updateDoorStates(data.doors);
        }
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [setVisible, setLocales, updateStats, updateSeats]);

  // Keypress listener for ESC
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
        fetch(`http://${(window as any).GetParentResourceName ? (window as any).GetParentResourceName() : 'mri_Qvehcontrol'}/NUIFocusOff`, {
          method: 'POST',
          body: JSON.stringify({})
        }).catch(() => {});
      }
    };
    window.addEventListener('keyup', keyHandler);
    return () => window.removeEventListener('keyup', keyHandler);
  }, [setVisible]);

  return null;
};

// Helper for sending NUI messages to Lua
export const fetchNui = async <T = any>(eventName: string, data?: any): Promise<T | null> => {
  const resourceName = (window as any).GetParentResourceName ? (window as any).GetParentResourceName() : 'mri_Qvehcontrol';
  try {
    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(data || {}),
    };
    const resp = await fetch(`https://${resourceName}/${eventName}`, options);
    return await resp.json();
  } catch (error) {
    return null;
  }
};
