/**
 * @fileoverview Help document: Managing Your Portfolio (Clipper)
 * @description Instructions for clippers on how to manage their portfolio
 * @version 1.0.0
 */

import { HelpDocument } from "./FindingAClipper";

/**
 * Managing Your Portfolio help document for clippers
 * @type {HelpDocument}
 */
export const MANAGING_YOUR_PORTFOLIO: HelpDocument = {
  id: "managing-your-portfolio",
  title: "Managing your Portfolio",
  overview:
    "Your portfolio helps clients preview \nyour work and style.",
  steps: [
    {
      number: 1,
      instruction:
        "Open the \"You\" tab",
    },
    {
      number: 2,
      instruction:
        "Press the pencil icon next to\n\"Portfolio\"",
    },
    {
      number: 3,
      instruction:
        "Add new photos or remove existing ones",
    },
    {
      number: 4,
      instruction:
        "Save changes to display \nthe updated portfolio",
    },
  ],
};
