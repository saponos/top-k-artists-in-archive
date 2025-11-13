import { parentPort, workerData } from "node:worker_threads";
import { countArtistAppearancesInFile } from "./utils/count-artist-appearances.js";

try {
  parentPort?.postMessage({
    data: await countArtistAppearancesInFile(workerData),
  });
} catch (err: unknown) {
  parentPort?.postMessage({ error: (err as Error)?.message ?? "An unknown error occurred in the worker" });
  process.exit(1);
}
