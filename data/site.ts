import { identity } from "./profile";

/**
 * Site-wide links, derived from the canonical profile.
 *
 * This used to repeat the email, GitHub, LinkedIn and CV values that
 * data/profile.ts (and the AI context generated from it) also held — two
 * places to update one fact. It keeps its shape for existing consumers.
 */
export const site = {
  name: identity.name,
  email: identity.contact.email,
  github: identity.contact.github,
  linkedin: identity.contact.linkedin,
  cv: identity.contact.resumeTarget,
} as const;
