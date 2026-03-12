<script lang="ts">
  import { correlationmetrics } from "../utils/metrics";
  import { settings } from "../utils/settings.svelte";
  import DataTable from "./DataTable.svelte";

  interface Props {
    xValues: number[];
    yValues: number[];
    floatingPrecision?: number;
    showMetricsAsPercentage?: boolean;
    showBar?: boolean;
    compact?: boolean;
  }

  let { 
    xValues, 
    yValues,
    floatingPrecision = 3, 
    showMetricsAsPercentage = false, 
    showBar = true, 
    compact = false 
  }: Props = $props();

  let visibleMetrics = $derived(
    Object.values(correlationmetrics).filter(m => m.level <= settings.metricVisibilityLevel)
  );

  let tableData = $derived(visibleMetrics.map(m => ({
    id: m.id,
    displayName: m.displayName,
    formula: m.formula,
    description: m.description,
    bounds: m.bounds,
    value: m.calc(xValues, yValues)
  })));
</script>
<DataTable metrics={tableData} {floatingPrecision} {showMetricsAsPercentage} {showBar} {compact} sortType={settings.tableSortType} title="Plot Statistics" />
