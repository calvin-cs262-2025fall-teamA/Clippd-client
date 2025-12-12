import { FINDING_A_CLIPPER , HelpDocument } from "./client/FindingAClipper";
import { CONTACTING_A_CLIPPER } from "./client/ContactingAClipper";
import { FAVORITING_A_CLIPPER } from "./client/FavoritingAClipper";
import { EDITING_YOUR_PROFILE } from "./client/EditingYourProfile";


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
