import { ModuleWithProviders } from '@angular/core';
import { ILocalStorageServiceConfig } from './local-storage.config.interface';
import * as i0 from "@angular/core";
export declare class LocalStorageModule {
    static forRoot(userConfig?: ILocalStorageServiceConfig): ModuleWithProviders<LocalStorageModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<LocalStorageModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<LocalStorageModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<LocalStorageModule>;
}
