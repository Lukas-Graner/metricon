import * as d3colormaps from "d3-scale-chromatic";
import { interpolateRgb } from "d3-interpolate";

export interface Colormap {
    id: string;
    calc: (t: number) => string;
    displayName: string;
}

const colormaps: Record<string, Colormap> = {
    GreenBlueRed: {
        id: "green_blue_red",
        calc: (t:number) =>
            t <= 0.5
                ? interpolateRgb("#ff0000", "#0000ff")(t * 2)
                : interpolateRgb("#0000ff", "#00ff00")(t * 2-1),
        displayName: "RedBlueGreen",
    },
    BrBG: {
        id: "brbg",
        calc: d3colormaps.interpolateBrBG,
        displayName: "BrBG",
    },
    PRGn: {
        id: "prgn",
        calc: d3colormaps.interpolatePRGn,
        displayName: "PRGn",
    },
    PiYG: {
        id: "piyg",
        calc: d3colormaps.interpolatePiYG,
        displayName: "PiYG",
    },
    PuOr: {
        id: "puor",
        calc: d3colormaps.interpolatePuOr,
        displayName: "PuOr",
    },
    RdBu: {
        id: "rdbu",
        calc: d3colormaps.interpolateRdBu,
        displayName: "RdBu",
    },
    RdGy: {
        id: "rdgy",
        calc: d3colormaps.interpolateRdGy,
        displayName: "RdGy",
    },
    RdYlBu: {
        id: "rdylbu",
        calc: d3colormaps.interpolateRdYlBu,
        displayName: "RdYlBu",
    },
    RdYlGn: {
        id: "rdyegn",
        calc: d3colormaps.interpolateRdYlGn,
        displayName: "RdYlGn",
    },
    Spectral: {
        id: "spectral",
        calc: d3colormaps.interpolateSpectral,
        displayName: "Spectral",
    },
    Blues: {
        id: "blues",
        calc: d3colormaps.interpolateBlues,
        displayName: "Blues",
    },
    Greens: {
        id: "greens",
        calc: d3colormaps.interpolateGreens,
        displayName: "Greens",
    },
    Greys: {
        id: "greys",
        calc: d3colormaps.interpolateGreys,
        displayName: "Greys",
    },
    Oranges: {
        id: "oranges",
        calc: d3colormaps.interpolateOranges,
        displayName: "Oranges",
    },
    Purples: {
        id: "purples",
        calc: d3colormaps.interpolatePurples,
        displayName: "Purples",
    },
    Reds: {
        id: "reds",
        calc: d3colormaps.interpolateReds,
        displayName: "Reds",
    },
    Turbo: {
        id: "turbo",
        calc: d3colormaps.interpolateTurbo,
        displayName: "Turbo",
    },
    Viridis: {
        id: "viridis",
        calc: d3colormaps.interpolateViridis,
        displayName: "Viridis",
    },
    Inferno: {
        id: "inferno",
        calc: d3colormaps.interpolateInferno,
        displayName: "Inferno",
    },
    Magma: {
        id: "magma",
        calc: d3colormaps.interpolateMagma,
        displayName: "Magma",
    },
    Plasma: {
        id: "plasma",
        calc: d3colormaps.interpolatePlasma,
        displayName: "Plasma",
    },
    Cividis: {
        id: "cividis",
        calc: d3colormaps.interpolateCividis,
        displayName: "Cividis",
    },
    Warm: {
        id: "warm",
        calc: d3colormaps.interpolateWarm,
        displayName: "Warm",
    },
    Cool: {
        id: "cool",
        calc: d3colormaps.interpolateCool,
        displayName: "Cool",
    },
    CubehelixDefault: {
        id: "cubehelix_default",
        calc: d3colormaps.interpolateCubehelixDefault,
        displayName: "CubehelixDefault",
    },
    BuGn: {
        id: "bugn",
        calc: d3colormaps.interpolateBuGn,
        displayName: "BuGn",
    },
    BuPu: {
        id: "bupu",
        calc: d3colormaps.interpolateBuPu,
        displayName: "BuPu",
    },
    GnBu: {
        id: "gnbu",
        calc: d3colormaps.interpolateGnBu,
        displayName: "GnBu",
    },
    OrRd: {
        id: "orrd",
        calc: d3colormaps.interpolateOrRd,
        displayName: "OrRd",
    },
    PuBuGn: {
        id: "pubugn",
        calc: d3colormaps.interpolatePuBuGn,
        displayName: "PuBuGn",
    },
    PuBu: {
        id: "pubu",
        calc: d3colormaps.interpolatePuBu,
        displayName: "PuBu",
    },
    PuRd: {
        id: "purd",
        calc: d3colormaps.interpolatePuRd,
        displayName: "PuRd",
    },
    RdPu: {
        id: "rdpu",
        calc: d3colormaps.interpolateRdPu,
        displayName: "RdPu",
    },
    YlGnBu: {
        id: "ylgnbu",
        calc: d3colormaps.interpolateYlGnBu,
        displayName: "YlGnBu",
    },
    YlGn: {
        id: "ylgn",
        calc: d3colormaps.interpolateYlGn,
        displayName: "YlGn",
    },
    YlOrBr: {
        id: "ylorbr",
        calc: d3colormaps.interpolateYlOrBr,
        displayName: "YlOrBr",
    },
    YlOrRd: {
        id: "ylorrd",
        calc: d3colormaps.interpolateYlOrRd,
        displayName: "YlOrRd",
    },
    Rainbow: {
        id: "rainbow",
        calc: d3colormaps.interpolateRainbow,
        displayName: "Rainbow",
    },
    Sinebow: {
        id: "sinebow",
        calc: d3colormaps.interpolateSinebow,
        displayName: "Sinebow",
    },
};

export default colormaps;
