<script lang="ts">
	import ConfusionMatrix from "../components/ConfusionMatrix.svelte";
	import ConfusionMatrixMetricTable from "../components/ConfusionMatrixMetricTable.svelte";
	import InteractivePanel from "../components/InteractivePanel.svelte";
	import InteractiveIcon from "../components/InteractiveIcon.svelte";
	import { settings } from "../utils/settings.svelte";
	import { onMount } from "svelte";
	import { router } from "../router.svelte";

	function parseMatrixFromUrl() {
		const params = new URLSearchParams(window.location.search);
		const matrixParam = params.get("m");
		
		if (matrixParam) {
			try {
				const values = matrixParam.split(",").map((v) => parseInt(v, 10));
				if (values.length === 4 && values.every((v) => !isNaN(v))) {
					return [[values[0], values[1]], [values[2], values[3]]];
				}
			} catch (e) {
				console.error("Failed to parse matrix from URL:", e);
			}
		}
		return [[10, 0], [0, 10]];
	}

	function updateUrl(matrix: number[][]) {
		const param = `${matrix[0][0]},${matrix[0][1]},${matrix[1][0]},${matrix[1][1]}`;
		const newUrl = `${window.location.pathname}?m=${param}${window.location.hash}`;
		window.history.replaceState({}, "", newUrl);
	}

	let matrix = $state(parseMatrixFromUrl());

	onMount(() => {
		const handler = () => {
			matrix = parseMatrixFromUrl();
		};
		window.addEventListener("popstate", handler);
		return () => window.removeEventListener("popstate", handler);
	});

	$effect(() => {
		if (router.currentRoute === 'confusion-matrix') {
			updateUrl(matrix);
		}
	});
</script>

<!-- Flex container that naturally wraps when content doesn't fit -->
<div class="flex flex-wrap justify-center items-center gap-12 p-4 mt-4">
	<InteractivePanel variant="full" title="Confusion Matrix">
		<ConfusionMatrix bind:matrix={matrix} mutable={true}/>
	</InteractivePanel>
	
	<!-- Metrics Table with new standardized wrapper -->
	<div class="w-[450px] panel rounded-lg shrink-0">
		<div class="overflow-visible w-full">
			<!-- Note: We adjust ConfusionMatrixMetricTable to fill its container nicely -->
			<div class="w-full [&>table]:w-full [&>table_.text-sm]:text-xs">
				<ConfusionMatrixMetricTable matrix={matrix} floatingPrecision={settings.floatingPrecision} showMetricsAsPercentage={settings.showMetricsAsPercentage} />
			</div>
		</div>
	</div>
</div>

<div class="max-w-4xl mx-auto px-6 py-8">
	<h1>
		Interactive Confusion Matrix
	</h1>
	<p class="leading-relaxed text-gray-600 dark:text-gray-300 mb-4">
		A confusion matrix is a table used to evaluate the performance of a classification model.
		It compares the actual labels with the predicted labels for a set of data instances and shows how many predictions were correct or incorrect for each class.
		It is a very useful tool in many fields, such as machine learning, where it highlights strengths and weaknesses of classifiers for example.
		From a confusion matrix, many different single-valued performance metrics can be derived.
	</p>
	<p class="leading-relaxed text-gray-600 dark:text-gray-300 mb-4">
		You can enable more metrics to be shown in the settings.
		You can edit <InteractiveIcon size="1em" inline={true} /> the values in the matrix cells to simulate different prediction outcomes and the performance metrics will update in real time.
		Tip: Click on a cell and drag up or down to modify the values (faster with shift-key, slower with alt-key pressed), or click and drag on the arrows between the cells, to move values between cells.
	</p>
</div>
