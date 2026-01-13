import { Modal } from "bootstrap";
import dashboardApi from "./dashboard.page";
import { formatIDR } from "../helpers/formatter";
import { renderStockAssetsPie } from "./stock-assets-pie";
import { initBuySellLineChart, updateBuySellLineChart } from "./buy-sell-line";

/* ================== STATE ================== */
const state = {
  filter: "month",
  from: undefined,
  to: undefined,
};

const seriesState = {
  granularity: "day",
  metric: "value",
};

const topState = {
  metric: "qty", // "qty" (volume) | "value"
  limit: 5,
};

/* ================== DOM ================== */
const filterLabel = document.getElementById("filter-label");

const modalEl = document.getElementById("modal-date-range");
const modal = modalEl ? new Modal(modalEl) : null;

const inputFrom = document.getElementById("range-from");
const inputTo = document.getElementById("range-to");
const btnApplyRange = document.getElementById("btn-apply-range");

// KPI DOM
const profitTitleEl = document.querySelector(".kpi-profit .kpi-title");
const profitTrendEl = document.getElementById("kpi-profit-trend");
const periodBadgeEl = document.getElementById("kpi-period-badge");

// Buy/Sell chart controls
const granularityGroup = document.querySelector('[aria-label="Granularity"]');
const metricGroup = document.querySelector('[aria-label="Metric"]');

// Top commodities DOM
const topMetricGroup = document.getElementById("top-commodities-metric");
const topListEl = document.getElementById("top-commodities-list");
const topCaptionEl = document.getElementById("top-commodities-caption");

/* ================== HELPERS ================== */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value ?? "");
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function setActiveFilterButton(filter) {
  document.querySelectorAll("[data-filter]").forEach((btn) => {
    const active = btn.dataset.filter === filter;
    btn.classList.toggle("btn-primary", active);
    btn.classList.toggle("btn-outline-primary", !active);
  });
}

function setActiveGroupButtons(groupEl, dataAttrName, activeValue) {
  if (!groupEl) return;
  groupEl.querySelectorAll(`button[${dataAttrName}]`).forEach((btn) => {
    const v = btn.getAttribute(dataAttrName);
    const active = v === activeValue;
    btn.classList.toggle("btn-primary", active);
    btn.classList.toggle("btn-outline-primary", !active);
  });
}

function getPeriodLabel() {
  switch (state.filter) {
    case "day":
      return "Day";
    case "month":
      return "Month";
    case "year":
      return "Year";
    case "all":
      return "All";
    case "date_range":
      return "Date Range";
    default:
      return capitalize(state.filter);
  }
}

function getCompareLabel() {
  switch (state.filter) {
    case "day":
      return "vs yesterday";
    case "month":
      return "vs last month";
    case "year":
      return "vs last year";
    case "date_range":
      return "vs previous range";
    default:
      return "vs previous period";
  }
}

function setLabel() {
  if (!filterLabel) return;

  if (state.filter === "date_range" && state.from && state.to) {
    filterLabel.textContent = `Date range: ${state.from} → ${state.to}`;
    return;
  }

  filterLabel.textContent = getPeriodLabel();
}

/* ===== Profit card header + badge ===== */
function setProfitHeader() {
  if (profitTitleEl) profitTitleEl.textContent = "Profit / Loss";
  if (periodBadgeEl) periodBadgeEl.textContent = getPeriodLabel();
}

// hide trend only when filter=all
function toggleProfitTrend() {
  if (!profitTrendEl) return;
  profitTrendEl.classList.toggle("kpi-hidden", state.filter === "all");
}

/* ================== BUILD QUERY ================== */
function ymdToDmy(ymd) {
  if (!ymd) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return "";
  const [, yyyy, mm, dd] = m;
  return `${dd}-${mm}-${yyyy}`;
}

function buildQuery() {
  const qs = new URLSearchParams();
  qs.set("filter", state.filter);

  if (state.filter === "date_range") {
    qs.set("from", ymdToDmy(state.from));
    qs.set("to", ymdToDmy(state.to));
  }

  return `?${qs.toString()}`;
}

// stock-assets endpoint accepts ONLY ?commodity=... (no filter/from/to)
function buildStockQuery(commodityId) {
  const qs = new URLSearchParams();
  if (commodityId) qs.set("commodity", commodityId);
  const q = qs.toString();
  return q ? `?${q}` : "";
}

function mapSeriesMetric(uiMetric) {
  return uiMetric === "qty" ? "qty" : "value";
}

function buildSeriesQuery() {
  const qs = new URLSearchParams();
  qs.set("filter", state.filter);

  if (state.filter === "date_range") {
    qs.set("from", ymdToDmy(state.from));
    qs.set("to", ymdToDmy(state.to));
  }

  qs.set("granularity", seriesState.granularity);
  qs.set("metric", mapSeriesMetric(seriesState.metric));

  return `?${qs.toString()}`;
}

function buildTopCommoditiesQuery() {
  const qs = new URLSearchParams();
  qs.set("filter", state.filter);

  if (state.filter === "date_range") {
    qs.set("from", ymdToDmy(state.from));
    qs.set("to", ymdToDmy(state.to));
  }

  qs.set("metric", topState.metric);
  qs.set("limit", String(topState.limit));

  return `?${qs.toString()}`;
}

/* ================== RANGE VALIDATION ================== */
function clearRangeErrors() {
  inputFrom?.classList.remove("is-invalid");
  inputTo?.classList.remove("is-invalid");

  const fromErr = document.getElementById("range-from-error");
  const toErr = document.getElementById("range-to-error");
  if (fromErr) fromErr.textContent = "";
  if (toErr) toErr.textContent = "";
}

function validateRange(from, to) {
  clearRangeErrors();
  let ok = true;

  if (!from) {
    inputFrom?.classList.add("is-invalid");
    const fromErr = document.getElementById("range-from-error");
    if (fromErr) fromErr.textContent = "From is required";
    ok = false;
  }

  if (!to) {
    inputTo?.classList.add("is-invalid");
    const toErr = document.getElementById("range-to-error");
    if (toErr) toErr.textContent = "To is required";
    ok = false;
  }

  // compare YYYY-MM-DD strings (safe)
  if (from && to && from > to) {
    inputFrom?.classList.add("is-invalid");
    const fromErr = document.getElementById("range-from-error");
    if (fromErr) fromErr.textContent = "From must be <= To";
    ok = false;
  }

  return ok;
}

/* ================== BUY/SELL SERIES LOAD ================== */
async function refreshBuySellSeries() {
  try {
    const q = buildSeriesQuery();
    const payload = await dashboardApi.getBuySellSeries(q);
    updateBuySellLineChart(payload);
  } catch (err) {
    console.error("refreshBuySellSeries failed:", err);
    const cap = document.getElementById("buy-sell-caption");
    if (cap) cap.textContent = "Failed to load Buy/Sell series";
  }
}

/* ================== TOP COMMODITIES RENDER ================== */
function setActiveTopMetric(metric) {
  if (!topMetricGroup) return;
  topMetricGroup.querySelectorAll('button[data-top-metric]').forEach((btn) => {
    const v = btn.getAttribute("data-top-metric");
    const active = v === metric;
    btn.classList.toggle("btn-primary", active);
    btn.classList.toggle("btn-outline-primary", !active);
  });
}

function renderTopCommodities(payload) {
  if (!topListEl) return;

  const metric = payload?.meta?.metric || topState.metric;
  const items = payload?.items ?? [];

  // compact tweak for value mode (optional – keep if you like)
  topListEl.classList.toggle("top-commodities-value", metric === "value");

  const rightLabel = document.getElementById("top-commodities-right-label");
  if (rightLabel) rightLabel.textContent = metric === "qty" ? "Total Qty" : "Total Value";

  if (!items.length) {
    topListEl.innerHTML = `<div class="text-muted small">No data</div>`;
    if (topCaptionEl) topCaptionEl.textContent = "";
    const hint = document.getElementById("top-commodities-hint");
    if (hint) hint.textContent = "";
    return;
  }

  const max = Math.max(
    ...items.map((it) => Number(metric === "qty" ? it.totalQty : it.totalValue) || 0),
    1
  );

  topListEl.innerHTML = items
    .map((it, idx) => {
      const rawTotal = Number(metric === "qty" ? it.totalQty : it.totalValue) || 0;
      const rawBuy = Number(metric === "qty" ? it.buyQty : it.buyValue) || 0;
      const rawSell = Number(metric === "qty" ? it.sellQty : it.sellValue) || 0;

      const pct = Math.max(3, Math.min(100, Math.round((rawTotal / max) * 100)));

      const displayTotal =
        metric === "qty"
          ? String(it.totalQty ?? "0")
          : `Rp ${formatIDR(String(it.totalValue ?? "0"))}`;

      const buyText =
        metric === "qty"
          ? String(it.buyQty ?? "0")
          : `Rp ${formatIDR(String(it.buyValue ?? "0"))}`;

      const sellText =
        metric === "qty"
          ? String(it.sellQty ?? "0")
          : `Rp ${formatIDR(String(it.sellValue ?? "0"))}`;

      // Net here is "sell - buy" (direction badge only)
      const net = rawSell - rawBuy;
      const netBadge =
        net > 0
          ? `<span class="badge rounded-pill bg-success-subtle text-success">Net +</span>`
          : net < 0
            ? `<span class="badge rounded-pill bg-danger-subtle text-danger">Net -</span>`
            : `<span class="badge rounded-pill bg-secondary-subtle text-secondary">Net 0</span>`;

      return `
        <div class="top-commodity-row">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div class="d-flex align-items-start gap-2" style="min-width: 0;">
              <span class="top-commodity-rank">${idx + 1}</span>

              <div style="min-width: 0;">
                <div class="d-flex align-items-center gap-2">
                  <div class="fw-semibold text-truncate">${it.commodityName}</div>
                  ${netBadge}
                </div>

                <div class="text-muted small mt-1">
                  <div class="d-flex justify-content-between gap-2">
                    <span>Buy</span>
                    <strong class="text-dark">${buyText}</strong>
                  </div>
                  <div class="d-flex justify-content-between gap-2 mt-1">
                    <span>Sell</span>
                    <strong class="text-dark">${sellText}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-end" style="flex: 0 0 auto;">
              <div class="fw-semibold">${displayTotal}</div>
            </div>
          </div>

          <div class="top-commodity-meter mt-2">
            <div style="width:${pct}%;" class="bg-primary"></div>
          </div>
        </div>
      `;
    })
    .join("");

  if (topCaptionEl) {
    const filter = payload?.meta?.filter ?? state.filter;
    const from = payload?.meta?.from;
    const to = payload?.meta?.to;
    const limit = payload?.meta?.limit ?? topState.limit;

    const rangeText =
      String(filter) === "all"
        ? "All time"
        : (from && to ? `${from} → ${to}` : getPeriodLabel());

    topCaptionEl.textContent = `${rangeText} • Top ${limit}`;
  }

  const subtitle = document.getElementById("top-commodities-subtitle");
  if (subtitle) {
    subtitle.textContent = `Ranking • ${metric === "qty" ? "By Volume" : "By Value"}`;
  }

  const hint = document.getElementById("top-commodities-hint");
  if (hint) {
    hint.textContent = "Tap Volume/Value to switch";
  }
}

async function refreshTopCommodities() {
  try {
    const q = buildTopCommoditiesQuery();
    const payload = await dashboardApi.getTopCommodities(q);
    renderTopCommodities(payload);
  } catch (err) {
    console.error("refreshTopCommodities failed:", err);
    if (topListEl) topListEl.innerHTML = `<div class="text-muted small">Failed to load</div>`;
    if (topCaptionEl) topCaptionEl.textContent = "";
  }
}

/* ================== MAIN KPI LOAD ================== */
async function refreshDashboard() {
  try {
    const query = buildQuery();

    const [buy, sell, profit] = await Promise.all([
      dashboardApi.getTotalBuyTransactions(query),
      dashboardApi.getTotalSellTransactions(query),
      dashboardApi.getTotalProfitLoss(query),
    ]);

    // Stock assets pie (NO filter/from/to)
    const stock = await dashboardApi.getStockAssets(buildStockQuery());
    renderStockAssetsPie({
      canvasId: "stock-assets-pie",
      totalTextId: "stock-assets-total",
      legendId: "stock-assets-legend",
      items: stock?.totalStockAssets ?? [],
      topN: 6,
    });

    // Buy KPI
    setText("kpi-buy-count", buy?.totalTransactions ?? 0);
    setText("kpi-buy-total", `Rp ${formatIDR(buy?.totalPrice ?? "0")}`);

    // Sell KPI
    setText("kpi-sell-count", sell?.totalTransactions ?? 0);
    setText("kpi-sell-total", `Rp ${formatIDR(sell?.totalPrice ?? "0")}`);

    // Profit KPI
    const tpl = profit?.totalProfitLoss ?? {};
    const value = tpl.value ?? "0";
    const trendRaw = tpl.trend ?? 0;

    setText("kpi-profit-value", `Rp ${formatIDR(value)}`);

    toggleProfitTrend();

    if (state.filter !== "all") {
      const trendNum = Number(trendRaw) || 0;
      const arrow = trendNum >= 0 ? "▲" : "▼";
      const pct = Math.abs(trendNum);
      setText("kpi-profit-trend", `${arrow} ${pct}% ${getCompareLabel()}`);
    }
  } catch (err) {
    console.error("refreshDashboard failed:", err);

    setText("kpi-buy-count", 0);
    setText("kpi-buy-total", "Rp 0");
    setText("kpi-sell-count", 0);
    setText("kpi-sell-total", "Rp 0");
    setText("kpi-profit-value", "Rp 0");

    toggleProfitTrend();
    if (state.filter !== "all") setText("kpi-profit-trend", `0% ${getCompareLabel()}`);
  }
}

/* ================== EVENTS ================== */
document.querySelectorAll("[data-filter]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const f = btn.dataset.filter;

    if (f === "date_range") {
      // Prefill modal with current range (if any)
      if (state.from) inputFrom.value = state.from;
      if (state.to) inputTo.value = state.to;
      clearRangeErrors();
      modal?.show();
      return;
    }

    // If same filter clicked, do nothing
    if (state.filter === f && state.filter !== "date_range") return;

    state.filter = f;
    state.from = undefined;
    state.to = undefined;

    setActiveFilterButton(f);
    setLabel();
    setProfitHeader();
    toggleProfitTrend();

    // auto refresh
    refreshDashboard();
    refreshBuySellSeries();
    refreshTopCommodities();
  });
});

btnApplyRange?.addEventListener("click", () => {
  const from = inputFrom?.value || "";
  const to = inputTo?.value || "";

  if (!validateRange(from, to)) return;

  state.filter = "date_range";
  state.from = from;
  state.to = to;

  setActiveFilterButton("date_range");
  setLabel();
  setProfitHeader();
  toggleProfitTrend();
  modal?.hide();

  refreshDashboard();
  refreshBuySellSeries();
  refreshTopCommodities();
});

modalEl?.addEventListener("hidden.bs.modal", clearRangeErrors);

/* Granularity buttons */
granularityGroup?.querySelectorAll("button[data-granularity]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const next = btn.dataset.granularity;
    if (seriesState.granularity === next) return; // ✅ avoid refetch
    seriesState.granularity = next;

    setActiveGroupButtons(granularityGroup, "data-granularity", seriesState.granularity);
    refreshBuySellSeries();
  });
});

/* Metric buttons */
metricGroup?.querySelectorAll("button[data-metric]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const next = btn.dataset.metric; // value|qty
    if (seriesState.metric === next) return; // ✅ avoid refetch
    seriesState.metric = next;

    setActiveGroupButtons(metricGroup, "data-metric", seriesState.metric);
    refreshBuySellSeries();
  });
});

/* Top commodities metric buttons */
topMetricGroup?.querySelectorAll('button[data-top-metric]').forEach((btn) => {
  btn.addEventListener("click", () => {
    const next = btn.getAttribute("data-top-metric"); // qty|value
    if (!next || topState.metric === next) return;
    topState.metric = next;

    setActiveTopMetric(topState.metric);
    refreshTopCommodities();
  });
});

/* ================== INIT ================== */
setActiveFilterButton(state.filter);
setLabel();
setProfitHeader();
toggleProfitTrend();

// init chart once
initBuySellLineChart("buy-sell-line");

// init active state for button groups
setActiveGroupButtons(granularityGroup, "data-granularity", seriesState.granularity);
setActiveGroupButtons(metricGroup, "data-metric", seriesState.metric);

// init top commodities buttons
setActiveTopMetric(topState.metric);

// initial loads
refreshDashboard();
refreshBuySellSeries();
refreshTopCommodities();
