<script>
    import DidYouKnowCard from "./DidYouKnowCard.svelte";
    import ConfusionMatrix from "../components/ConfusionMatrix.svelte";
    import Tex from "../components/Tex.svelte";
    import DataTable from "../components/DataTable.svelte";
    import InteractivePanel from "../components/InteractivePanel.svelte";
    import { confusionmatrixmetrics } from "../utils/metrics";
    import { formatMetricValue } from "../utils/utils";

    export const title = "F1-Score Limitations";
    let classRatio = $state(0.5);
    const numInstances = 100;
    
    // Dummy classifier that always predicts positive
    let positivePredictorMatrix = $derived.by(() => {
        let numPositives = Math.round(numInstances*classRatio);
        let numNegatives = numInstances - numPositives;
        return [[numPositives, 0], [numNegatives, 0]];
    });
    
    let positivePredictorF1 = $derived(confusionmatrixmetrics.f1_score.calc(positivePredictorMatrix));
    
    // Random predictor that predicts 50% positive/negative for each class (always sums to 100)
    let randomPredictorMatrix = $derived.by(() => {
        let numPositives = Math.round(numInstances*classRatio / 2) * 2; // Round to multiple of 2 so tp/fn are always equal
        let numNegatives = numInstances - numPositives;
        let tp = numPositives / 2;
        let fp = numPositives / 2;
        let fn = numNegatives / 2;
        let tn = numNegatives / 2;
        return [[tp, fp], [fn, tn]];
    });
    
    let randomPredictorF1 = $derived(confusionmatrixmetrics.f1_score.calc(randomPredictorMatrix));
</script>

<DidYouKnowCard
    title="A major F1 Score limitation"
    icon="⚖️"
>
    <p class="leading-relaxed text-gray-600 dark:text-gray-300 mb-4 text-justify">
        The F1-Score is not a suitable evaluation metric on datasets with a high of positive-to-negative ratio. Consider how naive classifiers performs: For any <button
            onclick={() => classRatio = 0.5}
            class="px-2 rounded-lg bg-accent/10 hover:bg-accent/20 dark:bg-accent/20 dark:hover:bg-accent/30 text-accent"
            title="Randomize matrix"
        >balanced</button> dataset, a classifier
        that always predicts the positive class already achieves an F1-Score of <Tex math={"\\frac{2}{3}=0.\\overline{6}"}/>, while a random predictor achieves a score of <Tex math="0.5"/>.
        Try a different class ratios:
    </p>
    <div class="flex justify-center mb-6">
        <InteractivePanel variant="compact">
            <div class="flex items-center gap-1">
                <span class="tabular-nums text-xs font-medium inline-block min-w-8 text-right">{formatMetricValue(1 - classRatio, true, 2)}</span>
                <span class="text-xs font-medium text-rose-600 dark:text-rose-400">Negatives</span>
                <input type="range" min={0} max={1} step={0.01} bind:value={classRatio} class="mx-3 w-32 h-1 bg-gray-200 dark:bg-slate-700 rounded appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"/>
                <span class="tabular-nums text-xs font-medium inline-block min-w-8 text-right">{formatMetricValue(classRatio, true, 2)}</span>
                <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Positives</span>
            </div>
        </InteractivePanel>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-0 divide-x-0 divide-y divide-gray-200 dark:divide-gray-700 md:divide-x md:divide-y-0">
        <div class="py-4 md:py-0 px-4">
            <div class="flex flex-col items-center">
                <div class="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">Positive-Only Predictor</div>
                <div class="flex flex-col items-center gap-4">
                    <ConfusionMatrix matrix={positivePredictorMatrix}/>
                    <div class="panel rounded-lg overflow-hidden w-full">
                        <DataTable
                            metrics={[{
                                id: "f1-positive-predictor",
                                displayName: "F1-Score",
                                bounds: [0, 1],
                                value: positivePredictorF1,
                            }]}
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="py-4 md:py-0 px-4">
            <div class="flex flex-col items-center">
                <div class="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">Random Predictor</div>
                <div class="flex flex-col items-center gap-4">
                    <ConfusionMatrix matrix={randomPredictorMatrix}/>
                    <div class="panel rounded-lg overflow-hidden w-full">
                        <DataTable
                            metrics={[{
                                id: "f1-random-predictor",
                                displayName: "F1-Score",
                                bounds: [0, 1],
                                value: randomPredictorF1,
                            }]}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</DidYouKnowCard>
