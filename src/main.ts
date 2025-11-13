import "dotenv/config";
import { readdirSync } from "fs";
import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type {
  ArtistAppearance,
  ArtistAppearanceMap,
  WorkerMessage,
} from "./utils/types.js";
import { HARD, TOP_K_ARTISTS } from "./utils/const.js";
import { selectDifficulty } from "./utils/select-difficulty.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";
const workerFile = isProduction ? "./worker.js" : "./worker-dev.mjs";
const workerUrl = new URL(workerFile, import.meta.url);
const workerExecArgv = isProduction ? undefined : [...process.execArgv];

async function main(): Promise<ArtistAppearance[]> {
  const difficulty = isProduction ? await selectDifficulty() : HARD;
  const dataDir = join(__dirname, "..", "data", difficulty);
  const files = readdirSync(dataDir).filter((file) =>
    file.endsWith(".jsonl.gz")
  );
  const artistAppearances: ArtistAppearanceMap = new Map();

  await Promise.all(
    files.map(
      async (file) =>
        new Promise<boolean>((resolve, reject) => {
          const worker = new Worker(workerUrl, {
            workerData: join(dataDir, file),
            ...(workerExecArgv ? { execArgv: workerExecArgv } : {}),
          });
          worker.on("message", (message: WorkerMessage) => {
            if ("error" in message) return reject(new Error(message.error));
            const chunk: ArtistAppearanceMap = message.data ?? new Map();

            for (const [artist, appearances] of chunk) {
              artistAppearances.set(
                artist,
                (artistAppearances.get(artist) || 0) + appearances
              );
            }
          });
          worker.on("error", reject);
          worker.once("exit", (code) => {
            if (code !== 0)
              reject(new Error(`Worker exited with code ${code}`));
            resolve(true);
          });
        })
    )
  );

  return Array.from(artistAppearances.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_K_ARTISTS)
    .map(([artist, appearances]) => ({ artist, appearances }));
}
const start = Date.now();
main()
  .then((result) => {
    console.log(
      `Here is the \x1b[31mTOP ${TOP_K_ARTISTS}\x1b[0m artists:\n\n${result
        .map(
          ({ artist, appearances }, index) =>
            `${
              index + 1
            }. "${artist}" with \x1b[32m\x1b[1m${appearances}\x1b[0m appearances`
        )
        .join("\n")}\n`
    );
    const end = Date.now();
    console.log(
      `Time taken: \x1b[32m\x1b[1m${new Date(
        end - start
      ).getSeconds()}\x1b[0m seconds and \x1b[32m\x1b[1m${new Date(
        end - start
      ).getMilliseconds()}\x1b[0m milliseconds`
    );
  })
  .catch((err) => console.error((err as Error).message));
