import { useCarStore, type ExtraInfo } from '../store/useCarStore';
import { fetchNui } from '../NuiListener';

export const ExtrasPanel = () => {
  const extras = useCarStore(state => state.extras);
  const liveries = useCarStore(state => state.liveries);
  const enableExtras = useCarStore(state => state.enableExtras);
  const enableLiveries = useCarStore(state => state.enableLiveries);
  const toggleExtra = useCarStore(state => state.toggleExtra);
  const setActiveLivery = useCarStore(state => state.setActiveLivery);

  const handleToggleExtra = async (extra: ExtraInfo) => {
    const result = await fetchNui<{ success: boolean }>('toggleExtra', { id: extra.id });
    if (result?.success) {
      toggleExtra(extra.id);
    }
  };

  const handleSetLivery = (id: number) => {
    setActiveLivery(id);
    fetchNui('setLivery', { id });
  };

  const hasExtras = enableExtras && extras.length > 0;
  const hasLiveries = enableLiveries && liveries.length > 0;

  if (!hasExtras && !hasLiveries) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-zinc-700 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <p className="text-zinc-600 text-xs font-medium uppercase tracking-wider">Nenhum extra ou plotagem</p>
          <p className="text-zinc-700 text-[10px] mt-1">Este veículo não possui opções de customização</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-hide">
      {/* Extras Section */}
      {hasExtras && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-dash-accent/20 p-1.5 rounded-lg">
              <svg className="w-3.5 h-3.5 text-dash-accent" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
              </svg>
            </div>
            <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-widest">Extras</h3>
            <span className="text-[9px] text-zinc-600 ml-auto">{extras.filter(e => e.enabled).length}/{extras.length}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 p-1">
            {extras.map(extra => (
              <button
                key={extra.id}
                onClick={() => handleToggleExtra(extra)}
                className={`relative rounded-lg px-2 py-2.5 border transition-all duration-200 flex flex-col items-center gap-1 hover:scale-[1.03] active:scale-95 ${
                  extra.enabled
                    ? 'bg-dash-accent/15 border-dash-accent/40 ring-1 ring-dash-accent/20 text-dash-accent shadow-[0_0_12px_rgba(0,230,153,0.1)]'
                    : 'bg-dash-bg/60 border-zinc-800/80 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                }`}
              >
                <svg className={`w-4 h-4 transition-colors ${extra.enabled ? 'text-dash-accent' : 'text-zinc-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
                <span className="text-[9px] font-bold uppercase leading-none">
                  E{extra.id}
                </span>
                {extra.enabled && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-dash-accent animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Liveries Section */}
      {hasLiveries && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-dash-accent/20 p-1.5 rounded-lg">
              <svg className="w-3.5 h-3.5 text-dash-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-widest">Plotagens</h3>
            <span className="text-[9px] text-zinc-600 ml-auto">{liveries.length} disponíveis</span>
          </div>
          <div className="grid grid-cols-4 gap-2 p-1">
            {liveries.map(livery => (
              <button
                key={livery.id}
                onClick={() => handleSetLivery(livery.id)}
                className={`relative rounded-lg px-2 py-2.5 border transition-all duration-200 flex flex-col items-center gap-1 hover:scale-[1.03] active:scale-95 ${
                  livery.active
                    ? 'bg-dash-accent/15 border-dash-accent/40 ring-1 ring-dash-accent/20 text-dash-accent shadow-[0_0_12px_rgba(0,230,153,0.1)]'
                    : 'bg-dash-bg/60 border-zinc-800/80 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                }`}
              >
                <svg className={`w-4 h-4 transition-colors ${livery.active ? 'text-dash-accent' : 'text-zinc-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                </svg>
                <span className="text-[9px] font-bold uppercase leading-none">
                  #{livery.id + 1}
                </span>
                {livery.active && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-dash-accent animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
