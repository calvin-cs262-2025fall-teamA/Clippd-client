export interface HelpStep {
  number: number;
  instruction: string;
}

export interface HelpDocument {
  id: string;
  title: string;
  overview: string;
  steps: HelpStep[];
}

export const FINDING_A_CLIPPER: HelpDocument = {
  id: "finding-a-clipper",
  title: "Finding a Clipper",
  overview:
    "With Clippd, you can easily browse Clippers based on your hair type, preferred style, and the services they provide.",
  steps: [
    {
      number: 1,
      instruction:
        "Open the home tab to\nview the feed of Clippers",
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
