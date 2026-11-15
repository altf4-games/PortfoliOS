// Background music: HoliznaCC0's "Winter Lofi" (2023), released under CC0 1.0 Universal
// via the Free Music Archive. Re-encoded to 128 kbps and self-hosted in public/audio.
export interface Track {
  title: string;
  src: string;
}

export const ALBUM = {
  artist: "HoliznaCC0",
  title: "Winter Lofi",
  license: "CC0 1.0",
  url: "https://freemusicarchive.org/music/holiznacc0/winter-lofi",
};

export const TRACKS: Track[] = [
  { title: "Winter Blues", src: "/audio/winter-blues.mp3" },
  { title: "First Snow", src: "/audio/first-snow.mp3" },
  { title: "Snow Drift", src: "/audio/snow-drift.mp3" },
  { title: "Fire Place", src: "/audio/fire-place.mp3" },
];
