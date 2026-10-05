/**
 * Writes data/portfolio-ai-context.json from the canonical sources.
 * Run: npm run ai-context   (never edit the JSON by hand)
 */
import { writeFileSync } from "node:fs";
import { buildAiContext } from "../lib/ai-context";

const path = new URL("../data/portfolio-ai-context.json", import.meta.url);
writeFileSync(path, JSON.stringify(buildAiContext(), null, 2) + "\n");
console.log("wrote data/portfolio-ai-context.json");
