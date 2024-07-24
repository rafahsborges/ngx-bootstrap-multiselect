(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/forms'), require('rxjs/operators'), require('rxjs'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('ngx-bootstrap-multiselect', ['exports', '@angular/core', '@angular/forms', 'rxjs/operators', 'rxjs', '@angular/common'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['ngx-bootstrap-multiselect'] = {}, global.ng.core, global.ng.forms, global.rxjs.operators, global.rxjs, global.ng.common));
}(this, (function (exports, core, forms, operators, rxjs, common) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    ;
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    var MultiSelectSearchFilter = /** @class */ (function () {
        function MultiSelectSearchFilter() {
            this._searchCache = {};
            this._searchCacheInclusive = {};
            this._prevSkippedItems = {};
        }
        MultiSelectSearchFilter.prototype.transform = function (options, str, limit, renderLimit, searchFunction) {
            if (str === void 0) { str = ''; }
            if (limit === void 0) { limit = 0; }
            if (renderLimit === void 0) { renderLimit = 0; }
            str = str.toLowerCase();
            // Drop cache because options were updated
            if (options !== this._lastOptions) {
                this._lastOptions = options;
                this._searchCache = {};
                this._searchCacheInclusive = {};
                this._prevSkippedItems = {};
            }
            var filteredOpts = this._searchCache.hasOwnProperty(str)
                ? this._searchCache[str]
                : this._doSearch(options, str, limit, searchFunction);
            var isUnderLimit = options.length <= limit;
            return isUnderLimit
                ? filteredOpts
                : this._limitRenderedItems(filteredOpts, renderLimit);
        };
        MultiSelectSearchFilter.prototype._getSubsetOptions = function (options, prevOptions, prevSearchStr) {
            var prevInclusiveOrIdx = this._searchCacheInclusive[prevSearchStr];
            if (prevInclusiveOrIdx === true) {
                // If have previous results and it was inclusive, do only subsearch
                return prevOptions;
            }
            else if (typeof prevInclusiveOrIdx === 'number') {
                // Or reuse prev results with unchecked ones
                return __spread(prevOptions, options.slice(prevInclusiveOrIdx));
            }
            return options;
        };
        MultiSelectSearchFilter.prototype._doSearch = function (options, str, limit, searchFunction) {
            var prevStr = str.slice(0, -1);
            var prevResults = this._searchCache[prevStr];
            var prevResultShift = this._prevSkippedItems[prevStr] || 0;
            if (prevResults) {
                options = this._getSubsetOptions(options, prevResults, prevStr);
            }
            var optsLength = options.length;
            var maxFound = limit > 0 ? Math.min(limit, optsLength) : optsLength;
            var regexp = searchFunction(str);
            var filteredOpts = [];
            var i = 0, founded = 0, removedFromPrevResult = 0;
            var doesOptionMatch = function (option) { return regexp.test(option.name); };
            var getChildren = function (option) { return options.filter(function (child) { return child.parentId === option.id; }); };
            var getParent = function (option) { return options.find(function (parent) { return option.parentId === parent.id; }); };
            var foundFn = function (item) { filteredOpts.push(item); founded++; };
            var notFoundFn = prevResults ? function () { return removedFromPrevResult++; } : function () { };
            for (; i < optsLength && founded < maxFound; ++i) {
                var option = options[i];
                var directMatch = doesOptionMatch(option);
                if (directMatch) {
                    foundFn(option);
                    continue;
                }
                if (typeof option.parentId === 'undefined') {
                    var childrenMatch = getChildren(option).some(doesOptionMatch);
                    if (childrenMatch) {
                        foundFn(option);
                        continue;
                    }
                }
                if (typeof option.parentId !== 'undefined') {
                    var parentMatch = doesOptionMatch(getParent(option));
                    if (parentMatch) {
                        foundFn(option);
                        continue;
                    }
                }
                notFoundFn();
            }
            var totalIterations = i + prevResultShift;
            this._searchCache[str] = filteredOpts;
            this._searchCacheInclusive[str] = i === optsLength || totalIterations;
            this._prevSkippedItems[str] = removedFromPrevResult + prevResultShift;
            return filteredOpts;
        };
        MultiSelectSearchFilter.prototype._limitRenderedItems = function (items, limit) {
            return items.length > limit && limit > 0 ? items.slice(0, limit) : items;
        };
        return MultiSelectSearchFilter;
    }());
    MultiSelectSearchFilter.decorators = [
        { type: core.Pipe, args: [{
                    name: 'searchFilter'
                },] }
    ];

    var MULTISELECT_VALUE_ACCESSOR = {
        provide: forms.NG_VALUE_ACCESSOR,
        useExisting: core.forwardRef(function () { return NgxDropdownMultiselectComponent; }),
        multi: true,
    };
    // tslint:disable-next-line: no-conflicting-lifecycle
    var NgxDropdownMultiselectComponent = /** @class */ (function () {
        function NgxDropdownMultiselectComponent(fb, searchFilter, differs, cdRef) {
            this.fb = fb;
            this.searchFilter = searchFilter;
            this.cdRef = cdRef;
            this.localIsVisible = false;
            this.workerDocClicked = false;
            this.filterControl = this.fb.control('');
            this.disabled = false;
            this.disabledSelection = false;
            this.searchFunction = this._escapeRegExp;
            this.selectionLimitReached = new core.EventEmitter();
            this.dropdownClosed = new core.EventEmitter();
            this.dropdownOpened = new core.EventEmitter();
            this.added = new core.EventEmitter();
            this.removed = new core.EventEmitter();
            this.lazyLoad = new core.EventEmitter();
            this.filter = this.filterControl.valueChanges;
            this.destroyed$ = new rxjs.Subject();
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
            this.onModelChange = function (_) { };
            this.onModelTouched = function () { };
            this.differ = differs.find([]).create(null);
            this.settings = this.defaultSettings;
            this.texts = this.defaultTexts;
        }
        Object.defineProperty(NgxDropdownMultiselectComponent.prototype, "focusBack", {
            get: function () {
                return this.settings.focusBack && this._focusBack;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NgxDropdownMultiselectComponent.prototype, "isVisible", {
            get: function () {
                return this.localIsVisible;
            },
            set: function (val) {
                this.localIsVisible = val;
                this.workerDocClicked = val ? false : this.workerDocClicked;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NgxDropdownMultiselectComponent.prototype, "searchLimit", {
            get: function () {
                return this.settings.searchRenderLimit;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NgxDropdownMultiselectComponent.prototype, "searchRenderAfter", {
            get: function () {
                return this.settings.searchRenderAfter;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NgxDropdownMultiselectComponent.prototype, "searchLimitApplied", {
            get: function () {
                return this.searchLimit > 0 && this.options.length > this.searchLimit;
            },
            enumerable: false,
            configurable: true
        });
        NgxDropdownMultiselectComponent.prototype.clickedOutside = function () {
            if (!this.isVisible || !this.settings.closeOnClickOutside) {
                return;
            }
            this.isVisible = false;
            this._focusBack = true;
            this.dropdownClosed.emit();
        };
        NgxDropdownMultiselectComponent.prototype.getItemStyle = function (option) {
            var style = {};
            if (!option.isLabel) {
                style['cursor'] = 'pointer';
            }
            if (option.disabled) {
                style['cursor'] = 'default';
            }
        };
        NgxDropdownMultiselectComponent.prototype.getItemStyleSelectionDisabled = function () {
            if (this.disabledSelection) {
                return { cursor: 'default' };
            }
        };
        NgxDropdownMultiselectComponent.prototype.ngOnInit = function () {
            var _this = this;
            this.title = this.texts.defaultTitle || '';
            this.filterControl.valueChanges.pipe(operators.takeUntil(this.destroyed$)).subscribe(function () {
                _this.updateRenderItems();
                if (_this.settings.isLazyLoad) {
                    _this.load();
                }
            });
        };
        NgxDropdownMultiselectComponent.prototype.ngOnChanges = function (changes) {
            var _this = this;
            if (changes['options']) {
                this.options = this.options || [];
                this.parents = this.options
                    .filter(function (option) { return typeof option.parentId === 'number'; })
                    .map(function (option) { return option.parentId; });
                this.updateRenderItems();
                if (this.settings.isLazyLoad &&
                    this.settings.selectAddedValues &&
                    this.loadedValueIds.length === 0) {
                    this.loadedValueIds = this.loadedValueIds.concat(changes.options.currentValue.map(function (value) { return value.id; }));
                }
                if (this.settings.isLazyLoad &&
                    this.settings.selectAddedValues &&
                    changes.options.previousValue) {
                    var addedValues_1 = changes.options.currentValue.filter(function (value) { return _this.loadedValueIds.indexOf(value.id) === -1; });
                    this.loadedValueIds.concat(addedValues_1.map(function (value) { return value.id; }));
                    if (this.checkAllStatus) {
                        this.addChecks(addedValues_1);
                    }
                    else if (this.checkAllSearchRegister.size > 0) {
                        this.checkAllSearchRegister.forEach(function (searchValue) { return _this.addChecks(_this.applyFilters(addedValues_1, searchValue)); });
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
        };
        NgxDropdownMultiselectComponent.prototype.ngOnDestroy = function () {
            this.destroyed$.next();
        };
        NgxDropdownMultiselectComponent.prototype.updateRenderItems = function () {
            this.renderItems =
                !this.searchLimitApplied ||
                    this.filterControl.value.length >= this.searchRenderAfter;
            this.filteredOptions = this.applyFilters(this.options, this.settings.isLazyLoad ? '' : this.filterControl.value);
            this.renderFilteredOptions = this.renderItems ? this.filteredOptions : [];
            this.focusedItem = undefined;
        };
        NgxDropdownMultiselectComponent.prototype.applyFilters = function (options, value) {
            return this.searchFilter.transform(options, value, this.settings.searchMaxLimit, this.settings.searchMaxRenderedItems, this.searchFunction);
        };
        NgxDropdownMultiselectComponent.prototype.fireModelChange = function () {
            if (this.model != this.prevModel) {
                this.prevModel = this.model;
                this.onModelChange(this.model);
                this.onModelTouched();
                this.cdRef.markForCheck();
            }
        };
        NgxDropdownMultiselectComponent.prototype.writeValue = function (value) {
            if (value !== undefined && value !== null) {
                this.model = Array.isArray(value) ? value : [value];
                this.ngDoCheck();
            }
            else {
                this.model = [];
            }
        };
        NgxDropdownMultiselectComponent.prototype.registerOnChange = function (fn) {
            this.onModelChange = fn;
        };
        NgxDropdownMultiselectComponent.prototype.registerOnTouched = function (fn) {
            this.onModelTouched = fn;
        };
        NgxDropdownMultiselectComponent.prototype.setDisabledState = function (isDisabled) {
            this.disabled = isDisabled;
        };
        NgxDropdownMultiselectComponent.prototype.ngDoCheck = function () {
            var changes = this.differ.diff(this.model);
            if (changes) {
                this.updateNumSelected();
                this.updateTitle();
            }
        };
        NgxDropdownMultiselectComponent.prototype.validate = function (_c) {
            var _this = this;
            if (this.model && this.model.length) {
                return {
                    required: {
                        valid: false
                    }
                };
            }
            if (this.options.filter(function (o) { return _this.model.indexOf(o.id) && !o.disabled; }).length === 0) {
                return {
                    selection: {
                        valid: false
                    }
                };
            }
            return null;
        };
        NgxDropdownMultiselectComponent.prototype.registerOnValidatorChange = function (_fn) {
            throw new Error('Method not implemented.');
        };
        NgxDropdownMultiselectComponent.prototype.clearSearch = function (event) {
            this.maybeStopPropagation(event);
            this.filterControl.setValue('');
        };
        NgxDropdownMultiselectComponent.prototype.toggleDropdown = function (e) {
            if (this.isVisible) {
                this._focusBack = true;
            }
            this.isVisible = !this.isVisible;
            this.isVisible ? this.dropdownOpened.emit() : this.dropdownClosed.emit();
            this.focusedItem = undefined;
        };
        NgxDropdownMultiselectComponent.prototype.closeDropdown = function (e) {
            this.isVisible = true;
            this.toggleDropdown(e);
        };
        NgxDropdownMultiselectComponent.prototype.isSelected = function (option) {
            return this.model && this.model.indexOf(option.id) > -1;
        };
        NgxDropdownMultiselectComponent.prototype.setSelected = function (_event, option) {
            var _this = this;
            if (option.isLabel) {
                return;
            }
            if (option.disabled) {
                return;
            }
            if (this.disabledSelection) {
                return;
            }
            setTimeout(function () {
                _this.maybeStopPropagation(_event);
                _this.maybePreventDefault(_event);
                var index = _this.model.indexOf(option.id);
                var isAtSelectionLimit = _this.settings.selectionLimit > 0 &&
                    _this.model.length >= _this.settings.selectionLimit;
                var removeItem = function (idx, id) {
                    _this.model.splice(idx, 1);
                    _this.removed.emit(id);
                    if (_this.settings.isLazyLoad &&
                        _this.lazyLoadOptions.some(function (val) { return val.id === id; })) {
                        _this.lazyLoadOptions.splice(_this.lazyLoadOptions.indexOf(_this.lazyLoadOptions.find(function (val) { return val.id === id; })), 1);
                    }
                };
                if (index > -1) {
                    if (_this.settings.minSelectionLimit === undefined ||
                        _this.numSelected > _this.settings.minSelectionLimit) {
                        removeItem(index, option.id);
                    }
                    var parentIndex = option.parentId && _this.model.indexOf(option.parentId);
                    if (parentIndex > -1) {
                        removeItem(parentIndex, option.parentId);
                    }
                    else if (_this.parents.indexOf(option.id) > -1) {
                        _this.options
                            .filter(function (child) { return _this.model.indexOf(child.id) > -1 &&
                            child.parentId === option.id; })
                            .forEach(function (child) { return removeItem(_this.model.indexOf(child.id), child.id); });
                    }
                }
                else if (isAtSelectionLimit && !_this.settings.autoUnselect) {
                    _this.selectionLimitReached.emit(_this.model.length);
                    return;
                }
                else {
                    var addItem_1 = function (id) {
                        _this.model.push(id);
                        _this.added.emit(id);
                        if (_this.settings.isLazyLoad &&
                            !_this.lazyLoadOptions.some(function (val) { return val.id === id; })) {
                            _this.lazyLoadOptions.push(option);
                        }
                    };
                    addItem_1(option.id);
                    if (!isAtSelectionLimit) {
                        if (option.parentId && !_this.settings.ignoreLabels) {
                            var children = _this.options.filter(function (child) { return child.id !== option.id && child.parentId === option.parentId; });
                            if (children.every(function (child) { return _this.model.indexOf(child.id) > -1; })) {
                                addItem_1(option.parentId);
                            }
                        }
                        else if (_this.parents.indexOf(option.id) > -1) {
                            var children = _this.options.filter(function (child) { return _this.model.indexOf(child.id) < 0 && child.parentId === option.id; });
                            children.forEach(function (child) { return addItem_1(child.id); });
                        }
                    }
                    else {
                        removeItem(0, _this.model[0]);
                    }
                }
                if (_this.settings.closeOnSelect) {
                    _this.toggleDropdown();
                }
                _this.model = _this.model.slice();
                _this.fireModelChange();
            }, 0);
        };
        NgxDropdownMultiselectComponent.prototype.updateNumSelected = function () {
            var _this = this;
            this.numSelected =
                this.model.filter(function (id) { return _this.parents.indexOf(id) < 0; }).length || 0;
        };
        NgxDropdownMultiselectComponent.prototype.updateTitle = function () {
            var _this = this;
            var numSelectedOptions = this.options.length;
            if (this.settings.ignoreLabels) {
                numSelectedOptions = this.options.filter(function (option) { return !option.isLabel; }).length;
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
                var useOptions_1 = this.settings.isLazyLoad && this.lazyLoadOptions.length
                    ? this.lazyLoadOptions
                    : this.options;
                var titleSelections = void 0;
                if (this.settings.maintainSelectionOrderInTitle) {
                    var optionIds_1 = useOptions_1.map(function (selectOption, idx) { return selectOption.id; });
                    titleSelections = this.model
                        .map(function (selectedId) { return optionIds_1.indexOf(selectedId); })
                        .filter(function (optionIndex) { return optionIndex > -1; })
                        .map(function (optionIndex) { return useOptions_1[optionIndex]; });
                }
                else {
                    titleSelections = useOptions_1.filter(function (option) { return _this.model.indexOf(option.id) > -1; });
                }
                this.title = titleSelections.map(function (option) { return option.name; }).join(', ');
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
        };
        NgxDropdownMultiselectComponent.prototype.searchFilterApplied = function () {
            return (this.settings.enableSearch &&
                this.filterControl.value &&
                this.filterControl.value.length > 0);
        };
        NgxDropdownMultiselectComponent.prototype.addChecks = function (options) {
            var _this = this;
            var checkedOptions = options
                .filter(function (option) {
                if (!option.disabled &&
                    (_this.model.indexOf(option.id) === -1 &&
                        !(_this.settings.ignoreLabels && option.isLabel))) {
                    _this.added.emit(option.id);
                    return true;
                }
                return false;
            })
                .map(function (option) { return option.id; });
            this.model = this.model.concat(checkedOptions);
        };
        NgxDropdownMultiselectComponent.prototype.checkAll = function () {
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
        };
        NgxDropdownMultiselectComponent.prototype.uncheckAll = function () {
            var _this = this;
            if (!this.disabledSelection) {
                var checkedOptions = this.model;
                var unCheckedOptions_1 = !this.searchFilterApplied()
                    ? this.model
                    : this.filteredOptions.map(function (option) { return option.id; });
                // set unchecked options only to the ones that were checked
                unCheckedOptions_1 = checkedOptions.filter(function (item) { return unCheckedOptions_1.indexOf(item) > -1; });
                this.model = this.model.filter(function (id) {
                    if ((unCheckedOptions_1.indexOf(id) < 0 &&
                        _this.settings.minSelectionLimit === undefined) ||
                        unCheckedOptions_1.indexOf(id) < _this.settings.minSelectionLimit) {
                        return true;
                    }
                    else {
                        _this.removed.emit(id);
                        return false;
                    }
                });
                if (this.settings.isLazyLoad && this.settings.selectAddedValues) {
                    if (this.searchFilterApplied()) {
                        if (this.checkAllSearchRegister.has(this.filterControl.value)) {
                            this.checkAllSearchRegister.delete(this.filterControl.value);
                            this.checkAllSearchRegister.forEach(function (searchTerm) {
                                var filterOptions = this.applyFilters(this.options.filter(function (option) { return unCheckedOptions_1.indexOf(option.id) > -1; }), searchTerm);
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
        };
        NgxDropdownMultiselectComponent.prototype.preventCheckboxCheck = function (event, option) {
            if (option.disabled ||
                (this.settings.selectionLimit &&
                    !this.settings.autoUnselect &&
                    this.model.length >= this.settings.selectionLimit &&
                    this.model.indexOf(option.id) === -1 &&
                    this.maybePreventDefault(event))) {
                this.maybePreventDefault(event);
            }
        };
        NgxDropdownMultiselectComponent.prototype.isCheckboxDisabled = function (option) {
            return this.disabledSelection || option && option.disabled;
        };
        NgxDropdownMultiselectComponent.prototype.checkScrollPosition = function (ev) {
            var scrollTop = ev.target.scrollTop;
            var scrollHeight = ev.target.scrollHeight;
            var scrollElementHeight = ev.target.clientHeight;
            var roundingPixel = 1;
            var gutterPixel = 1;
            if (scrollTop >=
                scrollHeight -
                    (1 + this.settings.loadViewDistance) * scrollElementHeight -
                    roundingPixel -
                    gutterPixel) {
                this.load();
            }
        };
        NgxDropdownMultiselectComponent.prototype.checkScrollPropagation = function (ev, element) {
            var scrollTop = element.scrollTop;
            var scrollHeight = element.scrollHeight;
            var scrollElementHeight = element.clientHeight;
            if ((ev.deltaY > 0 && scrollTop + scrollElementHeight >= scrollHeight) ||
                (ev.deltaY < 0 && scrollTop <= 0)) {
                ev = ev || window.event;
                this.maybePreventDefault(ev);
                ev.returnValue = false;
            }
        };
        NgxDropdownMultiselectComponent.prototype.trackById = function (idx, selectOption) {
            return selectOption.id;
        };
        NgxDropdownMultiselectComponent.prototype.load = function () {
            this.lazyLoad.emit({
                length: this.options.length,
                filter: this.filterControl.value,
                checkAllSearches: this.checkAllSearchRegister,
                checkAllStatus: this.checkAllStatus,
            });
        };
        NgxDropdownMultiselectComponent.prototype.focusItem = function (dir, e) {
            if (!this.isVisible) {
                return;
            }
            this.maybePreventDefault(e);
            var idx = this.filteredOptions.indexOf(this.focusedItem);
            if (idx === -1) {
                this.focusedItem = this.filteredOptions[0];
                return;
            }
            var nextIdx = idx + dir;
            var newIdx = nextIdx < 0
                ? this.filteredOptions.length - 1
                : nextIdx % this.filteredOptions.length;
            this.focusedItem = this.filteredOptions[newIdx];
        };
        NgxDropdownMultiselectComponent.prototype.maybePreventDefault = function (e) {
            if (e && e.preventDefault) {
                e.preventDefault();
            }
        };
        NgxDropdownMultiselectComponent.prototype.maybeStopPropagation = function (e) {
            if (e && e.stopPropagation) {
                e.stopPropagation();
            }
        };
        NgxDropdownMultiselectComponent.prototype._escapeRegExp = function (str) {
            var regExpStr = str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
            return new RegExp(regExpStr, 'i');
        };
        return NgxDropdownMultiselectComponent;
    }());
    NgxDropdownMultiselectComponent.decorators = [
        { type: core.Component, args: [{
                    selector: 'ngx-bootstrap-multiselect',
                    template: "<div *ngIf=\"options\" class=\"dropdown\" [ngClass]=\"settings.containerClasses\" [class.open]=\"isVisible\" (offClick)=\"clickedOutside()\">\n  <button type=\"button\" class=\"dropdown-toggle\" [ngClass]=\"settings.buttonClasses\" (click)=\"toggleDropdown($event)\" [disabled]=\"disabled\"\n    [ssAutofocus]=\"!focusBack\">\n    {{ title }}\n    <span class=\"caret\"></span>\n  </button>\n  <div #scroller *ngIf=\"isVisible\" class=\"dropdown-menu\" [ngClass]=\"{'chunkydropdown-menu': settings.checkedStyle == 'visual' }\"\n    (scroll)=\"settings.isLazyLoad ? checkScrollPosition($event) : null\" (wheel)=\"settings.stopScrollPropagation ? checkScrollPropagation($event, scroller) : null\"\n    [class.pull-right]=\"settings.pullRight\" [class.dropdown-menu-right]=\"settings.pullRight\" [style.max-height]=\"settings.maxHeight\"\n    style=\"display: block; height: auto; overflow-y: auto;\" (keydown.tab)=\"focusItem(1, $event)\" (keydown.shift.tab)=\"focusItem(-1, $event)\">\n    <div class=\"input-group search-container\" *ngIf=\"settings.enableSearch && (renderFilteredOptions.length > 1 || filterControl.value.length > 0)\">\n      <div class=\"input-group-prepend\">\n        <span class=\"input-group-text\" id=\"basic-addon1\">\n          <i class=\"fa fa-search\" aria-hidden=\"true\"></i>\n        </span>\n      </div>\n      <input type=\"text\" class=\"form-control\" ssAutofocus [formControl]=\"filterControl\" [placeholder]=\"texts.searchPlaceholder\"\n        class=\"form-control\">\n      <div class=\"input-group-append\" *ngIf=\"filterControl.value.length>0\">\n        <button class=\"btn btn-default btn-secondary\" type=\"button\" (click)=\"clearSearch($event)\">\n          <i class=\"fa fa-times\"></i>\n        </button>\n      </div>\n    </div>\n    <a role=\"menuitem\" href=\"javascript:;\" tabindex=\"-1\" class=\"dropdown-item check-control check-control-check\" *ngIf=\"settings.showCheckAll && !disabledSelection && renderFilteredOptions.length > 1\"\n      (click)=\"checkAll()\">\n      <span style=\"width: 16px;\"><span [ngClass]=\"{'glyphicon glyphicon-ok': settings.checkedStyle !== 'fontawesome','fa fa-check': settings.checkedStyle === 'fontawesome'}\"></span></span>\n      {{ texts.checkAll }}\n    </a>\n    <a role=\"menuitem\" href=\"javascript:;\" tabindex=\"-1\" class=\"dropdown-item check-control check-control-uncheck\" *ngIf=\"settings.showUncheckAll && !disabledSelection && renderFilteredOptions.length > 1\"\n      (click)=\"uncheckAll()\">\n      <span style=\"width: 16px;\"><span [ngClass]=\"{'glyphicon glyphicon-remove': settings.checkedStyle !== 'fontawesome','fa fa-times': settings.checkedStyle === 'fontawesome'}\"></span></span>\n      {{ texts.uncheckAll }}\n    </a>\n    <a *ngIf=\"settings.showCheckAll || settings.showUncheckAll\" href=\"javascript:;\" class=\"dropdown-divider divider\"></a>\n    <a *ngIf=\"!renderItems\" href=\"javascript:;\" class=\"dropdown-item empty\">{{ texts.searchNoRenderText }}</a>\n    <a *ngIf=\"renderItems && !renderFilteredOptions.length\" href=\"javascript:;\" class=\"dropdown-item empty\">{{ texts.searchEmptyResult }}</a>\n    <a class=\"dropdown-item\" href=\"javascript:;\" *ngFor=\"let option of renderFilteredOptions; trackBy: trackById\" [class.active]=\"isSelected(option)\"\n      [ngStyle]=\"getItemStyle(option)\" [ngClass]=\"option.classes\" [class.dropdown-header]=\"option.isLabel\" [ssAutofocus]=\"option !== focusedItem\"\n      tabindex=\"-1\" (click)=\"setSelected($event, option)\" (keydown.space)=\"setSelected($event, option)\" (keydown.enter)=\"setSelected($event, option)\">\n      <span *ngIf=\"!option.isLabel; else label\" role=\"menuitem\" tabindex=\"-1\" [style.padding-left]=\"this.parents.length>0&&this.parents.indexOf(option.id)<0&&'30px'\"\n        [ngStyle]=\"getItemStyleSelectionDisabled()\">\n        <ng-container [ngSwitch]=\"settings.checkedStyle\">\n          <input *ngSwitchCase=\"'checkboxes'\" type=\"checkbox\" [checked]=\"isSelected(option)\" (click)=\"preventCheckboxCheck($event, option)\"\n            [disabled]=\"isCheckboxDisabled(option)\" [ngStyle]=\"getItemStyleSelectionDisabled()\" />\n          <span *ngSwitchCase=\"'glyphicon'\" style=\"width: 16px;\" class=\"glyphicon\" [class.glyphicon-ok]=\"isSelected(option)\" [class.glyphicon-lock]=\"isCheckboxDisabled(option)\"></span>\n          <span *ngSwitchCase=\"'fontawesome'\" style=\"width: 16px;display: inline-block;\">\n            <span *ngIf=\"isSelected(option)\"><i class=\"fa fa-check\" aria-hidden=\"true\"></i></span>\n            <span *ngIf=\"isCheckboxDisabled(option)\"><i class=\"fa fa-lock\" aria-hidden=\"true\"></i></span>\n          </span>\n          <span *ngSwitchCase=\"'visual'\" style=\"display:block;float:left; border-radius: 0.2em; border: 0.1em solid rgba(44, 44, 44, 0.63);background:rgba(0, 0, 0, 0.1);width: 5.5em;\">\n            <div class=\"slider\" [ngClass]=\"{'slideron': isSelected(option)}\">\n              <img *ngIf=\"option.image != null\" [src]=\"option.image\" style=\"height: 100%; width: 100%; object-fit: contain\" />\n              <div *ngIf=\"option.image == null\" style=\"height: 100%; width: 100%;text-align: center; display: table; background-color:rgba(0, 0, 0, 0.74)\">\n                <div class=\"content_wrapper\">\n                  <span style=\"font-size:3em;color:white\" class=\"glyphicon glyphicon-eye-close\"></span>\n                </div>\n              </div>\n            </div>\n          </span>\n        </ng-container>\n        <span [ngClass]=\"{'chunkyrow': settings.checkedStyle == 'visual' }\" [class.disabled]=\"isCheckboxDisabled(option)\" [ngClass]=\"settings.itemClasses\"\n          [style.font-weight]=\"this.parents.indexOf(option.id)>=0?'bold':'normal'\">\n          {{ option.name }}\n        </span>\n      </span>\n      <ng-template #label>\n        <span [class.disabled]=\"isCheckboxDisabled(option)\">{{ option.name }}</span>\n      </ng-template>\n    </a>\n  </div>\n</div>\n",
                    providers: [MULTISELECT_VALUE_ACCESSOR, MultiSelectSearchFilter],
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    styles: ["a{outline:none!important}.dropdown-inline{display:inline-block}.dropdown-toggle .caret{display:inline-block;margin-left:4px;white-space:nowrap}.chunkydropdown-menu{min-width:20em}.chunkyrow{font-size:2em;line-height:2;margin-left:1em}.slider{display:block;height:3.8em;margin-left:.125em;margin-top:auto;transition:all .125s linear;width:3.8em}.slideron{margin-left:1.35em}.content_wrapper{display:table-cell;vertical-align:middle}.search-container{padding:0 5px 5px}"]
                },] }
    ];
    NgxDropdownMultiselectComponent.ctorParameters = function () { return [
        { type: forms.FormBuilder },
        { type: MultiSelectSearchFilter },
        { type: core.IterableDiffers },
        { type: core.ChangeDetectorRef }
    ]; };
    NgxDropdownMultiselectComponent.propDecorators = {
        options: [{ type: core.Input }],
        settings: [{ type: core.Input }],
        texts: [{ type: core.Input }],
        disabled: [{ type: core.Input }],
        disabledSelection: [{ type: core.Input }],
        searchFunction: [{ type: core.Input }],
        selectionLimitReached: [{ type: core.Output }],
        dropdownClosed: [{ type: core.Output }],
        dropdownOpened: [{ type: core.Output }],
        added: [{ type: core.Output }],
        removed: [{ type: core.Output }],
        lazyLoad: [{ type: core.Output }],
        filter: [{ type: core.Output }]
    };

    var AutofocusDirective = /** @class */ (function () {
        function AutofocusDirective(elemRef) {
            this.elemRef = elemRef;
        }
        Object.defineProperty(AutofocusDirective.prototype, "element", {
            get: function () {
                return this.elemRef.nativeElement;
            },
            enumerable: false,
            configurable: true
        });
        AutofocusDirective.prototype.ngOnInit = function () {
            this.focus();
        };
        AutofocusDirective.prototype.ngOnChanges = function (changes) {
            var ssAutofocusChange = changes.ssAutofocus;
            if (ssAutofocusChange && !ssAutofocusChange.isFirstChange()) {
                this.focus();
            }
        };
        AutofocusDirective.prototype.focus = function () {
            if (this.ssAutofocus) {
                return;
            }
            this.element.focus && this.element.focus();
        };
        return AutofocusDirective;
    }());
    AutofocusDirective.decorators = [
        { type: core.Directive, args: [{
                    selector: '[ssAutofocus]'
                },] }
    ];
    AutofocusDirective.ctorParameters = function () { return [
        { type: core.ElementRef, decorators: [{ type: core.Host }] }
    ]; };
    AutofocusDirective.propDecorators = {
        ssAutofocus: [{ type: core.Input }]
    };

    var OffClickDirective = /** @class */ (function () {
        function OffClickDirective() {
            this.onOffClick = new core.EventEmitter();
        }
        OffClickDirective.prototype.onClick = function (event) {
            this._clickEvent = event;
        };
        OffClickDirective.prototype.onTouch = function (event) {
            this._touchEvent = event;
        };
        OffClickDirective.prototype.onDocumentClick = function (event) {
            if (event !== this._clickEvent) {
                this.onOffClick.emit(event);
            }
        };
        OffClickDirective.prototype.onDocumentTouch = function (event) {
            if (event !== this._touchEvent) {
                this.onOffClick.emit(event);
            }
        };
        return OffClickDirective;
    }());
    OffClickDirective.decorators = [
        { type: core.Directive, args: [{
                    // tslint:disable-next-line:directive-selector
                    selector: '[offClick]',
                },] }
    ];
    OffClickDirective.propDecorators = {
        onOffClick: [{ type: core.Output, args: ['offClick',] }],
        onClick: [{ type: core.HostListener, args: ['click', ['$event'],] }],
        onTouch: [{ type: core.HostListener, args: ['touchstart', ['$event'],] }],
        onDocumentClick: [{ type: core.HostListener, args: ['document:click', ['$event'],] }],
        onDocumentTouch: [{ type: core.HostListener, args: ['document:touchstart', ['$event'],] }]
    };

    var NgxBootstrapMultiselectModule = /** @class */ (function () {
        function NgxBootstrapMultiselectModule() {
        }
        return NgxBootstrapMultiselectModule;
    }());
    NgxBootstrapMultiselectModule.decorators = [
        { type: core.NgModule, args: [{
                    declarations: [
                        NgxDropdownMultiselectComponent,
                        MultiSelectSearchFilter,
                        AutofocusDirective,
                        OffClickDirective
                    ],
                    imports: [
                        common.CommonModule,
                        forms.ReactiveFormsModule
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

    exports.MultiSelectSearchFilter = MultiSelectSearchFilter;
    exports.NgxBootstrapMultiselectModule = NgxBootstrapMultiselectModule;
    exports.ɵa = NgxDropdownMultiselectComponent;
    exports.ɵb = AutofocusDirective;
    exports.ɵc = OffClickDirective;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-bootstrap-multiselect.umd.js.map
