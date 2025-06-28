import { Script } from '../../Script';
import { ScriptExecutionEngine } from '../scriptExecutionEngine';

describe('ScriptExecutionEngine', () => {
  it('should handle easy conditionals #1', () => {
    const testScriptOne = '516352675368';

    const script = Script.fromHex(testScriptOne);
    const engine = new ScriptExecutionEngine(script);

    engine.run();

    const { stack } = engine.context;

    expect(stack).toEqual([]);
    expect(engine.executionStatus).toEqual('Success');
  });

  it('should handle easy conditionals #2', () => {
    const testScriptOne = '006352675168';

    const script = Script.fromHex(testScriptOne);
    const engine = new ScriptExecutionEngine(script);

    engine.run();

    const { stack } = engine.context;

    expect(stack).toEqual([]);
    expect(engine.executionStatus).toEqual('Success');
  });

  it('should handle nested conditionals #1', () => {
    const testScriptOne = '516352630100630204206802696953686751630230396868';

    const script = Script.fromHex(testScriptOne);
    const engine = new ScriptExecutionEngine(script);

    engine.run();

    const { stack } = engine.context;

    expect(stack).toEqual([new Uint8Array([0x69, 0x69]), new Uint8Array([0x03])]);
    expect(engine.executionStatus).toEqual('Failure');
  });
});
