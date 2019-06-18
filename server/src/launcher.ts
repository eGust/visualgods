import { createServer } from 'net';
import { resolve } from 'path';
import { exec } from 'child_process';

export function checkPortAvailable(port: number) {
  return new Promise<boolean>((rsv) => {
    const srv = createServer();
    srv.on('error', () => {
      rsv(false);
    });
    srv.on('listening', () => {
      rsv(true);
      srv.close();
    });
    srv.listen(port, '127.0.0.1');
  });
}

export async function findMinimumAvailablePort(from: number) {
  for (let port = from; port < 32_000; port += 1) {
    // eslint-disable-next-line no-await-in-loop
    if (await checkPortAvailable(port)) return port;
  }
  return null;
}

const options = { cwd: resolve(__dirname, '../../lib/service') };

export async function launch(args: string[], portFrom: number = 9527) {
  const port = await findMinimumAvailablePort(portFrom);
  const cmd = `node --inspect=127.0.0.1:${port} -r ts-node/register src/main.ts`;
  return port ? new Promise((rsv, reject) => {
    exec([cmd, ...args].join(' '), options, (error, _stdout, stderr) => {
      if (error) reject(error);

      const m = stderr.match(/(ws:\S+)/);
      rsv(m ? m[1] : null);
    });
  }) : null;
}
