<script lang="ts">
    import colormaps from "../utils/colormaps";
    import { confusionmatrixmetrics } from "../utils/metrics";
    import type { Metric } from "../utils/metrics";
    import { settings } from "../utils/settings.svelte";
    import { invlerp } from "../utils/utils";
    import ScatterPlot from "./Scatterplot.svelte";
    import ConfusionMatrix from "./ConfusionMatrix.svelte";
    import ConfusionMatrixMetricTable from "./ConfusionMatrixMetricTable.svelte";
    import type { Colormap } from "../utils/colormaps";


    interface Props {
        showKde?: boolean;
        positives?: number;
        negatives?: number;
        metricX?: Metric;
        metricY?: Metric;
        metricC?: Metric;
        colormap?: Colormap;
        resolution?: number;
        selectedIndex?: number | null;
        selectedMatrix?: number[][] | null;
        xValues?: number[];
        yValues?: number[];
        size?: string;
    }

    let {
        showKde = true,
        positives = 100,
        negatives = 100,
        metricX = confusionmatrixmetrics.accuracy,
        metricY = confusionmatrixmetrics.f1_score,
        metricC = confusionmatrixmetrics.balanced_accuracy,
        colormap = colormaps.YlGn,
        resolution = 20,
        selectedIndex = $bindable(null),
        selectedMatrix = $bindable(null),
        // eslint-disable-next-line no-useless-assignment
        xValues = $bindable([]),
        // eslint-disable-next-line no-useless-assignment
        yValues = $bindable([]),
        size = "25rem"
    }: Props = $props();

    let mousePosition = $state({ x: 0, y: 0 });
    let floatingWindow: HTMLDivElement | undefined = $state();
    let floatingWindowPos = $state({ left: 0, top: 0 });

    function updateFloatingPosition() {
        if (!floatingWindow || !selectedMatrix) return;
        const rect = floatingWindow.getBoundingClientRect();
        const padding = 8;
        const offset = 30;

        const spaceRight = window.innerWidth - mousePosition.x;
        const spaceLeft = mousePosition.x;
        const spaceBottom = window.innerHeight - mousePosition.y;
        const spaceTop = mousePosition.y;

        let left: number;
        if (spaceRight >= rect.width + offset) {
            left = mousePosition.x + offset;
        } else if (spaceLeft >= rect.width + offset) {
            left = mousePosition.x - rect.width - offset;
        } else {
            left = Math.max(padding, Math.min(mousePosition.x, window.innerWidth - rect.width - padding));
        }

        let top: number;
        if (spaceBottom >= rect.height + offset) {
            top = mousePosition.y + offset;
        } else if (spaceTop >= rect.height + offset) {
            top = mousePosition.y - rect.height - offset;
        } else {
            top = Math.max(padding, Math.min(mousePosition.y, window.innerHeight - rect.height - padding));
        }

        floatingWindowPos = { left, top };
    }

    let data = $derived.by(() => {
        const points = [];
        const matrices = [];
        for (var p = 0; p < resolution; p++) {
            for (var n = 0; n < resolution; n++) {
                const tps = Math.round((positives * p) / (resolution - 1));
                const tns = Math.round((negatives * n) / (resolution - 1));
                const matrix = [
                    [tps, positives - tps],
                    [negatives - tns, tns],
                ];
                let x = metricX.calc(matrix);
                let y = metricY.calc(matrix);
                let c = metricC.calc(matrix);
                if (isFinite(x) && isFinite(y) && isFinite(c)) {
                    points.push({
                        x: x,
                        y: y,
                        c: colormap.calc(invlerp(...metricC.preferredBounds, c)),
                        valid: 1.0,
                    });
                } else {
                    points.push({
                        x: 0.5,
                        y: 0.5,
                        c: "rgba(0,0,0,0)",
                        valid: 0.0,
                    });
                }
                matrices.push(matrix);
            }
        }

        // Generate triangle indices for the grid
        const triangles = [];
        for (let p = 0; p < resolution - 1; p++) {
            for (let n = 0; n < resolution - 1; n++) {
                // Four corners of the current grid cell
                const idx = p * resolution + n;  // top-left
                const idx2 = p * resolution + (n + 1);  // top-right
                const idx3 = (p + 1) * resolution + n;  // bottom-left
                const idx4 = (p + 1) * resolution + (n + 1);  // bottom-right
                
                // First triangle: top-left -> top-right -> bottom-left
                triangles.push([idx, idx2, idx3]);
                // Second triangle: bottom-left -> top-right -> bottom-right
                triangles.push([idx3, idx2, idx4]);
            }
        }

        return {
            points: points,
            matrices: matrices,
            triangles: triangles
        }
    });

    $effect(() => {
        const xVals = data.points.map(d => d.x);
        const yVals = data.points.map(d => d.y);
        
        // Expose raw values for use in MetricVsMetricMetricTable
        xValues = xVals;
        yValues = yVals;
    })
    
    $effect(() => {
        if (selectedIndex !== null && selectedIndex !== undefined) {
            selectedMatrix = data.matrices[selectedIndex];
        } else {
            selectedMatrix = null;
        }
    });
</script>


<div role="presentation" onmousemove={(e: MouseEvent) => { mousePosition = { x: e.clientX, y: e.clientY }; updateFloatingPosition(); }}>
    <ScatterPlot
        {data}
        {showKde}
        {size}
        bind:selectedIndex={selectedIndex}
        viewport={{left: metricX.preferredBounds[0], right: metricX.preferredBounds[1],
            top: metricY.preferredBounds[0], bottom: metricY.preferredBounds[1]}}
        xAxisTitle={metricX.displayName}
        yAxisTitle={metricY.displayName}
    />
</div>

<!-- Floating Window for Selected Matrix -->
{#if selectedMatrix}
    <div
        bind:this={floatingWindow}
        class="fixed panel p-4 z-50 w-max shadow-2xl!"
        style="left: {floatingWindowPos.left}px; top: {floatingWindowPos.top}px;"
    >
        <div class="flex flex-row items-center gap-3">
            <ConfusionMatrix matrix={selectedMatrix} />
            <div class="w-full overflow-x-auto">
                <ConfusionMatrixMetricTable matrix={selectedMatrix} floatingPrecision={settings.floatingPrecision} showMetricsAsPercentage={settings.showMetricsAsPercentage} showBar={false} compact={true} />
            </div>
        </div>
    </div>
{/if}