import { Button, Flex, Select } from 'antd';
import './tx-builder-view.css';
import { InputNumber } from 'antd';
import { useState } from 'react';
import { Input } from 'antd';

interface TIFProps {
  onAdd: () => void;
  onRemove: () => void;

  index: number;
}

function TxInputForm({ index }: TIFProps) {
  return (
    <Flex vertical gap={10} className="tx-input-form">
      <Input placeholder="TXID" />
      <InputNumber placeholder="Output Index (vout)" />
      <InputNumber placeholder="Amount" />
      <Input placeholder="Signature" />
    </Flex>
  );
}

interface TOFProps {
  onAdd: () => void;
  onRemove: () => void;

  index: number;
}

function TxOutputForm({ index }: TOFProps) {
  return (
    <Flex vertical gap={10} className="tx-output-form">
      <InputNumber placeholder="Amount" />
      <Input placeholder="Address" />
    </Flex>
  );
}

export default function TxBuilderView() {
  const [version, setVersion] = useState(1);
  const [txType, setTxType] = useState('P2PK');

  const [inputCount, setInputCount] = useState(1);
  const [outputCount, setOutputCount] = useState(1);
  const options = [
    { value: 'P2PK', label: 'P2PK' },
    { value: 'P2PKH', label: 'P2PKH' },
    { value: 'P2SH', label: 'P2SH' },
    { value: 'P2WPKH', label: 'P2WPKH' },
    { value: 'P2WSH', label: 'P2WSH' },
    { value: 'P2SH-P2WPKH', label: 'P2SH-P2WPKH' },
    { value: 'P2SH-P2WSH', label: 'P2SH-P2WSH' },
  ];

  return (
    <Flex className="tx-builder-view-container" vertical>
      <Flex gap={10} align="center" vertical>
        <Flex vertical>
          Transaction Type:
          <Select options={options} value={txType} onChange={(value) => setTxType(value)} />
        </Flex>

        <Flex vertical>
          TX Version:
          <InputNumber value={version} onChange={(value) => setVersion(value ?? 0)} />
        </Flex>

        <Flex gap={10} align="center" vertical>
          Inputs:
          {Array.from({ length: inputCount }).map((_, index) => (
            <TxInputForm onAdd={() => {}} index={index} onRemove={() => {}} />
          ))}
          <Flex gap={5}>
            <Button onClick={() => setInputCount(inputCount + 1)}>Add +</Button>
            {inputCount > 1 && <Button onClick={() => setInputCount(inputCount - 1)}>Remove -</Button>}
          </Flex>
        </Flex>

        <Flex gap={10} align="center" vertical>
          Outputs:
          {Array.from({ length: outputCount }).map((_, index) => (
            <TxOutputForm onAdd={() => {}} index={index} onRemove={() => {}} />
          ))}
          <Flex gap={5}>
            <Button onClick={() => setOutputCount(outputCount + 1)}>Add +</Button>
            {outputCount > 1 && <Button onClick={() => setOutputCount(outputCount - 1)}>Remove -</Button>}
          </Flex>
        </Flex>

      </Flex>
    </Flex>
  );
}
