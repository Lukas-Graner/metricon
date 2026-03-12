<script lang="ts">
    import DidYouKnowCard from "./DidYouKnowCard.svelte";
    import MetricVsMetricPlot from "../components/MetricVsMetricPlot.svelte";
    import Tex from "../components/Tex.svelte";
    import DataTable from "../components/DataTable.svelte";
    import { confusionmatrixmetrics, correlationmetrics } from "../utils/metrics";
    import { formatMetricValue } from "../utils/utils";
    import InteractivePanel from "../components/InteractivePanel.svelte";

    export const title = "Kappa vs Accuracy vs F1";
    let positives = 1000;
    let logNegatives = $state(Math.log10(1000));
    let negatives = $derived(Math.floor(Math.pow(10, logNegatives)));
    
    let xValuesAccuracy: number[] = $state([]);
    let yValuesAccuracy: number[] = $state([]);
    let xValuesF1: number[] = $state([]);
    let yValuesF1: number[] = $state([]);
    let pccAccuracy = $derived(correlationmetrics.pearson.calc(xValuesAccuracy, yValuesAccuracy));
    let pccF1 = $derived(correlationmetrics.pearson.calc(xValuesF1, yValuesF1));
</script>

<DidYouKnowCard
    title="Accuracy can correlate with Cohen's Kappa and F1"
    icon="📊"
>
    <div class="flex flex-col">
        <div class="items-center">
            <div class="leading-relaxed text-gray-600 dark:text-gray-300 text-justify">
                Did you know that for a balanced dataset, Cohen's Kappa has a linear relationship with Accuracy: <Tex math={"\\text{Kappa} = 2 \\times \\text{Accuracy} - 1"}/>. In this case, there is no benefit in using one over the other. However, when the negative class is the clear majority, Kappa approaches a linear relationship with the F1-Score.
                <br/>
                <div class="flex justify-center my-4">
                    <InteractivePanel variant="compact">
                        <div class="flex items-center gap-1">
                            <span class="tabular-nums text-xs font-medium inline-block min-w-8 text-right">{formatMetricValue(negatives/(positives+negatives), true, 3)}</span>
                            <span class="text-xs font-medium text-rose-600 dark:text-rose-400">Negatives</span>
                            <input type="range" min={Math.log10(1000)} max={Math.log10(1000000)} step={0.01} bind:value={logNegatives} class="mx-3 w-32 h-1 bg-gray-200 dark:bg-slate-700 rounded appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"/>
                            <span class="tabular-nums text-xs font-medium inline-block min-w-8 text-right">{formatMetricValue(positives/(positives+negatives), true, 3)}</span>
                            <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Positives</span>
                        </div>
                    </InteractivePanel>
                </div>
            </div>
        </div>
        <div class="flex flex-row flex-wrap justify-center gap-4">
            <div class="flex flex-col items-center">
                <MetricVsMetricPlot
                    showKde={false}
                    positives={positives}
                    negatives={negatives}
                    metricX={confusionmatrixmetrics.accuracy}
                    metricY={confusionmatrixmetrics.kappa}
                    size="18rem"
                    bind:xValues={xValuesAccuracy}
                    bind:yValues={yValuesAccuracy} />
                <div class="panel rounded-lg overflow-hidden w-full flex justify-center max-w-xs">
                    <DataTable
                        metrics={[{
                            id: "pearson-accuracy",
                            displayName: "Pearson (r)",
                            bounds: [-1, 1],
                            value: pccAccuracy,
                        }]}
                    />
                </div>
            </div>
            <div class="flex flex-col items-center">
                <MetricVsMetricPlot
                    showKde={false}
                    positives={positives}
                    negatives={negatives}
                    metricX={confusionmatrixmetrics.f1_score}
                    metricY={confusionmatrixmetrics.kappa}
                    size="18rem"
                    bind:xValues={xValuesF1}
                    bind:yValues={yValuesF1} />
                <div class="panel rounded-lg overflow-hidden w-full flex justify-center max-w-xs">
                    <DataTable
                        metrics={[{
                            id: "pearson-f1",
                            displayName: "Pearson (r)",
                            bounds: [-1, 1],
                            value: pccF1,
                        }]}
                    />
                </div>
            </div>
        </div>
    </div>
</DidYouKnowCard>
