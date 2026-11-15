export type ThemeId = "golden" | "retro" | "hypr";

export interface Wallpaper {
  id: string;
  name: string;
  url: string; // full resolution (3840x2160 webp, or a small pixel-art png scaled up crisply)
  thumb: string; // 1280px version, for pickers and the 3D monitor texture
  pixel?: boolean; // render with image-rendering: pixelated
  author: string | null; // Unsplash photographer (Unsplash License)
  photoId: string | null;
}

export const WALLPAPERS: Record<ThemeId, Wallpaper[]> = {
  golden: [
    {"id": "golden-golden-hour", "name": "Golden Hour", "url": "/wallpapers/golden/golden-hour.webp", "thumb": "/wallpapers/golden/golden-hour-md.webp", "author": "Evgeny Tchebotarev", "photoId": "ZPQE4XssoBc"},
    {"id": "golden-above-the-fog", "name": "Above the Fog", "url": "/wallpapers/golden/above-the-fog.webp", "thumb": "/wallpapers/golden/above-the-fog-md.webp", "author": "Joshua Sortino", "photoId": "71vAb1FXB6g"},
    {"id": "golden-bay-blue", "name": "Bay Blue", "url": "/wallpapers/golden/bay-blue.webp", "thumb": "/wallpapers/golden/bay-blue-md.webp", "author": "Varun Yadav", "photoId": "QhYTCG3CTeI"},
    {"id": "golden-fog-rolling", "name": "Fog Rolling In", "url": "/wallpapers/golden/fog-rolling.webp", "thumb": "/wallpapers/golden/fog-rolling-md.webp", "author": "Rockwell Branding Agency", "photoId": "1MnkSfwtxRI"},
    {"id": "golden-karl-the-fog", "name": "Karl", "url": "/wallpapers/golden/karl-the-fog.webp", "thumb": "/wallpapers/golden/karl-the-fog-md.webp", "author": "Parrish Freeman", "photoId": "6tiPnI_ijuI"},
    {"id": "golden-night-span", "name": "Night Span", "url": "/wallpapers/golden/night-span.webp", "thumb": "/wallpapers/golden/night-span-md.webp", "author": "Derek Zhang", "photoId": "i5hAmZrIpu0"},
    {"id": "golden-city-dusk", "name": "City at Dusk", "url": "/wallpapers/golden/city-dusk.webp", "thumb": "/wallpapers/golden/city-dusk-md.webp", "author": "Calvin Ma", "photoId": "Vq1lxH5TeQ0"},
  ],
  retro: [
    {"id": "retro-classic-teal", "name": "Classic Teal", "url": "/wallpapers/retro/classic-teal.png", "thumb": "/wallpapers/retro/classic-teal.png", "pixel": true, "author": null, "photoId": null},
    {"id": "retro-grid-sunset", "name": "Grid Sunset", "url": "/wallpapers/retro/grid-sunset.png", "thumb": "/wallpapers/retro/grid-sunset.png", "pixel": true, "author": "Neeqolah Creative Works", "photoId": "Tn5gnXGI3hI"},
    {"id": "retro-palm-dusk", "name": "Palm Dusk", "url": "/wallpapers/retro/palm-dusk.png", "thumb": "/wallpapers/retro/palm-dusk.png", "pixel": true, "author": "Simon Spring", "photoId": "qqvlV5WOnls"},
    {"id": "retro-lake-glow", "name": "Lake Glow", "url": "/wallpapers/retro/lake-glow.png", "thumb": "/wallpapers/retro/lake-glow.png", "pixel": true, "author": "Chris Stenger", "photoId": "DTMhL0OpXjQ"},
    {"id": "retro-alpine-lake", "name": "Alpine Lake", "url": "/wallpapers/retro/alpine-lake.png", "thumb": "/wallpapers/retro/alpine-lake.png", "pixel": true, "author": "Roberto Nickson", "photoId": "vZ1JAXUO3-0"},
    {"id": "retro-cotton-sky", "name": "Cotton Sky", "url": "/wallpapers/retro/cotton-sky.png", "thumb": "/wallpapers/retro/cotton-sky.png", "pixel": true, "author": "Nameless Photos", "photoId": "kYiMdxmkgpk"},
  ],
  hypr: [
    {"id": "hypr-neon-district", "name": "Neon District", "url": "/wallpapers/hypr/neon-district.webp", "thumb": "/wallpapers/hypr/neon-district-md.webp", "author": "Nat", "photoId": "dA0-qxdbyyY"},
    {"id": "hypr-night-alley", "name": "Night Alley", "url": "/wallpapers/hypr/night-alley.webp", "thumb": "/wallpapers/hypr/night-alley-md.webp", "author": "Hiep Duong", "photoId": "Z0aBm6359Oo"},
    {"id": "hypr-milky-way", "name": "Milky Way", "url": "/wallpapers/hypr/milky-way.webp", "thumb": "/wallpapers/hypr/milky-way-md.webp", "author": "Dns Dgn", "photoId": "9wH624ALFQA"},
    {"id": "hypr-starlit-peaks", "name": "Starlit Peaks", "url": "/wallpapers/hypr/starlit-peaks.webp", "thumb": "/wallpapers/hypr/starlit-peaks-md.webp", "author": "Haseeb Jamil", "photoId": "3s85IxVDyXE"},
    {"id": "hypr-misty-pines", "name": "Misty Pines", "url": "/wallpapers/hypr/misty-pines.webp", "thumb": "/wallpapers/hypr/misty-pines-md.webp", "author": "Adrien Tutin", "photoId": "Ddxb6fq6cIY"},
  ],
};

export const DEFAULT_WALLPAPER: Record<ThemeId, string> = {
  golden: "golden-golden-hour",
  retro: "retro-classic-teal",
  hypr: "hypr-neon-district",
};

export interface ResolvedWallpaper {
  url: string;
  thumb: string;
  pixel: boolean;
}

export function resolveWallpaper(
  theme: ThemeId,
  wallpapers: Record<ThemeId, string>,
  customWallpaper: string | null
): ResolvedWallpaper {
  const id = wallpapers?.[theme] ?? DEFAULT_WALLPAPER[theme];
  if (id === "custom" && customWallpaper) return { url: customWallpaper, thumb: customWallpaper, pixel: false };
  const wp = WALLPAPERS[theme].find((w) => w.id === id) ?? WALLPAPERS[theme][0];
  return { url: wp.url, thumb: wp.thumb, pixel: Boolean(wp.pixel) };
}
