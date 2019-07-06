import { MethodMessage, ResponseMessage } from '../../types';
import { RuntimeRemoteObject, RtPropertyDescriptor } from '../types';

interface DebugResolver {
  objectId: string;
  resolve: (result: Record<string, unknown>) => void;
}

export default class RemoteObjectResolver {
  public async resolveRemoteObject(objectId: string): Promise<Record<string, unknown>> {
    const items = (await this.runtimeGetProperties(objectId)).result as RtPropertyDescriptor[];
    const entries = await Promise.all(items.map(async ({ name, value }) => (
      value && value.type !== 'function' && name !== '__proto__'
        ? [name, await this.resolveObjectValue(value)] as [string, unknown]
        : null
    )));

    const obj = {};
    entries.filter(x => x).forEach(([k, v]) => {
      obj[k] = v;
    });
    return obj;
  }

  public handleResponse({ id, result }: ResponseMessage): void {
    const { resolvers } = this;
    if (resolvers.has(id)) {
      const { resolve } = resolvers.get(id);
      resolvers.delete(id);
      resolve(result);
    }
    // console.info('debugger:done', { id, result });
  }

  public constructor(send: (message: MethodMessage) => number) {
    this.send = send;
    this.handleResponse = this.handleResponse.bind(this);
    this.resolveRemoteObject = this.resolveRemoteObject.bind(this);
  }

  private async resolveObjectValue(v: RuntimeRemoteObject): Promise<unknown> {
    if (!v.objectId) return v.value;
    const {
      objectId,
      type,
      subtype,
      preview: { properties },
    } = v;

    if (type !== 'object') {
      return properties.map(({ value }) => value);
    }

    const obj = (await this.resolveRemoteObject(objectId)) as Record<string, unknown>;
    if (subtype !== 'array') return obj;

    const { length, ...list } = obj;
    const items = new Array(length);
    Object.keys(list).forEach((index) => {
      items[+index] = list[index];
    });
    return items;
  }

  private runtimeGetProperties(objectId: string): Promise<Record<string, unknown>> {
    return new Promise<Record<string, unknown>>((resolve) => {
      const msgId = this.send({
        method: 'Runtime.getProperties',
        params: {
          objectId,
          ownProperties: true,
          accessorPropertiesOnly: false,
          generatePreview: true,
        },
      });

      this.resolvers.set(msgId, { resolve, objectId });
    });
  }

  private resolvers = new Map<number, DebugResolver>();

  private send: (message: MethodMessage) => number;
}
