import { MethodMessage } from '../../types';
import {
  DebugPaused, DebugCallFrame, StackFrame, DebuggerPlugin,
} from '../types';
import BreakpointManager from './bp_manager';
import RemoteObjectResolver from './remote_obj';

const filterFramesByName = (plugin: DebuggerPlugin, frames: DebugCallFrame[], name: string) => {
  const callFrames = plugin.filterCallFrames(name, frames);
  if (!(callFrames && callFrames.length)) return null;

  return callFrames
    .map(({ functionName, location, scopeChain }) => ({
      functionName,
      location,
      scopeObjects: scopeChain
        .filter(({ type }) => type === 'local' || type === 'block')
        .map(({ type, object: { objectId } }) => ({ type, objectId })),
    }))
    .filter(({ scopeObjects }) => scopeObjects.length);
};

const logStack = (breakpoint: string, stack: StackFrame[]) => {
  console.log(breakpoint, stack);
};

export default class DebugMain extends BreakpointManager {
  protected constructor() {
    super();
    this.objectResolver = new RemoteObjectResolver(this.send);
  }

  protected assignDebugHandlers() {
    this.messageHandler = this.debugMessageHandler;
    this.responseHandler = this.objectResolver.handleResponse;
  }

  protected onStackPopulated: (breakpoint: string, stack: StackFrame[]) => void = logStack;

  private async emitStackPopulated(breakpoint: string, stack: StackFrame[]) {
    try {
      this.onStackPopulated(breakpoint, stack);
    } catch (e) {
      console.error();
    }
  }

  // pause/resume handlers
  private async debugMessageHandler({ method, params }: MethodMessage) {
    if (method === 'Debugger.paused') {
      const { hitBreakpoints: [bpId = ''] = [], callFrames } = params as DebugPaused;
      const breakpoint = this.activeBreakpoints[bpId];
      if (breakpoint) {
        const frames = filterFramesByName(this.plugin, callFrames, breakpoint);
        if (!frames) return;

        const stack: StackFrame[] = [];
        await Promise.all(frames.map(async ({ functionName, location, scopeObjects: items }) => {
          const scope: Record<string, any> = {};
          stack.push({ functionName, location, scope });
          return Promise.all(items.map(async ({ objectId }) => {
            const s = await this.objectResolver.resolveRemoteObject(objectId);
            Object.assign(scope, s);
          }));
        }));

        this.emitStackPopulated(breakpoint, stack);
      }
      this.send({ method: 'Debugger.resume' });
      return;
    }
    if (method === 'Debugger.resumed') return;
    console.info('debugMessageHandler', { method, params });
  }

  private objectResolver: RemoteObjectResolver;
}
