import { createReadStream, ReadStream } from "node:fs";
import { Gunzip } from "node:zlib";
import type {
  Artist,
  ArtistAppearanceMap,
} from "./types.js";
import zlib from "zlib";
import readline from "readline";

export async function* countArtistAppearancesInFile(
  pathToFile: string
): AsyncGenerator<ArtistAppearanceMap> {
  let fileStream: ReadStream | Gunzip = createReadStream(pathToFile);

  fileStream = pathToFile.endsWith(".gz")
    ? fileStream.pipe(zlib.createGunzip({ flush: zlib.constants.Z_SYNC_FLUSH }))
    : fileStream;

  const rl = readline.createInterface({ input: fileStream });

  const rawArtistAppearances: ArtistAppearanceMap = new Map();
  let count = 0;
  for await (const line of rl) {
    try {
      const { artist } = JSON.parse(line) as Artist;
      rawArtistAppearances.set(artist, (rawArtistAppearances.get(artist) || 0) + 1);

      if (++count > 100_000) {
        yield rawArtistAppearances;
        rawArtistAppearances.clear();
        count = 0;
      }
    } catch (err: unknown) {
      console.error(`Error parsing line: ${line}`, (err as Error).message);
    }
  }

  if (rawArtistAppearances.size > 0) {
    yield rawArtistAppearances;
  }

}