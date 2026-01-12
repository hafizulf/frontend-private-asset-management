import Chart from "chart.js/auto";
import { formatIDR } from "../helpers/formatter";

let chartInstance = null;

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatTotal(metric, rawString) {
  if (metric === "qty") return `${rawString}`;
  return `Rp ${formatIDR(rawString)}`;
}

export function initBuySellLineChart(canvasId = "buy-sell-line") {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  chartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "Buy", data: [], tension: 0.25 },
        { label: "Sell", data: [], tension: 0.25 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.dataset.label || "";
              const val = Number(ctx.raw ?? 0);
              const metric = chartInstance?.$metric || "value";

              if (metric === "qty") return `${label}: ${val}`;
              return `${label}: Rp ${formatIDR(String(val))}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => v,
          },
        },
      },
    },
  });

  chartInstance.$metric = "value";
  return chartInstance;
}

export function updateBuySellLineChart(payload, captionElId = "buy-sell-caption") {
  if (!chartInstance) return;

  const labels = payload.series.map((p) => p.bucket);
  const buy = payload.series.map((p) => toNumber(p.buy));
  const sell = payload.series.map((p) => toNumber(p.sell));

  chartInstance.data.labels = labels;
  chartInstance.data.datasets[0].data = buy;
  chartInstance.data.datasets[1].data = sell;

  // keep metric for tooltip + axis formatting
  const metric = payload.meta?.metric || "value";
  chartInstance.$metric = metric;

  // axis tick formatting based on metric
  chartInstance.options.scales.y.ticks.callback = (v) => {
    if (metric === "qty") return v;
    return `Rp ${formatIDR(String(v))}`;
  };

  chartInstance.update();

  const captionEl = document.getElementById(captionElId);
  if (captionEl) {
    const buyTotal = formatTotal(metric, payload.totals.buy);
    const sellTotal = formatTotal(metric, payload.totals.sell);

    captionEl.textContent =
      `${payload.meta.filter} • ${payload.meta.from} → ${payload.meta.to} • ` +
      `${payload.meta.granularity} • ${metric} • totals: buy ${buyTotal}, sell ${sellTotal}`;
  }
}
