import * as i0 from '@angular/core';
import { InjectionToken, NgModule, Injectable, Optional, Inject } from '@angular/core';
import CryptoJS from 'crypto-js';
import { Subscriber, Observable } from 'rxjs';
import { share } from 'rxjs/operators';

const LOCAL_STORAGE_SERVICE_CONFIG = new InjectionToken("LOCAL_STORAGE_SERVICE_CONFIG");

class LocalStorageModule {
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

const DEPRECATED = "This function is deprecated.";
const LOCAL_STORAGE_NOT_SUPPORTED = "LOCAL_STORAGE_NOT_SUPPORTED";
const ENCRYPT_KET_NOT_SET = "To use this function encryptKey must be set!";
class LocalStorageService {
    isSupported = false;
    errors$;
    removeItems$;
    setItems$;
    warnings$;
    notifyOptions = {
        setItem: false,
        removeItem: false,
    };
    prefix = "ls";
    storageType = "localStorage";
    webStorage;
    encryptData = false;
    key = "";
    errors = new Subscriber();
    removeItems = new Subscriber();
    setItems = new Subscriber();
    warnings = new Subscriber();
    constructor(config = {}) {
        let { notifyOptions, prefix, storageType, encrypt, encryptKey } = config;
        if (notifyOptions != null) {
            let { setItem, removeItem } = notifyOptions;
            this.setNotify(!!setItem, !!removeItem);
        }
        if (encrypt) {
            if (!encryptKey) {
                console.warn(ENCRYPT_KET_NOT_SET);
            }
            else {
                this.setEncryptKey(encryptKey);
            }
        }
        if (prefix != null) {
            this.setPrefix(prefix);
        }
        if (storageType != null) {
            this.setStorageType(storageType);
        }
        this.errors$ = new Observable((observer) => (this.errors = observer)).pipe(share());
        this.removeItems$ = new Observable((observer) => (this.removeItems = observer)).pipe(share());
        this.setItems$ = new Observable((observer) => (this.setItems = observer)).pipe(share());
        this.warnings$ = new Observable((observer) => (this.warnings = observer)).pipe(share());
        this.isSupported = this.checkSupport();
    }
    add(key, value) {
        if (console && console.warn) {
            console.warn(DEPRECATED);
            console.warn("Use `LocalStorageService.set` instead.");
        }
        return this.set(key, value);
    }
    clearAll(regularExpression) {
        // Setting both regular expressions independently
        // Empty strings result in catchall RegExp
        let prefixRegex = !!this.prefix
            ? new RegExp("^" + this.prefix)
            : new RegExp("");
        let testRegex = !!regularExpression
            ? new RegExp(regularExpression)
            : new RegExp("");
        if (!this.isSupported) {
            this.warnings.next(LOCAL_STORAGE_NOT_SUPPORTED);
            return false;
        }
        let prefixLength = this.prefix.length;
        for (let key in this.webStorage) {
            // Only remove items that are for this app and match the regular expression
            if (prefixRegex.test(key) && testRegex.test(key.substr(prefixLength))) {
                try {
                    this.remove(key.substr(prefixLength));
                }
                catch (e) {
                    this.errors.next(e.message);
                    return false;
                }
            }
        }
        return true;
    }
    deriveKey(key) {
        return `${this.prefix}${key}`;
    }
    get(key) {
        if (!this.isSupported) {
            this.warnings.next(LOCAL_STORAGE_NOT_SUPPORTED);
            return null;
        }
        let item = this.webStorage
            ? this.webStorage.getItem(this.deriveKey(key))
            : null;
        // FIXME: not a perfect solution, since a valid 'null' string can't be stored
        if (!item || item === "null") {
            return null;
        }
        try {
            if (this.encryptData) {
                item = this.decrypt(item);
            }
            return JSON.parse(item);
        }
        catch (e) {
            return null;
        }
    }
    getStorageType() {
        return this.storageType;
    }
    keys() {
        if (!this.isSupported) {
            this.warnings.next(LOCAL_STORAGE_NOT_SUPPORTED);
            return [];
        }
        let prefixLength = this.prefix.length;
        let keys = [];
        for (let key in this.webStorage) {
            // Only return keys that are for this app
            if (key.substr(0, prefixLength) === this.prefix) {
                try {
                    keys.push(key.substr(prefixLength));
                }
                catch (e) {
                    this.errors.next(e.message);
                    return [];
                }
            }
        }
        return keys;
    }
    length() {
        let count = 0;
        let storage = this.webStorage;
        for (let i = 0; i < storage.length; i++) {
            if (storage.key(i).indexOf(this.prefix) === 0) {
                count += 1;
            }
        }
        return count;
    }
    remove(...keys) {
        let result = true;
        keys.forEach((key) => {
            if (!this.isSupported) {
                this.warnings.next(LOCAL_STORAGE_NOT_SUPPORTED);
                result = false;
            }
            try {
                this.webStorage.removeItem(this.deriveKey(key));
                if (this.notifyOptions.removeItem) {
                    this.removeItems.next({
                        key: key,
                        storageType: this.storageType,
                    });
                }
            }
            catch (e) {
                this.errors.next(e.message);
                result = false;
            }
        });
        return result;
    }
    set(key, value) {
        // Let's convert `undefined` values to `null` to get the value consistent
        if (value === undefined) {
            value = null;
        }
        else {
            value = JSON.stringify(value);
            if (this.encryptData) {
                value = this.encrypt(value);
            }
        }
        if (!this.isSupported) {
            this.warnings.next(LOCAL_STORAGE_NOT_SUPPORTED);
            return false;
        }
        try {
            if (this.webStorage) {
                this.webStorage.setItem(this.deriveKey(key), value);
            }
            if (this.notifyOptions.setItem) {
                this.setItems.next({
                    key: key,
                    newvalue: value,
                    storageType: this.storageType,
                });
            }
        }
        catch (e) {
            this.errors.next(e.message);
            return false;
        }
        return true;
    }
    checkSupport() {
        try {
            let supported = this.storageType in window && window[this.storageType] !== null;
            if (supported) {
                this.webStorage = window[this.storageType];
                // When Safari (OS X or iOS) is in private browsing mode, it
                // appears as though localStorage is available, but trying to
                // call .setItem throws an exception.
                //
                // "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made
                // to add something to storage that exceeded the quota."
                let key = this.deriveKey(`__${Math.round(Math.random() * 1e7)}`);
                this.webStorage.setItem(key, "");
                this.webStorage.removeItem(key);
            }
            return supported;
        }
        catch (e) {
            this.errors.next(e.message);
            return false;
        }
    }
    setEncryptKey(key) {
        this.encryptData = true;
        this.key = key;
    }
    setPrefix(prefix) {
        this.prefix = prefix;
        // If there is a prefix set in the config let's use that with an appended
        // period for readability:
        const PERIOD = ".";
        if (this.prefix && !this.prefix.endsWith(PERIOD)) {
            this.prefix = !!this.prefix ? `${this.prefix}${PERIOD}` : "";
        }
    }
    setStorageType(storageType) {
        this.storageType = storageType;
    }
    setNotify(setItem, removeItem) {
        if (setItem != null) {
            this.notifyOptions.setItem = setItem;
        }
        if (removeItem != null) {
            this.notifyOptions.removeItem = removeItem;
        }
    }
    encrypt(txt) {
        return CryptoJS.AES.encrypt(txt, this.key).toString();
    }
    decrypt(txtToDecrypt) {
        return CryptoJS.AES.decrypt(txtToDecrypt, this.key).toString(CryptoJS.enc.Utf8);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.5", ngImport: i0, type: LocalStorageService, deps: [{ token: LOCAL_STORAGE_SERVICE_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.5", ngImport: i0, type: LocalStorageService, providedIn: "root" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.5", ngImport: i0, type: LocalStorageService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: "root",
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [LOCAL_STORAGE_SERVICE_CONFIG]
                }] }] });

/**
 * Generated bundle index. Do not edit.
 */

export { LocalStorageModule, LocalStorageService };
//# sourceMappingURL=ruanitto-ngx-local-storage.mjs.map
