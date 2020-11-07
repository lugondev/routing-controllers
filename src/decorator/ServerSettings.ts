import {Metadata, IServerSettings} from "..";
import {SERVER_SETTINGS} from "../constants";

export function ServerSettings(settings: IServerSettings): Function {
    return (target: any) => {
        Metadata.set(SERVER_SETTINGS, settings, target);
    };
}
