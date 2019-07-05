import {
  ScriptSource, DebuggerPlugin, Breakpoint, ParsedScript,
} from '../types';
import DebugBase from './debug_base';

import { MethodMessage, ResponseMessage } from '../../types';

import parseScript from './parse_script';
import { PROJECT_ROOT } from '../../utils/env_vars';

import Sort from '../sort';

const INIT_MESSAGES_JSON = `
{ "method": "Debugger.enable", "params": { "maxScriptsCacheSize": 100000000 } }
{ "method": "Debugger.setPauseOnExceptions", "params": { "state": "none" } }
{ "method": "Debugger.setAsyncCallStackDepth", "params": { "maxDepth": 32 } }
{ "method": "Debugger.setBlackboxPatterns", "params": { "patterns": [] } }
{ "method": "Debugger.setBreakpointsActive", "params":{ "active": true } }
{ "method": "Runtime.enable" }
`.trim();

const INIT_MESSAGES = Object.freeze(JSON.parse(`[${INIT_MESSAGES_JSON.split('\n').join(',')}]`));

export const AVAILABLE_PLUGINS: Record<string, DebuggerPlugin> = { Sort };

export class ScriptManager extends DebugBase {
  protected get plugin() { return this.currentPlugin; }

  protected selectPlugin(category: string) {
    const plugin = this.plugins[category];
    if (!plugin) throw new Error(`Cannot find plugin for ${category}`);
    this.currentPlugin = plugin;
  }

  protected constructor() {
    super();
    this.messageHandler = this.scriptMessageHandler.bind(this);
    this.responseHandler = this.scriptResponseHandler.bind(this);
  }

  protected init() {
    this.scriptResponseHandler({ id: 0 });
  }

  private scriptMessageHandler(message: MethodMessage) {
    if (message.method !== 'Debugger.scriptParsed') return;

    const script = parseScript(message.params as ParsedScript);
    if (script) {
      this.scripts[script.file.slice(PROJECT_ROOT.length + 1)] = script;
    }
  }

  private scriptResponseHandler(response: ResponseMessage) {
    const { id } = response;
    const initMsg = INIT_MESSAGES[id];
    if (initMsg) {
      this.send(initMsg);
    } else {
      console.log('init:done', id, this.scripts);
      this.resolveTask({ categories: Object.keys(AVAILABLE_PLUGINS) });
      this.reset();
    }
  }

  protected breakpoints: Record<string, Breakpoint[]> = {};

  protected activeBreakpoints: Record<string, string> = {};

  protected scripts: Record<string, ScriptSource> = {};

  protected plugins = AVAILABLE_PLUGINS;

  private currentPlugin: DebuggerPlugin;
}
