import { interpolateRgb } from "d3-interpolate";
import { settings } from "../utils/settings.svelte"

export const formatMetricValue = (value: number, showMetricsAsPercentage: boolean, floatingPrecision: number, bounds?: [number, number]): string => {
    const shouldShowAsPercentage = showMetricsAsPercentage && bounds !== undefined && bounds[0] === 0 && bounds[1] === 1;
    if (shouldShowAsPercentage) {
        return (value * 100).toFixed(Math.max(0, floatingPrecision - 2)) + '%';
    }
    return value.toFixed(floatingPrecision);
}

export const formatValue = (value: number, floatingPrecision: number) => {
    if (Number.isNaN(value)) return "NaN";
    else if (value === Number.POSITIVE_INFINITY) return "∞";
    else if (value === Number.NEGATIVE_INFINITY) return "-∞";
    else if (value >= Math.pow(10, floatingPrecision + 1)) return value.toExponential(floatingPrecision - 2).replace("+", "");
    else if (value >= 10) return value.toFixed(floatingPrecision - Math.floor(Math.log10(value)));
    else return value.toFixed(floatingPrecision);
};

export const matrixTotalSum = (m: number[][]) => {
    let sum = 0;
    for (const row of m) {
        for (const cell of row) {
            sum += cell;
        }
    }
    return sum;
};

export const addMatrices = (...matrices: number[][][]) => {
    const result = Array.from({ length: matrices[0].length }, () =>
        Array.from({ length: matrices[0][0].length }, () => 0)
    );
    for (const m of matrices) {
        for (let i = 0; i < m.length; i++) {
            for (let j = 0; j < m.length; j++) {
                result[i][j] += m[i][j];
            }
        }
    }
    return result;
};

export const multiToBinaryMatrix = (m: number[][], c: number) => {
    const matrix = [
        [0, 0],
        [0, 0],
    ];
    for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m.length; j++) {
            if (i != c && j != c) matrix[1][1] += m[i][j];
            else if (i === c && j != c) matrix[0][1] += m[i][j];
            else if (i != c && j === c) matrix[1][0] += m[i][j];
            else matrix[0][0] += m[i][j];
        }
    }
    return matrix;
};

export const microaverage = (m: number[][], metric: (m: number[][]) => number) => {
    const matrix = [
        [0, 0],
        [0, 0],
    ];
    for (let c = 0; c < m.length; c++) {
        const binaryMatrix = multiToBinaryMatrix(m, c);
        matrix[0][0] += binaryMatrix[0][0];
        matrix[1][0] += binaryMatrix[1][0];
        matrix[0][1] += binaryMatrix[0][1];
        matrix[1][1] += binaryMatrix[1][1];
    }
    return metric(matrix);
};

export const macroaverage = (m: number[][], metric: (m: number[][]) => number) => {
    let result = 0;
    for (let c = 0; c < m.length; c++) {
        result += metric(multiToBinaryMatrix(m, c));
    }
    return result / m.length;
};

export const sum = (values: number[]) => values.reduce((a, b) => a + b);

export const mean = (values: number[]) => values.reduce((a, b) => a + b) / values.length;

export const lerp = (a: number, b: number, v: number) => (isNaN(v) ? Number.NaN : a + v * (b - a));

export const invlerp = (a: number, b: number, v: number) => (isNaN(v) ? Number.NaN : (v - a) / (b - a));

export const minBy = <T>(arr: T[], selector: (a: T) => number): [number, number | null] => {
    let minValue = Infinity;
    let minIndex = null;
    arr.forEach((element, i) => {
        const val = selector(element);
        if (val < minValue) {
            minValue = val;
            minIndex = i;
        }
    });
    return [minValue, minIndex];
}


type Interpolator<T> = (t: number) => T;

export const getExtendedInterpolator = <T extends number | string | unknown[] | Date | Record<string, unknown> | unknown>(a: T, b: T): Interpolator<T> => {
    if (a === b || a !== a) return () => a as T;
    const type = typeof a;

    if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
        throw new Error("Cannot interpolate values of different type");
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        const arr = b.map((bi: unknown, i: number) => {
            return getExtendedInterpolator(a[i] as number | string | unknown[] | Date | Record<string, unknown> | unknown, bi);
        });

        return ((t: number) => arr.map((fn: (t: number) => unknown) => fn(t))) as Interpolator<T>;
    }

    if (type === "object" && a !== null && b !== null) {
        if (!a || !b) throw new Error("Object cannot be null");

        if (a instanceof Date && b instanceof Date) {
            const aTime = a.getTime();
            const bTime = b.getTime();
            const delta = bTime - aTime;
            return ((t: number) => new Date(aTime + t * delta)) as Interpolator<T>;
        }

        const keys = Object.keys(b).filter((k): k is string => typeof k === 'string');
        const interpolators: Record<string, (t: number) => unknown> = {};

        keys.forEach((key) => {
            interpolators[key] = getExtendedInterpolator((a as Record<string, unknown>)[key] as number | string | unknown[] | Date | Record<string, unknown> | unknown, (b as Record<string, unknown>)[key] as number | string | unknown[] | Date | Record<string, unknown> | unknown);
        });

        return ((t: number) => {
            const result: Record<string, unknown> = {};
            keys.forEach((key) => {
                result[key] = interpolators[key](t);
            });
            return result;
        }) as Interpolator<T>;
    }

    if (type === "number") {
        const delta = (b as number) - (a as number);
        return ((t: number) => (a as number) + t * delta) as Interpolator<T>;
    }

    if (type === "string") {
        return interpolateRgb(a as string, b as string) as Interpolator<T>;
    }

    throw new Error(`Cannot interpolate ${type} values`);
};


export const calcConfusionMatrixCellStyle = (value: number, total: number, correct: boolean) => {
    const isDark = settings.darkMode;
    if (isDark) {
        if (correct) {
            return `background-color:hsla(127,100%,60%,${(value / total) * 80}%)`
        } else {
            return `background-color:hsla(0,100%,60%,${(value / total) * 80}%)`
        }
    } else {
        if (correct) {
            return `background-color:hsl(127,100%,${100 - (value / total) * 20}%)`
        } else {
            return `background-color:hsl(0,100%,${100 - (value / total) * 20}%)`
        }
    }
};

// --- Plot Statistics ---

// Calculate KDE
export const computeKde = (data: number[], range: [number, number], resolution: number = 50, kernelSigma: number = 0.1) => {
    const kernel = (t: number) =>
        Math.exp((-0.5 * t * t) / kernelSigma / kernelSigma) / Math.sqrt(2 * Math.PI) / kernelSigma;

    const points: { x: number, y: number }[] = [];
    for (let i = 0; i < resolution; i++) {
        const p = lerp(range[0], range[1], i / resolution);
        let sum = 0;
        for (const d of data) {
            sum += kernel(d - p);
        }
        points.push({ x: p, y: sum });
    }
    return points;
};

// Spearman Rank Correlation
export const spearmanCorrelation = (x: number[], y: number[]) => {
    const rank = (arr: number[]) => {
        const sorted = arr.slice().sort((a, b) => a - b);
        return arr.map(v => sorted.indexOf(v) + 1);
    };
    const rankX = rank(x);
    const rankY = rank(y);
    const n = x.length;
    if (n === 0) return 0;
    let rankDiffSqSum = 0;
    for (let i = 0; i < n; i++) {
        rankDiffSqSum += Math.pow(rankX[i] - rankY[i], 2);
    }
    return 1 - ((6 * rankDiffSqSum) / (n * (Math.pow(n, 2) - 1)));
};

// KDE Area Overlap (Intersection)
export const kdeOverlapArea = (kdeX: { y: number }[], kdeY: { y: number }[]) => {
    if (!kdeX || !kdeY || kdeX.length !== kdeY.length || kdeX.length === 0) return 0;
    let overlap = 0;
    let totalAreaX = 0;
    let totalAreaY = 0;
    for (let i = 0; i < kdeX.length; i++) {
        overlap += Math.min(kdeX[i].y, kdeY[i].y);
        totalAreaX += kdeX[i].y;
        totalAreaY += kdeY[i].y;
    }
    const maxArea = Math.max(totalAreaX, totalAreaY);
    return maxArea > 0 ? (overlap / maxArea) : 0;
};

// KDE Kurtosis (Sharpness/Tailedness Proxy)
export const kdeKurtosis = (kde: { x: number, y: number }[]) => {
    if (!kde || kde.length === 0) return 0;
    let sumY = 0;
    let meanX = 0;
    for (const p of kde) { sumY += p.y; meanX += p.x * p.y; }
    if (sumY === 0) return 0;
    meanX /= sumY;

    let variance = 0;
    let m4 = 0;
    for (const p of kde) {
        const diff = p.x - meanX;
        variance += (diff * diff) * (p.y / sumY);
        m4 += Math.pow(diff, 4) * (p.y / sumY);
    }
    if (variance === 0) return 0;
    return (m4 / Math.pow(variance, 2)) - 3;
};

// Mutual Information (Histogram-based Proxy)
export const mutualInformation = (x: number[], y: number[], bins: number = 20) => {
    const n = x.length;
    if (n === 0) return 0;

    const minX = Math.min(...x);
    let maxX = Math.max(...x);
    const minY = Math.min(...y);
    let maxY = Math.max(...y);
    if (maxX === minX) maxX += 0.0001;
    if (maxY === minY) maxY += 0.0001;

    const histX = new Array(bins).fill(0);
    const histY = new Array(bins).fill(0);
    const histXY = Array.from({ length: bins }, () => new Array(bins).fill(0));

    for (let i = 0; i < n; i++) {
        const bx = Math.min(bins - 1, Math.floor((x[i] - minX) / (maxX - minX) * bins));
        const by = Math.min(bins - 1, Math.floor((y[i] - minY) / (maxY - minY) * bins));
        histX[bx]++;
        histY[by]++;
        histXY[bx][by]++;
    }

    let mi = 0;
    let hX = 0;
    let hY = 0;

    for (let i = 0; i < bins; i++) {
        const px = histX[i] / n;
        if (px > 0) hX -= px * Math.log2(px);

        const py = histY[i] / n;
        if (py > 0) hY -= py * Math.log2(py);

        for (let j = 0; j < bins; j++) {
            const pxy = histXY[i][j] / n;
            if (pxy > 0) {
                mi += pxy * Math.log2(pxy / (px * (histY[j] / n)));
            }
        }
    }
    // Normalized Mutual Information [0, 1]
    const hXY = hX + hY;
    return hXY > 0 ? (2 * mi / hXY) : 0;
};