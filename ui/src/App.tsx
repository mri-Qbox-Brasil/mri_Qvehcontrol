import { Dashboard } from './components/Dashboard';
import { NuiListener } from './NuiListener';
import { DevTools } from './components/DevTools';

function App() {
  return (
    <>
      <NuiListener />
      <DevTools />
      <Dashboard />
    </>
  );
}

export default App;
