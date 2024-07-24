import { Pipe, forwardRef, EventEmitter, Component, ChangeDetectionStrategy, IterableDiffers, ChangeDetectorRef, Input, Output, Directive, ElementRef, Host, HostListener, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';

class MultiSelectSearchFilter {
    constructor() {
        this._searchCache = {};
        this._searchCacheInclusive = {};
        this._prevSkippedItems = {};
    }
    transform(options, str = '', limit = 0, renderLimit = 0, searchFunction) {
        str = str.toLowerCase();
        // Drop cache because options were updated
        if (options !== this._lastOptions) {
            this._lastOptions = options;
            this._searchCache = {};
            this._searchCacheInclusive = {};
            this._prevSkippedItems = {};
        }
        const filteredOpts = this._searchCache.hasOwnProperty(str)
            ? this._searchCache[str]
            : this._doSearch(options, str, limit, searchFunction);
        const isUnderLimit = options.length <= limit;
        return isUnderLimit
            ? filteredOpts
            : this._limitRenderedItems(filteredOpts, renderLimit);
    }
    _getSubsetOptions(options, prevOptions, prevSearchStr) {
        const prevInclusiveOrIdx = this._searchCacheInclusive[prevSearchStr];
        if (prevInclusiveOrIdx === true) {
            // If have previous results and it was inclusive, do only subsearch
            return prevOptions;
        }
        else if (typeof prevInclusiveOrIdx === 'number') {
            // Or reuse prev results with unchecked ones
            return [...prevOptions, ...options.slice(prevInclusiveOrIdx)];
        }
        return options;
    }
    _doSearch(options, str, limit, searchFunction) {
        const prevStr = str.slice(0, -1);
        const prevResults = this._searchCache[prevStr];
        const prevResultShift = this._prevSkippedItems[prevStr] || 0;
        if (prevResults) {
            options = this._getSubsetOptions(options, prevResults, prevStr);
        }
        const optsLength = options.length;
        const maxFound = limit > 0 ? Math.min(limit, optsLength) : optsLength;
        const regexp = searchFunction(str);
        const filteredOpts = [];
        let i = 0, founded = 0, removedFromPrevResult = 0;
        const doesOptionMatch = (option) => regexp.test(option.name);
        const getChildren = (option) => options.filter(child => child.parentId === option.id);
        const getParent = (option) => options.find(parent => option.parentId === parent.id);
        const foundFn = (item) => { filteredOpts.push(item); founded++; };
        const notFoundFn = prevResults ? () => removedFromPrevResult++ : () => { };
        for (; i < optsLength && founded < maxFound; ++i) {
            const option = options[i];
            const directMatch = doesOptionMatch(option);
            if (directMatch) {
                foundFn(option);
                continue;
            }
            if (typeof option.parentId === 'undefined') {
                const childrenMatch = getChildren(option).some(doesOptionMatch);
                if (childrenMatch) {
                    foundFn(option);
                    continue;
                }
            }
            if (typeof option.parentId !== 'undefined') {
                const parentMatch = doesOptionMatch(getParent(option));
                if (parentMatch) {
                    foundFn(option);
                    continue;
                }
            }
            notFoundFn();
        }
        const totalIterations = i + prevResultShift;
        this._searchCache[str] = filteredOpts;
        this._searchCacheInclusive[str] = i === optsLength || totalIterations;
        this._prevSkippedItems[str] = removedFromPrevResult + prevResultShift;
        return filteredOpts;
    }
    _limitRenderedItems(items, limit) {
        return items.length > limit && limit > 0 ? items.slice(0, limit) : items;
    }
}
MultiSelectSearchFilter.decorators = [
    { type: Pipe, args: [{
                name: 'searchFilter'
            },] }
];

const MULTISELECT_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NgxDropdownMultiselectComponent),
    multi: true,
};
// tslint:disable-next-line: no-conflicting-lifecycle
class NgxDropdownMultiselectComponent {
    constructor(fb, searchFilter, differs, cdRef) {
        this.fb = fb;
        this.searchFilter = searchFilter;
        this.cdRef = cdRef;
        this.localIsVisible = false;
        this.workerDocClicked = false;
        this.filterControl = this.fb.control('');
        this.disabled = false;
        this.disabledSelection = false;
        this.searchFunction = this._escapeRegExp;
        this.selectionLimitReached = new EventEmitter();
        this.dropdownClosed = new EventEmitter();
        this.dropdownOpened = new EventEmitter();
        this.added = new EventEmitter();
        this.removed = new EventEmitter();
        this.lazyLoad = new EventEmitter();
        this.filter = this.filterControl.valueChanges;
        this.destroyed$ = new Subject();
        this.filteredOptions = [];
        this.lazyLoadOptions = [];
        this.renderFilteredOptions = [];
        this.model = [];
        this.prevModel = [];
        this.numSelected = 0;
        this.renderItems = true;
        this.checkAllSearchRegister = new Set();
        this.checkAllStatus = false;
        this.loadedValueIds = [];
        this._focusBack = false;
        this.defaultSettings = {
            closeOnClickOutside: true,
            pullRight: false,
            enableSearch: false,
            searchRenderLimit: 0,
            searchRenderAfter: 1,
            searchMaxLimit: 0,
            searchMaxRenderedItems: 0,
            checkedStyle: 'checkboxes',
            buttonClasses: 'btn btn-primary dropdown-toggle',
            containerClasses: 'dropdown-inline',
            selectionLimit: 0,
            minSelectionLimit: 0,
            closeOnSelect: false,
            autoUnselect: false,
            showCheckAll: false,
            showUncheckAll: false,
            fixedTitle: false,
            dynamicTitleMaxItems: 3,
            maxHeight: '300px',
            isLazyLoad: false,
            stopScrollPropagation: false,
            loadViewDistance: 1,
            selectAddedValues: false,
            ignoreLabels: false,
            maintainSelectionOrderInTitle: false,
            focusBack: true
        };
        this.defaultTexts = {
            checkAll: 'Select all',
            uncheckAll: 'Unselect all',
            checked: 'selected',
            checkedPlural: 'selected',
            searchPlaceholder: 'Search...',
            searchEmptyResult: 'Nothing found...',
            searchNoRenderText: 'Type in search box to see results...',
            defaultTitle: 'Select',
            allSelected: 'All selected',
        };
        this.onModelChange = (_) => { };
        this.onModelTouched = () => { };
        this.differ = differs.find([]).create(null);
        this.settings = this.defaultSettings;
        this.texts = this.defaultTexts;
    }
    get focusBack() {
        return this.settings.focusBack && this._focusBack;
    }
    set isVisible(val) {
        this.localIsVisible = val;
        this.workerDocClicked = val ? false : this.workerDocClicked;
    }
    get isVisible() {
        return this.localIsVisible;
    }
    get searchLimit() {
        return this.settings.searchRenderLimit;
    }
    get searchRenderAfter() {
        return this.settings.searchRenderAfter;
    }
    get searchLimitApplied() {
        return this.searchLimit > 0 && this.options.length > this.searchLimit;
    }
    clickedOutside() {
        if (!this.isVisible || !this.settings.closeOnClickOutside) {
            return;
        }
        this.isVisible = false;
        this._focusBack = true;
        this.dropdownClosed.emit();
    }
    getItemStyle(option) {
        const style = {};
        if (!option.isLabel) {
            style['cursor'] = 'pointer';
        }
        if (option.disabled) {
            style['cursor'] = 'default';
        }
    }
    getItemStyleSelectionDisabled() {
        if (this.disabledSelection) {
            return { cursor: 'default' };
        }
    }
    ngOnInit() {
        this.title = this.texts.defaultTitle || '';
        this.filterControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
            this.updateRenderItems();
            if (this.settings.isLazyLoad) {
                this.load();
            }
        });
    }
    ngOnChanges(changes) {
        if (changes['options']) {
            this.options = this.options || [];
            this.parents = this.options
                .filter(option => typeof option.parentId === 'number')
                .map(option => option.parentId);
            this.updateRenderItems();
            if (this.settings.isLazyLoad &&
                this.settings.selectAddedValues &&
                this.loadedValueIds.length === 0) {
                this.loadedValueIds = this.loadedValueIds.concat(changes.options.currentValue.map(value => value.id));
            }
            if (this.settings.isLazyLoad &&
                this.settings.selectAddedValues &&
                changes.options.previousValue) {
                const addedValues = changes.options.currentValue.filter(value => this.loadedValueIds.indexOf(value.id) === -1);
                this.loadedValueIds.concat(addedValues.map(value => value.id));
                if (this.checkAllStatus) {
                    this.addChecks(addedValues);
                }
                else if (this.checkAllSearchRegister.size > 0) {
                    this.checkAllSearchRegister.forEach((searchValue) => this.addChecks(this.applyFilters(addedValues, searchValue)));
                }
            }
            if (this.texts) {
                this.updateTitle();
            }
            this.fireModelChange();
        }
        if (changes['settings']) {
            this.settings = Object.assign(Object.assign({}, this.defaultSettings), this.settings);
        }
        if (changes['texts']) {
            this.texts = Object.assign(Object.assign({}, this.defaultTexts), this.texts);
            if (!changes['texts'].isFirstChange()) {
                this.updateTitle();
            }
        }
    }
    ngOnDestroy() {
        this.destroyed$.next();
    }
    updateRenderItems() {
        this.renderItems =
            !this.searchLimitApplied ||
                this.filterControl.value.length >= this.searchRenderAfter;
        this.filteredOptions = this.applyFilters(this.options, this.settings.isLazyLoad ? '' : this.filterControl.value);
        this.renderFilteredOptions = this.renderItems ? this.filteredOptions : [];
        this.focusedItem = undefined;
    }
    applyFilters(options, value) {
        return this.searchFilter.transform(options, value, this.settings.searchMaxLimit, this.settings.searchMaxRenderedItems, this.searchFunction);
    }
    fireModelChange() {
        if (this.model != this.prevModel) {
            this.prevModel = this.model;
            this.onModelChange(this.model);
            this.onModelTouched();
            this.cdRef.markForCheck();
        }
    }
    writeValue(value) {
        if (value !== undefined && value !== null) {
            this.model = Array.isArray(value) ? value : [value];
            this.ngDoCheck();
        }
        else {
            this.model = [];
        }
    }
    registerOnChange(fn) {
        this.onModelChange = fn;
    }
    registerOnTouched(fn) {
        this.onModelTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    ngDoCheck() {
        const changes = this.differ.diff(this.model);
        if (changes) {
            this.updateNumSelected();
            this.updateTitle();
        }
    }
    validate(_c) {
        if (this.model && this.model.length) {
            return {
                required: {
                    valid: false
                }
            };
        }
        if (this.options.filter(o => this.model.indexOf(o.id) && !o.disabled).length === 0) {
            return {
                selection: {
                    valid: false
                }
            };
        }
        return null;
    }
    registerOnValidatorChange(_fn) {
        throw new Error('Method not implemented.');
    }
    clearSearch(event) {
        this.maybeStopPropagation(event);
        this.filterControl.setValue('');
    }
    toggleDropdown(e) {
        if (this.isVisible) {
            this._focusBack = true;
        }
        this.isVisible = !this.isVisible;
        this.isVisible ? this.dropdownOpened.emit() : this.dropdownClosed.emit();
        this.focusedItem = undefined;
    }
    closeDropdown(e) {
        this.isVisible = true;
        this.toggleDropdown(e);
    }
    isSelected(option) {
        return this.model && this.model.indexOf(option.id) > -1;
    }
    setSelected(_event, option) {
        if (option.isLabel) {
            return;
        }
        if (option.disabled) {
            return;
        }
        if (this.disabledSelection) {
            return;
        }
        setTimeout(() => {
            this.maybeStopPropagation(_event);
            this.maybePreventDefault(_event);
            const index = this.model.indexOf(option.id);
            const isAtSelectionLimit = this.settings.selectionLimit > 0 &&
                this.model.length >= this.settings.selectionLimit;
            const removeItem = (idx, id) => {
                this.model.splice(idx, 1);
                this.removed.emit(id);
                if (this.settings.isLazyLoad &&
                    this.lazyLoadOptions.some(val => val.id === id)) {
                    this.lazyLoadOptions.splice(this.lazyLoadOptions.indexOf(this.lazyLoadOptions.find(val => val.id === id)), 1);
                }
            };
            if (index > -1) {
                if (this.settings.minSelectionLimit === undefined ||
                    this.numSelected > this.settings.minSelectionLimit) {
                    removeItem(index, option.id);
                }
                const parentIndex = option.parentId && this.model.indexOf(option.parentId);
                if (parentIndex > -1) {
                    removeItem(parentIndex, option.parentId);
                }
                else if (this.parents.indexOf(option.id) > -1) {
                    this.options
                        .filter(child => this.model.indexOf(child.id) > -1 &&
                        child.parentId === option.id)
                        .forEach(child => removeItem(this.model.indexOf(child.id), child.id));
                }
            }
            else if (isAtSelectionLimit && !this.settings.autoUnselect) {
                this.selectionLimitReached.emit(this.model.length);
                return;
            }
            else {
                const addItem = (id) => {
                    this.model.push(id);
                    this.added.emit(id);
                    if (this.settings.isLazyLoad &&
                        !this.lazyLoadOptions.some(val => val.id === id)) {
                        this.lazyLoadOptions.push(option);
                    }
                };
                addItem(option.id);
                if (!isAtSelectionLimit) {
                    if (option.parentId && !this.settings.ignoreLabels) {
                        const children = this.options.filter(child => child.id !== option.id && child.parentId === option.parentId);
                        if (children.every(child => this.model.indexOf(child.id) > -1)) {
                            addItem(option.parentId);
                        }
                    }
                    else if (this.parents.indexOf(option.id) > -1) {
                        const children = this.options.filter(child => this.model.indexOf(child.id) < 0 && child.parentId === option.id);
                        children.forEach(child => addItem(child.id));
                    }
                }
                else {
                    removeItem(0, this.model[0]);
                }
            }
            if (this.settings.closeOnSelect) {
                this.toggleDropdown();
            }
            this.model = this.model.slice();
            this.fireModelChange();
        }, 0);
    }
    updateNumSelected() {
        this.numSelected =
            this.model.filter(id => this.parents.indexOf(id) < 0).length || 0;
    }
    updateTitle() {
        let numSelectedOptions = this.options.length;
        if (this.settings.ignoreLabels) {
            numSelectedOptions = this.options.filter((option) => !option.isLabel).length;
        }
        if (this.numSelected === 0 || this.settings.fixedTitle) {
            this.title = this.texts ? this.texts.defaultTitle : '';
        }
        else if (this.settings.displayAllSelectedText &&
            this.model.length === numSelectedOptions) {
            this.title = this.texts ? this.texts.allSelected : '';
        }
        else if (this.settings.dynamicTitleMaxItems &&
            this.settings.dynamicTitleMaxItems >= this.numSelected) {
            const useOptions = this.settings.isLazyLoad && this.lazyLoadOptions.length
                ? this.lazyLoadOptions
                : this.options;
            let titleSelections;
            if (this.settings.maintainSelectionOrderInTitle) {
                const optionIds = useOptions.map((selectOption, idx) => selectOption.id);
                titleSelections = this.model
                    .map((selectedId) => optionIds.indexOf(selectedId))
                    .filter((optionIndex) => optionIndex > -1)
                    .map((optionIndex) => useOptions[optionIndex]);
            }
            else {
                titleSelections = useOptions.filter((option) => this.model.indexOf(option.id) > -1);
            }
            this.title = titleSelections.map((option) => option.name).join(', ');
        }
        else {
            this.title =
                this.numSelected +
                    ' ' +
                    (this.numSelected === 1
                        ? this.texts.checked
                        : this.texts.checkedPlural);
        }
        this.cdRef.markForCheck();
    }
    searchFilterApplied() {
        return (this.settings.enableSearch &&
            this.filterControl.value &&
            this.filterControl.value.length > 0);
    }
    addChecks(options) {
        const checkedOptions = options
            .filter((option) => {
            if (!option.disabled &&
                (this.model.indexOf(option.id) === -1 &&
                    !(this.settings.ignoreLabels && option.isLabel))) {
                this.added.emit(option.id);
                return true;
            }
            return false;
        })
            .map((option) => option.id);
        this.model = this.model.concat(checkedOptions);
    }
    checkAll() {
        if (!this.disabledSelection) {
            this.addChecks(!this.searchFilterApplied() ? this.options : this.filteredOptions);
            if (this.settings.isLazyLoad && this.settings.selectAddedValues) {
                if (this.searchFilterApplied() && !this.checkAllStatus) {
                    this.checkAllSearchRegister.add(this.filterControl.value);
                }
                else {
                    this.checkAllSearchRegister.clear();
                    this.checkAllStatus = true;
                }
                this.load();
            }
            this.fireModelChange();
        }
    }
    uncheckAll() {
        if (!this.disabledSelection) {
            const checkedOptions = this.model;
            let unCheckedOptions = !this.searchFilterApplied()
                ? this.model
                : this.filteredOptions.map((option) => option.id);
            // set unchecked options only to the ones that were checked
            unCheckedOptions = checkedOptions.filter(item => unCheckedOptions.indexOf(item) > -1);
            this.model = this.model.filter((id) => {
                if ((unCheckedOptions.indexOf(id) < 0 &&
                    this.settings.minSelectionLimit === undefined) ||
                    unCheckedOptions.indexOf(id) < this.settings.minSelectionLimit) {
                    return true;
                }
                else {
                    this.removed.emit(id);
                    return false;
                }
            });
            if (this.settings.isLazyLoad && this.settings.selectAddedValues) {
                if (this.searchFilterApplied()) {
                    if (this.checkAllSearchRegister.has(this.filterControl.value)) {
                        this.checkAllSearchRegister.delete(this.filterControl.value);
                        this.checkAllSearchRegister.forEach(function (searchTerm) {
                            const filterOptions = this.applyFilters(this.options.filter(option => unCheckedOptions.indexOf(option.id) > -1), searchTerm);
                            this.addChecks(filterOptions);
                        });
                    }
                }
                else {
                    this.checkAllSearchRegister.clear();
                    this.checkAllStatus = false;
                }
                this.load();
            }
            this.fireModelChange();
        }
    }
    preventCheckboxCheck(event, option) {
        if (option.disabled ||
            (this.settings.selectionLimit &&
                !this.settings.autoUnselect &&
                this.model.length >= this.settings.selectionLimit &&
                this.model.indexOf(option.id) === -1 &&
                this.maybePreventDefault(event))) {
            this.maybePreventDefault(event);
        }
    }
    isCheckboxDisabled(option) {
        return this.disabledSelection || option && option.disabled;
    }
    checkScrollPosition(ev) {
        const scrollTop = ev.target.scrollTop;
        const scrollHeight = ev.target.scrollHeight;
        const scrollElementHeight = ev.target.clientHeight;
        const roundingPixel = 1;
        const gutterPixel = 1;
        if (scrollTop >=
            scrollHeight -
                (1 + this.settings.loadViewDistance) * scrollElementHeight -
                roundingPixel -
                gutterPixel) {
            this.load();
        }
    }
    checkScrollPropagation(ev, element) {
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const scrollElementHeight = element.clientHeight;
        if ((ev.deltaY > 0 && scrollTop + scrollElementHeight >= scrollHeight) ||
            (ev.deltaY < 0 && scrollTop <= 0)) {
            ev = ev || window.event;
            this.maybePreventDefault(ev);
            ev.returnValue = false;
        }
    }
    trackById(idx, selectOption) {
        return selectOption.id;
    }
    load() {
        this.lazyLoad.emit({
            length: this.options.length,
            filter: this.filterControl.value,
            checkAllSearches: this.checkAllSearchRegister,
            checkAllStatus: this.checkAllStatus,
        });
    }
    focusItem(dir, e) {
        if (!this.isVisible) {
            return;
        }
        this.maybePreventDefault(e);
        const idx = this.filteredOptions.indexOf(this.focusedItem);
        if (idx === -1) {
            this.focusedItem = this.filteredOptions[0];
            return;
        }
        const nextIdx = idx + dir;
        const newIdx = nextIdx < 0
            ? this.filteredOptions.length - 1
            : nextIdx % this.filteredOptions.length;
        this.focusedItem = this.filteredOptions[newIdx];
    }
    maybePreventDefault(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
    }
    maybeStopPropagation(e) {
        if (e && e.stopPropagation) {
            e.stopPropagation();
        }
    }
    _escapeRegExp(str) {
        const regExpStr = str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        return new RegExp(regExpStr, 'i');
    }
}
NgxDropdownMultiselectComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-bootstrap-multiselect',
                template: "<div *ngIf=\"options\" class=\"dropdown\" [ngClass]=\"settings.containerClasses\" [class.open]=\"isVisible\" (offClick)=\"clickedOutside()\">\n  <button type=\"button\" class=\"dropdown-toggle\" [ngClass]=\"settings.buttonClasses\" (click)=\"toggleDropdown($event)\" [disabled]=\"disabled\"\n    [ssAutofocus]=\"!focusBack\">\n    {{ title }}\n    <span class=\"caret\"></span>\n  </button>\n  <div #scroller *ngIf=\"isVisible\" class=\"dropdown-menu\" [ngClass]=\"{'chunkydropdown-menu': settings.checkedStyle == 'visual' }\"\n    (scroll)=\"settings.isLazyLoad ? checkScrollPosition($event) : null\" (wheel)=\"settings.stopScrollPropagation ? checkScrollPropagation($event, scroller) : null\"\n    [class.pull-right]=\"settings.pullRight\" [class.dropdown-menu-right]=\"settings.pullRight\" [style.max-height]=\"settings.maxHeight\"\n    style=\"display: block; height: auto; overflow-y: auto;\" (keydown.tab)=\"focusItem(1, $event)\" (keydown.shift.tab)=\"focusItem(-1, $event)\">\n    <div class=\"input-group search-container\" *ngIf=\"settings.enableSearch && (renderFilteredOptions.length > 1 || filterControl.value.length > 0)\">\n      <div class=\"input-group-prepend\">\n        <span class=\"input-group-text\" id=\"basic-addon1\">\n          <i class=\"fa fa-search\" aria-hidden=\"true\"></i>\n        </span>\n      </div>\n      <input type=\"text\" class=\"form-control\" ssAutofocus [formControl]=\"filterControl\" [placeholder]=\"texts.searchPlaceholder\"\n        class=\"form-control\">\n      <div class=\"input-group-append\" *ngIf=\"filterControl.value.length>0\">\n        <button class=\"btn btn-default btn-secondary\" type=\"button\" (click)=\"clearSearch($event)\">\n          <i class=\"fa fa-times\"></i>\n        </button>\n      </div>\n    </div>\n    <a role=\"menuitem\" href=\"javascript:;\" tabindex=\"-1\" class=\"dropdown-item check-control check-control-check\" *ngIf=\"settings.showCheckAll && !disabledSelection && renderFilteredOptions.length > 1\"\n      (click)=\"checkAll()\">\n      <span style=\"width: 16px;\"><span [ngClass]=\"{'glyphicon glyphicon-ok': settings.checkedStyle !== 'fontawesome','fa fa-check': settings.checkedStyle === 'fontawesome'}\"></span></span>\n      {{ texts.checkAll }}\n    </a>\n    <a role=\"menuitem\" href=\"javascript:;\" tabindex=\"-1\" class=\"dropdown-item check-control check-control-uncheck\" *ngIf=\"settings.showUncheckAll && !disabledSelection && renderFilteredOptions.length > 1\"\n      (click)=\"uncheckAll()\">\n      <span style=\"width: 16px;\"><span [ngClass]=\"{'glyphicon glyphicon-remove': settings.checkedStyle !== 'fontawesome','fa fa-times': settings.checkedStyle === 'fontawesome'}\"></span></span>\n      {{ texts.uncheckAll }}\n    </a>\n    <a *ngIf=\"settings.showCheckAll || settings.showUncheckAll\" href=\"javascript:;\" class=\"dropdown-divider divider\"></a>\n    <a *ngIf=\"!renderItems\" href=\"javascript:;\" class=\"dropdown-item empty\">{{ texts.searchNoRenderText }}</a>\n    <a *ngIf=\"renderItems && !renderFilteredOptions.length\" href=\"javascript:;\" class=\"dropdown-item empty\">{{ texts.searchEmptyResult }}</a>\n    <a class=\"dropdown-item\" href=\"javascript:;\" *ngFor=\"let option of renderFilteredOptions; trackBy: trackById\" [class.active]=\"isSelected(option)\"\n      [ngStyle]=\"getItemStyle(option)\" [ngClass]=\"option.classes\" [class.dropdown-header]=\"option.isLabel\" [ssAutofocus]=\"option !== focusedItem\"\n      tabindex=\"-1\" (click)=\"setSelected($event, option)\" (keydown.space)=\"setSelected($event, option)\" (keydown.enter)=\"setSelected($event, option)\">\n      <span *ngIf=\"!option.isLabel; else label\" role=\"menuitem\" tabindex=\"-1\" [style.padding-left]=\"this.parents.length>0&&this.parents.indexOf(option.id)<0&&'30px'\"\n        [ngStyle]=\"getItemStyleSelectionDisabled()\">\n        <ng-container [ngSwitch]=\"settings.checkedStyle\">\n          <input *ngSwitchCase=\"'checkboxes'\" type=\"checkbox\" [checked]=\"isSelected(option)\" (click)=\"preventCheckboxCheck($event, option)\"\n            [disabled]=\"isCheckboxDisabled(option)\" [ngStyle]=\"getItemStyleSelectionDisabled()\" />\n          <span *ngSwitchCase=\"'glyphicon'\" style=\"width: 16px;\" class=\"glyphicon\" [class.glyphicon-ok]=\"isSelected(option)\" [class.glyphicon-lock]=\"isCheckboxDisabled(option)\"></span>\n          <span *ngSwitchCase=\"'fontawesome'\" style=\"width: 16px;display: inline-block;\">\n            <span *ngIf=\"isSelected(option)\"><i class=\"fa fa-check\" aria-hidden=\"true\"></i></span>\n            <span *ngIf=\"isCheckboxDisabled(option)\"><i class=\"fa fa-lock\" aria-hidden=\"true\"></i></span>\n          </span>\n          <span *ngSwitchCase=\"'visual'\" style=\"display:block;float:left; border-radius: 0.2em; border: 0.1em solid rgba(44, 44, 44, 0.63);background:rgba(0, 0, 0, 0.1);width: 5.5em;\">\n            <div class=\"slider\" [ngClass]=\"{'slideron': isSelected(option)}\">\n              <img *ngIf=\"option.image != null\" [src]=\"option.image\" style=\"height: 100%; width: 100%; object-fit: contain\" />\n              <div *ngIf=\"option.image == null\" style=\"height: 100%; width: 100%;text-align: center; display: table; background-color:rgba(0, 0, 0, 0.74)\">\n                <div class=\"content_wrapper\">\n                  <span style=\"font-size:3em;color:white\" class=\"glyphicon glyphicon-eye-close\"></span>\n                </div>\n              </div>\n            </div>\n          </span>\n        </ng-container>\n        <span [ngClass]=\"{'chunkyrow': settings.checkedStyle == 'visual' }\" [class.disabled]=\"isCheckboxDisabled(option)\" [ngClass]=\"settings.itemClasses\"\n          [style.font-weight]=\"this.parents.indexOf(option.id)>=0?'bold':'normal'\">\n          {{ option.name }}\n        </span>\n      </span>\n      <ng-template #label>\n        <span [class.disabled]=\"isCheckboxDisabled(option)\">{{ option.name }}</span>\n      </ng-template>\n    </a>\n  </div>\n</div>\n",
                providers: [MULTISELECT_VALUE_ACCESSOR, MultiSelectSearchFilter],
                changeDetection: ChangeDetectionStrategy.OnPush,
                styles: ["a{outline:none!important}.dropdown-inline{display:inline-block}.dropdown-toggle .caret{display:inline-block;margin-left:4px;white-space:nowrap}.chunkydropdown-menu{min-width:20em}.chunkyrow{font-size:2em;line-height:2;margin-left:1em}.slider{display:block;height:3.8em;margin-left:.125em;margin-top:auto;transition:all .125s linear;width:3.8em}.slideron{margin-left:1.35em}.content_wrapper{display:table-cell;vertical-align:middle}.search-container{padding:0 5px 5px}"]
            },] }
];
NgxDropdownMultiselectComponent.ctorParameters = () => [
    { type: FormBuilder },
    { type: MultiSelectSearchFilter },
    { type: IterableDiffers },
    { type: ChangeDetectorRef }
];
NgxDropdownMultiselectComponent.propDecorators = {
    options: [{ type: Input }],
    settings: [{ type: Input }],
    texts: [{ type: Input }],
    disabled: [{ type: Input }],
    disabledSelection: [{ type: Input }],
    searchFunction: [{ type: Input }],
    selectionLimitReached: [{ type: Output }],
    dropdownClosed: [{ type: Output }],
    dropdownOpened: [{ type: Output }],
    added: [{ type: Output }],
    removed: [{ type: Output }],
    lazyLoad: [{ type: Output }],
    filter: [{ type: Output }]
};

class AutofocusDirective {
    constructor(elemRef) {
        this.elemRef = elemRef;
    }
    get element() {
        return this.elemRef.nativeElement;
    }
    ngOnInit() {
        this.focus();
    }
    ngOnChanges(changes) {
        const ssAutofocusChange = changes.ssAutofocus;
        if (ssAutofocusChange && !ssAutofocusChange.isFirstChange()) {
            this.focus();
        }
    }
    focus() {
        if (this.ssAutofocus) {
            return;
        }
        this.element.focus && this.element.focus();
    }
}
AutofocusDirective.decorators = [
    { type: Directive, args: [{
                selector: '[ssAutofocus]'
            },] }
];
AutofocusDirective.ctorParameters = () => [
    { type: ElementRef, decorators: [{ type: Host }] }
];
AutofocusDirective.propDecorators = {
    ssAutofocus: [{ type: Input }]
};

class OffClickDirective {
    constructor() {
        this.onOffClick = new EventEmitter();
    }
    onClick(event) {
        this._clickEvent = event;
    }
    onTouch(event) {
        this._touchEvent = event;
    }
    onDocumentClick(event) {
        if (event !== this._clickEvent) {
            this.onOffClick.emit(event);
        }
    }
    onDocumentTouch(event) {
        if (event !== this._touchEvent) {
            this.onOffClick.emit(event);
        }
    }
}
OffClickDirective.decorators = [
    { type: Directive, args: [{
                // tslint:disable-next-line:directive-selector
                selector: '[offClick]',
            },] }
];
OffClickDirective.propDecorators = {
    onOffClick: [{ type: Output, args: ['offClick',] }],
    onClick: [{ type: HostListener, args: ['click', ['$event'],] }],
    onTouch: [{ type: HostListener, args: ['touchstart', ['$event'],] }],
    onDocumentClick: [{ type: HostListener, args: ['document:click', ['$event'],] }],
    onDocumentTouch: [{ type: HostListener, args: ['document:touchstart', ['$event'],] }]
};

class NgxBootstrapMultiselectModule {
}
NgxBootstrapMultiselectModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    NgxDropdownMultiselectComponent,
                    MultiSelectSearchFilter,
                    AutofocusDirective,
                    OffClickDirective
                ],
                imports: [
                    CommonModule,
                    ReactiveFormsModule
                ],
                exports: [
                    NgxDropdownMultiselectComponent,
                    MultiSelectSearchFilter,
                ],
            },] }
];

/*
 * Public API Surface of ngx-bootstrap-multiselect
 */

/**
 * Generated bundle index. Do not edit.
 */

export { MultiSelectSearchFilter, NgxBootstrapMultiselectModule, NgxDropdownMultiselectComponent as ɵa, AutofocusDirective as ɵb, OffClickDirective as ɵc };
//# sourceMappingURL=ngx-bootstrap-multiselect.js.map
