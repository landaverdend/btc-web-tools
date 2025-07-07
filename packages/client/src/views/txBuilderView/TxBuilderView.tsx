import { Button, Flex, Select, Spin } from 'antd';
import './tx-builder-view.css';
import { InputNumber } from 'antd';
import { useState } from 'react';
import { Input } from 'antd';
import { fetchUtxo, Utxo } from '@/api/api';
import ColoredText from '@/components/coloredText/ColoredText';

interface TIFProps {
  onAdd: () => void;
  onRemove: () => void;

  index: number;
}
function TxInputForm({ index }: TIFProps) {
  const [addr, setAddr] = useState('');

  const [utxos, setUtxos] = useState<Utxo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Flex vertical gap={10} className="tx-input-form">
      <Flex gap={10} vertical>
        {error && (
          <ColoredText color="red" className="error-text">
            {error}
          </ColoredText>
        )}

        <Input placeholder="Address" value={addr} onChange={(e) => setAddr(e.target.value)} />
        {utxos.length > 0 && (
          <Flex vertical gap={10} align="center">
            <h3>
              UTXOs for <br /> {addr}
            </h3>
            {utxos.map((utxo, i) => (
              <Flex key={utxo.txid} vertical gap={5} className="utxo-item">
                <span>UTXO #{i + 1}</span>
                <span>Sats: {utxo.value}</span>
                <span>Block Height: {utxo.status.block_height}</span>
                <span>Block Time:{utxo.status.block_time}</span>
              </Flex>
            ))}
          </Flex>
        )}

        <Button
          onClick={() => {
            if (isLoading) return;

            setIsLoading(true);
            if (!addr) {
              setError('Address is required');
              setIsLoading(false);
              return;
            }

            fetchUtxo(addr, true)
              .then((data) => {
                setUtxos(data);
                setError(null);
              })
              .catch((err) => {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error(err);
              })
              .finally(() => {
                setIsLoading(false);
              });
          }}>
          Fetch UTXO(s)
          {isLoading && <Spin />}
        </Button>
      </Flex>
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
    <Flex className="tx-builder-view-container" vertical align="center">
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
