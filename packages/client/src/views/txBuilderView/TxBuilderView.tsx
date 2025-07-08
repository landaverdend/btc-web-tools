import { Button, Flex, Select, Spin } from 'antd';
import './tx-builder-view.css';
import { InputNumber } from 'antd';
import { useState } from 'react';
import TxInputForm, { TxFormData } from './txInputForm/TxInputForm';
import Tx from '@/btclib/transaction/Tx';
import { useTxBuilderStore } from '@/state/txBuilderStore';
import TxOut from '@/btclib/transaction/TxOut';
import TxIn from '@/btclib/transaction/TxIn';
import { hexToBytes } from '@/btclib/util/helper';
import { Script } from '@/btclib/script/Script';

export default function TxBuilderView() {
  const { formData } = useTxBuilderStore();

  const [tx, setTx] = useState<null | Tx>(null);

  const [version, setVersion] = useState(1);
  const [txType, setTxType] = useState('P2PK');

  const [inputCount, setInputCount] = useState(1);

  const buildTx = () => {
    // TODO: pass in inputs/outputs
    console.log(formData);

    try {
      const inputs: TxIn[] = [];
      const outputs: TxOut[] = [];
      for (const [prevTxId, theData] of formData) {
        const { utxo } = theData;
        // TODO: add the unlocking script...
        const txin = new TxIn(hexToBytes(prevTxId), utxo.vout, 0xffffffff, new Script());
        inputs.push(txin);
      }

      // TODO: build the outputs

      const tx = new Tx(version, inputs, outputs, 0, false);
    } catch (e) {
      console.error(e);
    }
  };

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

      <Button onClick={() => buildTx()}>Build TX</Button>
    </Flex>
  );
}

function validateFormData(formData: Map<string, TxFormData>) {}
