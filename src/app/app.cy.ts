import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe(App.name, () => {
  beforeEach(() => {
    TestBed.overrideComponent(App, {
      add: {
        imports: [],
        providers: []
      }
    });
  });

  it('should mount successfully', () => {
    cy.mount(App);
  });

  it('should have no console errors', () => {
    cy.window().then((win) => {
      cy.spy(win.console, 'error');
    });
    cy.mount(App);
    cy.window().then((win) => {
      expect(win.console.error).to.not.be.called;
    });
  });

  it('should render all the main components', () => {
    cy.mount(App);
    cy.get('app-calendar').should('be.visible');
    cy.get('app-meal-log').should('be.visible');
    cy.get('app-add-meal').should('be.visible');
    cy.get('app-favorite-products').should('be.visible');
    cy.get('app-diet-plan').should('be.visible');
  });

});
