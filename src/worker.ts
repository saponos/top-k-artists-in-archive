import { parentPort, workerData } from "node:worker_threads";
import { countArtistAppearancesInFile } from "./utils/count-artist-appearances.js";

try {
  for await (const chunk of countArtistAppearancesInFile(workerData as string)) {
    parentPort?.postMessage({
      data: chunk,
    });
  }
  
} catch (err: unknown) {
  parentPort?.postMessage({ error: (err as Error)?.message ?? "An unknown error occurred in the worker" });
  process.exit(1);
}
