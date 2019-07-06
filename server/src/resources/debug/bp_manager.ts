import { LineMapping, Breakpoint, DebugLocation } from '../types';
import { ScriptManager } from './script_manager';
import { ResponseMessage } from '../../types';

interface BaseBp { name: string; breakpointId: string }

interface SetupResolver {
  name: string;
  resolve: (item: BaseBp) => void;
}

interface ConvertResolver {
  name: string;
  url: string;
  resolve: (value: Breakpoint) => void;
}

const onClearResponse = ({ id }: ResponseMessage): void => {
  const resolve: () => void = this[id];
  delete this[id];
  resolve();
};

const onSetupResponse = ({ id, result: { breakpointId } }: ResponseMessage): void => {
  const { name, resolve }: SetupResolver = this[id];
  delete this[id];
  resolve({ name, breakpointId: breakpointId as string });
};

const onConvertResponse = ({ id, result: { locations } }: ResponseMessage): void => {
  const [location] = locations as DebugLocation[];
  const { name, url, resolve }: ConvertResolver = this[id];
  delete this[id];
  const { lineNumber, columnNumber } = location;
  const bp = {
    name,
    url,
    lineNumber,
    columnNumber,
  };
  // console.log('getPossibleBreakpoints', location.scriptId, bp);
  resolve(bp);
};

export default class BreakpointManager extends ScriptManager {
  protected get currentBreakpoints(): [string, LineMapping][] {
    return Object.entries(this.sourceBreakpoints[this.pluginCategory])
      .map(([name, bp]) => [name, { ...bp, mappings: undefined }]);
  }

  protected async clearBreakpoints(): Promise<void> {
    const { activeBreakpoints } = this;
    // console.log('clearBreakpoints', activeBreakpoints);
    if (!Object.keys(activeBreakpoints).length) return;

    const resolves: Record<string, () => void> = {};
    this.responseHandler = onClearResponse.bind(resolves);

    await Promise.all(
      Object.keys(activeBreakpoints).map(breakpointId => new Promise<void>((resolve) => {
        const id = this.send({ method: 'Debugger.removeBreakpoint', params: { breakpointId } });
        resolves[id] = resolve;
      })),
    );
    this.activeBreakpoints = {};
  }

  protected async setupBreakpoints(subject: string): Promise<void> {
    const bps = await this.findBreakpoints(subject);
    if (!bps) return;

    const resolves: Record<string, SetupResolver> = {};
    this.responseHandler = onSetupResponse.bind(resolves);

    const breakpoints = {};
    (await Promise.all(bps.map(({ name, ...params }) => new Promise<BaseBp>((resolve) => {
      const id = this.send({ method: 'Debugger.setBreakpointByUrl', params });
      resolves[id] = { name, resolve };
    })))).forEach(({ name, breakpointId }) => {
      breakpoints[breakpointId] = name;
    });
    this.activeBreakpoints = breakpoints;
    // console.log('breakpoints set', { breakpoints });
  }

  private async findBreakpoints(subject: string): Promise<Breakpoint[]> {
    const { breakpoints, sourceBreakpoints } = this;
    const bps = breakpoints[subject];
    if (bps) return bps;

    const bpLineMappings = sourceBreakpoints[subject] || this.plugin.findBreakpoints(this.scripts);
    console.log('findBreakpoints', bpLineMappings);
    sourceBreakpoints[subject] = bpLineMappings;
    if (!bpLineMappings) return null;

    const converted = await this.convertBreakpoints(bpLineMappings);
    breakpoints[subject] = converted;
    // console.log(converted);
    return converted;
  }

  private convertBreakpoints(src: Record<string, LineMapping>): Promise<Breakpoint[]> {
    const resolves: Record<string, ConvertResolver> = {};
    this.responseHandler = onConvertResponse.bind(resolves);

    return Promise.all(
      Object.entries(src)
        .map(([name, bp]) => new Promise<Breakpoint>((resolve) => {
          const { line: lineNumber, scriptId, mappings } = bp;
          const params = {
            start: { lineNumber, scriptId, columnNumber: null },
            end: { lineNumber, scriptId, columnNumber: null },
          };
          ([{ col: params.start.columnNumber }, { col: params.end.columnNumber }] = mappings);

          const id = this.send({ method: 'Debugger.getPossibleBreakpoints', params });
          resolves[id] = { name, url: bp.url, resolve };
        })),
    );
  }

  protected sourceBreakpoints: Record<string, Record<string, LineMapping>> = {};

  protected breakpoints: Record<string, Breakpoint[]> = {};

  protected activeBreakpoints: Record<string, string> = {};
}
