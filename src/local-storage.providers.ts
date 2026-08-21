import {
  EnvironmentProviders,
  Provider,
  makeEnvironmentProviders,
} from "@angular/core";

import {
  ILocalStorageServiceConfig,
  LOCAL_STORAGE_SERVICE_CONFIG,
} from "./local-storage.config.interface";
import { LocalStorageModule } from "./local-storage.module";
import {
  LOCAL_STORAGE_MOCK_STORAGE,
  LocalStorageMock,
} from "./local-storage-mock.storage";

export function provideLocalStorage(
  userConfig: ILocalStorageServiceConfig = {}
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: LOCAL_STORAGE_SERVICE_CONFIG, useValue: userConfig },
  ]);
}

export interface IMockLocalStorageOptions {
  /**
   * Backs the service with an in-memory `Storage` instead of the browser's
   * real storage, keeping tests fully isolated from persisted data.
   */
  inMemoryStorage?: boolean;
}

export function provideMockLocalStorage(
  userConfig?: ILocalStorageServiceConfig,
  options: IMockLocalStorageOptions = {}
): EnvironmentProviders {
  const providers: Array<Provider> = [
    {
      provide: LOCAL_STORAGE_SERVICE_CONFIG,
      useValue:
        userConfig ?? ({
          prefix: "test-app",
          storageType: "localStorage",
        } as ILocalStorageServiceConfig),
    },
  ];

  if (options.inMemoryStorage) {
    providers.push({
      provide: LOCAL_STORAGE_MOCK_STORAGE,
      useClass: LocalStorageMock,
    });
  }

  return makeEnvironmentProviders(providers);
}
