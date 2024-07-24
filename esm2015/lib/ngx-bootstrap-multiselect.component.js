import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, IterableDiffers, Output, } from '@angular/core';
import { FormBuilder, NG_VALUE_ACCESSOR, } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { MultiSelectSearchFilter } from './search-filter.pipe';
import { Subject } from 'rxjs';
const MULTISELECT_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NgxDropdownMultiselectComponent),
    multi: true,
};
// tslint:disable-next-line: no-conflicting-lifecycle
export class NgxDropdownMultiselectComponent {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWJvb3RzdHJhcC1tdWx0aXNlbGVjdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtYm9vdHN0cmFwLW11bHRpc2VsZWN0L3NyYy9saWIvbmd4LWJvb3RzdHJhcC1tdWx0aXNlbGVjdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUVULFlBQVksRUFDWixVQUFVLEVBQ1YsS0FBSyxFQUNMLGVBQWUsRUFJZixNQUFNLEdBRVAsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUdMLFdBQVcsRUFFWCxpQkFBaUIsR0FFbEIsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFL0QsT0FBTyxFQUFFLE9BQU8sRUFBYyxNQUFNLE1BQU0sQ0FBQztBQUUzQyxNQUFNLDBCQUEwQixHQUFRO0lBQ3RDLE9BQU8sRUFBRSxpQkFBaUI7SUFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQywrQkFBK0IsQ0FBQztJQUM5RCxLQUFLLEVBQUUsSUFBSTtDQUNaLENBQUM7QUFFRixxREFBcUQ7QUFRckQsTUFBTSxPQUFPLCtCQUErQjtJQTRHMUMsWUFDVSxFQUFlLEVBQ2YsWUFBcUMsRUFDN0MsT0FBd0IsRUFDaEIsS0FBd0I7UUFIeEIsT0FBRSxHQUFGLEVBQUUsQ0FBYTtRQUNmLGlCQUFZLEdBQVosWUFBWSxDQUF5QjtRQUVyQyxVQUFLLEdBQUwsS0FBSyxDQUFtQjtRQXpHMUIsbUJBQWMsR0FBRyxLQUFLLENBQUM7UUFDdkIscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1FBRWpDLGtCQUFhLEdBQWdCLElBQUksQ0FBQyxFQUFFLENBQUMs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QUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTyxtQkFBbUIsQ0FBQyxDQUFTO1FBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLEVBQUU7WUFDekIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3BCO0lBQ0gsQ0FBQztJQUVPLG9CQUFvQixDQUFDLENBQVM7UUFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLGVBQWUsRUFBRTtZQUMxQixDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7U0FDckI7SUFDSCxDQUFDO0lBRU8sYUFBYSxDQUFDLEdBQVc7UUFDL0IsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxxQ0FBcUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM3RSxPQUFPLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDOzs7WUEvcEJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsMkJBQTJCO2dCQUNyQyw0M0xBQXlEO2dCQUV6RCxTQUFTLEVBQUUsQ0FBQywwQkFBMEIsRUFBRSx1QkFBdUIsQ0FBQztnQkFDaEUsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07O2FBQ2hEOzs7WUF4QkMsV0FBVztZQU9KLHVCQUF1QjtZQWxCOUIsZUFBZTtZQU5mLGlCQUFpQjs7O3NCQXNEaEIsS0FBSzt1QkFDTCxLQUFLO29CQUNMLEtBQUs7dUJBQ0wsS0FBSztnQ0FDTCxLQUFLOzZCQUNMLEtBQUs7b0NBRUwsTUFBTTs2QkFDTixNQUFNOzZCQUNOLE1BQU07b0JBQ04sTUFBTTtzQkFDTixNQUFNO3VCQUNOLE1BQU07cUJBQ04sTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBEb0NoZWNrLFxuICBFdmVudEVtaXR0ZXIsXG4gIGZvcndhcmRSZWYsXG4gIElucHV0LFxuICBJdGVyYWJsZURpZmZlcnMsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgU2ltcGxlQ2hhbmdlcyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7XG4gIEFic3RyYWN0Q29udHJvbCxcbiAgQ29udHJvbFZhbHVlQWNjZXNzb3IsXG4gIEZvcm1CdWlsZGVyLFxuICBGb3JtQ29udHJvbCxcbiAgTkdfVkFMVUVfQUNDRVNTT1IsXG4gIFZhbGlkYXRvcixcbn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBNdWx0aVNlbGVjdFNlYXJjaEZpbHRlciB9IGZyb20gJy4vc2VhcmNoLWZpbHRlci5waXBlJztcbmltcG9ydCB7IElNdWx0aVNlbGVjdE9wdGlvbiwgSU11bHRpU2VsZWN0U2V0dGluZ3MsIElNdWx0aVNlbGVjdFRleHRzLCB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuXG5jb25zdCBNVUxUSVNFTEVDVF9WQUxVRV9BQ0NFU1NPUjogYW55ID0ge1xuICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmd4RHJvcGRvd25NdWx0aXNlbGVjdENvbXBvbmVudCksXG4gIG11bHRpOiB0cnVlLFxufTtcblxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1jb25mbGljdGluZy1saWZlY3ljbGVcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25neC1ib290c3RyYXAtbXVsdGlzZWxlY3QnLFxuICB0ZW1wbGF0ZVVybDogJy4vbmd4LWJvb3RzdHJhcC1tdWx0aXNlbGVjdC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL25neC1ib290c3RyYXAtbXVsdGlzZWxlY3QuY29tcG9uZW50LmNzcyddLFxuICBwcm92aWRlcnM6IFtNVUxUSVNFTEVDVF9WQUxVRV9BQ0NFU1NPUiwgTXVsdGlTZWxlY3RTZWFyY2hGaWx0ZXJdLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxufSlcbmV4cG9ydCBjbGFzcyBOZ3hEcm9wZG93bk11bHRpc2VsZWN0Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LFxuICBPbkNoYW5nZXMsXG4gIERvQ2hlY2ssXG4gIE9uRGVzdHJveSxcbiAgQ29udHJvbFZhbHVlQWNjZXNzb3IsXG4gIFZhbGlkYXRvciB7XG5cbiAgcHJpdmF0ZSBsb2NhbElzVmlzaWJsZSA9IGZhbHNlO1xuICBwcml2YXRlIHdvcmtlckRvY0NsaWNrZWQgPSBmYWxzZTtcblxuICBmaWx0ZXJDb250cm9sOiBGb3JtQ29udHJvbCA9IHRoaXMuZmIuY29udHJvbCgnJyk7XG5cbiAgQElucHV0KCkgb3B0aW9uczogQXJyYXk8SU11bHRpU2VsZWN0T3B0aW9uPjtcbiAgQElucHV0KCkgc2V0dGluZ3M6IElNdWx0aVNlbGVjdFNldHRpbmdzO1xuICBASW5wdXQoKSB0ZXh0czogSU11bHRpU2VsZWN0VGV4dHM7XG4gIEBJbnB1dCgpIGRpc2FibGVkID0gZmFsc2U7XG4gIEBJbnB1dCgpIGRpc2FibGVkU2VsZWN0aW9uID0gZmFsc2U7XG4gIEBJbnB1dCgpIHNlYXJjaEZ1bmN0aW9uOiAoc3RyOiBzdHJpbmcpID0+IFJlZ0V4cCA9IHRoaXMuX2VzY2FwZVJlZ0V4cDtcblxuICBAT3V0cHV0KCkgc2VsZWN0aW9uTGltaXRSZWFjaGVkID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgZHJvcGRvd25DbG9zZWQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBkcm9wZG93bk9wZW5lZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIGFkZGVkID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgcmVtb3ZlZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIGxhenlMb2FkID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgZmlsdGVyOiBPYnNlcnZhYmxlPHN0cmluZz4gPSB0aGlzLmZpbHRlckNvbnRyb2wudmFsdWVDaGFuZ2VzO1xuXG4gIGdldCBmb2N1c0JhY2soKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0dGluZ3MuZm9jdXNCYWNrICYmIHRoaXMuX2ZvY3VzQmFjaztcbiAgfVxuXG4gIGRlc3Ryb3llZCQgPSBuZXcgU3ViamVjdDxhbnk+KCk7XG5cbiAgZmlsdGVyZWRPcHRpb25zOiBJTXVsdGlTZWxlY3RPcHRpb25bXSA9IFtdO1xuICBsYXp5TG9hZE9wdGlvbnM6IElNdWx0aVNlbGVjdE9wdGlvbltdID0gW107XG4gIHJlbmRlckZpbHRlcmVkT3B0aW9uczogSU11bHRpU2VsZWN0T3B0aW9uW10gPSBbXTtcbiAgbW9kZWw6IGFueVtdID0gW107XG4gIHByZXZNb2RlbDogYW55W10gPSBbXTtcbiAgcGFyZW50czogYW55W107XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGRpZmZlcjogYW55O1xuICBudW1TZWxlY3RlZCA9IDA7XG4gIHNldCBpc1Zpc2libGUodmFsOiBib29sZWFuKSB7XG4gICAgdGhpcy5sb2NhbElzVmlzaWJsZSA9IHZhbDtcbiAgICB0aGlzLndvcmtlckRvY0NsaWNrZWQgPSB2YWwgPyBmYWxzZSA6IHRoaXMud29ya2VyRG9jQ2xpY2tlZDtcbiAgfVxuICBnZXQgaXNWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxvY2FsSXNWaXNpYmxlO1xuICB9XG4gIHJlbmRlckl0ZW1zID0gdHJ1ZTtcbiAgY2hlY2tBbGxTZWFyY2hSZWdpc3RlciA9IG5ldyBTZXQoKTtcbiAgY2hlY2tBbGxTdGF0dXMgPSBmYWxzZTtcbiAgbG9hZGVkVmFsdWVJZHMgPSBbXTtcbiAgX2ZvY3VzQmFjayA9IGZhbHNlO1xuICBmb2N1c2VkSXRlbTogSU11bHRpU2VsZWN0T3B0aW9uIHwgdW5kZWZpbmVkO1xuXG4gIGRlZmF1bHRTZXR0aW5nczogSU11bHRpU2VsZWN0U2V0dGluZ3MgPSB7XG4gICAgY2xvc2VPbkNsaWNrT3V0c2lkZTogdHJ1ZSxcbiAgICBwdWxsUmlnaHQ6IGZhbHNlLFxuICAgIGVuYWJsZVNlYXJjaDogZmFsc2UsXG4gICAgc2VhcmNoUmVuZGVyTGltaXQ6IDAsXG4gICAgc2VhcmNoUmVuZGVyQWZ0ZXI6IDEsXG4gICAgc2VhcmNoTWF4TGltaXQ6IDAsXG4gICAgc2VhcmNoTWF4UmVuZGVyZWRJdGVtczogMCxcbiAgICBjaGVja2VkU3R5bGU6ICdjaGVja2JveGVzJyxcbiAgICBidXR0b25DbGFzc2VzOiAnYnRuIGJ0bi1wcmltYXJ5IGRyb3Bkb3duLXRvZ2dsZScsXG4gICAgY29udGFpbmVyQ2xhc3NlczogJ2Ryb3Bkb3duLWlubGluZScsXG4gICAgc2VsZWN0aW9uTGltaXQ6IDAsXG4gICAgbWluU2VsZWN0aW9uTGltaXQ6IDAsXG4gICAgY2xvc2VPblNlbGVjdDogZmFsc2UsXG4gICAgYXV0b1Vuc2VsZWN0OiBmYWxzZSxcbiAgICBzaG93Q2hlY2tBbGw6IGZhbHNlLFxuICAgIHNob3dVbmNoZWNrQWxsOiBmYWxzZSxcbiAgICBmaXhlZFRpdGxlOiBmYWxzZSxcbiAgICBkeW5hbWljVGl0bGVNYXhJdGVtczogMyxcbiAgICBtYXhIZWlnaHQ6ICczMDBweCcsXG4gICAgaXNMYXp5TG9hZDogZmFsc2UsXG4gICAgc3RvcFNjcm9sbFByb3BhZ2F0aW9uOiBmYWxzZSxcbiAgICBsb2FkVmlld0Rpc3RhbmNlOiAxLFxuICAgIHNlbGVjdEFkZGVkVmFsdWVzOiBmYWxzZSxcbiAgICBpZ25vcmVMYWJlbHM6IGZhbHNlLFxuICAgIG1haW50YWluU2VsZWN0aW9uT3JkZXJJblRpdGxlOiBmYWxzZSxcbiAgICBmb2N1c0JhY2s6IHRydWVcbiAgfTtcbiAgZGVmYXVsdFRleHRzOiBJTXVsdGlTZWxlY3RUZXh0cyA9IHtcbiAgICBjaGVja0FsbDogJ1NlbGVjdCBhbGwnLFxuICAgIHVuY2hlY2tBbGw6ICdVbnNlbGVjdCBhbGwnLFxuICAgIGNoZWNrZWQ6ICdzZWxlY3RlZCcsXG4gICAgY2hlY2tlZFBsdXJhbDogJ3NlbGVjdGVkJyxcbiAgICBzZWFyY2hQbGFjZWhvbGRlcjogJ1NlYXJjaC4uLicsXG4gICAgc2VhcmNoRW1wdHlSZXN1bHQ6ICdOb3RoaW5nIGZvdW5kLi4uJyxcbiAgICBzZWFyY2hOb1JlbmRlclRleHQ6ICdUeXBlIGluIHNlYXJjaCBib3ggdG8gc2VlIHJlc3VsdHMuLi4nLFxuICAgIGRlZmF1bHRUaXRsZTogJ1NlbGVjdCcsXG4gICAgYWxsU2VsZWN0ZWQ6ICdBbGwgc2VsZWN0ZWQnLFxuICB9O1xuXG4gIGdldCBzZWFyY2hMaW1pdCgpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnNldHRpbmdzLnNlYXJjaFJlbmRlckxpbWl0O1xuICB9XG5cbiAgZ2V0IHNlYXJjaFJlbmRlckFmdGVyKCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuc2V0dGluZ3Muc2VhcmNoUmVuZGVyQWZ0ZXI7XG4gIH1cblxuICBnZXQgc2VhcmNoTGltaXRBcHBsaWVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNlYXJjaExpbWl0ID4gMCAmJiB0aGlzLm9wdGlvbnMubGVuZ3RoID4gdGhpcy5zZWFyY2hMaW1pdDtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZmI6IEZvcm1CdWlsZGVyLFxuICAgIHByaXZhdGUgc2VhcmNoRmlsdGVyOiBNdWx0aVNlbGVjdFNlYXJjaEZpbHRlcixcbiAgICBkaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMsXG4gICAgcHJpdmF0ZSBjZFJlZjogQ2hhbmdlRGV0ZWN0b3JSZWZcbiAgKSB7XG4gICAgdGhpcy5kaWZmZXIgPSBkaWZmZXJzLmZpbmQoW10pLmNyZWF0ZShudWxsKTtcbiAgICB0aGlzLnNldHRpbmdzID0gdGhpcy5kZWZhdWx0U2V0dGluZ3M7XG4gICAgdGhpcy50ZXh0cyA9IHRoaXMuZGVmYXVsdFRleHRzO1xuICB9XG5cbiAgY2xpY2tlZE91dHNpZGUoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlzVmlzaWJsZSB8fCAhdGhpcy5zZXR0aW5ncy5jbG9zZU9uQ2xpY2tPdXRzaWRlKSB7IHJldHVybjsgfVxuXG4gICAgdGhpcy5pc1Zpc2libGUgPSBmYWxzZTtcbiAgICB0aGlzLl9mb2N1c0JhY2sgPSB0cnVlO1xuICAgIHRoaXMuZHJvcGRvd25DbG9zZWQuZW1pdCgpO1xuICB9XG5cbiAgZ2V0SXRlbVN0eWxlKG9wdGlvbjogSU11bHRpU2VsZWN0T3B0aW9uKTogYW55IHtcbiAgICBjb25zdCBzdHlsZSA9IHt9O1xuICAgIGlmICghb3B0aW9uLmlzTGFiZWwpIHtcbiAgICAgIHN0eWxlWydjdXJzb3InXSA9ICdwb2ludGVyJztcbiAgICB9XG4gICAgaWYgKG9wdGlvbi5kaXNhYmxlZCkge1xuICAgICAgc3R5bGVbJ2N1cnNvciddID0gJ2RlZmF1bHQnO1xuICAgIH1cbiAgfVxuXG4gIGdldEl0ZW1TdHlsZVNlbGVjdGlvbkRpc2FibGVkKCk6IGFueSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWRTZWxlY3Rpb24pIHtcbiAgICAgIHJldHVybiB7IGN1cnNvcjogJ2RlZmF1bHQnIH07XG4gICAgfVxuICB9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgdGhpcy50aXRsZSA9IHRoaXMudGV4dHMuZGVmYXVsdFRpdGxlIHx8ICcnO1xuXG4gICAgdGhpcy5maWx0ZXJDb250cm9sLnZhbHVlQ2hhbmdlcy5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3llZCQpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVSZW5kZXJJdGVtcygpO1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuaXNMYXp5TG9hZCkge1xuICAgICAgICB0aGlzLmxvYWQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoY2hhbmdlc1snb3B0aW9ucyddKSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnMgfHwgW107XG4gICAgICB0aGlzLnBhcmVudHMgPSB0aGlzLm9wdGlvbnNcbiAgICAgICAgLmZpbHRlcihvcHRpb24gPT4gdHlwZW9mIG9wdGlvbi5wYXJlbnRJZCA9PT0gJ251bWJlcicpXG4gICAgICAgIC5tYXAob3B0aW9uID0+IG9wdGlvbi5wYXJlbnRJZCk7XG4gICAgICB0aGlzLnVwZGF0ZVJlbmRlckl0ZW1zKCk7XG5cbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5pc0xhenlMb2FkICYmXG4gICAgICAgIHRoaXMuc2V0dGluZ3Muc2VsZWN0QWRkZWRWYWx1ZXMgJiZcbiAgICAgICAgdGhpcy5sb2FkZWRWYWx1ZUlkcy5sZW5ndGggPT09IDBcbiAgICAgICkge1xuICAgICAgICB0aGlzLmxvYWRlZFZhbHVlSWRzID0gdGhpcy5sb2FkZWRWYWx1ZUlkcy5jb25jYXQoXG4gICAgICAgICAgY2hhbmdlcy5vcHRpb25zLmN1cnJlbnRWYWx1ZS5tYXAodmFsdWUgPT4gdmFsdWUuaWQpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuc2V0dGluZ3MuaXNMYXp5TG9hZCAmJlxuICAgICAgICB0aGlzLnNldHRpbmdzLnNlbGVjdEFkZGVkVmFsdWVzICYmXG4gICAgICAgIGNoYW5nZXMub3B0aW9ucy5wcmV2aW91c1ZhbHVlXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgYWRkZWRWYWx1ZXMgPSBjaGFuZ2VzLm9wdGlvbnMuY3VycmVudFZhbHVlLmZpbHRlcihcbiAgICAgICAgICB2YWx1ZSA9PiB0aGlzLmxvYWRlZFZhbHVlSWRzLmluZGV4T2YodmFsdWUuaWQpID09PSAtMVxuICAgICAgICApO1xuICAgICAgICB0aGlzLmxvYWRlZFZhbHVlSWRzLmNvbmNhdChhZGRlZFZhbHVlcy5tYXAodmFsdWUgPT4gdmFsdWUuaWQpKTtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tBbGxTdGF0dXMpIHtcbiAgICAgICAgICB0aGlzLmFkZENoZWNrcyhhZGRlZFZhbHVlcyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jaGVja0FsbFNlYXJjaFJlZ2lzdGVyLnNpemUgPiAwKSB7XG4gICAgICAgICAgdGhpcy5jaGVja0FsbFNlYXJjaFJlZ2lzdGVyLmZvckVhY2goKHNlYXJjaFZhbHVlOiBzdHJpbmcpID0+XG4gICAgICAgICAgICB0aGlzLmFkZENoZWNrcyh0aGlzLmFwcGx5RmlsdGVycyhhZGRlZFZhbHVlcywgc2VhcmNoVmFsdWUpKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMudGV4dHMpIHtcbiAgICAgICAgdGhpcy51cGRhdGVUaXRsZSgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmZpcmVNb2RlbENoYW5nZSgpO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VzWydzZXR0aW5ncyddKSB7XG4gICAgICB0aGlzLnNldHRpbmdzID0geyAuLi50aGlzLmRlZmF1bHRTZXR0aW5ncywgLi4udGhpcy5zZXR0aW5ncyB9O1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VzWyd0ZXh0cyddKSB7XG4gICAgICB0aGlzLnRleHRzID0geyAuLi50aGlzLmRlZmF1bHRUZXh0cywgLi4udGhpcy50ZXh0cyB9O1xuICAgICAgaWYgKCFjaGFuZ2VzWyd0ZXh0cyddLmlzRmlyc3RDaGFuZ2UoKSkgeyB0aGlzLnVwZGF0ZVRpdGxlKCk7IH1cbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmRlc3Ryb3llZCQubmV4dCgpO1xuICB9XG5cbiAgdXBkYXRlUmVuZGVySXRlbXMoKSB7XG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9XG4gICAgICAhdGhpcy5zZWFyY2hMaW1pdEFwcGxpZWQgfHxcbiAgICAgIHRoaXMuZmlsdGVyQ29udHJvbC52YWx1ZS5sZW5ndGggPj0gdGhpcy5zZWFyY2hSZW5kZXJBZnRlcjtcbiAgICB0aGlzLmZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuYXBwbHlGaWx0ZXJzKFxuICAgICAgdGhpcy5vcHRpb25zLFxuICAgICAgdGhpcy5zZXR0aW5ncy5pc0xhenlMb2FkID8gJycgOiB0aGlzLmZpbHRlckNvbnRyb2wudmFsdWVcbiAgICApO1xuICAgIHRoaXMucmVuZGVyRmlsdGVyZWRPcHRpb25zID0gdGhpcy5yZW5kZXJJdGVtcyA/IHRoaXMuZmlsdGVyZWRPcHRpb25zIDogW107XG4gICAgdGhpcy5mb2N1c2VkSXRlbSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGFwcGx5RmlsdGVycyhvcHRpb25zOiBJTXVsdGlTZWxlY3RPcHRpb25bXSwgdmFsdWU6IHN0cmluZyk6IElNdWx0aVNlbGVjdE9wdGlvbltdIHtcbiAgICByZXR1cm4gdGhpcy5zZWFyY2hGaWx0ZXIudHJhbnNmb3JtKFxuICAgICAgb3B0aW9ucyxcbiAgICAgIHZhbHVlLFxuICAgICAgdGhpcy5zZXR0aW5ncy5zZWFyY2hNYXhMaW1pdCxcbiAgICAgIHRoaXMuc2V0dGluZ3Muc2VhcmNoTWF4UmVuZGVyZWRJdGVtcyxcbiAgICAgIHRoaXMuc2VhcmNoRnVuY3Rpb25cbiAgICApO1xuICB9XG5cbiAgZmlyZU1vZGVsQ2hhbmdlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLm1vZGVsICE9IHRoaXMucHJldk1vZGVsKSB7XG4gICAgICB0aGlzLnByZXZNb2RlbCA9IHRoaXMubW9kZWw7XG4gICAgICB0aGlzLm9uTW9kZWxDaGFuZ2UodGhpcy5tb2RlbCk7XG4gICAgICB0aGlzLm9uTW9kZWxUb3VjaGVkKCk7XG4gICAgICB0aGlzLmNkUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIG9uTW9kZWxDaGFuZ2U6IEZ1bmN0aW9uID0gKF86IGFueSkgPT4geyB9O1xuICBvbk1vZGVsVG91Y2hlZDogRnVuY3Rpb24gPSAoKSA9PiB7IH07XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgIHRoaXMubW9kZWwgPSBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW3ZhbHVlXTtcbiAgICAgIHRoaXMubmdEb0NoZWNrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubW9kZWwgPSBbXTtcbiAgICB9XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMub25Nb2RlbENoYW5nZSA9IGZuO1xuICB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5vbk1vZGVsVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKSB7XG4gICAgdGhpcy5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgY29uc3QgY2hhbmdlcyA9IHRoaXMuZGlmZmVyLmRpZmYodGhpcy5tb2RlbCk7XG4gICAgaWYgKGNoYW5nZXMpIHtcbiAgICAgIHRoaXMudXBkYXRlTnVtU2VsZWN0ZWQoKTtcbiAgICAgIHRoaXMudXBkYXRlVGl0bGUoKTtcbiAgICB9XG4gIH1cblxuICB2YWxpZGF0ZShfYzogQWJzdHJhY3RDb250cm9sKTogeyBba2V5OiBzdHJpbmddOiBhbnkgfSB7XG4gICAgaWYgKHRoaXMubW9kZWwgJiYgdGhpcy5tb2RlbC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVpcmVkOiB7XG4gICAgICAgICAgdmFsaWQ6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5maWx0ZXIobyA9PiB0aGlzLm1vZGVsLmluZGV4T2Yoby5pZCkgJiYgIW8uZGlzYWJsZWQpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2VsZWN0aW9uOiB7XG4gICAgICAgICAgdmFsaWQ6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZWdpc3Rlck9uVmFsaWRhdG9yQ2hhbmdlKF9mbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRocm93IG5ldyBFcnJvcignTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIGNsZWFyU2VhcmNoKGV2ZW50OiBFdmVudCkge1xuICAgIHRoaXMubWF5YmVTdG9wUHJvcGFnYXRpb24oZXZlbnQpO1xuICAgIHRoaXMuZmlsdGVyQ29udHJvbC5zZXRWYWx1ZSgnJyk7XG4gIH1cblxuICB0b2dnbGVEcm9wZG93bihlPzogRXZlbnQpIHtcbiAgICBpZiAodGhpcy5pc1Zpc2libGUpIHtcbiAgICAgIHRoaXMuX2ZvY3VzQmFjayA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5pc1Zpc2libGUgPSAhdGhpcy5pc1Zpc2libGU7XG4gICAgdGhpcy5pc1Zpc2libGUgPyB0aGlzLmRyb3Bkb3duT3BlbmVkLmVtaXQoKSA6IHRoaXMuZHJvcGRvd25DbG9zZWQuZW1pdCgpO1xuICAgIHRoaXMuZm9jdXNlZEl0ZW0gPSB1bmRlZmluZWQ7XG4gIH1cblxuICBjbG9zZURyb3Bkb3duKGU/OiBFdmVudCkge1xuICAgIHRoaXMuaXNWaXNpYmxlID0gdHJ1ZTtcbiAgICB0aGlzLnRvZ2dsZURyb3Bkb3duKGUpO1xuICB9XG5cbiAgaXNTZWxlY3RlZChvcHRpb246IElNdWx0aVNlbGVjdE9wdGlvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm1vZGVsICYmIHRoaXMubW9kZWwuaW5kZXhPZihvcHRpb24uaWQpID4gLTE7XG4gIH1cblxuICBzZXRTZWxlY3RlZChfZXZlbnQ6IEV2ZW50LCBvcHRpb246IElNdWx0aVNlbGVjdE9wdGlvbikge1xuICAgIGlmIChvcHRpb24uaXNMYWJlbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChvcHRpb24uZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kaXNhYmxlZFNlbGVjdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5tYXliZVN0b3BQcm9wYWdhdGlvbihfZXZlbnQpO1xuICAgICAgdGhpcy5tYXliZVByZXZlbnREZWZhdWx0KF9ldmVudCk7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMubW9kZWwuaW5kZXhPZihvcHRpb24uaWQpO1xuICAgICAgY29uc3QgaXNBdFNlbGVjdGlvbkxpbWl0ID1cbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zZWxlY3Rpb25MaW1pdCA+IDAgJiZcbiAgICAgICAgdGhpcy5tb2RlbC5sZW5ndGggPj0gdGhpcy5zZXR0aW5ncy5zZWxlY3Rpb25MaW1pdDtcbiAgICAgIGNvbnN0IHJlbW92ZUl0ZW0gPSAoaWR4LCBpZCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLm1vZGVsLnNwbGljZShpZHgsIDEpO1xuICAgICAgICB0aGlzLnJlbW92ZWQuZW1pdChpZCk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLnNldHRpbmdzLmlzTGF6eUxvYWQgJiZcbiAgICAgICAgICB0aGlzLmxhenlMb2FkT3B0aW9ucy5zb21lKHZhbCA9PiB2YWwuaWQgPT09IGlkKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLmxhenlMb2FkT3B0aW9ucy5zcGxpY2UoXG4gICAgICAgICAgICB0aGlzLmxhenlMb2FkT3B0aW9ucy5pbmRleE9mKFxuICAgICAgICAgICAgICB0aGlzLmxhenlMb2FkT3B0aW9ucy5maW5kKHZhbCA9PiB2YWwuaWQgPT09IGlkKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIDFcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy5taW5TZWxlY3Rpb25MaW1pdCA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgdGhpcy5udW1TZWxlY3RlZCA+IHRoaXMuc2V0dGluZ3MubWluU2VsZWN0aW9uTGltaXRcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmVtb3ZlSXRlbShpbmRleCwgb3B0aW9uLmlkKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJlbnRJbmRleCA9XG4gICAgICAgICAgb3B0aW9uLnBhcmVudElkICYmIHRoaXMubW9kZWwuaW5kZXhPZihvcHRpb24ucGFyZW50SWQpO1xuICAgICAgICBpZiAocGFyZW50SW5kZXggPiAtMSkge1xuICAgICAgICAgIHJlbW92ZUl0ZW0ocGFyZW50SW5kZXgsIG9wdGlvbi5wYXJlbnRJZCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wYXJlbnRzLmluZGV4T2Yob3B0aW9uLmlkKSA+IC0xKSB7XG4gICAgICAgICAgdGhpcy5vcHRpb25zXG4gICAgICAgICAgICAuZmlsdGVyKFxuICAgICAgICAgICAgICBjaGlsZCA9PlxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuaW5kZXhPZihjaGlsZC5pZCkgPiAtMSAmJlxuICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudElkID09PSBvcHRpb24uaWRcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5mb3JFYWNoKGNoaWxkID0+XG4gICAgICAgICAgICAgIHJlbW92ZUl0ZW0odGhpcy5tb2RlbC5pbmRleE9mKGNoaWxkLmlkKSwgY2hpbGQuaWQpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGlzQXRTZWxlY3Rpb25MaW1pdCAmJiAhdGhpcy5zZXR0aW5ncy5hdXRvVW5zZWxlY3QpIHtcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25MaW1pdFJlYWNoZWQuZW1pdCh0aGlzLm1vZGVsLmxlbmd0aCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGFkZEl0ZW0gPSAoaWQpOiB2b2lkID0+IHtcbiAgICAgICAgICB0aGlzLm1vZGVsLnB1c2goaWQpO1xuICAgICAgICAgIHRoaXMuYWRkZWQuZW1pdChpZCk7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5pc0xhenlMb2FkICYmXG4gICAgICAgICAgICAhdGhpcy5sYXp5TG9hZE9wdGlvbnMuc29tZSh2YWwgPT4gdmFsLmlkID09PSBpZClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMubGF6eUxvYWRPcHRpb25zLnB1c2gob3B0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgYWRkSXRlbShvcHRpb24uaWQpO1xuICAgICAgICBpZiAoIWlzQXRTZWxlY3Rpb25MaW1pdCkge1xuICAgICAgICAgIGlmIChvcHRpb24ucGFyZW50SWQgJiYgIXRoaXMuc2V0dGluZ3MuaWdub3JlTGFiZWxzKSB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMub3B0aW9ucy5maWx0ZXIoXG4gICAgICAgICAgICAgIGNoaWxkID0+XG4gICAgICAgICAgICAgICAgY2hpbGQuaWQgIT09IG9wdGlvbi5pZCAmJiBjaGlsZC5wYXJlbnRJZCA9PT0gb3B0aW9uLnBhcmVudElkXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmV2ZXJ5KGNoaWxkID0+IHRoaXMubW9kZWwuaW5kZXhPZihjaGlsZC5pZCkgPiAtMSkpIHtcbiAgICAgICAgICAgICAgYWRkSXRlbShvcHRpb24ucGFyZW50SWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wYXJlbnRzLmluZGV4T2Yob3B0aW9uLmlkKSA+IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMub3B0aW9ucy5maWx0ZXIoXG4gICAgICAgICAgICAgIGNoaWxkID0+XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5pbmRleE9mKGNoaWxkLmlkKSA8IDAgJiYgY2hpbGQucGFyZW50SWQgPT09IG9wdGlvbi5pZFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gYWRkSXRlbShjaGlsZC5pZCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZW1vdmVJdGVtKDAsIHRoaXMubW9kZWxbMF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy5jbG9zZU9uU2VsZWN0KSB7XG4gICAgICAgIHRoaXMudG9nZ2xlRHJvcGRvd24oKTtcbiAgICAgIH1cbiAgICAgIHRoaXMubW9kZWwgPSB0aGlzLm1vZGVsLnNsaWNlKCk7XG4gICAgICB0aGlzLmZpcmVNb2RlbENoYW5nZSgpO1xuXG4gICAgfSwgMClcbiAgfVxuXG4gIHVwZGF0ZU51bVNlbGVjdGVkKCkge1xuICAgIHRoaXMubnVtU2VsZWN0ZWQgPVxuICAgICAgdGhpcy5tb2RlbC5maWx0ZXIoaWQgPT4gdGhpcy5wYXJlbnRzLmluZGV4T2YoaWQpIDwgMCkubGVuZ3RoIHx8IDA7XG4gIH1cblxuICB1cGRhdGVUaXRsZSgpIHtcbiAgICBsZXQgbnVtU2VsZWN0ZWRPcHRpb25zID0gdGhpcy5vcHRpb25zLmxlbmd0aDtcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5pZ25vcmVMYWJlbHMpIHtcbiAgICAgIG51bVNlbGVjdGVkT3B0aW9ucyA9IHRoaXMub3B0aW9ucy5maWx0ZXIoXG4gICAgICAgIChvcHRpb246IElNdWx0aVNlbGVjdE9wdGlvbikgPT4gIW9wdGlvbi5pc0xhYmVsXG4gICAgICApLmxlbmd0aDtcbiAgICB9XG4gICAgaWYgKHRoaXMubnVtU2VsZWN0ZWQgPT09IDAgfHwgdGhpcy5zZXR0aW5ncy5maXhlZFRpdGxlKSB7XG4gICAgICB0aGlzLnRpdGxlID0gdGhpcy50ZXh0cyA/IHRoaXMudGV4dHMuZGVmYXVsdFRpdGxlIDogJyc7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHRoaXMuc2V0dGluZ3MuZGlzcGxheUFsbFNlbGVjdGVkVGV4dCAmJlxuICAgICAgdGhpcy5tb2RlbC5sZW5ndGggPT09IG51bVNlbGVjdGVkT3B0aW9uc1xuICAgICkge1xuICAgICAgdGhpcy50aXRsZSA9IHRoaXMudGV4dHMgPyB0aGlzLnRleHRzLmFsbFNlbGVjdGVkIDogJyc7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHRoaXMuc2V0dGluZ3MuZHluYW1pY1RpdGxlTWF4SXRlbXMgJiZcbiAgICAgIHRoaXMuc2V0dGluZ3MuZHluYW1pY1RpdGxlTWF4SXRlbXMgPj0gdGhpcy5udW1TZWxlY3RlZFxuICAgICkge1xuICAgICAgY29uc3QgdXNlT3B0aW9ucyA9XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuaXNMYXp5TG9hZCAmJiB0aGlzLmxhenlMb2FkT3B0aW9ucy5sZW5ndGhcbiAgICAgICAgICA/IHRoaXMubGF6eUxvYWRPcHRpb25zXG4gICAgICAgICAgOiB0aGlzLm9wdGlvbnM7XG5cbiAgICAgIGxldCB0aXRsZVNlbGVjdGlvbnM6IEFycmF5PElNdWx0aVNlbGVjdE9wdGlvbj47XG5cbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLm1haW50YWluU2VsZWN0aW9uT3JkZXJJblRpdGxlKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbklkcyA9IHVzZU9wdGlvbnMubWFwKChzZWxlY3RPcHRpb246IElNdWx0aVNlbGVjdE9wdGlvbiwgaWR4OiBudW1iZXIpID0+IHNlbGVjdE9wdGlvbi5pZCk7XG4gICAgICAgIHRpdGxlU2VsZWN0aW9ucyA9IHRoaXMubW9kZWxcbiAgICAgICAgICAubWFwKChzZWxlY3RlZElkKSA9PiBvcHRpb25JZHMuaW5kZXhPZihzZWxlY3RlZElkKSlcbiAgICAgICAgICAuZmlsdGVyKChvcHRpb25JbmRleCkgPT4gb3B0aW9uSW5kZXggPiAtMSlcbiAgICAgICAgICAubWFwKChvcHRpb25JbmRleCkgPT4gdXNlT3B0aW9uc1tvcHRpb25JbmRleF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGl0bGVTZWxlY3Rpb25zID0gdXNlT3B0aW9ucy5maWx0ZXIoKG9wdGlvbjogSU11bHRpU2VsZWN0T3B0aW9uKSA9PiB0aGlzLm1vZGVsLmluZGV4T2Yob3B0aW9uLmlkKSA+IC0xKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50aXRsZSA9IHRpdGxlU2VsZWN0aW9ucy5tYXAoKG9wdGlvbjogSU11bHRpU2VsZWN0T3B0aW9uKSA9PiBvcHRpb24ubmFtZSkuam9pbignLCAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50aXRsZSA9XG4gICAgICAgIHRoaXMubnVtU2VsZWN0ZWQgK1xuICAgICAgICAnICcgK1xuICAgICAgICAodGhpcy5udW1TZWxlY3RlZCA9PT0gMVxuICAgICAgICAgID8gdGhpcy50ZXh0cy5jaGVja2VkXG4gICAgICAgICAgOiB0aGlzLnRleHRzLmNoZWNrZWRQbHVyYWwpO1xuICAgIH1cbiAgICB0aGlzLmNkUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgc2VhcmNoRmlsdGVyQXBwbGllZCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5zZXR0aW5ncy5lbmFibGVTZWFyY2ggJiZcbiAgICAgIHRoaXMuZmlsdGVyQ29udHJvbC52YWx1ZSAmJlxuICAgICAgdGhpcy5maWx0ZXJDb250cm9sLnZhbHVlLmxlbmd0aCA+IDBcbiAgICApO1xuICB9XG5cbiAgYWRkQ2hlY2tzKG9wdGlvbnMpIHtcbiAgICBjb25zdCBjaGVja2VkT3B0aW9ucyA9IG9wdGlvbnNcbiAgICAgIC5maWx0ZXIoKG9wdGlvbjogSU11bHRpU2VsZWN0T3B0aW9uKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhb3B0aW9uLmRpc2FibGVkICYmXG4gICAgICAgICAgKFxuICAgICAgICAgICAgdGhpcy5tb2RlbC5pbmRleE9mKG9wdGlvbi5pZCkgPT09IC0xICYmXG4gICAgICAgICAgICAhKHRoaXMuc2V0dGluZ3MuaWdub3JlTGFiZWxzICYmIG9wdGlvbi5pc0xhYmVsKVxuICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5hZGRlZC5lbWl0KG9wdGlvbi5pZCk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC5tYXAoKG9wdGlvbjogSU11bHRpU2VsZWN0T3B0aW9uKSA9PiBvcHRpb24uaWQpO1xuXG4gICAgdGhpcy5tb2RlbCA9IHRoaXMubW9kZWwuY29uY2F0KGNoZWNrZWRPcHRpb25zKTtcbiAgfVxuXG4gIGNoZWNrQWxsKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZFNlbGVjdGlvbikge1xuICAgICAgdGhpcy5hZGRDaGVja3MoXG4gICAgICAgICF0aGlzLnNlYXJjaEZpbHRlckFwcGxpZWQoKSA/IHRoaXMub3B0aW9ucyA6IHRoaXMuZmlsdGVyZWRPcHRpb25zXG4gICAgICApO1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuaXNMYXp5TG9hZCAmJiB0aGlzLnNldHRpbmdzLnNlbGVjdEFkZGVkVmFsdWVzKSB7XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaEZpbHRlckFwcGxpZWQoKSAmJiAhdGhpcy5jaGVja0FsbFN0YXR1cykge1xuICAgICAgICAgIHRoaXMuY2hlY2tBbGxTZWFyY2hSZWdpc3Rlci5hZGQodGhpcy5maWx0ZXJDb250cm9sLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNoZWNrQWxsU2VhcmNoUmVnaXN0ZXIuY2xlYXIoKTtcbiAgICAgICAgICB0aGlzLmNoZWNrQWxsU3RhdHVzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvYWQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZmlyZU1vZGVsQ2hhbmdlKCk7XG4gICAgfVxuICB9XG5cbiAgdW5jaGVja0FsbCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZGlzYWJsZWRTZWxlY3Rpb24pIHtcbiAgICAgIGNvbnN0IGNoZWNrZWRPcHRpb25zID0gdGhpcy5tb2RlbDtcbiAgICAgIGxldCB1bkNoZWNrZWRPcHRpb25zID0gIXRoaXMuc2VhcmNoRmlsdGVyQXBwbGllZCgpXG4gICAgICAgID8gdGhpcy5tb2RlbFxuICAgICAgICA6IHRoaXMuZmlsdGVyZWRPcHRpb25zLm1hcCgob3B0aW9uOiBJTXVsdGlTZWxlY3RPcHRpb24pID0+IG9wdGlvbi5pZCk7XG4gICAgICAvLyBzZXQgdW5jaGVja2VkIG9wdGlvbnMgb25seSB0byB0aGUgb25lcyB0aGF0IHdlcmUgY2hlY2tlZFxuICAgICAgdW5DaGVja2VkT3B0aW9ucyA9IGNoZWNrZWRPcHRpb25zLmZpbHRlcihpdGVtID0+IHVuQ2hlY2tlZE9wdGlvbnMuaW5kZXhPZihpdGVtKSA+IC0xKTtcbiAgICAgIHRoaXMubW9kZWwgPSB0aGlzLm1vZGVsLmZpbHRlcigoaWQ6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgKHVuQ2hlY2tlZE9wdGlvbnMuaW5kZXhPZihpZCkgPCAwICYmXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLm1pblNlbGVjdGlvbkxpbWl0ID09PSB1bmRlZmluZWQpIHx8XG4gICAgICAgICAgdW5DaGVja2VkT3B0aW9ucy5pbmRleE9mKGlkKSA8IHRoaXMuc2V0dGluZ3MubWluU2VsZWN0aW9uTGltaXRcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVkLmVtaXQoaWQpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy5pc0xhenlMb2FkICYmIHRoaXMuc2V0dGluZ3Muc2VsZWN0QWRkZWRWYWx1ZXMpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoRmlsdGVyQXBwbGllZCgpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuY2hlY2tBbGxTZWFyY2hSZWdpc3Rlci5oYXModGhpcy5maWx0ZXJDb250cm9sLnZhbHVlKSkge1xuICAgICAgICAgICAgdGhpcy5jaGVja0FsbFNlYXJjaFJlZ2lzdGVyLmRlbGV0ZSh0aGlzLmZpbHRlckNvbnRyb2wudmFsdWUpO1xuICAgICAgICAgICAgdGhpcy5jaGVja0FsbFNlYXJjaFJlZ2lzdGVyLmZvckVhY2goZnVuY3Rpb24oc2VhcmNoVGVybSkge1xuICAgICAgICAgICAgICBjb25zdCBmaWx0ZXJPcHRpb25zID0gdGhpcy5hcHBseUZpbHRlcnModGhpcy5vcHRpb25zLmZpbHRlcihvcHRpb24gPT4gdW5DaGVja2VkT3B0aW9ucy5pbmRleE9mKG9wdGlvbi5pZCkgPiAtMSksIHNlYXJjaFRlcm0pO1xuICAgICAgICAgICAgICB0aGlzLmFkZENoZWNrcyhmaWx0ZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNoZWNrQWxsU2VhcmNoUmVnaXN0ZXIuY2xlYXIoKTtcbiAgICAgICAgICB0aGlzLmNoZWNrQWxsU3RhdHVzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmZpcmVNb2RlbENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByZXZlbnRDaGVja2JveENoZWNrKGV2ZW50OiBFdmVudCwgb3B0aW9uOiBJTXVsdGlTZWxlY3RPcHRpb24pOiB2b2lkIHtcbiAgICBpZiAoXG4gICAgICBvcHRpb24uZGlzYWJsZWQgfHxcbiAgICAgIChcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5zZWxlY3Rpb25MaW1pdCAmJlxuICAgICAgICAhdGhpcy5zZXR0aW5ncy5hdXRvVW5zZWxlY3QgJiZcbiAgICAgICAgdGhpcy5tb2RlbC5sZW5ndGggPj0gdGhpcy5zZXR0aW5ncy5zZWxlY3Rpb25MaW1pdCAmJlxuICAgICAgICB0aGlzLm1vZGVsLmluZGV4T2Yob3B0aW9uLmlkKSA9PT0gLTEgJiZcbiAgICAgICAgdGhpcy5tYXliZVByZXZlbnREZWZhdWx0KGV2ZW50KVxuICAgICAgKVxuICAgICkge1xuICAgICAgdGhpcy5tYXliZVByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBpc0NoZWNrYm94RGlzYWJsZWQob3B0aW9uPzogSU11bHRpU2VsZWN0T3B0aW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZGlzYWJsZWRTZWxlY3Rpb24gfHwgb3B0aW9uICYmIG9wdGlvbi5kaXNhYmxlZDtcbiAgfVxuXG4gIGNoZWNrU2Nyb2xsUG9zaXRpb24oZXYpOiB2b2lkIHtcbiAgICBjb25zdCBzY3JvbGxUb3AgPSBldi50YXJnZXQuc2Nyb2xsVG9wO1xuICAgIGNvbnN0IHNjcm9sbEhlaWdodCA9IGV2LnRhcmdldC5zY3JvbGxIZWlnaHQ7XG4gICAgY29uc3Qgc2Nyb2xsRWxlbWVudEhlaWdodCA9IGV2LnRhcmdldC5jbGllbnRIZWlnaHQ7XG4gICAgY29uc3Qgcm91bmRpbmdQaXhlbCA9IDE7XG4gICAgY29uc3QgZ3V0dGVyUGl4ZWwgPSAxO1xuXG4gICAgaWYgKFxuICAgICAgc2Nyb2xsVG9wID49XG4gICAgICBzY3JvbGxIZWlnaHQgLVxuICAgICAgKDEgKyB0aGlzLnNldHRpbmdzLmxvYWRWaWV3RGlzdGFuY2UpICogc2Nyb2xsRWxlbWVudEhlaWdodCAtXG4gICAgICByb3VuZGluZ1BpeGVsIC1cbiAgICAgIGd1dHRlclBpeGVsXG4gICAgKSB7XG4gICAgICB0aGlzLmxvYWQoKTtcbiAgICB9XG4gIH1cblxuICBjaGVja1Njcm9sbFByb3BhZ2F0aW9uKGV2LCBlbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gZWxlbWVudC5zY3JvbGxUb3A7XG4gICAgY29uc3Qgc2Nyb2xsSGVpZ2h0ID0gZWxlbWVudC5zY3JvbGxIZWlnaHQ7XG4gICAgY29uc3Qgc2Nyb2xsRWxlbWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXG4gICAgaWYgKFxuICAgICAgKGV2LmRlbHRhWSA+IDAgJiYgc2Nyb2xsVG9wICsgc2Nyb2xsRWxlbWVudEhlaWdodCA+PSBzY3JvbGxIZWlnaHQpIHx8XG4gICAgICAoZXYuZGVsdGFZIDwgMCAmJiBzY3JvbGxUb3AgPD0gMClcbiAgICApIHtcbiAgICAgIGV2ID0gZXYgfHwgd2luZG93LmV2ZW50O1xuICAgICAgdGhpcy5tYXliZVByZXZlbnREZWZhdWx0KGV2KTtcbiAgICAgIGV2LnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdHJhY2tCeUlkKGlkeDogbnVtYmVyLCBzZWxlY3RPcHRpb246IElNdWx0aVNlbGVjdE9wdGlvbik6IHZvaWQge1xuICAgIHJldHVybiBzZWxlY3RPcHRpb24uaWQ7XG4gIH1cblxuICBsb2FkKCk6IHZvaWQge1xuICAgIHRoaXMubGF6eUxvYWQuZW1pdCh7XG4gICAgICBsZW5ndGg6IHRoaXMub3B0aW9ucy5sZW5ndGgsXG4gICAgICBmaWx0ZXI6IHRoaXMuZmlsdGVyQ29udHJvbC52YWx1ZSxcbiAgICAgIGNoZWNrQWxsU2VhcmNoZXM6IHRoaXMuY2hlY2tBbGxTZWFyY2hSZWdpc3RlcixcbiAgICAgIGNoZWNrQWxsU3RhdHVzOiB0aGlzLmNoZWNrQWxsU3RhdHVzLFxuICAgIH0pO1xuICB9XG5cbiAgZm9jdXNJdGVtKGRpcjogbnVtYmVyLCBlPzogRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNWaXNpYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tYXliZVByZXZlbnREZWZhdWx0KGUpO1xuXG4gICAgY29uc3QgaWR4ID0gdGhpcy5maWx0ZXJlZE9wdGlvbnMuaW5kZXhPZih0aGlzLmZvY3VzZWRJdGVtKTtcblxuICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICB0aGlzLmZvY3VzZWRJdGVtID0gdGhpcy5maWx0ZXJlZE9wdGlvbnNbMF07XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbmV4dElkeCA9IGlkeCArIGRpcjtcbiAgICBjb25zdCBuZXdJZHggPVxuICAgICAgbmV4dElkeCA8IDBcbiAgICAgICAgPyB0aGlzLmZpbHRlcmVkT3B0aW9ucy5sZW5ndGggLSAxXG4gICAgICAgIDogbmV4dElkeCAlIHRoaXMuZmlsdGVyZWRPcHRpb25zLmxlbmd0aDtcblxuICAgIHRoaXMuZm9jdXNlZEl0ZW0gPSB0aGlzLmZpbHRlcmVkT3B0aW9uc1tuZXdJZHhdO1xuICB9XG5cbiAgcHJpdmF0ZSBtYXliZVByZXZlbnREZWZhdWx0KGU/OiBFdmVudCk6IHZvaWQge1xuICAgIGlmIChlICYmIGUucHJldmVudERlZmF1bHQpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG1heWJlU3RvcFByb3BhZ2F0aW9uKGU/OiBFdmVudCk6IHZvaWQge1xuICAgIGlmIChlICYmIGUuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2VzY2FwZVJlZ0V4cChzdHI6IHN0cmluZyk6IFJlZ0V4cCB7XG4gICAgY29uc3QgcmVnRXhwU3RyID0gc3RyLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCAnXFxcXCQmJyk7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAocmVnRXhwU3RyLCAnaScpO1xuICB9XG59XG4iXX0=