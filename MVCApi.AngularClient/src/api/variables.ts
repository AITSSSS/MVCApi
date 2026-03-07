import { InjectionToken } from '@angular/core';

export const emailRegex = /^[a-z\.\-_0-9]+@[a-z0-9]+\.[a-z0-9]+$/;
export const BASE_PATH = new InjectionToken<string>('basePath');
export const COLLECTION_FORMATS = {
    'csv': ',',
    'tsv': '   ',
    'ssv': ' ',
    'pipes': '|'
}
