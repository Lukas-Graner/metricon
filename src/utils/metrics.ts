import { microaverage, macroaverage } from "./utils";

export const tp = (m: number[][]) => m[0][0];
export const fn = (m: number[][]) => m[0][1];
export const fp = (m: number[][]) => m[1][0];
export const tn = (m: number[][]) => m[1][1];

export interface Metric {
    id: string;
    displayName: string;
    fullName?: string;
    bounds: [number, number];
    preferredBounds: [number, number];
    calc: (m: number[][]) => number;
    level: number; // 1 = basic, 2 = advanced, 3 = expert
    formula?: string; // LaTeX formula
    description?: string; // Plain text description
}

export const confusionmatrixmetrics: Record<string, Metric> = {
    accuracy: {
        id: "accuracy",
        displayName: "Accuracy",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 1,
        description: "Proportion of correct predictions",
        formula: "\\frac{\\text{TP} + \\text{TN}}{\\text{TP} + \\text{TN} + \\text{FP} + \\text{FN}}",
        calc: (m: number[][]) => {
            let diag = 0;
            let total = 0;
            for (let i = 0; i < m.length; i++) {
                const row = m[i];
                for (let j = 0; j < row.length; j++) {
                    const cell = row[j];
                    total += cell;
                    if (i == j) diag += cell;
                }
            }
            return diag / total;
        },
    },
    precision: {
        id: "precision",
        displayName: "Precision",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 1,
        description: "Proportion of positive predictions that were correct",
        formula: "\\frac{\\text{TP}}{\\text{TP} + \\text{FP}}",
        calc: (m: number[][]) => {
            const denom = tp(m) + fp(m);
            return denom === 0 ? 0 : tp(m) / denom;
        }
    },
    recall: {
        id: "recall",
        displayName: "Recall",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 1,
        description: "Proportion of real positives that were correctly identified - also called sensitivity",
        formula: "\\frac{\\text{TP}}{\\text{TP} + \\text{FN}}",
        calc: (m: number[][]) => {
            return confusionmatrixmetrics.tpr.calc(m);
        },
    },
    balanced_accuracy: {
        id: "balanced_accuracy",
        displayName: "Balanced Acc.",
        fullName: "Balanced Accuracy",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 1,
        description: "Arithmetic mean of sensitivity (i.e. recall) and specificity",
        formula: "\\frac{\\text{TPR} + \\text{TNR}}{2} = \\frac{1}{2} \\left( \\frac{\\text{TP}}{\\text{TP} + \\text{FN}} + \\frac{\\text{TN}}{\\text{TN} + \\text{FP}} \\right)",
        calc: (m: number[][]) => {
            let result = 0;
            for (let i = 0; i < m.length; i++) {
                const row = m[i];
                let rowSum = 0;
                for (let j = 0; j < row.length; j++) {
                    rowSum += row[j];
                }
                result += row[i] / rowSum;
            }
            return result / m.length;
        },
    },
    f1_score: {
        id: "f1_score",
        displayName: "F1",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 1,
        description: "Harmonic mean of precision and recall",
        formula: "\\frac{2 \\cdot \\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}",
        calc: (m: number[][]) => {
            const pr = confusionmatrixmetrics.precision.calc(m);
            const re = confusionmatrixmetrics.recall.calc(m);
            const denom = pr + re;
            return denom === 0 ? 0 : (2 * pr * re) / denom;
        },
    },
    youdensj: {
        id: "youdensj",
        displayName: "Youden's J",
        fullName: "Youden's J",
        bounds: [-1, 1],
        preferredBounds: [-1, 1],
        level: 3,
        description: "Statistic evaluating binary classifier performance, sensitivity + specificity - 1, equal to balanced accuracy * 2 - 1",
        formula: "\\text{Sensitivity} + \\text{Specificity} - 1 = \\frac{\\text{TP}}{\\text{TP} + \\text{FN}} + \\frac{\\text{TN}}{\\text{TN} + \\text{FP}} - 1",
        calc: (m: number[][]) => {
            return confusionmatrixmetrics.balanced_accuracy.calc(m) * 2 - 1;
        },
    },
    markedness: {
        id: "markedness",
        displayName: "Markedness",
        bounds: [-1, 1],
        preferredBounds: [-1, 1],
        level: 2,
        description: "Measures the trustworthiness of positive and negative predictions: Precision + NPV - 1",
        formula: "\\text{Precision} + \\text{NPV} - 1 = \\frac{\\text{TP}}{\\text{TP} + \\text{FP}} + \\frac{\\text{TN}}{\\text{TN} + \\text{FN}} - 1",
        calc: (m: number[][]) => {
            const precision = tp(m) / (tp(m) + fp(m));
            const npv = tn(m) / (tn(m) + fn(m));
            return precision + npv - 1;
        },
    },
    kappa: {
        id: "kappa",
        displayName: "Cohen's κ",
        fullName: "Cohen's kappa",
        bounds: [-1, 1],
        preferredBounds: [-1, 1],
        level: 2,
        description: "Measures agreement between observers accounting for chance agreement. p_o is observed agreement (accuracy), p_e is expected agreement by chance.",
        formula: "\\frac{p_o - p_e}{1 - p_e} = \\frac{\\frac{\\text{TP}+\\text{TN}}{N} - \\frac{(\\text{TP}+\\text{FN})(\\text{TP}+\\text{FP}) + (\\text{FP}+\\text{TN})(\\text{FN}+\\text{TN})}{N^2}}{1 - \\frac{(\\text{TP}+\\text{FN})(\\text{TP}+\\text{FP}) + (\\text{FP}+\\text{TN})(\\text{FN}+\\text{TN})}{N^2}}",
        calc: (m: number[][]) => {
            let diag = 0;
            let total = 0;
            let pe = 0;
            for (let i = 0; i < m.length; i++) {
                let rowSum = 0;
                let colSum = 0;
                for (let j = 0; j < m.length; j++) {
                    total += m[i][j];
                    if (i == j) diag += m[i][j];
                    rowSum += m[i][j];
                    colSum += m[j][i];
                }
                pe += rowSum * colSum;
            }
            pe /= total;
            return (diag - pe) / (total - pe);
        },
    },
    tpr: {
        id: "tpr",
        displayName: "TPR",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 2,
        description: "True positive rate: measures proportion of positives correctly identified",
        formula: "\\frac{\\text{TP}}{\\text{TP} + \\text{FN}}",
        calc: (m: number[][]) => {
            return tp(m) / (tp(m) + fn(m));
        },
    },
    fpr: {
        id: "fpr",
        displayName: "FPR",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 2,
        description: "False positive rate: measures proportion of negatives incorrectly classified as positive",
        formula: "\\frac{\\text{FP}}{\\text{FP} + \\text{TN}}",
        calc: (m: number[][]) => {
            return fp(m) / (fp(m) + tn(m));
        },
    },
    tnr: {
        id: "tnr",
        displayName: "TNR",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 2,
        description: "True negative rate: measures proportion of negatives correctly identified",
        formula: "\\frac{\\text{TN}}{\\text{TN} + \\text{FP}}",
        calc: (m: number[][]) => {
            return tn(m) / (tn(m) + fp(m));
        },
    },
    fnr: {
        id: "fnr",
        displayName: "FNR",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 2,
        description: "False negative rate: measures proportion of positives incorrectly classified as negative",
        formula: "\\frac{\\text{FN}}{\\text{FN} + \\text{TP}}",
        calc: (m: number[][]) => {
            return fn(m) / (fn(m) + tp(m));
        },
    },
    fowlkes_mallows: {
        id: "fowlkes_mallows",
        displayName: "Fowlkes-Mallows",
        fullName: "Fowlkes-Mallows",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 2,
        description: "Geometric mean of precision and recall",
        formula: "\\sqrt{\\text{Precision} \\cdot \\text{Recall}}",
        calc: (m: number[][]) => {
            const pr = confusionmatrixmetrics.precision.calc(m);
            const re = confusionmatrixmetrics.recall.calc(m);
            return Math.sqrt(pr * re);
        },
    },
    gmean: {
        id: "gmean",
        displayName: "g-mean",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 2,
        description: "Geometric mean of true positive rate and true negative rate",
        formula: "\\sqrt{\\text{TPR} \\cdot \\text{TNR}}",
        calc: (m: number[][]) => {
            return Math.sqrt(confusionmatrixmetrics.tpr.calc(m) * confusionmatrixmetrics.tnr.calc(m));
        },
    },
    mcc: {
        id: "mcc",
        displayName: "MCC",
        fullName: "Matthews correlation coefficient",
        bounds: [-1, 1],
        preferredBounds: [-1, 1],
        level: 2,
        description: "Matthews correlation coefficient measures correlation between predicted and true classifications",
        formula: "\\frac{\\text{TP} \\cdot \\text{TN} - \\text{FP} \\cdot \\text{FN}}{\\sqrt{(\\text{TP}+\\text{FP})(\\text{TP}+\\text{FN})(\\text{TN}+\\text{FP})(\\text{TN}+\\text{FN})}}",
        calc: (m: number[][]) => {
            return (
                (tp(m) * tn(m) - fp(m) * fn(m)) /
                Math.sqrt(
                    (tp(m) + fp(m)) *
                    (tp(m) + fn(m)) *
                    (tn(m) + fp(m)) *
                    (tn(m) + fn(m))
                )
            );
        },
    },
    mutualinformation: {
        id: "mutualinformation",
        displayName: "Mutual Info",
        fullName: "Mutual information",
        bounds: [0, Number.POSITIVE_INFINITY],
        preferredBounds: [0, 1],
        level: 3,
        description: "Information shared between true and predicted classes. p_ij is the joint probability, p_i· is the marginal probability of true class i, p_·j is the marginal probability of predicted class j.",
        formula: "\\sum_{i,j} p_{ij}\\log\\frac{p_{ij}}{p_{i\\cdot}p_{\\cdot j}}",
        calc: (m: number[][]) => {
            const _tp = tp(m);
            const _fn = fn(m);
            const _fp = fp(m);
            const _tn = tn(m);

            const total = _tp + _fn + _fp + _tn;
            if (total === 0) return 0;

            const rowPos = (_tp + _fn) / total;
            const rowNeg = (_fp + _tn) / total;
            const colPos = (_tp + _fp) / total;
            const colNeg = (_fn + _tn) / total;

            const cells = [
                { p: _tp / total, pr: rowPos, pc: colPos },
                { p: _fn / total, pr: rowPos, pc: colNeg },
                { p: _fp / total, pr: rowNeg, pc: colPos },
                { p: _tn / total, pr: rowNeg, pc: colNeg },
            ];

            let mi = 0;
            for (const { p, pr, pc } of cells) {
                if (p > 0) {
                    mi += p * Math.log2(p / (pr * pc));
                }
            }
            return mi;
        },
    },
    micro_recall: {
        id: "micro_recall",
        displayName: "Micro-Recall",
        fullName: "Micro-Recall",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 3,
        description: "Recall calculated globally by counting total true positives and false negatives",
        formula: "\\frac{\\sum_i \\text{TP}_i}{\\sum_i \\text{TP}_i + \\sum_i \\text{FN}_i}",
        calc: (m: number[][]) => {
            return microaverage(m, confusionmatrixmetrics.recall.calc);
        },
    },
    macro_recall: {
        id: "macro_recall",
        displayName: "Macro-Recall",
        fullName: "Macro-Recall",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 3,
        description: "Arithmetic mean of per-class recall values",
        formula: "\\frac{1}{N} \\sum_{i} \\text{Recall}_i",
        calc: (m: number[][]) => {
            return macroaverage(m, confusionmatrixmetrics.recall.calc);
        },
    },
    micro_precision: {
        id: "micro_precision",
        displayName: "Micro-Precision",
        fullName: "Micro-Precision",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 3,
        description: "Precision calculated globally by counting total true positives and false positives",
        formula: "\\frac{\\sum_i \\text{TP}_i}{\\sum_i \\text{TP}_i + \\sum_i \\text{FP}_i}",
        calc: (m: number[][]) => {
            return microaverage(m, confusionmatrixmetrics.precision.calc);
        },
    },
    macro_precision: {
        id: "macro_precision",
        displayName: "Macro-Precision",
        fullName: "Macro-Precision",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 3,
        description: "Arithmetic mean of per-class precision values",
        formula: "\\frac{1}{N} \\sum_{i} \\text{Precision}_i",
        calc: (m: number[][]) => {
            return macroaverage(m, confusionmatrixmetrics.precision.calc);
        },
    },
    micro_f1score: {
        id: "micro_f1score",
        displayName: "Micro-F1",
        fullName: "Micro-F1Score",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 3,
        description: "F1 calculated globally by counting total true positives, false positives, and false negatives",
        formula: "\\frac{2 \\cdot \\sum_i \\text{TP}_i}{2 \\cdot \\sum_i \\text{TP}_i + \\sum_i \\text{FP}_i + \\sum_i \\text{FN}_i}",
        calc: (m: number[][]) => {
            return microaverage(m, confusionmatrixmetrics.f1_score.calc);
        },
    },
    macro_f1score: {
        id: "macro_f1score",
        displayName: "Macro-F1",
        fullName: "Macro-F1Score",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 2,
        description: "Arithmetic mean of per-class F1 scores",
        formula: "\\frac{1}{N} \\sum_{i} \\text{F1}_i",
        calc: (m: number[][]) => {
            return macroaverage(m, confusionmatrixmetrics.f1_score.calc);
        },
    },
    diagnostic_odds_ratio: {
        id: "diagnostic_odds_ratio",
        displayName: "DOR",
        fullName: "Diagnostic odds ratio",
        bounds: [0, Number.POSITIVE_INFINITY],
        preferredBounds: [0, 5],
        level: 3,
        description: "Ratio of odds of positive test result in diseased vs non-diseased subjects",
        formula: "\\frac{\\text{TP} \\cdot \\text{TN}}{\\text{FP} \\cdot \\text{FN}}",
        calc: (m: number[][]) => {
            return (tp(m) * tn(m)) / (fp(m) * fn(m));
        },
    },
    positive_likelihood_ratio: {
        id: "positive_likelihood_ratio",
        displayName: "PLR",
        fullName: "Positive likelihood ratio",
        bounds: [0, Number.POSITIVE_INFINITY],
        preferredBounds: [0, 5],
        level: 3,
        description: "Likelihood of a positive test result if the subject has the condition",
        formula: "\\frac{\\text{TPR}}{\\text{FPR}} = \\frac{\\text{TP}(\\text{FP}+\\text{TN})}{\\text{FP}(\\text{TP}+\\text{FN})}",
        calc: (m: number[][]) => {
            return confusionmatrixmetrics.tpr.calc(m) / confusionmatrixmetrics.fpr.calc(m);
        },
    },
    negative_likelihood_ratio: {
        id: "negative_likelihood_ratio",
        displayName: "NLR",
        fullName: "Negative likelihood ratio",
        bounds: [0, Number.POSITIVE_INFINITY],
        preferredBounds: [0, 5],
        level: 3,
        description: "Likelihood of a negative test result if the subject has the condition",
        formula: "\\frac{\\text{FNR}}{\\text{TNR}} = \\frac{\\text{FN}(\\text{TN}+\\text{FP})}{\\text{TN}(\\text{FN}+\\text{TP})}",
        calc: (m: number[][]) => {
            return confusionmatrixmetrics.fnr.calc(m) / confusionmatrixmetrics.tnr.calc(m);
        },
    },
};

// Correlation metrics for Metric vs Metric page - computed from plot data arrays
export interface CorrelationMetric {
    id: string;
    displayName: string;
    fullName?: string;
    bounds: [number, number];
    preferredBounds: [number, number];
    level: number; // 1 = basic, 2 = advanced, 3 = expert
    formula?: string;
    description?: string;
    calc: (xValues: number[], yValues: number[]) => number;
}

// Helper functions for correlation calculations
function mean(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr: number[]): number {
    const m = mean(arr);
    return arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length;
}

function standardDeviation(arr: number[]): number {
    return Math.sqrt(variance(arr));
}

function rank(arr: number[]): number[] {
    const sorted = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(arr.length);
    for (let i = 0; i < sorted.length; i++) {
        let j = i;
        while (j < sorted.length - 1 && sorted[j].v === sorted[j + 1].v) {
            j++;
        }
        const rank = (i + j + 2) / 2;
        for (let k = i; k <= j; k++) {
            ranks[sorted[k].i] = rank;
        }
        i = j;
    }
    return ranks;
}

function entropy(arr: number[]): number {
    const counts = new Map<number, number>();
    for (const v of arr) {
        counts.set(v, (counts.get(v) || 0) + 1);
    }
    let ent = 0;
    const n = arr.length;
    for (const c of counts.values()) {
        const p = c / n;
        ent -= p * Math.log2(p);
    }
    return ent;
}

function mutualInformation(xValues: number[], yValues: number[]): number {
    const n = xValues.length;
    const xyPairs = xValues.map((x, i) => `${x},${yValues[i]}`);
    
    const xCounts = new Map<number, number>();
    const yCounts = new Map<number, number>();
    const xyCounts = new Map<string, number>();
    
    for (let i = 0; i < n; i++) {
        xCounts.set(xValues[i], (xCounts.get(xValues[i]) || 0) + 1);
        yCounts.set(yValues[i], (yCounts.get(yValues[i]) || 0) + 1);
        xyCounts.set(xyPairs[i], (xyCounts.get(xyPairs[i]) || 0) + 1);
    }
    
    let mi = 0;
    for (const [xy, count] of xyCounts) {
        const [x, y] = xy.split(',').map(Number);
        const pxy = count / n;
        const px = xCounts.get(x)! / n;
        const py = yCounts.get(y)! / n;
        mi += pxy * Math.log2(pxy / (px * py));
    }
    return mi;
}

export const correlationmetrics: Record<string, CorrelationMetric> = {
    pearson: {
        id: "pearson",
        displayName: "Pearson (r)",
        fullName: "Pearson Correlation Coefficient",
        bounds: [-1, 1],
        preferredBounds: [-1, 1],
        level: 1,
        description: "Measures linear relationship between two metrics",
        formula: "\\frac{\\sum(\\text{x}_i - \\bar{\\text{x}})(\\text{y}_i - \\bar{\\text{y}})}{\\sqrt{\\sum(\\text{x}_i - \\bar{\\text{x}})^2 \\sum(\\text{y}_i - \\bar{\\text{y}})^2}}",
        calc: (xValues: number[], yValues: number[]) => {
            const n = xValues.length;
            if (n === 0) return 0;
            
            const mx = mean(xValues);
            const my = mean(yValues);
            const sx = standardDeviation(xValues);
            const sy = standardDeviation(yValues);
            
            if (sx === 0 || sy === 0) return 0;
            
            let sum = 0;
            for (let i = 0; i < n; i++) {
                sum += (xValues[i] - mx) * (yValues[i] - my);
            }
            return sum / (n * sx * sy);
        },
    },
    spearman: {
        id: "spearman",
        displayName: "Spearman (ρ)",
        fullName: "Spearman Rank Correlation",
        bounds: [-1, 1],
        preferredBounds: [-1, 1],
        level: 2,
        description: "Measures monotonic relationship between two metrics",
        formula: "1 - \\frac{6 \\sum \\text{d}_i^2}{\\text{n}(\\text{n}^2 - 1)}",
        calc: (xValues: number[], yValues: number[]) => {
            const n = xValues.length;
            if (n === 0) return 0;
            
            const xRanks = rank(xValues);
            const yRanks = rank(yValues);
            
            // Calculate Pearson on ranks
            const mx = mean(xRanks);
            const my = mean(yRanks);
            let sumNum = 0, sumDenX = 0, sumDenY = 0;
            for (let i = 0; i < n; i++) {
                sumNum += (xRanks[i] - mx) * (yRanks[i] - my);
                sumDenX += Math.pow(xRanks[i] - mx, 2);
                sumDenY += Math.pow(yRanks[i] - my, 2);
            }
            
            const denom = Math.sqrt(sumDenX * sumDenY);
            if (denom === 0) return 0;
            return sumNum / denom;
        },
    },
    predictability: {
        id: "predictability",
        displayName: "Predictability",
        fullName: "Predictability",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 2,
        description: "Normalized mutual information between X and Y metrics",
        formula: "\\frac{2 \\cdot \\text{MI}(X,Y)}{H(X) + H(Y)}",
        calc: (xValues: number[], yValues: number[]) => {
            const n = xValues.length;
            if (n === 0) return 0;
            
            const hX = entropy(xValues);
            const hY = entropy(yValues);
            const mi = mutualInformation(xValues, yValues);
            
            if (hX + hY === 0) return 0;
            return (2 * mi) / (hX + hY);
        },
    },
    density_overlap: {
        id: "density_overlap",
        displayName: "Density Overlap",
        fullName: "Density Overlap",
        bounds: [0, 1],
        preferredBounds: [0, 1],
        level: 3,
        description: "Approximated overlap between KDE distributions of X and Y values",
        calc: (xValues: number[], yValues: number[]) => {
            const n = xValues.length;
            if (n === 0) return 0;
            
            // Simple histogram-based overlap estimation
            const allValues = [...xValues, ...yValues];
            const min = Math.min(...allValues);
            const max = Math.max(...allValues);
            const bins = 20;
            const binWidth = (max - min) / bins;
            
            if (binWidth === 0) return 1;
            
            const xHist = new Array(bins).fill(0);
            const yHist = new Array(bins).fill(0);
            
            for (const v of xValues) {
                const bin = Math.min(Math.floor((v - min) / binWidth), bins - 1);
                xHist[bin]++;
            }
            for (const v of yValues) {
                const bin = Math.min(Math.floor((v - min) / binWidth), bins - 1);
                yHist[bin]++;
            }
            
            // Normalize
            for (let i = 0; i < bins; i++) {
                xHist[i] /= n;
                yHist[i] /= n;
            }
            
            // Calculate overlap
            let overlap = 0;
            for (let i = 0; i < bins; i++) {
                overlap += Math.min(xHist[i], yHist[i]);
            }
            
            return overlap;
        },
    },
    kurtosis_x: {
        id: "kurtosis_x",
        displayName: "Kurtosis X",
        fullName: "Kurtosis (X-axis metric)",
        bounds: [0, 10],
        preferredBounds: [0, 10],
        level: 3,
        description: "Tailedness of the X metric distribution",
        formula: "\\frac{E[(X - \\mu)^4]}{E[(X - \\mu)^2]^2}",
        calc: (xValues: number[], yValues: number[]) => {
            void yValues;
            const n = xValues.length;
            if (n < 4) return 0;
            const m = mean(xValues);
            const s = standardDeviation(xValues);
            if (s === 0) return 0;
            const fourthMoment = xValues.reduce((sum, val) => sum + Math.pow(val - m, 4), 0) / n;
            const secondMoment = xValues.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / n;
            return fourthMoment / (secondMoment * secondMoment);
        },
    },
    kurtosis_y: {
        id: "kurtosis_y",
        displayName: "Kurtosis Y",
        fullName: "Kurtosis (Y-axis metric)",
        bounds: [0, 10],
        preferredBounds: [0, 10],
        level: 3,
        description: "Tailedness of the Y metric distribution",
        formula: "\\frac{E[(Y - \\mu)^4]}{E[(Y - \\mu)^2]^2}",
        calc: (_xValues: number[], yValues: number[]) => {
            const n = yValues.length;
            if (n < 4) return 0;
            const m = mean(yValues);
            const s = standardDeviation(yValues);
            if (s === 0) return 0;
            const fourthMoment = yValues.reduce((sum, val) => sum + Math.pow(val - m, 4), 0) / n;
            const secondMoment = yValues.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / n;
            return fourthMoment / (secondMoment * secondMoment);
        },
    },
};
