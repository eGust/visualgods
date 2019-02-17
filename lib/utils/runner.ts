export class Runner {
  data: any;
  verify: () => boolean = null;

  dump() {
    return JSON.stringify(this.data);
  }

  load(json: string) {
    this.data = JSON.parse(json);
  }

  randomize(args = {}) {}

  execute() {}
}

type Runnable = Runner | { new(): Runner };

export class RunnerHelper {
  private runner: Runner;
  private sample?: string;

  constructor(run: Runnable, sample?: string) {
    this.runner = run instanceof Runner ? run : new run();
    this.sample = sample;
  }

  run() {
    const { runner, sample } = this;
    if (!runner.data) {
      console.time('init');
      if (sample) {
        runner.load(sample);
      } else {
        runner.randomize();
      }
      console.timeEnd('init');
    }

    console.log('[Starting]', new Date());
    const before = runner.dump();
    console.log('--');
    console.log(before);

    runner.execute();

    console.log('');
    if (runner.verify) {
      if (runner.verify()) {
        console.log('[Correct] =>');
      } else {
        console.error('[Wrong] =>');
      }
    } else {
      console.log(' =>');
    }
    console.log('');

    console.log('[Finished]', new Date());
    const after = runner.dump();
    console.log('--');
    console.log(after);
  }
}
