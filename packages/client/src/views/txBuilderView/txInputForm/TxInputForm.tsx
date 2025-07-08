import { fetchUtxo, Utxo } from '@/api/api';
import ColoredText from '@/components/coloredText/ColoredText';
import { Button, Flex, Input, Spin } from 'antd';
import { useState } from 'react';
import './tx-input-form.css';

/**
 * TODO:
 * - Add the recipient address/change address and amount to send for each...
 *    - state logic for this
 *    - amount to send from each utxo w/ validation...
 */

interface TIFProps {
  onAdd: () => void;
  onRemove: () => void;

  index: number;
}
export default function TxInputForm({ index }: TIFProps) {
  const [addr, setAddr] = useState('');

  const [utxos, setUtxos] = useState<Utxo[]>([]);
  const [selectedUtxos, setSelectedUtxos] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleSelectUtxo = (utxo: Utxo) => {
    if (selectedUtxos.has(utxo.txid)) {
      selectedUtxos.delete(utxo.txid);
    } else {
      selectedUtxos.add(utxo.txid);
    }
    setSelectedUtxos(new Set(selectedUtxos));
  };

  const handleFetchUtxos = () => {
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
  };

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
              <UtxoItem
                key={utxo.txid}
                index={i}
                utxo={utxo}
                selected={selectedUtxos.has(utxo.txid)}
                onSelect={handleSelectUtxo}
              />
            ))}
          </Flex>
        )}

        <Button
          onClick={() => {
            handleFetchUtxos();
          }}>
          Fetch UTXO(s)
          {isLoading && <Spin />}
        </Button>
      </Flex>
    </Flex>
  );
}

type Output = {
  amount?: number;
  address?: string;
  signature?: string;
};

interface UtxoItemProps {
  index: number;
  utxo: Utxo;
  selected: boolean;
  onSelect: (utxo: Utxo) => void;
}
function UtxoItem({ index, utxo, selected, onSelect }: UtxoItemProps) {
  const [outputs, setOutputs] = useState<Output[]>([]);

  const handleOutputChange = (i: number, key: keyof Output, value: string) => {
    const newOutputs = [...outputs];
    if (key === 'amount') {
      newOutputs[i] = { ...newOutputs[i], [key]: Number(value) };
    } else {
      newOutputs[i] = { ...newOutputs[i], [key]: value };
    }
    setOutputs(newOutputs);
  };

  return (
    <Flex gap={10}>
      <Flex
        vertical
        gap={5}
        className={`utxo-item ${selected ? 'selected' : ''}`}
        onClick={() => {
          onSelect(utxo);
          setOutputs([{ amount: utxo.value }]);
        }}>
        <span>UTXO #{index + 1}</span>
        <span>Sats: {utxo.value}</span>
        <span>Block Height: {utxo.status.block_height}</span>
        <span>Block Time:{utxo.status.block_time}</span>
      </Flex>

      {selected && (
        <Flex align="center" vertical gap={10} className="utxo-output">
          {outputs.map((output, i) => (
            <Flex key={i} vertical gap={5}>
              <span>Output #{i + 1}</span>
              <Input
                type="number"
                placeholder="Amount"
                value={output.amount}
                min={0}
                max={utxo.value}
                onChange={(e) => {
                  if (Number(e.target.value) <= utxo.value) {
                    handleOutputChange(i, 'amount', e.target.value);
                  } else {
                    handleOutputChange(i, 'amount', utxo.value.toString());
                  }
                }}
              />
              <Input
                placeholder="Recipient/Change Address"
                onChange={(e) => handleOutputChange(i, 'address', e.target.value)}
                value={output.address}
              />
              <Input
                placeholder="Signature"
                onChange={(e) => handleOutputChange(i, 'signature', e.target.value)}
                value={output.signature}
              />
            </Flex>
          ))}
          <Button onClick={() => setOutputs([...outputs, {}])}>Add Output</Button>
          <Button
            onClick={() => {
              if (outputs.length > 1) setOutputs(outputs.slice(0, -1));
            }}>
            Remove Output
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
