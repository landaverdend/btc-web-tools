import { fetchUtxo, Utxo } from '@/api/api';
import ColoredText from '@/components/coloredText/ColoredText';
import { Button, Flex, Input, Spin } from 'antd';
import { useState } from 'react';
import './tx-input-form.css';
import { useTxBuilderStore } from '@/state/txBuilderStore';

export interface TxInputFormData {
  utxo: Utxo;
  outputs: Output[];
}

interface TIFProps {
  onRemove: () => void;

  index: number;
}
export default function TxInputForm({}: TIFProps) {
  const { formData, setFormData } = useTxBuilderStore();

  const [addr, setAddr] = useState('');

  const [utxos, setUtxos] = useState<Utxo[]>([]);
  const [selectedUtxos, setSelectedUtxos] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Add the form data to global state
  const handleSelectUtxo = (utxo: Utxo) => {
    if (selectedUtxos.has(utxo.txid)) {
      formData.delete(utxo.txid);
      selectedUtxos.delete(utxo.txid);
    } else {
      formData.set(utxo.txid, { utxo, outputs: [{ amount: utxo.value }] });
      selectedUtxos.add(utxo.txid);
    }

    setFormData(new Map(formData));
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
  const { formData, setFormData } = useTxBuilderStore();

  const outputs = formData.get(utxo.txid)?.outputs || [];

  const handleOutputChange = (i: number, key: keyof Output, value: string) => {
    const newFormData = new Map(formData);

    if (key === 'amount') {
      const num = Number(value) > utxo.value ? utxo.value : Number(value);
      newFormData.set(utxo.txid, {
        utxo,
        outputs: outputs.map((output, j) => (j === i ? { ...output, [key]: num } : output)),
      });
    } else {
      newFormData.set(utxo.txid, { utxo, outputs: outputs.map((output, j) => (j === i ? { ...output, [key]: value } : output)) });
    }

    setFormData(newFormData);
  };

  const handleAddOutput = () => {
    const newFormData = new Map(formData);
    newFormData.set(utxo.txid, { utxo, outputs: [...outputs, {}] });
    setFormData(newFormData);
  };

  const handleRemoveOutput = (i: number) => {
    const newFormData = new Map(formData);
    newFormData.set(utxo.txid, { utxo, outputs: outputs.filter((_, j) => j !== i) });
    setFormData(newFormData);
  };

  return (
    <Flex gap={10}>
      <Flex
        vertical
        gap={5}
        className={`utxo-item ${selected ? 'selected' : ''}`}
        onClick={() => {
          onSelect(utxo);
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
                onChange={(e) => handleOutputChange(i, 'amount', e.target.value)}
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
          <Button
            onClick={() => {
              handleAddOutput();
            }}>
            Add Output
          </Button>
          <Button
            onClick={() => {
              handleRemoveOutput(outputs.length - 1);
            }}>
            Remove Output
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
