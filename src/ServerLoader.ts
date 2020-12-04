import * as Express from "express";
import * as Http from "http";

import {$log} from "ts-log-debug";
import {IServerSettings, IServerLoader} from "./interfaces/IServerSettings";
import {Metadata} from "./metadata-builder/Metadata";
import {SERVER_SETTINGS} from "./constants";
import {ILoader, useExpressServer} from "./index";

export class ServerLoader implements IServerLoader {
    public project: string;
    public expressApp: Express.Application;
    public httpServer: Http.Server;
    public settings: IServerSettings;

    constructor() {
        this.settings = Metadata.getOwn(SERVER_SETTINGS, this);
        this.project = this.settings.project || "Project";
        if (!!this.settings.mongoose) {
            require(this.settings.mongoose);
        }
        if (!!this.settings.required) {
            (this.settings.required).forEach((pack) => {
                require(pack);
            });
        }

    }

    public async start(): Promise<any> {
        try {
            const start = new Date();
            await this.callHookCallback("$beforeInit")
                .then(() => {
                    $log.info("Create express application");
                    this.createExpressApplication()
                        .callHook("$onInit");
                });

            await this.initServer();
            await this.startServer();

            await this.callHook("$onReady");

            $log.info(`Started in ${new Date().getTime() - start.getTime()} ms`);
            return this;
        } catch (err) {
            this.callHook("$onServerInitError", undefined, err);

            return Promise.reject(err);
        }
    }

    protected initServer(): Promise<any> {
        this.callHook("$beforeCreateServer");
        useExpressServer(this.expressApp, this.settings.options || {});
        this.httpServer = Http.createServer(this.expressApp);
        return new Promise((resolve) => {
            this.callHook("$onCreateServer", undefined, this.httpServer);
            return resolve();
        });
    }

    protected startServer(): Promise<any> {
        let port = this.settings.port;
        let address = this.settings.address || "127.0.0.1";
        $log.debug(`Start server on ${address}:${port}`);
        const promise = new Promise((resolve, reject) => {
            this.httpServer.on("listening", resolve).on("error", reject);
        }).then(() => {
            port = (this.httpServer.address() as any).port;
            $log.info(`HTTP Server listen on  ${address}:${port}`);
        });

        this.httpServer.listen(port, this.httpServer.address() as any);

        return promise.then(_ => {
            return new Promise((resolve) => {
                this.callHook("$onCreatedServer", undefined, this.httpServer);
                return resolve();
            });
        });
    }

    private createExpressApplication(): ServerLoader {
        this.expressApp = Express();

        return this;
    }

    public use(...args: any[]): ServerLoader {
        this.expressApp.use(...args);

        return this;
    }

    private async load(loader: ILoader): Promise<any> {
        await loader(this);
    }

    private runPromisesLoaders(loaders: Promise<any>[] | any[]) {
        let result = Promise.resolve();
        loaders.forEach(loader => {
            result = result.then(() => this.load(loader));
        });
        return result;
    }

    public async loaders(oneByOne: boolean = false): Promise<any> {
        if (this.settings.loaders && this.settings.loaders.length > 0) {
            if (!oneByOne) {
                return await Promise.all(this.settings.loaders.map(async loader => {
                    return await this.load(loader);
                }));
            } else {
                return await this.runPromisesLoaders(this.settings.loaders);
            }
        }
    }

    public async runLoaders(loaders: ILoader[], oneByOne: boolean = false): Promise<any> {
        if (loaders && loaders.length > 0) {
            if (!oneByOne) {
                return await Promise.all(loaders.map(async loader => {
                    return await this.load(loader);
                }));
            } else {
                return await this.runPromisesLoaders(loaders);
            }
        }
    }

    public set(setting: string, val: any): ServerLoader {
        this.expressApp.set(setting, val);

        return this;
    }

    public engine(ext: string, fn: (path: string, options: object, callback: (e: any, rendered?: string) => void) => void): ServerLoader {
        this.expressApp.engine(ext, fn);

        return this;
    }

    private callHook(key: string, elseFn = new Function(), ...args: any[]) {
        const self: any = this;

        if (key in this) {
            $log.debug(`Call hook ${key}`);

            return self[key](...args);
        }

        return elseFn();
    }

    private async callHookCallback(key: string, callback = new Function(), ...args: any[]) {
        const self: any = this;

        if (key in this) {
            $log.debug(`Call hook callback ${key}`);

            return self[key](...args).then(callback);
        }

        return callback();
    }
}
