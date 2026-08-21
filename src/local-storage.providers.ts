import {
  EnvironmentProviders,
  makeEnvironmentProviders,
} from "@angular/core";

import {
  ILocalStorageServiceConfig,
  LOCAL_STORAGE_SERVICE_CONFIG,
} from "./local-storage.config.interface";

export function provideLocalStorage(
  userConfig: ILocalStorageServiceConfig = {}
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: LOCAL_STORAGE_SERVICE_CONFIG, useValue: userConfig },
  ]);
}
