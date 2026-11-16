// Client-facing help for each checklist document (Figma "Upload flow":
// the line under the title and the "What to provide" card).
export interface DocumentGuidance {
  hint: string;
  provideIntro: string;
  provideItems: string[];
}

const FALLBACK: DocumentGuidance = {
  hint: "Upload the document your case team asked for.",
  provideIntro: "A clear, complete copy of the document.",
  provideItems: [],
};

const GUIDANCE: Record<string, DocumentGuidance> = {
  passport: {
    hint: "Upload a clear copy of your passport's identity page.",
    provideIntro: "A clear scan of your valid passport, such as:",
    provideItems: ["The identity (photo) page", "Pages with visas or stamps, if applicable"],
  },
  "letter-of-acceptance": {
    hint: "Upload the letter of acceptance from your school.",
    provideIntro: "An official letter from your designated learning institution, such as:",
    provideItems: ["Your letter of acceptance", "An updated letter, if your program dates changed"],
  },
  "proof-of-funds": {
    hint: "Upload documents that show the funds available for your application.",
    provideIntro: "Documents showing that you have sufficient funds for your application, such as:",
    provideItems: ["Recent bank statements (for example, 4-6 months)", "A bank letter, if applicable"],
  },
  "statement-of-purpose": {
    hint: "Upload your statement explaining your study plans.",
    provideIntro: "A short letter in your own words, covering:",
    provideItems: ["Why you chose this program and school", "Your plans after you finish your studies"],
  },
  "language-test": {
    hint: "Upload your English or French language test results.",
    provideIntro: "Official test results, such as:",
    provideItems: ["IELTS, CELPIP or PTE Core results", "TEF or TCF results, if applicable"],
  },
};

export function getDocumentGuidance(itemId: string): DocumentGuidance {
  return GUIDANCE[itemId] ?? FALLBACK;
}
