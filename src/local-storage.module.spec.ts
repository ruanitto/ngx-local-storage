import { describe, expect, it } from "vitest";

import { LOCAL_STORAGE_SERVICE_CONFIG } from "./local-storage.config.interface";
import { LocalStorageModule } from "./local-storage.module";

describe("LocalStorageModule", () => {
  it("exposes the config token with an empty default", () => {
    const ngModule = LocalStorageModule.forRoot();

    expect(ngModule.ngModule).toBe(LocalStorageModule);
    expect(ngModule.providers).toHaveLength(1);
    expect(ngModule.providers![0].provide).toBe(LOCAL_STORAGE_SERVICE_CONFIG);
    expect(ngModule.providers![0].useValue).toEqual({});
  });

  it("passes the user configuration through", () => {
    const config = {
      prefix: "app",
      encrypt: true,
      encryptKey: "k3y",
      storageType: "sessionStorage" as const,
    };
    const ngModule = LocalStorageModule.forRoot(config);

    expect(ngModule.providers![0].useValue).toBe(config);
  });
});
