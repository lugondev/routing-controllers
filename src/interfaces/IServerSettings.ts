import {RoutingControllersOptions} from "../RoutingControllersOptions";
import {ILoader} from "./ILoader";

export interface IServerSettings {
    /**
     * name of project -  show on log
     */
    project?: string;
    /**
     * root dir of project
     */
    rootDir?: string;
    /**
     *
     */
    env?: "dev" | "development" | "prod" | "production";
    /**
     * port
     */
    port?: number | string;
    /**
     *
     */
    address?: string;
    /**
     *
     */
    required?: string[];
    /**
     *
     */
    loaders?: ILoader[];

    /**
     * Load mongooses, for example './models'.
     */
    mongoose?: string;

    options?: RoutingControllersOptions;
}

export interface IServerLoader {
    project: any;

    $beforeInit?(): Promise<any>;

    $onInit?(): Function;

    $beforeCreateServer?(): Promise<any>;

    $onCreateServer?(): Function;

    $onCreatedServer?(): Function;

    $onReady?(): Function;

    $onServerInitError?(error: any): Function;
}
