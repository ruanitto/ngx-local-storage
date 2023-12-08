import { NgModule } from '@angular/core';
import { LOCAL_STORAGE_SERVICE_CONFIG } from './local-storage.config.interface';
import * as i0 from "@angular/core";
export class LocalStorageModule {
    static forRoot(userConfig = {}) {
        return {
            ngModule: LocalStorageModule,
            providers: [
                { provide: LOCAL_STORAGE_SERVICE_CONFIG, useValue: userConfig }
            ]
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.5", ngImport: i0, type: LocalStorageModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "17.0.5", ngImport: i0, type: LocalStorageModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "17.0.5", ngImport: i0, type: LocalStorageModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.5", ngImport: i0, type: LocalStorageModule, decorators: [{
            type: NgModule
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwtc3RvcmFnZS5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbG9jYWwtc3RvcmFnZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUF1QixRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFOUQsT0FBTyxFQUE4Qiw0QkFBNEIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDOztBQUc1RyxNQUFNLE9BQU8sa0JBQWtCO0lBQzNCLE1BQU0sQ0FBQyxPQUFPLENBQUUsYUFBeUMsRUFBRTtRQUN2RCxPQUFPO1lBQ0gsUUFBUSxFQUFFLGtCQUFrQjtZQUM1QixTQUFTLEVBQUU7Z0JBQ1AsRUFBRSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRTthQUNsRTtTQUNKLENBQUE7SUFDTCxDQUFDO3VHQVJRLGtCQUFrQjt3R0FBbEIsa0JBQWtCO3dHQUFsQixrQkFBa0I7OzJGQUFsQixrQkFBa0I7a0JBRDlCLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBJTG9jYWxTdG9yYWdlU2VydmljZUNvbmZpZywgTE9DQUxfU1RPUkFHRV9TRVJWSUNFX0NPTkZJRyB9IGZyb20gJy4vbG9jYWwtc3RvcmFnZS5jb25maWcuaW50ZXJmYWNlJztcblxuQE5nTW9kdWxlKClcbmV4cG9ydCBjbGFzcyBMb2NhbFN0b3JhZ2VNb2R1bGUge1xuICAgIHN0YXRpYyBmb3JSb290ICh1c2VyQ29uZmlnOiBJTG9jYWxTdG9yYWdlU2VydmljZUNvbmZpZyA9IHt9KTogTW9kdWxlV2l0aFByb3ZpZGVyczxMb2NhbFN0b3JhZ2VNb2R1bGU+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5nTW9kdWxlOiBMb2NhbFN0b3JhZ2VNb2R1bGUsXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgICAgICAgICB7IHByb3ZpZGU6IExPQ0FMX1NUT1JBR0VfU0VSVklDRV9DT05GSUcsIHVzZVZhbHVlOiB1c2VyQ29uZmlnIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==