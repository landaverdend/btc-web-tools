import Navbar from '@components/navbar/Navbar';
import TxView from '@views/txview/TxView';
import ScriptView from '@views/scriptView/ScriptView';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

export const APP_ROUTES = {
  Script: '/script',
  Tx: '/tx',
  Home: '/',
};

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <Routes>
          <Route path="/script" element={<ScriptView />} />
          <Route path="/tx" element={<TxView />} />
          <Route path="/" element={<Navigate to="/script" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
