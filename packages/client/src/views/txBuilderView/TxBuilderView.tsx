import { Button, Flex, Select, Spin } from 'antd';
import './tx-builder-view.css';
import { InputNumber } from 'antd';
import { useState } from 'react';
import TxInputForm from './txInputForm/TxInputForm';
import Tx from '@/btclib/transaction/Tx';
import { useTxBuilderStore } from '@/state/txBuilderStore';

export default function TxBuilderView() {
  const { formData } = useTxBuilderStore();

  const [tx, setTx] = useState<null | Tx>(null);

  const [version, setVersion] = useState(1);
  const [txType, setTxType] = useState('P2PK');

  const [inputCount, setInputCount] = useState(1);

  const options = [
    { value: 'P2PK', label: 'P2PK' },
    { value: 'P2PKH', label: 'P2PKH' },
    { value: 'P2SH', label: 'P2SH' },
    { value: 'P2WPKH', label: 'P2WPKH' },
    { value: 'P2WSH', label: 'P2WSH' },
    { value: 'P2SH-P2WPKH', label: 'P2SH-P2WPKH' },
    { value: 'P2SH-P2WSH', label: 'P2SH-P2WSH' },
  ];

  const inputForms: React.ReactNode[] = [];
  for (let i = 0; i < inputCount; i++) {
    inputForms.push(<TxInputForm key={i} index={i} onRemove={() => {}} />);
  }

  return (
    <Flex className="tx-builder-view-container" vertical align="center" gap={10}>
      <h2>Testnet Transaction Builder/Broadcaster </h2>

      <Flex gap={10} align="center" vertical>
        <Flex vertical>
          Transaction Type:
          <Select options={options} value={txType} onChange={(value) => setTxType(value)} />
        </Flex>

        <Flex vertical>
          TX Version:
          <InputNumber value={version} onChange={(value) => setVersion(value ?? 0)} min={1} />
        </Flex>

        <Flex gap={10} align="center" vertical>
          Inputs:
          {inputForms}
          <Flex gap={5}>
            <Button onClick={() => setInputCount(inputCount + 1)}>Add +</Button>
            {inputCount > 1 && <Button onClick={() => setInputCount(inputCount - 1)}>Remove -</Button>}
          </Flex>
        </Flex>
      </Flex>

      <Button
        onClick={() => {
          // TODO: pass in inputs/outputs
          console.log(formData);
          // setTx(new Tx(version, [], [], 0, false));
        }}>
        Build TX
      </Button>
    </Flex>
  );
}
