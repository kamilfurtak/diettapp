import { TestBed } from '@angular/core/testing';
import { MealLogComponent } from './meal-log.component';

describe(MealLogComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(MealLogComponent, {
      add: {
        imports: [],
        providers: []
      }
    });
  });

  it('renders', () => {
    cy.mount(MealLogComponent);
  });
});
