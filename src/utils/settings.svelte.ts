export type SortType = "default" | "bounded" | "bounded-descending" | "absolute" | "absolute-descending" | "name" | "name-descending";

export const settings = $state(
    {
        confusionMatrixFlip: false,
        darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
        metricVisibilityLevel: 2, // 1 = basic, 2 = advanced, 3 = expert
        showMetricsAsPercentage: false,
        floatingPrecision: 3,
        scatterplotRenderMode: 2, // 1 = points only, 2 = points + triangles, 3 = triangles only
        tableSortType: "default" as SortType,
    }
);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    settings.darkMode = event.matches;
});