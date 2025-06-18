import { compileScript } from './scriptCompiler';

describe('Script Compiler Tests', () => {
  
  
  it('should parse a simple if-else statement', () => {
    const script = compileScript('OP_0 OP_IF OP_2 OP_ELSE OP_3 OP_ENDIF');

    expect(script.getCmd(0)).toBe(0);
    expect(script.getCmd(1)).toBe(99);
    expect(script.getCmd(2)).toBe(2);
    expect(script.getCmd(3)).toBe(103);
    expect(script.getCmd(4)).toBe(3);
    expect(script.getCmd(5)).toBe(104);
  });



});
