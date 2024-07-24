import { NgModule } from '@angular/core';
import { NgxDropdownMultiselectComponent } from './ngx-bootstrap-multiselect.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MultiSelectSearchFilter } from './search-filter.pipe';
import { AutofocusDirective } from './autofocus.directive';
import { OffClickDirective } from './off-click.directive';
export class NgxBootstrapMultiselectModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWJvb3RzdHJhcC1tdWx0aXNlbGVjdC5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtYm9vdHN0cmFwLW11bHRpc2VsZWN0L3NyYy9saWIvbmd4LWJvb3RzdHJhcC1tdWx0aXNlbGVjdC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsK0JBQStCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUN4RixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDckQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFrQjFELE1BQU0sT0FBTyw2QkFBNkI7OztZQWhCekMsUUFBUSxTQUFDO2dCQUNSLFlBQVksRUFBRTtvQkFDWiwrQkFBK0I7b0JBQy9CLHVCQUF1QjtvQkFDdkIsa0JBQWtCO29CQUNsQixpQkFBaUI7aUJBQ2xCO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxZQUFZO29CQUNaLG1CQUFtQjtpQkFDcEI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLCtCQUErQjtvQkFDL0IsdUJBQXVCO2lCQUN4QjthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5neERyb3Bkb3duTXVsdGlzZWxlY3RDb21wb25lbnQgfSBmcm9tICcuL25neC1ib290c3RyYXAtbXVsdGlzZWxlY3QuY29tcG9uZW50JztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBSZWFjdGl2ZUZvcm1zTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgTXVsdGlTZWxlY3RTZWFyY2hGaWx0ZXIgfSBmcm9tICcuL3NlYXJjaC1maWx0ZXIucGlwZSc7XG5pbXBvcnQgeyBBdXRvZm9jdXNEaXJlY3RpdmUgfSBmcm9tICcuL2F1dG9mb2N1cy5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgT2ZmQ2xpY2tEaXJlY3RpdmUgfSBmcm9tICcuL29mZi1jbGljay5kaXJlY3RpdmUnO1xuXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBOZ3hEcm9wZG93bk11bHRpc2VsZWN0Q29tcG9uZW50LFxuICAgIE11bHRpU2VsZWN0U2VhcmNoRmlsdGVyLFxuICAgIEF1dG9mb2N1c0RpcmVjdGl2ZSxcbiAgICBPZmZDbGlja0RpcmVjdGl2ZVxuICBdLFxuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIFJlYWN0aXZlRm9ybXNNb2R1bGVcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIE5neERyb3Bkb3duTXVsdGlzZWxlY3RDb21wb25lbnQsXG4gICAgTXVsdGlTZWxlY3RTZWFyY2hGaWx0ZXIsXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIE5neEJvb3RzdHJhcE11bHRpc2VsZWN0TW9kdWxlIHsgfVxuIl19