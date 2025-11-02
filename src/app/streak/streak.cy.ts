import { TestBed } from '@angular/core/testing';
import { StreakComponent } from './streak';

describe(StreakComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(StreakComponent, {
      add: {
        imports: [],
        providers: []
      }
    });
  });

  it('renders', () => {
    cy.mount(StreakComponent);
  });
});
