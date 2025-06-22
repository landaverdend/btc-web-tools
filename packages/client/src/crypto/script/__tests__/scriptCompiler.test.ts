import { compileScript } from '../scriptCompiler';

describe('Script Compiler Tests', () => {
  it('should parse a simple if-else statement', () => {
    const script = compileScript('OP_0 OP_IF OP_2 OP_ELSE OP_3 OP_ENDIF');

    expect(script.getCmd(0)).toBe(0);
    expect(script.getCmd(1)).toBe(99);
    expect(script.getCmd(2)).toBe(82);
    expect(script.getCmd(3)).toBe(103);
    expect(script.getCmd(4)).toBe(83);
    expect(script.getCmd(5)).toBe(104);
  });

  it('should parse a giga-nested if-else statement', () => {
    expect(() => {
      compileScript(
        'OP_0 OP_IF OP_2 OP_0 OP_IF OP_2 OP_0 OP_IF OP_2 OP_ELSE OP_3 OP_ENDIF OP_ELSE OP_3 OP_ENDIF OP_0 OP_IF OP_2 OP_ELSE OP_3 OP_ENDIF OP_ELSE OP_3 OP_0 OP_IF OP_2 OP_0 OP_IF OP_2 OP_ELSE OP_3 OP_ENDIF OP_ELSE OP_3 OP_ENDIF OP_ENDIF'
      );
    }).not.toThrow();
  });

  it('should throw an error if the if statement is not balanced', () => {
    expect(() => {
      compileScript('OP_1 OP_IF OP_2 OP_ELSE OP_3');
    }).toThrow();
  });

  it('should throw an error if there are multiple OP_ELSE statements', () => {
    expect(() => {
      compileScript('OP_1 OP_IF OP_2 OP_ELSE OP_3 OP_ELSE OP_4 OP_ENDIF');
    }).toThrow();
  });

  it('should throw an error if there are are missing OP_IF statements', () => {
    expect(() => {
      compileScript('OP_1 OP_ELSE OP_2 OP_ENDIF');
    }).toThrow();

    expect(() => {
      compileScript('OP_1 OP_2 OP_ENDIF');
    }).toThrow();
  });
});
