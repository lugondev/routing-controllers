import {IServerLoader} from "./IServerSettings";

/**
 *
 */
export interface ILoader {
  (options?: IServerLoader): Promise<any> | any;
}
