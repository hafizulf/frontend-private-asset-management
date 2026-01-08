import { Modal } from "bootstrap";
import dashboardApi from "./dashboard.page";
import { formatIDR } from "../helpers/formatter";
import { renderStockAssetsPie } from "./stock-assets-pie";

/* ================== STATE ================== */
const state = {
  filter: "month",
  from: undefined, // YYYY-MM-DD
  to: undefined,   // YYYY-MM-DD
};

/* ================== DOM ================== */
const filterLabel = document.getElementById("filter-label");
const btnApply = document.getElementById("btn-apply-filter");

const modalEl = document.getElementById("modal-date-range");
const modal = modalEl ? new Modal(modalEl) : null;

const inputFrom = document.getElementById("range-from");
const inputTo = document.getElementById("range-to");
const btnApplyRange = document.getElementById("btn-apply-range");

// KPI DOM (matches the NEW KPI HTML)
const profitTitleEl = document.querySelector(".kpi-profit .kpi-title");
const profitTrendEl = document.getElementById("kpi-profit-trend");
const periodBadgeEl = document.getElementById("kpi-period-badge");

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

/* hide trend only when filter=all */
function toggleProfitTrend() {
  if (!profitTrendEl) return;
  // use your CSS class (kpi-hidden) for consistent styling
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
    // backend expects DD-MM-YYYY
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

/* ================== MAIN LOAD ================== */
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
      modal?.show();
      return;
    }

    state.filter = f;
    state.from = undefined;
    state.to = undefined;

    setActiveFilterButton(f);
    setLabel();
    setProfitHeader();
    toggleProfitTrend();
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
});

btnApply?.addEventListener("click", () => {
  if (state.filter === "date_range" && (!state.from || !state.to)) {
    modal?.show();
    return;
  }
  refreshDashboard();
});

modalEl?.addEventListener("hidden.bs.modal", clearRangeErrors);

/* ================== INIT ================== */
setActiveFilterButton(state.filter);
setLabel();
setProfitHeader();
toggleProfitTrend();
refreshDashboard();
