import "dotenv/config";
import main from "./services/index.js";
import { TOP_K_ARTISTS } from "./lib/const.js";
import { ArtistAppearance } from "./lib/interfaces.js";

const start = Date.now();
main()
  .then((result: ArtistAppearance[]) => {
    console.log(
      `Here is the \x1b[31mTOP ${TOP_K_ARTISTS}\x1b[0m artists:\n\n${result
        .map(
          ({ artist, appearances }: ArtistAppearance, index: number) =>
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
