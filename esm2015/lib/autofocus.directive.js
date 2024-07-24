import { Directive, ElementRef, Host, Input } from '@angular/core';
export class AutofocusDirective {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b2ZvY3VzLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1ib290c3RyYXAtbXVsdGlzZWxlY3Qvc3JjL2xpYi9hdXRvZm9jdXMuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQW9DLE1BQU0sZUFBZSxDQUFDO0FBS3JHLE1BQU0sT0FBTyxrQkFBa0I7SUFXN0IsWUFDa0IsT0FBbUI7UUFBbkIsWUFBTyxHQUFQLE9BQU8sQ0FBWTtJQUNqQyxDQUFDO0lBTkwsSUFBSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztJQUNwQyxDQUFDO0lBTUQsUUFBUTtRQUNOLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBc0I7UUFDaEMsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBRTlDLElBQUksaUJBQWlCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsRUFBRTtZQUMzRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDZDtJQUNILENBQUM7SUFFRCxLQUFLO1FBQ0gsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDN0MsQ0FBQzs7O1lBcENGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsZUFBZTthQUMxQjs7O1lBSm1CLFVBQVUsdUJBaUJ6QixJQUFJOzs7MEJBUE4sS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSG9zdCwgSW5wdXQsIE9uQ2hhbmdlcywgT25Jbml0LCBTaW1wbGVDaGFuZ2VzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tzc0F1dG9mb2N1c10nXG59KVxuZXhwb3J0IGNsYXNzIEF1dG9mb2N1c0RpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzIHtcblxuICAvKipcbiAgICogV2lsbCBzZXQgZm9jdXMgaWYgc2V0IHRvIGZhbHN5IHZhbHVlIG9yIG5vdCBzZXQgYXQgYWxsXG4gICAqL1xuICBASW5wdXQoKSBzc0F1dG9mb2N1czogYm9vbGVhbjtcblxuICBnZXQgZWxlbWVudCgpOiB7IGZvY3VzPzogRnVuY3Rpb24gfSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbVJlZi5uYXRpdmVFbGVtZW50O1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEhvc3QoKSBwcml2YXRlIGVsZW1SZWY6IEVsZW1lbnRSZWYsXG4gICkgeyB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5mb2N1cygpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IHNzQXV0b2ZvY3VzQ2hhbmdlID0gY2hhbmdlcy5zc0F1dG9mb2N1cztcblxuICAgIGlmIChzc0F1dG9mb2N1c0NoYW5nZSAmJiAhc3NBdXRvZm9jdXNDaGFuZ2UuaXNGaXJzdENoYW5nZSgpKSB7XG4gICAgICB0aGlzLmZvY3VzKCk7XG4gICAgfVxuICB9XG5cbiAgZm9jdXMoKSB7XG4gICAgaWYgKHRoaXMuc3NBdXRvZm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnQuZm9jdXMgJiYgdGhpcy5lbGVtZW50LmZvY3VzKCk7XG4gIH1cblxufVxuIl19