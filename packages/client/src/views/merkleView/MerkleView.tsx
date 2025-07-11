import { Button, Flex, Input } from 'antd';
import './merkle-view.css';
import Tree, { CustomNodeElementProps, RawNodeDatum } from 'react-d3-tree';
import { hash256 } from '@/btclib/hash/hashUtil';
import { bytesToHex } from '@/btclib/util/helper';
import { useState } from 'react';
import ColoredText from '@/components/coloredText/ColoredText';

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

  // Input Leaf dims
  const width = 115;
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
              border: '2px solid var(--sky-blue)',
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
          <rect
            x={hashX}
            y={rectY}
            width={hashWidth * 1.1}
            height={rectHeight}
            fill="var(--input-gray)"
            stroke="white"
            strokeWidth={2}
          />
          <foreignObject width={hashWidth} height={height} x={hashX * 0.95} y={y}>
            <span className="hash-text">{nodeDatum.name}</span>
          </foreignObject>
        </>
      )}
    </g>
  );
};

const initialInputs = (numInputs: number) => {
  // build the initial tree
  const inputs = [];

  for (let i = 0; i < numInputs; i++) {
    inputs.push(`TX Data ${i + 1}`);
  }

  return inputs;
};

export default function MerkleView() {
  const [inputs, setInputs] = useState<string[]>(initialInputs(5));

  const tree = generateTree(inputs);

  const onLeafChange = (newValue: string, leafIndex: number) => {
    const newInputs = [...inputs];
    newInputs[leafIndex] = newValue;
    setInputs(newInputs);
  };

  // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
  return (
    <Flex className="merkle-view-container" style={{ width: '100vw', height: '100vh' }} vertical justify="center" align="center">
      <Flex className="merkle-view-header" vertical justify="center" align="center" gap={10}>
        <span className="merkle-root-text">
          Merkle Root: <ColoredText color="var(--sky-blue)">{tree.name}</ColoredText>
        </span>

        <p>
          A merkle tree is a binary tree where each node is a hash of its children. In Bitcoin, merkle trees are used to create a
          compact and easily verifiable fingerprint of a block and its transactions.
        </p>

        <Flex gap={5}>
          <Button onClick={() => setInputs([...inputs, `TX Data ${inputs.length + 1}`])}>Add Leaf Node</Button>
          <Button onClick={() => setInputs(inputs.slice(0, -1))}>Remove Leaf Node</Button>
        </Flex>
      </Flex>

      <Tree
        data={tree}
        orientation="vertical"
        depthFactor={-100}
        pathClassFunc={(path) => {
          return 'merkle-tree-path';
        }}
        translate={{ x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 }}
        renderCustomNodeElement={(rd3tProps) => {
          return InputNode(rd3tProps, onLeafChange);
        }}
      />
    </Flex>
  );
}
