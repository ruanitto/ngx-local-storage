import { InjectionToken } from "@angular/core";
import { INotifyOptions } from "./notify-options.interface";
export declare const LOCAL_STORAGE_SERVICE_CONFIG: InjectionToken<string>;
export interface ILocalStorageServiceConfig {
    notifyOptions?: INotifyOptions;
    /**
     * Prefix for storage item
     */
    prefix?: string;
    storageType?: "sessionStorage" | "localStorage";
    /**
     * Encrypt data
     */
    encrypt?: boolean;
    /**
     * If encrypt data, key must be set
     */
    encryptKey?: string;
}
