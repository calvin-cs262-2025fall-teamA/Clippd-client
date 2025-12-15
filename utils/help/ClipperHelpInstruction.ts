/**
 * @fileoverview Clipper help instructions aggregator
 * @description Aggregates all help documents for clipper users
 * Includes Finding Clippers, Profile Editing, Services, and Portfolio Management
 * @version 1.0.0
 */

import { FINDING_A_CLIPPER, HelpDocument } from "./clipper/FindingAClipper";
import { EDITING_YOUR_PROFILE } from "./clipper/EditingYourProfile";
import { MANAGING_YOUR_SERVICES } from "./clipper/ManagingYourServices";
import { MANAGING_YOUR_PORTFOLIO } from "./clipper/ManagingYourPortfolio";

/**
 * Clipper help instructions container
 * @typedef {Object} HelpInstructions
 * @property {string} title - Help section title
 * @property {string[]} toc - Table of contents with document titles
 * @property {HelpDocument[]} documents - Array of help documents
 */
interface HelpInstructions {
  title: string;
  toc: string[];
  documents: HelpDocument[];
}

export const CLIPPER_HELP_INSTRUCTION: HelpInstructions = {
  title: "Clipper Help",
  toc: ["Finding a Clipper", "Editing your Profile", "Managing your Services", "Managing your Portfolio"],
  documents: [FINDING_A_CLIPPER, EDITING_YOUR_PROFILE, MANAGING_YOUR_SERVICES, MANAGING_YOUR_PORTFOLIO],
};
