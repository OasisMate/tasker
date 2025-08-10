export type ThemeKey = "blue" | "green" | "purple" | "orange" | "gray";

export type Palette = {
  key: ThemeKey;
  label: string; // UI label
  start: string; // gradient start
  end: string; // gradient end
  brand: string; // primary brand color
  card: string; // card bg
};

export const PALETTES: Palette[] = [
  {
    key: "blue",
    label: "Blue",
    start: "#56CCF2",
    end: "#2F80ED",
    brand: "#1F5BD7",
    card: "#F8FAFC",
  },
  {
    key: "green",
    label: "Green",
    start: "#34D399",
    end: "#10B981",
    brand: "#0E9F6E",
    card: "#F7FEFB",
  },
  {
    key: "purple",
    label: "Purple",
    start: "#A78BFA",
    end: "#7C3AED",
    brand: "#6D28D9",
    card: "#FAF8FF",
  },
  {
    key: "orange",
    label: "Orange",
    start: "#FB7185",
    end: "#F97316",
    brand: "#EA580C",
    card: "#FFF7F2",
  },
  {
    key: "gray",
    label: "Gray",
    start: "#94A3B8",
    end: "#64748B",
    brand: "#334155",
    card: "#F8FAFC",
  },
];

// keep this if you still want deterministic board accents by id
export function pickPaletteById(id: string): Palette {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTES[h % PALETTES.length];
}
