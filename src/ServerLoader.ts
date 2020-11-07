import * as Express from "express";
import * as Http from "http";

import {$log} from "ts-log-debug";
import {IServerSettings, IServerLoader} from "./interfaces/IServerSettings";
import {Metadata} from "./metadata-builder/Metadata";
import {SERVER_SETTINGS} from "./constants";
import {useExpressServer} from "./index";

export class ServerLoader implements IServerLoader {
    public project: string;
    public expressApp: Express.Application;
    public httpServer: Http.Server;
    public settings: IServerSettings;

    constructor() {
        this.settings = Metadata.getOwn(SERVER_SETTINGS, this);
        if (!!this.settings.mongoose) {
            require(this.settings.mongoose);
        }
        if (!!this.settings.required) {
            (this.settings.required).forEach((pack) => {
                require(pack);
            });
        }
        this.createExpressApplication()
            .callHook("$onInit");
    }

    public async start(): Promise<any> {
        try {
            const start = new Date();
            await this.initServer();
            await this.startServer();

            await this.callHook("$onReady");

            $log.info(`Started in ${new Date().getTime() - start.getTime()} ms`);
        } catch (err) {
            this.callHook("$onServerInitError", undefined, err);

            return Promise.reject(err);
        }
    }

    protected initServer(): Promise<any> {
        useExpressServer(this.expressApp, this.settings.options || {});
        this.httpServer = Http.createServer(this.expressApp);
        return new Promise(resolve => {
            this.callHook("$onCreateServer", undefined, this.httpServer);
            resolve();
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

        return promise;
    }

    private createExpressApplication(): ServerLoader {
        this.expressApp = Express();

        return this;
    }

    public use(...args: any[]): ServerLoader {
        this.expressApp.use(...args);

        return this;
    }

    public set(setting: string, val: any): ServerLoader {
        this.expressApp.set(setting, val);

        return this;
    }

    public engine(ext: string, fn: Function): ServerLoader {
        // @ts-ignore
        this.expressApp.engine(ext, fn);

        return this;
    }

    private callHook = (key: string, elseFn = new Function(), ...args: any[]) => {
        const self: any = this;

        if (key in this) {
            $log.debug(`Call hook ${key}`);

            return self[key](...args);
        }

        return elseFn();
    }
}
