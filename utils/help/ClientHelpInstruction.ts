/**
 * @fileoverview Client help instructions aggregator
 * @description Aggregates all help documents for client users
 * Includes Finding a Clipper, Contacting, Favoriting, and Profile Editing
 * @version 1.0.0
 */

import { FINDING_A_CLIPPER , HelpDocument } from "./client/FindingAClipper";
import { CONTACTING_A_CLIPPER } from "./client/ContactingAClipper";
import { FAVORITING_A_CLIPPER } from "./client/FavoritingAClipper";
import { EDITING_YOUR_PROFILE } from "./client/EditingYourProfile";

/**
 * Client help instructions container
 * @typedef {Object} ClientHelpInstruction
 * @property {string} title - Help section title
 * @property {string[]} toc - Table of contents with document titles
 * @property {HelpDocument[]} documents - Array of help documents
 */
export interface ClientHelpInstruction {
  title: string;
  toc: string[];
  documents: HelpDocument[];
}

export const CLIENT_HELP_INSTRUCTION: ClientHelpInstruction = {
  title: "Clippd Help",
  toc: [
    "Finding a Clipper",
    "Contacting a Clipper",
    "Favoriting a Clipper",
    "Editing your Profile",
  ],
  documents: [
    FINDING_A_CLIPPER,
    CONTACTING_A_CLIPPER,
    FAVORITING_A_CLIPPER,
    EDITING_YOUR_PROFILE,
  ],
};
