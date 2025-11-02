import { TestBed } from '@angular/core/testing';
import { DietPlanComponent } from './diet-plan.component';

describe(DietPlanComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(DietPlanComponent, {
      add: {
        imports: [],
        providers: []
      }
    });
  });

  it('renders', () => {
    cy.mount(DietPlanComponent);
  });
});
