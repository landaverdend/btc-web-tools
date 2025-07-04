import TextMode from 'ace-builds/src-noconflict/mode-text';

export class ScriptMode extends TextMode.Mode {
  constructor(hexMode = false) {
    super();
    this.HighlightRules = ScriptHighlightRules;
  }
}

export class ScriptHighlightRules extends new TextMode.Mode().HighlightRules {
  constructor() {
    super();
    this.addRules({
      start: [
        {
          token: 'keyword', // For opcodes
          regex: '\\b(OP_[A-Z0-9_]+)\\b',
          caseInsensitive: true,
        },
        {
          token: 'constant.numeric', // For hex values
          regex: '0x[0-9a-fA-F]+',
          caseInsensitive: true,
        },
        {
          token: 'constant.numeric', // For hex values
          regex: '[0-9a-fA-F]+',
          caseInsensitive: true,
        },
        {
          token: 'constant.numeric', // For base 10 values
          regex: '[0-9]+',
          caseInsensitive: true,
        },
        {
          token: 'comment', // For comments
          regex: '//.*$',
        },
      ],
    });
  }
}
