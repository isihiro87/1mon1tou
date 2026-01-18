import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PlayerPage } from './pages/PlayerPage';
import { SettingsPage } from './pages/SettingsPage';
import { RangeSelectPage } from './pages/RangeSelectPage';
import { VerticalPlayerPage } from './pages/VerticalPlayerPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/player" element={<PlayerPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/range-select" element={<RangeSelectPage />} />
        <Route path="/vertical-player" element={<VerticalPlayerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
