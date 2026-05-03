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
        const setPos = useCarStore.getState().setPosition;
        setPos(data.positionType || 'center', data.customX || 0, data.customY || 0);
        updateStats({ 
          isAdmin: data.isAdmin === true,
          enable3DViewer: data.enable3DViewer === true,
          hasHood: data.hasHood !== false,
          hasTrunk: data.hasTrunk !== false
        });
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

  return null; // This component doesn't render anything
};

// Helper for sending NUI messages to Lua
export const fetchNui = async (eventName: string, data?: any) => {
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
    return false;
  }
};
