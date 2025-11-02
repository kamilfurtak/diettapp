# Diet Tracker Application

## Overview

A simple application to track your daily meals and calorie intake. It helps users monitor their diet, maintain a food log, and provides a view of their meal history.

## Implemented Features

### Core Functionality

*   **Meal Logging:** Users can log their meals for the day, categorized by breakfast, lunch, dinner, and snacks.
*   **Calorie Calculation:** The application automatically calculates and displays the total calorie intake for the day based on the logged meals.
*   **Streak Counter:** A streak counter is displayed to motivate users to log their meals consistently.
*   **Favorite Meals:** Users can add meals to a "Favorites" list for quick access and logging.

### User Interface

*   **Modern Design:** The application features a clean and modern user interface with a dark theme.
*   **Navigation:** A bottom navigation bar provides easy access to different sections of the app, including Streak, Meal Log, and Diet Plan.
*   **Meal Cards:** Logged meals are displayed as cards, showing the meal's name, calorie count, and a relevant icon.
*   **Favorites:** A dedicated "Favorites" page allows users to view their favorite meals and add them to their daily log.

## Current Task: Add to Favorites Functionality

### Plan

1.  **Add Star Icon:**
    *   Add a star icon button to each meal card in the daily meal log.
2.  **Implement `addFavoriteMeal` Method:**
    *   Create a new `FavoriteMeal` model.
    *   Add an `addFavoriteMeal` method to the `FirebaseService` to save favorite meals to Firestore.
    *   Add an `addFavoriteMeal` method to the `MealService` to interact with the `FirebaseService`.
    *   Add an `addMealToFavorites` method to the `MealLogComponent` to handle the user's action.
3.  **Update `FavoriteMealsComponent`:**
    *   Update the component to display the list of favorite meals.
    *   Add a button to each favorite meal to add it to the current day's meal log.
