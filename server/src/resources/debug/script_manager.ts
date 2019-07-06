import {
  ScriptSource, DebuggerPlugin, ParsedScript, DebugLocation,
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
  public get category(): string { return this.pluginCategory; }

  protected get plugin(): DebuggerPlugin { return this.currentPlugin; }

  protected selectPlugin(category: string): void {
    const plugin = this.plugins[category];
    if (!plugin) throw new Error(`Cannot find plugin for ${category}`);
    this.currentPlugin = plugin;
    this.pluginCategory = category;
  }

  protected getSourceLocation(location: DebugLocation): DebugLocation {
    const { scriptId, lineNumber, columnNumber } = location;
    const cacheKey = [scriptId, lineNumber, columnNumber].join(':');
    const cached = this.locationCache[cacheKey];
    if (cached) return cached;

    const script = this.scripts[scriptId];
    const mappings = script.lineMappings[lineNumber];
    const colIndex = mappings.findIndex(({ col }) => col > columnNumber);

    const item = colIndex > 0 ? mappings[colIndex - 1] : mappings[mappings.length - 1];
    const r = item ? {
      scriptId,
      lineNumber: item.sourceLine,
      columnNumber: item.sourceCol,
    } : location;
    this.locationCache[cacheKey] = r;
    return r;
  }

  protected scripts: Record<string, ScriptSource> = {};

  protected plugins = AVAILABLE_PLUGINS;

  protected pluginCategory = '';

  protected init(): void {
    this.scriptResponseHandler({ id: 0 });
  }

  protected constructor() {
    super();
    this.messageHandler = this.scriptMessageHandler.bind(this);
    this.responseHandler = this.scriptResponseHandler.bind(this);
  }

  private scriptMessageHandler(message: MethodMessage): void {
    if (message.method !== 'Debugger.scriptParsed') return;

    const script = parseScript(message.params as ParsedScript);
    if (script) {
      this.scripts[script.scriptId] = {
        ...script,
        file: script.file.slice(PROJECT_ROOT.length + 1),
      };
    }
  }

  private scriptResponseHandler(response: ResponseMessage): void {
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

  private currentPlugin: DebuggerPlugin;

  private locationCache: Record<string, DebugLocation> = {};
}
