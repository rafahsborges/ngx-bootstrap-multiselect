import { PipeTransform } from '@angular/core';
import { IMultiSelectOption } from './types';
export declare class MultiSelectSearchFilter implements PipeTransform {
    private _lastOptions;
    private _searchCache;
    private _searchCacheInclusive;
    private _prevSkippedItems;
    transform(options: IMultiSelectOption[], str: string, limit: number, renderLimit: number, searchFunction: (str: string) => RegExp): IMultiSelectOption[];
    private _getSubsetOptions;
    private _doSearch;
    private _limitRenderedItems;
}
