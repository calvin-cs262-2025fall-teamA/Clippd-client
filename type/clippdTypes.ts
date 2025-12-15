/**
 * @fileoverview Type Definitions for Clippd Application
 *
 * This module defines all TypeScript interfaces and types used throughout
 * the Clippd client application. These types ensure type safety and provide
 * clear contracts for data structures passed between components and API calls.
 *
 * Key types:
 * - Service: Individual barber service (cut, trim, coloring, etc.)
 * - ClipperProfile: Display-ready clipper information for UI
 * - Review: Customer review and rating
 * - Users: Full user account information from backend
 * - Filter types: Service, language, and price filtering
 *
 * @see AuthContext for user authentication types
 * @see ClippdContext for data management using these types
 */

/**
 * @typedef {Object} Service
 * @property {number} id - Unique service identifier
 * @property {number} clipperID - ID of the clipper offering this service
 * @property {string} serviceName - Name of the service (e.g., "Men's Cut", "Beard Trim")
 * @property {number} [price] - Service price in dollars
 * @property {number | null} [durationMinutes] - Estimated service duration in minutes
 */
export interface Service {
  id: number;
  clipperID: number;
  serviceName: string;
  price?: number;
  durationMinutes?: number | null;
}

/**
 * @typedef {Object} ClipperProfile
 * @property {string} id - Unique clipper/barber identifier
 * @property {string | number} [userId] - Associated UserAccount ID (for queries)
 * @property {string} name - Clipper's display name
 * @property {string} location - Location string (city, state format)
 * @property {number | null} [latitude] - Geographic latitude for map display
 * @property {number | null} [longitude] - Geographic longitude for map display
 * @property {string[]} images - Portfolio image URLs
 * @property {string} rating - Average rating as string (e.g., "4.5")
 * @property {string} profilePic - URL to profile picture
 * @property {string} [bio] - Professional biography/description
 * @property {string} [address] - Full street address
 * @property {string} [phone] - Contact phone number
 * @property {string} [emailAddress] - Contact email address
 * @property {Review[]} [reviews] - Array of customer reviews
 * @property {Service[]} [services] - Array of services offered
 */
export interface ClipperProfile {
  id: string;
  userId?: string | number; // UserAccount ID for language/specialty queries
  name: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  images: string[];
  rating: string;
  profilePic: string;
  bio?: string;
  address?: string;
  phone?: string;
  emailAddress?: string;
  reviews?: Review[];
  services?: Service[];
}

/**
 * @typedef {Object} Review
 * @property {number} id - Unique review identifier
 * @property {number} [clientID] - ID of the client who left review
 * @property {string} reviewerName - Name of the person who reviewed
 * @property {string} [reviewContent] - Full review text
 * @property {string} [comment] - Review comment (alternative to reviewContent)
 * @property {number} [rating] - Star rating (1-5)
 * @property {string} [date] - Review submission date
 * @property {string} [createdAt] - ISO timestamp of review creation
 */
export interface Review {
  id: number;
  clientID?: number;
  reviewerName: string;
  reviewContent?: string;
  comment?: string;
  rating?: number;
  date?: string;
  createdAt?: string;
}

/**
 * @typedef {Object} Users
 * @property {number} id - Unique user identifier from database
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} loginID - Username for authentication
 * @property {string} passWord - Hashed password (never sent to frontend)
 * @property {'Client' | 'Clipper'} role - User role type
 * @property {string} [nickname] - Optional display nickname
 * @property {string} [address] - Street address
 * @property {string} city - City of residence/business
 * @property {string} state - State of residence/business
 * @property {string} emailAddress - Email address (unique)
 * @property {string} [phone] - Contact phone number
 */
export interface Users {
  id: number;
  firstName: string;
  lastName: string;
  loginID: string;
  passWord: string;
  role: "Client" | "Clipper";
  nickname?: string;
  address?: string;
  city: string;
  state: string;
  emailAddress: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: Date;
}
