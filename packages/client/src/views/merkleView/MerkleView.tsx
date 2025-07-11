import { Input } from 'antd';
import './merkle-view.css';
import Tree, { CustomNodeElementProps, RawNodeDatum } from 'react-d3-tree';
import { hash256 } from '@/btclib/hash/hashUtil';
import { bytesToHex } from '@/btclib/util/helper';
import { useState } from 'react';

// Build a merkle tree from a list of input strings
function generateTree(inputs: string[]): RawNodeDatum {
  const textEncoder = new TextEncoder();

  let currentLevel: RawNodeDatum[] = inputs.map((input, i) => ({ name: input, children: [], leafIndex: i }));

  while (currentLevel.length > 1) {
    const nextLevel: RawNodeDatum[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];

      const hasPair = i + 1 < currentLevel.length;
      const right = hasPair ? currentLevel[i + 1] : currentLevel[i];

      const parent = hash256(textEncoder.encode(left.name + right.name));
      const parentString = bytesToHex(parent);

      const node: RawNodeDatum = { name: parentString, children: hasPair ? [left, right] : [left] };
      nextLevel.push(node);
    }

    currentLevel = nextLevel;
  }

  return currentLevel[0];
}

const InputNode = (rd3tProps: CustomNodeElementProps, onLeafChange: (str: string, leafIndex: number) => void) => {
  const { nodeDatum } = rd3tProps;

  const isLeaf = nodeDatum.children === undefined || nodeDatum.children.length === 0;

  // foreign obj dims
  const width = 100;
  const height = 30;
  const x = -width / 2;
  const y = -height / 2;

  // outer rect dims
  const hashWidth = 300; // increased to accommodate hash length
  const hashX = -hashWidth * 0.55; // This will be our reference point for both rect and foreignObject

  const rectHeight = height * 1.2;
  const rectY = -rectHeight / 2;

  return (
    <g>
      {isLeaf && (
        <foreignObject width={width} height={height} x={x} y={y}>
          <Input
            type="text"
            style={{
              width: '100%',
              height: '100%',
              zIndex: 1000,
            }}
            value={nodeDatum.name}
            onChange={(e) => {
              const leafIndex = (nodeDatum as any)?.leafIndex;
              if (typeof leafIndex === 'number') {
                onLeafChange(e.target.value, leafIndex);
              }
            }}
          />
        </foreignObject>
      )}
      {!isLeaf && (
        <>
          <rect x={hashX} y={rectY} width={hashWidth * 1.1} height={rectHeight} fill="var(--soft-orange)" />
          <foreignObject width={hashWidth} height={height} x={hashX * 0.95} y={y}>
            <span className="hash-text">{nodeDatum.name}</span>
          </foreignObject>
        </>
      )}
    </g>
  );
};

const initialInputs = () => {
  // build the initial tree
  const inputs = [];

  const a_char_index = 97;
  const endIndex = a_char_index + 6;

  for (let i = a_char_index; i < endIndex; i++) {
    inputs.push(String.fromCharCode(i));
  }

  return inputs;
};

export default function MerkleView() {
  const [inputs, setInputs] = useState<string[]>(initialInputs());

  const tree = generateTree(inputs);

  const onLeafChange = (newValue: string, leafIndex: number) => {
    const newInputs = [...inputs];
    newInputs[leafIndex] = newValue;
    setInputs(newInputs);
  };

  // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <span>Merkle Root: {tree.name}</span>
      <Tree
        data={tree}
        orientation="vertical"
        depthFactor={-100}
        translate={{ x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 }}
        renderCustomNodeElement={(rd3tProps) => {
          return InputNode(rd3tProps, onLeafChange);
        }}
      />
    </div>
  );
}
