<script lang="ts">
	import { Tween } from 'svelte/motion';
    import { cubicOut } from "svelte/easing";
    import KdePlot from "../components/KdePlot.svelte";
    import { getExtendedInterpolator, invlerp, lerp, minBy } from "../utils/utils";
    import { mouseDrag } from "../utils/mouseDrag";
    import { scaleLinear } from "d3-scale";
    import { settings } from "../utils/settings.svelte";

    let width = $state(150);
    let height = $state(150);

    let isDragging = $state(false);

    
    interface Point {
        x: number;
        y: number;
        c: string;
        valid: number;
    }


    interface Viewport {
        left: number;
        right: number;
        top: number;
        bottom: number;
    }

    interface PlotData {
        points: Point[];
        triangles?: number[][];
    }

    interface Props {
        showKde?: boolean;
        selectedIndex?: number | null;
        data: PlotData;
        viewport?: Viewport;
        xAxisTitle?: string;
        yAxisTitle?: string;
        size?: string;
    }

    let {
        showKde = true,
        selectedIndex = $bindable(null),
        data,
        viewport = $bindable({left: 0, right: 1, top: 0, bottom: 1}),
        xAxisTitle = "",
        yAxisTitle = "",
        size = "25rem"
    }: Props = $props();

    let margin = $derived({left: showKde ? 70 : 50, right: 10, top: 10, bottom: showKde ? 65 : 45});

    // The initial value is captured here, but prop changes are handled via .set() in $effect below.
    // This is the correct Svelte 5 pattern for Tween - create with initial data, update via .set()
    // to animate prop changes smoothly.
    // svelte-ignore state_referenced_locally
    let tweenedData = new Tween(data, {
        duration: 300,
        easing: cubicOut,
        interpolate: getExtendedInterpolator,
    })
    let tweenedViewport = new Tween(viewport, {
        duration: 50,
        easing: cubicOut,
        interpolate: getExtendedInterpolator,
    })
    
    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) {
            const [dist, index] = minBy(circles, (circle: {x: number, y: number}) =>
                Math.sqrt(
                    Math.pow(e.offsetX - circle.x, 2) +
                        Math.pow(e.offsetY - circle.y, 2)
                )
            );
            selectedIndex = dist < 100 ? index : null;
        }
    };

    const onMouseLeave = () => {
        selectedIndex = null;
    };

    const onMouseZoom = (e: WheelEvent) => {
        e.preventDefault()
        const factor = 1-(e.deltaY > 0 ? 1 / 0.85 : 0.85);
        const zoomPointX = invlerp(bounding.left, bounding.right, e.offsetX);
        const zoomPointY = invlerp(bounding.bottom, bounding.top, e.offsetY);
        viewport = {
            left: lerp(viewport.left, viewport.right, factor*zoomPointX),
            right: lerp(viewport.right, viewport.left, factor*(1 - zoomPointX)),
            top: lerp(viewport.top, viewport.bottom, factor*zoomPointY),
            bottom: lerp(viewport.bottom, viewport.top, factor*(1-zoomPointY))
        };
    };
    
    const onMouseDrag = (e: CustomEvent) => {
        const event = e.detail.event;
        viewport = {
            left: viewport.left + scaleX.invert(event.offsetX) - scaleX.invert(event.offsetX + event.movementX),
            right: viewport.right + scaleX.invert(event.offsetX) - scaleX.invert(event.offsetX + event.movementX),
            top: viewport.top + scaleY.invert(event.offsetY) - scaleY.invert(event.offsetY + event.movementY),
            bottom: viewport.bottom + scaleY.invert(event.offsetY) - scaleY.invert(event.offsetY + event.movementY)
        };
    };

    let bounding = $derived({left: margin.left, right: width-margin.right, top:margin.top, bottom: height-margin.bottom});
    $effect(() => {
        tweenedData.set(data)
    });
    $effect(() => {
        tweenedViewport.set(viewport)
    });
    let scaleX = $derived(scaleLinear().domain([tweenedViewport.current.left, tweenedViewport.current.right]).range([bounding.left, bounding.right]));
    let scaleY = $derived(scaleLinear().domain([tweenedViewport.current.top, tweenedViewport.current.bottom]).range([bounding.bottom, bounding.top]));
    let showPoints = $derived(settings.scatterplotRenderMode !== 3);
    let showTriangles = $derived(settings.scatterplotRenderMode !== 1);
    let circles = $derived(tweenedData.current.points.map((d: {x: number, y: number, c: string, valid: number}) => ({x: scaleX(d.x), y: scaleY(d.y), c: d.c, r: (d.valid** 20) * 3})));
    let triangles = $derived(
        tweenedData.current.triangles?.map((tri: number[], triIndex: number) => {
            void triIndex
            const p0 = tweenedData.current.points[tri[0]];
            const p1 = tweenedData.current.points[tri[1]];
            const p2 = tweenedData.current.points[tri[2]];
            
            // Use the actual data (not tweened) for validity check to prevent flickering
            // This ensures triangles vanish instantly when any point becomes invalid
            const actualP0 = data.points[tri[0]];
            const actualP1 = data.points[tri[1]];
            const actualP2 = data.points[tri[2]];
            
            // Only render triangle if all 3 points are valid in the actual data
            if (actualP0.valid > 0.1 && actualP1.valid > 0.1 && actualP2.valid > 0.1) {
                return {
                    points: `${scaleX(p0.x)},${scaleY(p0.y)} ${scaleX(p1.x)},${scaleY(p1.y)} ${scaleX(p2.x)},${scaleY(p2.y)}`,
                    fill: p0.c
                };
            }
            return null;
        }).filter((t: unknown) => t !== null) ?? []
    );
</script>



<div class="grid" style="grid-template-columns: 60px {size}; grid-template-rows: auto auto;">
    <figure
        bind:clientWidth={width}
        bind:clientHeight={height}
        onmousemove={onMouseMove}
        onmouseleave={onMouseLeave}
        onwheel={onMouseZoom}
        use:mouseDrag={true}
        onmousedrag={(e: Event) => { onMouseDrag(e as unknown as CustomEvent); return e; }}
        onmousedragstart={(e: Event) => { isDragging = true; return e; }}
        onmousedragend={(e: Event) => { isDragging = false; return e; }}
        style="width:{size}; height:{size}"
    >
        <svg width={width} height={height}>
            <!-- Vertical KDE (left side) -->
            {#if showKde}
                <svg x={0} y={margin.top} width={Math.max(0, bounding.left-40)} height={Math.max(0, bounding.bottom - margin.top)} viewBox="0 0 1 1" preserveAspectRatio="none">
                    <g transform="rotate(90, 0.5, 0.5)">
                        <KdePlot
                            data={tweenedData.current.points.map((d: {x: number, y: number}) => d.y)}
                            range={[tweenedViewport.current.bottom, tweenedViewport.current.top]}
                        />
                    </g>
                </svg>
                <svg x={margin.left} y={bounding.bottom+40} width={Math.max(0, bounding.right - margin.left)} height={Math.max(0, height - bounding.bottom - 40)} viewBox="0 0 1 1" preserveAspectRatio="none">
                    <KdePlot
                        data={tweenedData.current.points.map((d: {x: number, y: number}) => d.x)}
                        range={[tweenedViewport.current.left, tweenedViewport.current.right]}
                    />
                </svg>
            {/if}
            <line
                x1={bounding.left}
                y1={bounding.top}
                x2={bounding.left}
                y2={bounding.bottom}
                stroke={settings.darkMode ? "#e5e7eb" : "black"}
            />
            <line
                x1={bounding.left}
                y1={bounding.bottom}
                x2={bounding.right}
                y2={bounding.bottom}
                stroke={settings.darkMode ? "#e5e7eb" : "black"}
            />
            {#each scaleX.ticks(10) as tick (tick)}
                {@const tickX = scaleX(tick)}
                <line x1={tickX} y1={bounding.bottom} x2={tickX} y2={bounding.bottom+5} stroke={settings.darkMode ? "#e5e7eb" : "black"}/>
                <text x={tickX} y={bounding.bottom+20} text-anchor="middle" fill={settings.darkMode ? "#e5e7eb" : "black"} font-size="10">{tick}</text>
            {/each}
            {#each scaleY.ticks(10) as tick (tick)}
                {@const tickY = scaleY(tick)}
                <line y1={tickY} x1={bounding.left} y2={tickY} x2={bounding.left-5} stroke={settings.darkMode ? "#e5e7eb" : "black"}/>
                <text x={bounding.left-10} y={tickY} text-anchor="end" alignment-baseline="middle" fill={settings.darkMode ? "#e5e7eb" : "black"} font-size="10">{tick}</text>
            {/each}

            <!-- X-axis title -->
            {#if xAxisTitle}
                <text
                    x={(bounding.left + bounding.right) / 2}
                    y={bounding.bottom + 35}
                    text-anchor="middle"
                    fill={settings.darkMode ? "#e5e7eb" : "black"}
                    font-size="12"
                    font-weight="500"
                >{xAxisTitle}</text>
            {/if}

            <!-- Y-axis title -->
            {#if yAxisTitle}
                <text
                    x={bounding.left - 30}
                    y={(bounding.top + bounding.bottom) / 2}
                    text-anchor="middle"
                    fill={settings.darkMode ? "#e5e7eb" : "black"}
                    font-size="12"
                    font-weight="500"
                    transform="rotate(-90, {bounding.left - 30}, {(bounding.top + bounding.bottom) / 2})"
                >{yAxisTitle}</text>
            {/if}

            {#if showTriangles}
                {#each triangles as triangle, idx (idx)}
                    {#if triangle}
                    <polygon
                        points={triangle.points}
                        fill={triangle.fill}
                        opacity="0.7"
                    />
                    {/if}
                {/each}
            {/if}

            {#if showPoints}
                {#each circles as circle, idx (idx)}
                    <circle
                        fill={circle.c}
                        cx={circle.x}
                        cy={circle.y}
                        r={circle.r}
                    />
                {/each}
            {/if}
            {#if selectedIndex !== null}
                <circle
                    cx={circles[selectedIndex].x}
                    cy={circles[selectedIndex].y}
                    r={circles[selectedIndex].r * 2}
                    fill="none"
                    stroke={settings.darkMode ? '#e5e7eb' : 'black'}
                    stroke-width="2"
                />
                <line x1={bounding.left} x2={circles[selectedIndex].x} y1={circles[selectedIndex].y} y2={circles[selectedIndex].y} stroke={settings.darkMode ? "#e5e7eb" : "black"} />
                <line x1={circles[selectedIndex].x} x2={circles[selectedIndex].x} y1={circles[selectedIndex].y} y2={bounding.bottom} stroke={settings.darkMode ? "#e5e7eb" : "black"} />
            {/if}
        </svg>
    </figure>
</div>
