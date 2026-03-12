<script lang="ts">
    import { onMount } from "svelte";
    import { SvelteURLSearchParams } from "svelte/reactivity";
    import { router } from "../router.svelte";


	import ConfusionMatrix from "../components/ConfusionMatrix.svelte";
    import DraggableInput from "../components/DraggableInput.svelte";
    import InteractivePanel from "../components/InteractivePanel.svelte";
    import FlashSpan from "../components/FlashSpan.svelte";
    import { confusionmatrixmetrics } from "../utils/metrics";
    import { addMatrices, mean, multiToBinaryMatrix, formatMetricValue } from "../utils/utils";
    import { settings } from "../utils/settings.svelte";
    function parseMatrixFromUrl(): number[][] {
        const params = new SvelteURLSearchParams(window.location.search);
        const classCount = parseInt(params.get("cc") || "3", 10);
        const mParam = params.get("m");
        
        if (mParam) {
            try {
                const values = mParam.split(",").map(v => parseInt(v, 10));
                if (values.length === classCount * classCount && values.every(v => !isNaN(v))) {
                    const result: number[][] = [];
                    for (let i = 0; i < classCount; i++) {
                        result.push(values.slice(i * classCount, (i + 1) * classCount));
                    }
                    return result;
                }
            } catch (e) {
                console.error("Failed to parse matrix from URL:", e);
            }
        }
        
        return Array.from({length: classCount}, (_, i) => Array.from({length: classCount}, (_, j) => i==j ? 10 : 0));
    }

    function updateUrl(matrix: number[][], metricId: string, classCount: number) {
        const params = new SvelteURLSearchParams();
        params.set("cc", classCount.toString());
        params.set("mt", metricId);
        const flat = matrix.flat();
        params.set("m", flat.join(","));
        const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
        window.history.replaceState({}, "", newUrl);
    }

    function parseQueryParams() {
        const params = new SvelteURLSearchParams(window.location.search);
        return {
            classCount: parseInt(params.get("cc") || "3", 10),
            metric: confusionmatrixmetrics[params.get("mt") || "f1_score"] || confusionmatrixmetrics.f1_score,
            matrix: parseMatrixFromUrl(),
        };
    }

    let classCount = $state(3);
    let metric = $state(confusionmatrixmetrics.f1_score);
    let matrix = $state(parseMatrixFromUrl());
    let classNames = $state(["C1", "C2", "C3"]);
    
    $effect(() => {
        const currentSize = matrix.length;
        if (currentSize !== classCount) {
            const newMatrix: number[][] = Array.from({ length: classCount }, (_, i) =>
                Array.from({ length: classCount }, (_, j) => {
                    // Preserve existing values if within bounds
                    if (i < currentSize && j < currentSize) {
                        return matrix[i][j];
                    }
                    // Default: diagonal=10, off-diagonal=0 for new cells
                    return i === j ? 10 : 0;
                })
            );
            matrix = newMatrix;
        }
        classNames = Array.from({ length: classCount }, (_, i) =>  "C"+(i+1));
    });
    
    
    let binaryMatrices = $derived(Array.from({length: classCount}, (_, i) => multiToBinaryMatrix(matrix, i)));
    let microSumMatrix = $derived(addMatrices(...binaryMatrices));

    onMount(() => {
        const initial = parseQueryParams();
        classCount = initial.classCount;
        metric = initial.metric;
        matrix = initial.matrix;

        const handler = () => {
            const parsed = parseQueryParams();
            classCount = parsed.classCount;
            metric = parsed.metric;
            matrix = parsed.matrix;
        };
        window.addEventListener("popstate", handler);
        return () => window.removeEventListener("popstate", handler);
    });

    $effect(() => {
        if (router.currentRoute === 'micro-vs-macro') {
            updateUrl(matrix, metric.id, classCount);
        }
    });
</script>

<!-- Main Grid Layout -->
<div class="grid grid-cols-[auto_auto_1fr] xl:grid-cols-[auto_auto_1fr] gap-6 p-4">
    <!-- Column 1: Interactive Matrix -->
    <InteractivePanel variant="full" title="Interactive Matrix">
        <ConfusionMatrix bind:matrix={matrix} mutable={true} bind:classNames={classNames} />
    </InteractivePanel>

    <!-- Column 2: Step 1 - Binary Matrices Stacked -->
    <div class="panel rounded-lg overflow-hidden flex flex-col">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold">Step 1</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
                Build binary confusion matrix for each class.
            </p>
        </div>
        <div class="p-4 flex-1 flex flex-col gap-4 justify-center">
            {#each Array(classCount) as i (i)}
                <div class="data-card inline-block">
                    <ConfusionMatrix matrix={binaryMatrices[i]} classNames={[classNames[i], "¬" + classNames[i]]} />
                </div>
            {/each}
        </div>
    </div>

    <!-- Column 3: Macro and Micro Stacked -->
    <div class="flex flex-col gap-3">
        <!-- Micro Section -->
        <div class="panel rounded-lg overflow-hidden">
            <div class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-base font-semibold text-emerald-600 dark:text-emerald-400">Micro</h2>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                    Sum all matrices elementwise:
                </p>
            </div>
            <div class="px-3 py-2">
                <div class="flex items-center justify-center">
                    <ConfusionMatrix matrix={microSumMatrix} classNames={["", ""]} />
                </div>
                <div class="mt-2 text-center">
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                        micro-{metric.displayName}:
                    </p>
                    <div class="data-card inline-block font-mono text-sm mt-1">
                        <FlashSpan text={formatMetricValue(metric.calc(microSumMatrix), settings.showMetricsAsPercentage, settings.floatingPrecision)} />
                    </div>
                </div>
            </div>
        </div>

        <!-- Macro Section -->
        <div class="panel rounded-lg overflow-hidden">
            <div class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-base font-semibold text-rose-600 dark:text-rose-400">Macro</h2>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                    {metric.displayName} of binary matrices:
                </p>
            </div>
            <div class="px-3 py-2">
                <table class="w-full text-xs">
                    <thead>
                        <tr class="text-gray-500">
                            <th class="pb-1">Class</th>
                            <th class="pb-1 text-right">{metric.displayName}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each Array(classCount) as i (i)}
                            <tr class="border-t border-gray-200 dark:border-gray-700">
                                <td class="py-1 text-gray-700 dark:text-gray-300">{i+1}</td>
                                <td class="py-1 text-right font-mono text-gray-900 dark:text-gray-100">
                                    <FlashSpan text={formatMetricValue(metric.calc(binaryMatrices[i]), settings.showMetricsAsPercentage, settings.floatingPrecision)} />
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                <div class="mt-2 text-center">
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                        macro-{metric.displayName} (avg):
                    </p>
                    <div class="data-card inline-block font-mono text-sm mt-1">
                        <FlashSpan text={formatMetricValue(mean(binaryMatrices.map(metric.calc)), settings.showMetricsAsPercentage, settings.floatingPrecision)} />
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Controls Panel (at bottom, like MetricVsMetricPage) -->
<div class="flex justify-center mb-6">
    <InteractivePanel variant="full" title="Visualization Controls">
            <div class="flex flex-wrap gap-6">
                <!-- Number of Classes Section -->
                <div class="space-y-3 flex-1">
                    <h4 class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Number of Classes
                    </h4>
                    <div class="grid grid-cols-[auto_1fr] gap-2 items-center">
                        <label for="class-count-input" class="text-xs font-medium text-indigo-600 dark:text-indigo-400">Classes</label>
                        <DraggableInput id="class-count-input" classs="sharp-input" bind:value={classCount} min={2} max={5} />
                    </div>
                </div>

                <!-- Measure Selection Section -->
                <div class="space-y-3 flex-1">
                    <h4 class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Measure Selection
                    </h4>
                    <div class="grid grid-cols-[auto_1fr] gap-2 items-center">
                        <label for="metric-select" class="text-xs font-medium text-slate-600 dark:text-slate-400">Metric</label>
                        <select id="metric-select" bind:value={metric} class="sharp-input text-xs">
                            {#each Object.values(confusionmatrixmetrics) as m (m.id)}
                                <option value={m}>{m.displayName}</option>
                            {/each}
                        </select>
                    </div>
                </div>
            </div>
    </InteractivePanel>
</div>
