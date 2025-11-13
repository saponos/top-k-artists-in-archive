import { createReadStream, ReadStream } from "node:fs";
import { Gunzip } from "node:zlib";
import type {
  Artist,
  ArtistAppearance,
  ArtistAppearanceMap,
} from "./types.js";
import zlib from "zlib";
import readline from "readline";

export async function countArtistAppearancesInFile(
  pathToFile: string
): Promise<ArtistAppearance[]> {
  let fileStream: ReadStream | Gunzip = createReadStream(pathToFile);

  fileStream = pathToFile.endsWith(".gz")
    ? fileStream.pipe(zlib.createGunzip({ flush: zlib.constants.Z_SYNC_FLUSH }))
    : fileStream;

  const rl = readline.createInterface({ input: fileStream });

  const rawArtistAppearances: ArtistAppearanceMap = {};
  for await (const line of rl) {
    try {
      const { artist } = JSON.parse(line) as Artist;
      rawArtistAppearances[artist] = (rawArtistAppearances[artist] || 0) + 1;
    } catch (err: unknown) {
      console.error(`Error parsing line: ${line}`, (err as Error).message);
    }
  }

  return Object.entries(rawArtistAppearances).map(([artist, appearances]) => ({
    artist,
    appearances,
  }));
}