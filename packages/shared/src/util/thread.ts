import { sleep } from "./sleep";

export interface IContext {
    get shouldPause(): boolean;
    get shouldStop(): boolean;
    stopedCallback(): void;
}

export class Thread implements IContext{
    private _thread: NodeJS.Timeout | undefined;
    private _worker: (context:IContext) => void;
    private _shouldStop: boolean = false;
    private _shouldPause: boolean = true;
    get shouldPause() {
        return this._shouldPause;
    }
    get shouldStop() {
        return this._shouldStop;
    }
    constructor(worker: (context:IContext) => void) {
        this._worker = worker;
    }
    private _stoppedCallback?: () => void;
    stopedCallback(): void {
        if (this._stoppedCallback) {
            this._stoppedCallback();
        }
    }

    async start() {
        this._thread = setTimeout(()=>{this._worker(this)}, 0)
    }
    async pause() {
        this._shouldPause = true;
    }
    async resume() {
        this._shouldPause = false;
    }
    async stop() {
        this._shouldStop = true;
        const ps = new Promise<void>((resolve) => {
            this._stoppedCallback = resolve;
            setTimeout(() => {
                resolve();
            }, 3000);
        });
        await ps;
        clearTimeout(this._thread!);
        this._thread = undefined;
    }

    
}

export class ThreadHandler {
    private _thread?: Thread;
    private _pauseInterval: number;
    private _pauseResolve?: () => void;

    constructor(private poll: (context: IContext) => Promise<boolean>, private name: string, pauseInterval: number) {
        this._pauseInterval = pauseInterval;
    }

    async start() {
        this._thread = new Thread(this.loop.bind(this));
        this._thread.start();
    }

    async resume() {
        this._thread!.resume();
    }

    async pause() {
        this._thread!.pause();
    }

    async stop() {
        this._thread!.stop();
    }

    async destroy() {
        this._thread = undefined;
    }

    // Allow external control to resolve the pause
    forcePauseResolve() {
        if (this._pauseResolve) {
            this._pauseResolve();
            this._pauseResolve = undefined;
        }
    }

    private async loop(context: IContext): Promise<void> {
        // log loop started
        console.log(`loop ${this.name} started`);
        for (;;) {
            try {
                if (context.shouldPause) {
                    // log loop paused
                    console.log(`loop ${this.name} paused`);
                    await sleep(1000);
                    continue;
                }
                if (context.shouldStop) {
                    break;
                }
                const shouldPause = await this.poll(context);
                if (shouldPause) {
                    const ps = new Promise<void>((resolve) => {
                        this._pauseResolve = resolve;
                        setTimeout(() => {
                            this.forcePauseResolve();
                        }, this._pauseInterval);
                    });
                    await ps;
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
}
