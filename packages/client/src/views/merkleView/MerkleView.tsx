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

  // Input Leaf dims
  const width = 130;
  const height = 32;
  const x = -width / 2;
  const y = -height / 2;

  // outer rect dims
  const hashWidth = 320;
  const hashX = -hashWidth * 0.55;

  const rectHeight = height * 1.3;
  const rectY = -rectHeight / 2;

  return (
    <g>
      {isLeaf && (
        <>
          <rect
            x={x - 4}
            y={y - 4}
            width={width + 8}
            height={height + 8}
            rx={8}
            fill="#1a1a1a"
            stroke="#f7931a"
            strokeWidth={2}
          />
          <foreignObject width={width} height={height} x={x} y={y}>
            <input
              type="text"
              className="merkle-leaf-input"
              value={nodeDatum.name}
              onChange={(e) => {
                const leafIndex = (nodeDatum as any)?.leafIndex;
                if (typeof leafIndex === 'number') {
                  onLeafChange(e.target.value, leafIndex);
                }
              }}
            />
          </foreignObject>
        </>
      )}

      {!isLeaf && (
        <>
          <rect
            x={hashX}
            y={rectY}
            width={hashWidth * 1.1}
            height={rectHeight}
            rx={8}
            fill="#1a1a1a"
            stroke="#2a2a2a"
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

  return (
    <div className="flex flex-col items-center bg-(--background-slate) h-screen">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-4 px-6 py-6 w-full max-w-3xl">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#f7931a]" />
          <h1 className="text-xl font-semibold text-white">Merkle Tree Visualizer</h1>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm text-center leading-relaxed">
          A <span className="text-[#f7931a] font-medium">Merkle Tree</span> is a binary tree where each node is a hash of its children.
          Edit any leaf node below to see the tree update in real-time.
        </p>

        {/* Controls & Root */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <div className="flex flex-row items-center gap-2">
            <button
              onClick={() => setInputs([...inputs, `TX Data ${inputs.length + 1}`])}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#f7931a] hover:bg-[#f7931a]/90 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
            {inputs.length > 2 && (
              <button
                onClick={() => setInputs(inputs.slice(0, -1))}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Remove
              </button>
            )}
          </div>

          {/* Merkle Root Display */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg flex-1 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 shrink-0">
              Root:
            </span>
            <span className="text-[#0ea5e9] font-mono text-xs truncate">
              {tree.name}
            </span>
          </div>
        </div>
      </div>

      {/* Tree Visualization */}
      <div id="treeWrapper" style={{ width: '100vw', height: 'calc(100vh - 180px)' }}>
        <Tree
          data={tree}
          orientation="vertical"
          depthFactor={-75}
          zoom={0.7}
          scaleExtent={{ min: 0.2, max: 2 }}
          pathClassFunc={() => 'merkle-tree-path'}
          translate={{
            x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
            y: 200
          }}
          renderCustomNodeElement={(rd3tProps) => InputNode(rd3tProps, onLeafChange)}
        />
      </div>
    </div>
  );
}
