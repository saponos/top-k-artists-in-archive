import fs from "fs";
import path from "path";
import zlib from "zlib";

const dataDir = path.join(__dirname, "../..", "data");
const artists = [
  "Radiohead",
  "Arctic Monkeys",
  "Muse",
  "The Killers",
  "Nirvana",
  "Foo Fighters",
  "Linkin Park",
  "Placebo",
  "The Smashing Pumpkins",
  "Nine Inch Nails",
  "Coldplay",
  "Imagine Dragons",
  "Paramore",
  "Red Hot Chili Peppers",
  "The Strokes",
  "Queens of the Stone Age",
  "The White Stripes",
  "Interpol",
  "The 1975",
  "Snow Patrol",
  "Kasabian",
  "The Black Keys",
  "Florence + The Machine",
  "Yeah Yeah Yeahs",
  "Editors",
  "The National",
  "Modest Mouse",
  "The Verve",
  "Blur",
  "Oasis",
  "Green Day",
  "Beck",
  "The Cranberries",
  "Evanescence",
  "The Kooks",
  "Franz Ferdinand",
  "Arcade Fire",
  "The Goo Goo Dolls",
  "Smashing Pumpkins",
  "The Libertines",
  "Kings of Leon",
  "Panic! At The Disco",
  "Thirty Seconds to Mars",
  "Death Cab for Cutie",
  "MGMT",
  "Silversun Pickups",
  "Biffy Clyro",
  "R.E.M.",
  "No Doubt",
  "The Offspring",
  "The Cure",
];
const artistsLength = artists.length;

function randomArtist() {
  return artists[Math.floor(Math.random() * artistsLength)];
}

function generateFile(filename: string, lines: number) {
  const filePath = path.join(dataDir, filename);
  const gz = zlib.createGzip();
  const out = fs.createWriteStream(filePath);
  gz.pipe(out);

  for (let i = 0; i < lines; i++) {
    gz.write(JSON.stringify({ artist: randomArtist() }) + "\n", "utf-8");
  } 

  gz.end(() => console.log(`Generated ${filename} with ${lines} lines`));
}

fs.mkdirSync(dataDir, { recursive: true });

generateFile("simple.json.gz", 20);
generateFile("medium.json.gz", 50_000);
generateFile("hard.json.gz", 1_000_000);
