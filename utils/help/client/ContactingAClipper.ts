/**
 * @fileoverview Help document: Contacting a Clipper (Client)
 * @description Instructions for clients on how to contact clippers
 * @version 1.0.0
 */

import { HelpDocument } from "./FindingAClipper";

/**
 * Contacting a Clipper help document for clients
 * @type {HelpDocument}
 */
export const CONTACTING_A_CLIPPER: HelpDocument = {
  id: "contacting-a-clipper",
  title: "Contacting a Clipper",
  overview:
    "You can contact Clippers through\ntheir provided contact information\nto schedule a service.",
  steps: [
    {
      number: 1,
      instruction:
        "Tap the Clipper to\nopen their detail page",
    },
    {
      number: 2,
      instruction:
        "Scroll to the\n\"contact information\"\nsection",
    },
    {
      number: 3,
      instruction:
        "Use the contact method\npreferred by either you\nor the Clipper",
    },
  ],
};
