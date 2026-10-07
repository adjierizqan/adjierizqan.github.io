/** English-only public UI. Pure compatibility helpers for the approved presentation.
 * No global render state or partially translated language toggle. Ask accepts visitor language independently. */
export type Locale = "en" | "id";
export const tk = (text: string) => text;
export const t = (text: string) => text;
export function L(english: string, ..._translation: string[]) { void _translation; return english; }
