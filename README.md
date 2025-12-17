# Clippd Client

Clippd is a mobile app that helps customers discover hairclippers based on visual portfolios and verified reviews.

#### This is a client application for the  [**Clippd Project**](https://github.com/calvin-cs262-2025fall-teamA/Clippd-project).
---

## Tech Stack
* React Native
* Expo
* TypeScript
* Azure

---

## Current Features

The app currently contains login/signup screens, home screen with clipper browsing, details screen, filters, map page, favorites screen, and profile management for both customers and professionals.

### **Customer Side:**

* **Login/Signup Page:**
  * Contains fields for entering email/password and buttons to "log in" or "sign up" to create a new account
  * The "log in" button navigates to the home page if credentials are correctly entered

* **Home Page:**
  * Displays a feed of hairclipper cards with portfolio images, ratings, and location
  * Cards feature swipeable image galleries showing before-and-after work
  * Only the bottom info section (name, location, rating) is tappable to view details

* **Filtering & Search:**
  * Filter by specialty, service type, and price range
  * Sort by distance, rating, or availability
  * Count clippers within specified radius

* **Details Page:**
  * Shows comprehensive clipper profile including contact information, location, and rating
  * Displays full portfolio gallery with horizontal scrolling
  * Contains reviews from previous customers
  * Includes services offered with pricing
  * Direction link integrates with Google Maps

* **Map/Explore Page:**
  * Browse clippers on an interactive map
  * Filter by distance radius (5, 10, 25 miles)
  * Location-based search
  
* **Favorites Page:**
  * Displays saved clippers for quick access
  * Add/remove clippers from favorites via heart icon

* **Profile Page:**
  * Displays current user's name and email
  * Logout button navigates back to login page

### **Clipper Side:**

* **Dashboard (Profile):**
  * Update profile photo
  * Edit bio, location, and contact information
  * Manage services list
  * Upload and organize portfolio photos
  * View customer reviews

* **Explore Page:**
  * Same as client home page 

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Client
```bash
npx expo start
```

Scan the QR code with Expo Go (Android) or Camera app (iOS), or press `a` for Android emulator / `i` for iOS simulator.

The data service is hosted on Azure (see the [**Clippd Service**](https://github.com/calvin-cs262-2025fall-teamA/Clippd-service)).

---
