# Metricon

Interactive exploration and learning tool for performance metrics, many of which are used for evaluation in machine learning and much more. Visualize confusion matrices, calculate metrics, visualize their relationships and learn some niche, but potentially relevant facts.

Live at: [https://metricon.pages.dev](https://metricon.pages.dev)

## Run It

If you want to run it yourself:
```bash
# with bun
bun install
bun run dev

# or with docker
docker build -t metricon .
docker run -p 3000:3000 metricon
```


## Stack

This project uses the following open-source libraries:
- [Svelte 5](https://github.com/sveltejs/svelte) (MIT License)
- [Tailwind CSS 4](https://github.com/tailwindlabs/tailwindcss) (MIT License)
- [D3.js](https://github.com/d3/d3) (ISC License)
- [KaTeX](https://github.com/KaTeX/KaTeX) (MIT License)
- [Vite](https://github.com/vitejs/vite) (MIT License)

## Roadmap

- Add mobile support
- Add page for Micro/Macro average calculation
- Add page for ROC and PR curve visualizations
- Add more "Did you know?"-cards
- Sortable metric tables
- Show value ranges of metrics
