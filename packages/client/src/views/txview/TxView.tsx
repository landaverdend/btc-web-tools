import TextEditor from './textEditor/TextEditor';
import TxHexView from './txHexView/TxHexView';

import { TxFetcher } from '@/components/txFetcher/TxFetcher';

export default function TxView() {
  return (
    <div className="flex flex-col md:flex-row gap-10 bg-(--input-gray) w-screen">
      <TextEditor />
      <TxFetcher includeDemoTxs={true} />
      <TxHexView />
    </div>
  );
}
