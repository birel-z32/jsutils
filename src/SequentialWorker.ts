class ResolveQueue extends Array<(value?: unknown) => void>
{
    private _interval: number;
    private _timerId: number | null;

    constructor(interval: number)
    {
        super();
        this._interval = interval;
        this._timerId = null;
    }

    push(...items: ((value?: unknown) => void)[]): number
    {
        if (!this._timerId) this.startTimer();
        return super.push(...items);
    }

    shift(): ((value?: unknown) => void) | undefined
    {
        const resolve = super.shift();

        if (this.length == 0) this.stopTimer();

        return resolve;
    }

    private startTimer()
    {
        this._timerId = setInterval(() => {
            const resolve = this.shift();
            if (resolve)
            {
                resolve();
            }
        }, this._interval);
    }

    private stopTimer()
    {
        if (!this._timerId) return;
        clearInterval(this._timerId);
        this._timerId = null;
    }
}

export class SequentialWorker
{
    private _queue: ResolveQueue;

    constructor(interval: number = 1000)
    {
        this._queue = new ResolveQueue(interval);
    }

    regist(): Promise<unknown>
    {
        return new Promise((resolve, reject) => this._queue.push(resolve));
    }
}