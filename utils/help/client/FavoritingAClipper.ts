/**
 * @fileoverview Help document: Favoriting a Clipper (Client)
 * @description Instructions for clients on how to favorite clippers
 * @version 1.0.0
 */

import { HelpDocument } from "./FindingAClipper";

/**
 * Favoriting a Clipper help document for clients
 * @type {HelpDocument}
 */
export const FAVORITING_A_CLIPPER: HelpDocument = {
  id: "favoriting-a-clipper",
  title: "Favoriting a Clipper",
  overview:
    "Clippd allows you to save Clippers \nthat you want to return to later.",
  steps: [
    {
      number: 1,
      instruction:
        "Tap a Clipper to open\ntheir detail page",
    },
    {
      number: 2,
      instruction:
        "Press the heart icon in \nthe upper right corner",
    },
    {
      number: 3,
      instruction:
        "Access your saved Clippers \nby navigating to the \"favorites\"tab",
    },
  ],
};
