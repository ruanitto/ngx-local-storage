import { InjectionToken } from "@angular/core";
import { INotifyOptions } from "./notify-options.interface";

export const LOCAL_STORAGE_SERVICE_CONFIG = new InjectionToken<string>(
  "LOCAL_STORAGE_SERVICE_CONFIG"
);

export interface ILocalStorageServiceConfig {
  // Properties:
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
