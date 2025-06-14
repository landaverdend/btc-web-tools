import Navbar from '@components/navbar/Navbar';
import TxView from '@views/txview/TxView';
import { useState } from 'react';
import ScriptView from '@views/scriptView/ScriptView';

export type ViewType = 'tx' | 'script';

export default function App() {
  const [view, setView] = useState<ViewType>('script');

  const renderView = () => {
    switch (view) {
      case 'tx':
        return <TxView />;
      case 'script':
        return <ScriptView />;
    }
  };

  return (
    <div>
      <Navbar view={view} setView={setView} />
      {renderView()}
    </div>
  );
}
