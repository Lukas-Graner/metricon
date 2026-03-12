import type { Component } from 'svelte';

export interface RouteConfig {
    name: string;
    component: Component | null;
}

const routes = {
    'confusion-matrix': { name: 'Confusion Matrix', component: null },
    'metric-vs-metric': { name: 'Metric vs. Metric', component: null },
    'did-you-know': { name: 'Did You Know?', component: null },
};

function getCurrentRoute(): string {
    if (typeof window === 'undefined') return 'confusion-matrix';
    const path = window.location.pathname;
    const routePath = path.slice(1);
    return routePath && routePath in routes ? routePath : 'confusion-matrix';
}

export const router = $state({
    currentRoute: getCurrentRoute(),
});

export function navigate(path: string) {
    if (typeof window === 'undefined') return;
    const validPath = path in routes ? path : 'confusion-matrix';
    router.currentRoute = validPath;
    window.history.pushState({}, '', `/${validPath}`);
}

export function handleNavigation(e: Event, path: string) {
    e.preventDefault();
    navigate(path);
}

export function getHref(path: string): string {
    const validPath = path in routes ? path : 'confusion-matrix';
    return `/${validPath}`;
}

export function initRouter(routesWithComponents: Record<string, RouteConfig>) {
    Object.assign(routes, routesWithComponents);
    
    const handler = () => {
        router.currentRoute = getCurrentRoute();
    };
    
    window.addEventListener('popstate', handler);
    
    return () => window.removeEventListener('popstate', handler);
}