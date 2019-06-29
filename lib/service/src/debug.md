# Debug

## Links

- [Decode mappings](https://gist.github.com/bengourley/c3c62e41c9b579ecc1d51e9d9eb8b9d2)
- [Redux undo](https://redux.js.org/recipes/implementing-undo-history)

## Debugger Commands

Start debugger

$ node --inspect-brk -r ts-node/register ./tests/debug.ts

Captured Chrome commands

```ts
{"id":1,"method":"Profiler.enable"}
{"id":2,"method":"Runtime.enable"}
{"id":3,"method":"Debugger.enable","params":{"maxScriptsCacheSize":100000000}}
{"id":4,"method":"Debugger.setPauseOnExceptions","params":{"state":"none"}}
{"id":5,"method":"Debugger.setAsyncCallStackDepth","params":{"maxDepth":32}}
{"id":6,"method":"Runtime.getIsolateId"}
{"id":7,"method":"Debugger.setBlackboxPatterns","params":{"patterns":[]}}
{"id":8,"method":"Runtime.runIfWaitingForDebugger"}
{"id":9,"method":"Debugger.getScriptSource","params":{"scriptId":"102"}}
{"id":10,"method":"Runtime.getProperties","params":{"objectId":"{\\"injectedScriptId\\":1,\\"id\\":1}","ownProperties":false,"accessorPropertiesOnly":false,"generatePreview":true}}
{"id":11,"method":"Runtime.getHeapUsage","params":{}}
{"id":12,"method":"Runtime.getHeapUsage","params":{}}
{"id":13,"method":"Debugger.getPossibleBreakpoints","params":{"start":{"scriptId":"102","lineNumber":27,"columnNumber":8},"end":{"scriptId":"102","lineNumber":27,"columnNumber":20},"restrictToFunction":false}}
{"id":14,"method":"Runtime.getHeapUsage","params":{}}
{"id":15,"method":"Debugger.setBreakpointsActive","params":{"active":true}}
{"id":16,"method":"Debugger.getPossibleBreakpoints","params":{"start":{"scriptId":"102","lineNumber":27,"columnNumber":8},"end":{"scriptId":"102","lineNumber":28,"columnNumber":8},"restrictToFunction":false}}
{"id":17,"method":"Debugger.setBreakpointByUrl","params":{"lineNumber":27,"urlRegex":"/Users/sea/dev/visualgods/lib/tests/debug\\\\.ts|file:///Users/sea/dev/visualgods/lib/tests/debug\\\\.ts","columnNumber":13,"condition":""}}
{"id":18,"method":"Debugger.getPossibleBreakpoints","params":{"start":{"scriptId":"102","lineNumber":27,"columnNumber":8},"end":{"scriptId":"102","lineNumber":28,"columnNumber":8},"restrictToFunction":false}}
{"id":19,"method":"Debugger.resume"}
{"id":20,"method":"Runtime.getProperties","params":{"objectId":"{\\"injectedScriptId\\":1,\\"id\\":51}","ownProperties":false,"accessorPropertiesOnly":false,"generatePreview":true}}
{"id":21,"method":"Runtime.getProperties","params":{"objectId":"{\\"injectedScriptId\\":1,\\"id\\":50}","ownProperties":false,"accessorPropertiesOnly":false,"generatePreview":true}}
{"id":22,"method":"Runtime.getHeapUsage","params":{}}
{"id":23,"method":"Runtime.getHeapUsage","params":{}}
{"id":24,"method":"Debugger.removeBreakpoint","params":{"breakpointId":"2:27:13:/Users/sea/dev/visualgods/lib/tests/debug\\\\.ts|file:///Users/sea/dev/visualgods/lib/tests/debug\\\\.ts"}}
{"id":25,"method":"Runtime.getHeapUsage","params":{}}
{"id":26,"method":"Debugger.resume"}
{"id":27,"method":"Debugger.getScriptSource","params":{"scriptId":"133"}}
{"id":28,"method":"Debugger.getScriptSource","params":{"scriptId":"135"}}
{"id":29,"method":"Runtime.getHeapUsage","params":{}}
```

## Dump WireShark JSON file

```js
const dumpJson = (src) => {
  const d = new TextDecoder('utf8');

  const dumpItem = ({ _source: { layers } }) => {
    const lines = Object.keys(layers['data-text-lines'])[0];
    const s = (layers['tcp.segments'] || {})["tcp.reassembled.data"] || layers.tcp['tcp.payload'];
    const pos = s.indexOf('7b');
    if (pos < 0) return [null, lines, layers];

    const buff = new Uint8Array(s.slice(pos).split(':').map(c => Number.parseInt(c, 16)));
    return [d.decode(buff), lines, layers];
  };

  const decodeJson = ([raw, s, layers]) => {
    try {
      try {
        return JSON.parse(raw || s)
      } catch (e1) {
        return JSON.parse(s)
      }
    } catch (e2) {
      return layers;
    }
  };

  return JSON.parse(src).map(dumpItem).map(decodeJson);
};
```

Demo:

$ wscat -c ws://127.0.0.1:3333/api

```json
{"id":1,"method":"inspect","params":{"action":"Sort.heap","items":[{"key":"1","value":11},{"key":"2","value":18},{"key":"3","value":12},{"key":"4","value":15},{"key":"5","value":14}]}}
```
