// One Line, No Deadline Met — make.fun entry.
// Writes a single original one-line joke excusing a missed deadline
// to <output-dir>/entry.txt (argv[2], default /output).
// Deterministic: no network, no wall-clock time, no randomness.
// Stdlib only (node:fs, node:path).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry line. Original, one sentence, punch at the end.
const LINE =
  "I finished it on time in my head, which unfortunately is the only place my boss can't open the file.";

function selfCheck(line: string): void {
  // Gate mirror: UTF-8 text, 1-200 characters, not only whitespace.
  if (line.length < 1 || line.length > 200) {
    throw new Error(`entry length ${line.length} is outside 1-200 characters`);
  }
  if (line.trim().length === 0) {
    throw new Error("entry is only whitespace");
  }
  // Single line, single sentence: no newline, exactly one sentence.
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  const sentences = line.split(/[.!?]+/).filter((part) => part.trim().length > 0);
  if (sentences.length !== 1) {
    throw new Error(`entry must be a single sentence, found ${sentences.length}`);
  }
  if (!line.endsWith(".")) {
    throw new Error("entry must end with a full stop");
  }
  // Byte-size sanity: plain ASCII line, so bytes equal characters here;
  // guard anyway so a future edit with multi-byte characters cannot
  // silently slip past the character-count check above.
  const bytes = Buffer.byteLength(line, "utf8");
  if (bytes < 1 || bytes > 200) {
    throw new Error(`entry byte size ${bytes} is outside 1-200 bytes`);
  }
}

function main(): void {
  selfCheck(LINE);
  const outDir = process.argv[2] ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE, "utf8");
  // Read-back verification: what landed on disk must match exactly.
  const back = readFileSync(outPath, "utf8");
  if (back !== LINE) {
    throw new Error("read-back mismatch: entry.txt does not match the entry line");
  }
  // No trailing newline: the file is the line and nothing else, so the
  // gate sees exactly one line with no empty second line after it.
  if (back.endsWith("\n")) {
    throw new Error("entry.txt must not end with a newline");
  }
  selfCheck(back);
}

main();
