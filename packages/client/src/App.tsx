import Navbar from '@components/navbar/Navbar';
import TxView from '@views/txview/TxView';
import ScriptView from '@views/scriptView/ScriptView';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MerkleView from './views/merkleView/MerkleView';

export const APP_ROUTES = {
  Script: '/script',
  Tx: '/txview',
  Merkle: '/merkle',
  Home: '/',
};

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <Routes>
          <Route path={APP_ROUTES.Script} element={<ScriptView />} />
          <Route path={APP_ROUTES.Tx} element={<TxView />} />
          <Route path={APP_ROUTES.Merkle} element={<MerkleView />} />
          <Route path={APP_ROUTES.Home} element={<Navigate to={APP_ROUTES.Merkle} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
