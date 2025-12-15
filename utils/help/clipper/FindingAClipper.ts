/**
 * @fileoverview Help document: Finding a Clipper (Clipper)
 * @description Instructions for clippers on how to find and explore other clippers
 * @version 1.0.0
 */

/**
 * Help instruction step
 * @typedef {Object} HelpStep
 * @property {number} number - Step number
 * @property {string} instruction - Step instruction text
 */
export interface HelpStep {
  number: number;
  instruction: string;
}

/**
 * Help document structure
 * @typedef {Object} HelpDocument
 * @property {string} id - Document ID
 * @property {string} title - Document title
 * @property {string} overview - Document overview/description
 * @property {HelpStep[]} steps - Array of instruction steps
 */
export interface HelpDocument {
  id: string;
  title: string;
  overview: string;
  steps: HelpStep[];
}

/**
 * Finding a Clipper help document for clippers
 * @type {HelpDocument}
 */
export const FINDING_A_CLIPPER: HelpDocument = {
  id: "finding-a-clipper",
  title: "Finding a Clipper",
  overview:
    "With Clippd, you can easily browse Clippers based on your hair type, preferred style, and the services they provide.",
  steps: [
    {
      number: 1,
      instruction:
        "Open the Explore tab to\nview the feed of Clippers",
    },
    {
      number: 2,
      instruction:
        "Use the filter button\nnear the bottom right\nto filter results",
    },
    {
      number: 3,
      instruction:
        "Tap on any of the Clipper cards \nto view their details, gallery,\nand reviews",
    },
  ],
};
