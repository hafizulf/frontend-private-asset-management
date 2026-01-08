import Chart from "chart.js/auto";

let chartInstance = null;

// plugin: center text (total units)
const centerTextPlugin = {
  id: "centerTextPlugin",
  afterDraw(chart, args, pluginOptions) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;

    const x = meta.data[0].x;
    const y = meta.data[0].y;

    const textTop = pluginOptions?.topText ?? "";
    const textBottom = pluginOptions?.bottomText ?? "";

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "700 14px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.fillText(textTop, x, y - 8);

    ctx.font = "500 11px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.fillText(textBottom, x, y + 10);

    ctx.restore();
  },
};

function parseQty(qty) {
  const n = Number(qty);
  return Number.isFinite(n) ? n : 0;
}

function formatQty(n) {
  // keep simple. change if you want 0 decimals for non-fractions
  return n.toFixed(2);
}

function colors(count) {
  // curated palette (repeat if needed)
  const palette = [
    "#60A5FA", "#34D399", "#FBBF24", "#F472B6", "#A78BFA",
    "#FB7185", "#22D3EE", "#F97316", "#84CC16", "#E879F9",
  ];
  return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
}

function buildTopNWithOthers(items, topN = 6) {
  const normalized = (items || [])
    .map((x) => ({
      commodityId: x.commodityId,
      commodityName: x.commodityName,
      qty: parseQty(x.qty),
    }))
    .filter((x) => x.qty > 0)
    .sort((a, b) => b.qty - a.qty);

  const top = normalized.slice(0, topN);
  const rest = normalized.slice(topN);

  const othersQty = rest.reduce((sum, x) => sum + x.qty, 0);
  if (othersQty > 0) {
    top.push({
      commodityId: "others",
      commodityName: "Others",
      qty: othersQty,
    });
  }

  return top;
}

function renderLegend({ legendEl, rows, total, colorList }) {
  if (!legendEl) return;

  if (!rows.length) {
    legendEl.innerHTML = `<div class="legend-item"><div class="legend-left"><span class="name">No stock</span></div><span class="value">0</span></div>`;
    return;
  }

  legendEl.innerHTML = rows
    .map((row, idx) => {
      const pct = total > 0 ? (row.qty / total) * 100 : 0;
      return `
        <div class="legend-item">
          <div class="legend-left">
            <span class="dot" style="background:${colorList[idx]}"></span>
            <span class="name" title="${row.commodityName}">${row.commodityName}</span>
          </div>
          <span class="value">${formatQty(row.qty)} • ${pct.toFixed(1)}%</span>
        </div>
      `;
    })
    .join("");
}

export function renderStockAssetsPie({
  canvasId,
  totalTextId,
  legendId,
  items,
  topN = 6,
}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const legendEl = legendId ? document.getElementById(legendId) : null;

  const rows = buildTopNWithOthers(items, topN);
  const labels = rows.map((x) => x.commodityName);
  const data = rows.map((x) => x.qty);
  const total = data.reduce((a, b) => a + b, 0);

  // total text in footer
  if (totalTextId) {
    const totalEl = document.getElementById(totalTextId);
    if (totalEl) totalEl.textContent = `${formatQty(total)} Units`;
  }

  const colorList = colors(data.length);

  // legend list
  renderLegend({ legendEl, rows, total, colorList });

  // destroy old chart
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colorList,
          borderColor: "rgba(255,255,255,.25)",
          borderWidth: 1,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { display: false }, // we use our own legend list
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.label ?? "";
              const value = Number(ctx.raw ?? 0);
              const pct = total > 0 ? (value / total) * 100 : 0;
              return `${label}: ${formatQty(value)} (${pct.toFixed(1)}%)`;
            },
          },
        },
        centerTextPlugin: {
          topText: formatQty(total),
          bottomText: "Total Units",
        },
      },
    },
    plugins: [centerTextPlugin],
  });
}
