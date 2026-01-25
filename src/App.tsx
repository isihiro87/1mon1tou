import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { RangeSelectPage } from './pages/RangeSelectPage';
import { VerticalPlayerPage } from './pages/VerticalPlayerPage';
import { LoginPage } from './pages/LoginPage';
import { StatsPage } from './pages/StatsPage';
import { useAuthStore } from './stores/authStore';

export function App() {
  const initAuth = useAuthStore(state => state.initAuth);

  // アプリ起動時に認証状態を初期化
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/range-select" element={<RangeSelectPage />} />
        <Route path="/vertical-player" element={<VerticalPlayerPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
