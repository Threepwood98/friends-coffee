import { readFileSync } from "node:fs";
import path from "node:path";

export function getFriendsFontBuffer() {
  return readFileSync(path.join(process.cwd(), "src/app/fonts/GABRWFFR.ttf"));
}
