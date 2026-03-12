<script lang="ts">
    import { onMount } from "svelte";
    import { SvelteURLSearchParams } from "svelte/reactivity";
    import DraggableInput from "../components/DraggableInput.svelte";
    import InteractivePanel from "../components/InteractivePanel.svelte";
    import InteractiveIcon from "../components/InteractiveIcon.svelte";
    import colormaps from "../utils/colormaps";
    import { confusionmatrixmetrics } from "../utils/metrics";
    import MetricVsMetricPlot from "../components/MetricVsMetricPlot.svelte";
    import MetricVsMetricMetricTable from "../components/MetricVsMetricMetricTable.svelte";
    import { router } from "../router.svelte";
    import ColormapPicker from "../components/ColormapPicker.svelte";
    import { settings } from "../utils/settings.svelte";

    function parseQueryParams() {
        const params = new SvelteURLSearchParams(window.location.search);
        
        return {
            positives: parseInt(params.get("pos") || "100", 10),
            negatives: parseInt(params.get("neg") || "100", 10),
            metricX: confusionmatrixmetrics[params.get("mx") || "accuracy"] || confusionmatrixmetrics.accuracy,
            metricY: confusionmatrixmetrics[params.get("my") || "f1_score"] || confusionmatrixmetrics.f1_score,
            metricC: confusionmatrixmetrics[params.get("mc") || "balanced_accuracy"] || confusionmatrixmetrics.balanced_accuracy,
            colormap: Object.values(colormaps).find(c => c.id === params.get("cm")) || colormaps.RdBu,
        };
    }

    const initialParams = parseQueryParams();

    function updateQueryParams() {
        const params = new SvelteURLSearchParams();
        params.set("pos", positives.toString());
        params.set("neg", negatives.toString());
        params.set("mx", metricXId);
        params.set("my", metricYId);
        params.set("mc", metricCId);
        params.set("cm", colormap.id);
        const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
        window.history.replaceState({}, "", newUrl);
    }

    let positives = $state(initialParams.positives);
    let negatives = $state(initialParams.negatives);
    // Store metric IDs as primitives for performant select binding
    let metricXId = $state(initialParams.metricX.id);
    let metricYId = $state(initialParams.metricY.id);
    let metricCId = $state(initialParams.metricC.id);
    let colormap = $state(initialParams.colormap);
    let resolution = $state(20);
    
    // Derive the actual Metric objects from their IDs for downstream components
    let metricX = $derived.by(() => confusionmatrixmetrics[metricXId] || confusionmatrixmetrics.accuracy);
    let metricY = $derived.by(() => confusionmatrixmetrics[metricYId] || confusionmatrixmetrics.f1_score);
    let metricC = $derived.by(() => confusionmatrixmetrics[metricCId] || confusionmatrixmetrics.balanced_accuracy);
    
    let selectedIndex = $state(null);
    let selectedMatrix = $state(null);
    let xValues = $state<number[]>([]);
    let yValues = $state<number[]>([]);

    onMount(() => {
        const handler = () => {
            const parsed = parseQueryParams();
            positives = parsed.positives;
            negatives = parsed.negatives;
            metricXId = parsed.metricX.id;
            metricYId = parsed.metricY.id;
            metricCId = parsed.metricC.id;
            colormap = parsed.colormap;
        };
        window.addEventListener("popstate", handler);
        return () => window.removeEventListener("popstate", handler);
    });

    $effect(() => {
        if (router.currentRoute === 'metric-vs-metric') {
            updateQueryParams();
        }
    });

    // Pearson and other stats lay out now beside the plot
</script>

<div class="flex flex-wrap justify-center items-center gap-12 p-4 mt-4">
    <div class="shrink-0">
        <MetricVsMetricPlot
            {positives} {negatives} {metricX} {metricY} {metricC} {colormap} {resolution}
            bind:selectedIndex bind:selectedMatrix
            bind:xValues bind:yValues
        />
    </div>

    <!-- Statistics Table -->
    <div class="w-80 panel rounded-lg shrink-0">
        <MetricVsMetricMetricTable
            {xValues} {yValues}
            showBar={false}
            floatingPrecision={settings.floatingPrecision}
            showMetricsAsPercentage={settings.showMetricsAsPercentage}
        />
    </div>
</div>

<!-- Controls Panel -->
<div class="flex justify-center">
    <InteractivePanel variant="full" title="Visualization Controls">
        <div class="flex flex-wrap gap-6">
            <!-- Sample Size Section -->
            <div class="space-y-3 flex-1">
                <h4 class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Sample Size
                </h4>
                <div class="grid grid-cols-[auto_1fr] gap-2 items-center">
                    <label for="positives-input" class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Positives</label>
                    <DraggableInput id="positives-input" classs="sharp-input" bind:value={positives} min={20} />
                    <label for="negatives-input" class="text-xs font-medium text-rose-600 dark:text-rose-400">Negatives</label>
                    <DraggableInput id="negatives-input" classs="sharp-input" bind:value={negatives} min={20} />
                </div>
            </div>

            <!-- Axes Section -->
            <div class="space-y-3 flex-1">
                <h4 class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Axes Metrics
                </h4>
                <div class="grid grid-cols-[auto_1fr] gap-2 items-center">
                    <label for="metric-x-select" class="text-xs font-medium text-slate-600 dark:text-slate-400">X Axis</label>
                    <select id="metric-x-select" bind:value={metricXId} class="sharp-input text-xs">
                        {#each Object.values(confusionmatrixmetrics) as metric (metric.id)}
                            <option value={metric.id}>{metric.displayName}</option>
                        {/each}
                    </select>
                    <label for="metric-y-select" class="text-xs font-medium text-slate-600 dark:text-slate-400">Y Axis</label>
                    <select id="metric-y-select" bind:value={metricYId} class="sharp-input text-xs">
                        {#each Object.values(confusionmatrixmetrics) as metric (metric.id)}
                            <option value={metric.id}>{metric.displayName}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <!-- Color Section -->
            <div class="space-y-3 flex-1">
                <h4 class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Color Mapping
                </h4>
                <div class="grid grid-cols-[auto_1fr] gap-2 items-center">
                    <label for="metric-c-select" class="text-xs font-medium text-slate-600 dark:text-slate-400">C Axis</label>
                    <select id="metric-c-select" bind:value={metricCId} class="sharp-input text-xs">
                        {#each Object.values(confusionmatrixmetrics) as metric (metric.id)}
                            <option value={metric.id}>{metric.displayName}</option>
                        {/each}
                    </select>
                    <label for="colormap-picker" class="text-xs font-medium text-slate-600 dark:text-slate-400">Colormap</label>
                    <ColormapPicker id="colormap-picker" bind:colormap />
                </div>
            </div>
        </div>
    </InteractivePanel>
</div>

<div class="max-w-4xl mx-auto px-6 py-8">
    <h1>
        Metric vs. Metric Visualization
    </h1>
    <p class="leading-relaxed text-gray-600 dark:text-gray-300 mb-4">
        This visualization shows the relationship between two performance metrics across all possible confusion matrices with a fixed sample size.
        Each point represents a unique confusion matrix configuration, plotted by its X and Y metric values.
        The color represents a third metric, allowing you to explore how three metrics relate to each other.
    </p>
    <p class="leading-relaxed text-gray-600 dark:text-gray-300 mb-4">
        You can <InteractiveIcon size="1em" inline={true} /> edit the metrics for the axes and more.
        Hover over points to see the corresponding confusion matrix and all metric values.
        The statistics alongside give you more insight into how the two metrics are related, such as the Pearson correlation coefficient.
    </p>
</div>
