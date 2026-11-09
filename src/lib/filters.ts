export type FilterId =
  | "original"
  | "clarendon"
  | "juno"
  | "lark"
  | "valencia"
  | "ludwig"
  | "sierra";

export type FilterPreset = {
  id: FilterId;
  name: string;
  description: string;
};

export const FILTER_PRESETS: FilterPreset[] = [
  { id: "original", name: "Original", description: "No filter" },
  { id: "clarendon", name: "Clarendon", description: "Cool contrast pop" },
  { id: "juno", name: "Juno", description: "Warm lifted exposure" },
  { id: "lark", name: "Lark", description: "Bright airy lift" },
  { id: "valencia", name: "Valencia", description: "Faded warm fade" },
  { id: "ludwig", name: "Ludwig", description: "Soft pastel wash" },
  { id: "sierra", name: "Sierra", description: "Gentle warm midtones" },
];

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

function applyCurve(value: number, amount: number): number {
  const x = value / 255;
  const curved = Math.pow(x, 1 - amount * 0.35);
  return clamp(curved * 255);
}

type ChannelAdjust = {
  contrast?: number;
  brightness?: number;
  saturation?: number;
  warm?: number;
  cool?: number;
  fade?: number;
  greenLift?: number;
  magenta?: number;
};

function adjustPixel(
  r: number,
  g: number,
  b: number,
  adjust: ChannelAdjust,
  intensity: number,
): [number, number, number] {
  const t = Math.max(0, Math.min(1, intensity));
  let nr = r;
  let ng = g;
  let nb = b;

  if (adjust.brightness) {
    const delta = adjust.brightness * t * 40;
    nr += delta;
    ng += delta;
    nb += delta;
  }

  if (adjust.contrast) {
    const factor = 1 + adjust.contrast * t;
    nr = (nr - 128) * factor + 128;
    ng = (ng - 128) * factor + 128;
    nb = (nb - 128) * factor + 128;
  }

  if (adjust.saturation !== undefined) {
    const gray = 0.299 * nr + 0.587 * ng + 0.114 * nb;
    const sat = 1 + adjust.saturation * t;
    nr = gray + (nr - gray) * sat;
    ng = gray + (ng - gray) * sat;
    nb = gray + (nb - gray) * sat;
  }

  if (adjust.warm) {
    nr += adjust.warm * t * 28;
    nb -= adjust.warm * t * 18;
  }

  if (adjust.cool) {
    nb += adjust.cool * t * 30;
    nr -= adjust.cool * t * 12;
  }

  if (adjust.greenLift) {
    ng += adjust.greenLift * t * 18;
    nr -= adjust.greenLift * t * 6;
  }

  if (adjust.magenta) {
    nr += adjust.magenta * t * 14;
    nb += adjust.magenta * t * 10;
    ng -= adjust.magenta * t * 8;
  }

  if (adjust.fade) {
    const fade = adjust.fade * t;
    nr = nr * (1 - fade * 0.25) + 255 * fade * 0.18;
    ng = ng * (1 - fade * 0.25) + 255 * fade * 0.16;
    nb = nb * (1 - fade * 0.25) + 255 * fade * 0.12;
    nr = applyCurve(nr, fade * 0.4);
    ng = applyCurve(ng, fade * 0.35);
    nb = applyCurve(nb, fade * 0.3);
  }

  return [clamp(nr), clamp(ng), clamp(nb)];
}

const PRESET_ADJUST: Record<Exclude<FilterId, "original">, ChannelAdjust> = {
  clarendon: { contrast: 0.45, saturation: 0.35, cool: 0.35, brightness: 0.1 },
  juno: { warm: 0.55, contrast: 0.2, saturation: 0.25, brightness: 0.25 },
  lark: { brightness: 0.45, saturation: -0.25, greenLift: 0.2, contrast: -0.1 },
  valencia: { warm: 0.45, fade: 0.7, saturation: -0.1, brightness: 0.15 },
  ludwig: { saturation: -0.35, magenta: 0.35, fade: 0.35, contrast: -0.15 },
  sierra: { warm: 0.35, fade: 0.45, contrast: -0.05, brightness: 0.1 },
};

export function applyFilterToImageData(
  imageData: ImageData,
  filterId: FilterId,
  intensity: number,
): ImageData {
  if (filterId === "original" || intensity <= 0) {
    return new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    );
  }

  const adjust = PRESET_ADJUST[filterId];
  const data = new Uint8ClampedArray(imageData.data);
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = adjustPixel(data[i], data[i + 1], data[i + 2], adjust, intensity);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  return new ImageData(data, imageData.width, imageData.height);
}
