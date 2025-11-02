import { TestBed } from '@angular/core/testing';
import { FavoriteProductsComponent } from './favorite-products.component';

describe(FavoriteProductsComponent.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(FavoriteProductsComponent, {
      add: {
        imports: [],
        providers: []
      }
    });
  });

  it('renders', () => {
    cy.mount(FavoriteProductsComponent);
  });
});
