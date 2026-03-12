<script lang="ts">
    import DidYouKnowF1 from "../didyouknows/DidYouKnowF1.svelte";
    import DidYouKnowKappaNegative from "../didyouknows/DidYouKnowKappaNegative.svelte";
    import DidYouKnowKappaAccuracyF1 from "../didyouknows/DidYouKnowKappaAccuracyF1.svelte";
    import DidYouKnowMicroF1Accuracy from "../didyouknows/DidYouKnowMicroF1Accuracy.svelte";
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
    <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Did You Know?
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
            Interactive and interesting facts about ML evaluation metrics.
        </p>
    </div>
    
    <div class="flex flex-col gap-4">
        <DidYouKnowF1 />
        <DidYouKnowKappaNegative />
        <DidYouKnowKappaAccuracyF1 />
        <DidYouKnowMicroF1Accuracy />
    </div>
</div>