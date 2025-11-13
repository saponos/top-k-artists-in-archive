import { EASY, HARD, MEDIUM } from "./const.js";

export interface WorkerMessage {
  data?: ArtistAppearanceMap;
  error?: string;
}
export type ArtistName = string;
export type ArtistAppearances = number;
export type ArtistAppearanceMap = Map<string, number>;
export interface Artist {
  artist: ArtistName;
}
export interface ArtistAppearance {
  artist: ArtistName;
  appearances: ArtistAppearances;
}
export type Difficulty = typeof EASY | typeof MEDIUM | typeof HARD;
export type Level = {
  name: Difficulty;
  range: [number, number];
  files: number;
};
