import { identity } from "./profile";
export const site = {
  name: identity.name,
  email: identity.contact.email,
  github: identity.contact.github,
  linkedin: identity.contact.linkedin,
  cv: identity.contact.resumeTarget,
} as const;
