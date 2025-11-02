import { TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar';

describe(CalendarComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(CalendarComponent, {
      add: {
        imports: [],
        providers: []
      }
    });
  });

  it('renders', () => {
    cy.mount(CalendarComponent);
  });
});
