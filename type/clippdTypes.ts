/**
 * @fileoverview Type definitions for Clippd application
 * @description Defines all TypeScript interfaces for data models including
 * ClipperProfile, Service, Review, and Users
 * @version 1.0.0
 */

/**
 * Service offered by a clipper
 * @typedef {Object} Service
 * @property {number} id - Service ID
 * @property {number} clipperID - Clipper ID
 * @property {string} serviceName - Name of the service
 * @property {number} [price] - Service price
 * @property {number|null} [durationMinutes] - Service duration in minutes
 */
export interface Service {
  id: number;
  clipperID: number;
  serviceName: string;
  price?: number;
  durationMinutes?: number | null;
}

/**
 * Clipper profile information
 * @typedef {Object} ClipperProfile
 * @property {string} id - Clipper ID
 * @property {string|number} [userId] - UserAccount ID
 * @property {string} name - Clipper name
 * @property {string} location - Clipper location
 * @property {number|null} [latitude] - Latitude coordinate
 * @property {number|null} [longitude] - Longitude coordinate
 * @property {string[]} images - Portfolio images
 * @property {string} rating - Rating score
 * @property {string} profilePic - Profile picture URL
 * @property {string} [bio] - Biography
 * @property {string} [address] - Full address
 * @property {string} [phone] - Phone number
 * @property {string} [emailAddress] - Email address
 * @property {Review[]} [reviews] - Customer reviews
 * @property {Service[]} [services] - Offered services
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
 * Customer review information
 * @typedef {Object} Review
 * @property {number} id - Review ID
 * @property {number} [clientID] - Client ID
 * @property {string} reviewerName - Name of reviewer
 * @property {string} [reviewContent] - Review content
 * @property {string} [comment] - Review comment
 * @property {number} [rating] - Review rating
 * @property {string} [date] - Review date
 * @property {string} [createdAt] - Creation timestamp
/**
 * User account information
 * @typedef {Object} Users
 * @property {number} id - User ID
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} loginID - Login ID/username
 * @property {string} passWord - Password
 * @property {"Client"|"Clipper"} role - User role type
 * @property {string} [nickname] - User nickname
 * @property {string} [address] - Address
 * @property {string} city - City
 * @property {string} state - State
 * @property {string} emailAddress - Email address
 * @property {string} [phone] - Phone number
 */
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
