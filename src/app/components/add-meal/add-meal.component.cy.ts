import { TestBed } from '@angular/core/testing';
import { AddMealComponent } from './add-meal.component';

describe(AddMealComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(AddMealComponent, {
      add: {
        imports: [],
        providers: []
      }
    });
  });

  it('renders', () => {
    cy.mount(AddMealComponent);
  });
});
