/**
 * The World at War — 2026  |  main.js
 * Interactive charts and UI behaviours.
 * Depends on: Chart.js 4.x (loaded via CDN in index.html)
 */

"use strict";

// ── Constants ────────────────────────────────────────────────
const RED     = "#c0392b";
const RED_A   = "rgba(192,57,43,0.82)";
const BLUE    = "#3b6fbf";
const BLUE_A  = "rgba(59,111,191,0.82)";
const AMBER   = "#b5680a";
const GREEN   = "#5a7a3a";
const INK4    = "#8a8780";
const PAPER2  = "#ede8df";
const PAPER3  = "#e2dcd1";
const GRID    = "rgba(15,14,12,0.07)";

// ── Chart registry (for updates) ────────────────────────────
const charts = {};

// ── Data (loaded from JSON) ──────────────────────────────────
let DATA = null;

// ── Base Chart.js defaults ───────────────────────────────────
Chart.defaults.font.family = "'DM Sans', sans-serif";
Chart.defaults.color       = INK4;

function baseOpts(overrides = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500, easing: "easeInOutQuart" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f0e0c",
        titleColor: "#f5f1ea",
        bodyColor: "rgba(245,241,234,0.72)",
        padding: 10,
        cornerRadius: 2,
        titleFont: { family: "'DM Sans', sans-serif", size: 11, weight: "500" },
        bodyFont:  { family: "'DM Sans', sans-serif", size: 11 },
      },
    },
    scales: {
      x: { grid: { color: GRID }, border: { display: false },
           ticks: { color: INK4, font: { size: 10 } } },
      y: { grid: { color: GRID }, border: { display: false },
           ticks: { color: INK4, font: { size: 10 } } },
    },
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────
// INIT — fetch data, then build everything
// ─────────────────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch("data/conflicts.json");
    DATA = await res.json();
  } catch {
    // fallback: data embedded directly so page still works offline
    DATA = FALLBACK_DATA;
  }

  buildStatStrip();
  buildConflictTable();
  buildTrendChart();
  buildCasChart();
  buildEqChart();
  buildTerrChart();
  buildIranChart();
  buildCumulChart();
  setupNavSpy();
  setupScrollAnimations();
  setupMastheadScroll();
  setupConflictFilters();
  setupConflictSort();

  // Remove loader
  setTimeout(() => {
    document.getElementById("loader").classList.add("hidden");
  }, 600);
}

// ─────────────────────────────────────────────────────────────
// STAT STRIP
// ─────────────────────────────────────────────────────────────
function buildStatStrip() {
  const strip = document.getElementById("stat-strip");
  const colors = ["", "amber", "light", ""];
  const inner = document.createElement("div");
  inner.className = "stat-strip-inner";

  DATA.headline_stats.forEach((s, i) => {
    inner.innerHTML += `
      <div class="stat-item">
        <span class="stat-num ${colors[i]}">${s.value}</span>
        <span class="stat-label">${s.label}</span>
      </div>`;
  });

  strip.appendChild(inner);
}

// ─────────────────────────────────────────────────────────────
// CONFLICT TABLE (filterable + sortable)
// ─────────────────────────────────────────────────────────────
let conflictSort = { key: null, dir: 1 };

function buildConflictTable() {
  renderConflictRows(DATA.conflicts);
}

function renderConflictRows(rows) {
  const container = document.getElementById("conflict-rows");
  container.innerHTML = "";

  const tierColor = { 1: RED_A, 2: "rgba(181,104,10,0.75)", 3: "rgba(90,122,58,0.75)" };
  const tierLabel = { 1: "Tier I", 2: "Tier II", 3: "Tier III" };

  rows.forEach((c) => {
    const row = document.createElement("div");
    row.className = "conflict-row";
    row.dataset.tier = c.tier;
    row.innerHTML = `
      <div>
        <div class="conflict-name">${c.name}</div>
        <div class="conflict-region">${c.region}</div>
      </div>
      <div class="bar-wrap">
        <div class="bar-track">
          <div class="bar-fill" style="width:${c.intensity}%;background:${tierColor[c.tier]};"></div>
        </div>
        <span class="bar-label">${c.intensity}%</span>
      </div>
      <div style="font-family:'DM Sans',sans-serif;font-size:11px;color:var(--ink-3);">${c.status}</div>
      <div><span class="tier-pill tier-${c.tier}">${tierLabel[c.tier]}</span></div>`;

    row.addEventListener("click", () => {
      document.querySelectorAll(".conflict-row.selected").forEach(r => r.classList.remove("selected"));
      row.classList.toggle("selected");
    });

    container.appendChild(row);
  });
}

function setupConflictFilters() {
  document.getElementById("conflict-filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tier = btn.dataset.tier;
    const filtered = tier === "all"
      ? DATA.conflicts
      : DATA.conflicts.filter(c => String(c.tier) === tier);

    applySort(filtered);
  });
}

function setupConflictSort() {
  document.querySelectorAll(".sortable").forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (conflictSort.key === key) {
        conflictSort.dir *= -1;
      } else {
        conflictSort.key = key;
        conflictSort.dir = 1;
      }
      const activeTier = document.querySelector(".filter-btn.active")?.dataset.tier || "all";
      const filtered = activeTier === "all"
        ? [...DATA.conflicts]
        : DATA.conflicts.filter(c => String(c.tier) === activeTier);
      applySort(filtered);
    });
  });
}

function applySort(rows) {
  const { key, dir } = conflictSort;
  if (key) {
    rows.sort((a, b) => {
      const av = a[key], bv = b[key];
      return typeof av === "string"
        ? av.localeCompare(bv) * dir
        : (av - bv) * dir;
    });
  }
  renderConflictRows(rows);
}

// ─────────────────────────────────────────────────────────────
// CHART 1 — GLOBAL TREND
// ─────────────────────────────────────────────────────────────
function buildTrendChart() {
  const { years, counts } = DATA.global_trend;
  const ctx = document.getElementById("trendChart").getContext("2d");

  charts.trend = new Chart(ctx, {
    type: "line",
    data: {
      labels: years,
      datasets: [{
        data: counts,
        borderColor: RED,
        backgroundColor: "rgba(192,57,43,0.07)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: RED,
        pointHoverRadius: 6,
        borderWidth: 2,
      }],
    },
    options: baseOpts({
      scales: {
        x: baseOpts().scales.x,
        y: {
          ...baseOpts().scales.y,
          min: 40,
          ticks: { ...baseOpts().scales.y.ticks, callback: v => v },
        },
      },
      plugins: {
        ...baseOpts().plugins,
        tooltip: {
          ...baseOpts().plugins.tooltip,
          callbacks: {
            title: ([item]) => `Year: ${item.label}`,
            label: (item) => `Active conflicts: ${item.raw}`,
          },
        },
      },
    }),
  });

  // Toggle line/bar
  document.querySelectorAll('[data-chart="trend"]').forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll('[data-chart="trend"]').forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      charts.trend.config.type = btn.dataset.view;
      charts.trend.update();
    });
  });
}

// ─────────────────────────────────────────────────────────────
// CHART 2 — CASUALTIES (grouped / stacked)
// ─────────────────────────────────────────────────────────────
function buildCasChart() {
  const { labels, killed, wounded } = DATA.ukraine_casualties;
  const ctx = document.getElementById("casChart").getContext("2d");

  charts.cas = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Killed",
          data: killed,
          backgroundColor: [RED_A, BLUE_A],
          borderRadius: 2,
        },
        {
          label: "Wounded",
          data: wounded,
          backgroundColor: ["rgba(192,57,43,0.35)", "rgba(59,111,191,0.35)"],
          borderRadius: 2,
        },
      ],
    },
    options: baseOpts({
      scales: {
        x: baseOpts().scales.x,
        y: {
          ...baseOpts().scales.y,
          ticks: {
            ...baseOpts().scales.y.ticks,
            callback: v => v >= 1e6 ? (v/1e6).toFixed(1)+"M"
                        : v >= 1000 ? (v/1000).toFixed(0)+"K" : v,
          },
        },
      },
      plugins: {
        ...baseOpts().plugins,
        tooltip: {
          ...baseOpts().plugins.tooltip,
          callbacks: {
            label: (item) => ` ${item.dataset.label}: ${(item.raw/1000).toFixed(0)}K`,
          },
        },
      },
    }),
  });

  document.querySelectorAll('[data-chart="cas"]').forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll('[data-chart="cas"]').forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      charts.cas.options.scales.x.stacked = btn.dataset.view === "stacked";
      charts.cas.options.scales.y.stacked = btn.dataset.view === "stacked";
      charts.cas.update();
    });
  });
}

// ─────────────────────────────────────────────────────────────
// CHART 3 — EQUIPMENT LOSSES (grouped / ratio)
// ─────────────────────────────────────────────────────────────
function buildEqChart() {
  const { categories, russia, ukraine } = DATA.equipment_losses;
  const ctx = document.getElementById("eqChart").getContext("2d");

  charts.eq = new Chart(ctx, {
    type: "bar",
    data: {
      labels: categories,
      datasets: [
        { label: "Russia",  data: russia,  backgroundColor: RED_A,  borderRadius: 2 },
        { label: "Ukraine", data: ukraine, backgroundColor: BLUE_A, borderRadius: 2 },
      ],
    },
    options: baseOpts({
      scales: {
        x: { ...baseOpts().scales.x, ticks: { ...baseOpts().scales.x.ticks, maxRotation: 0, font: { size: 9 } } },
        y: { ...baseOpts().scales.y, ticks: { ...baseOpts().scales.y.ticks,
          callback: v => v >= 1000 ? (v/1000).toFixed(0)+"K" : v } },
      },
    }),
  });

  document.querySelectorAll('[data-chart="eq"]').forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll('[data-chart="eq"]').forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (btn.dataset.view === "ratio") {
        const { russia, ukraine } = DATA.equipment_losses;
        charts.eq.data.datasets[0].data = russia.map((r, i) => +(r / ukraine[i]).toFixed(2));
        charts.eq.data.datasets[1].data = ukraine.map(() => 1);
        charts.eq.options.scales.y.ticks.callback = v => v + "×";
      } else {
        charts.eq.data.datasets[0].data = DATA.equipment_losses.russia;
        charts.eq.data.datasets[1].data = DATA.equipment_losses.ukraine;
        charts.eq.options.scales.y.ticks.callback = v => v >= 1000 ? (v/1000).toFixed(0)+"K" : v;
      }
      charts.eq.update();
    });
  });
}

// ─────────────────────────────────────────────────────────────
// CHART 4 — TERRITORY MONTHLY (range selector)
// ─────────────────────────────────────────────────────────────
function buildTerrChart() {
  const { months, gains } = DATA.territory_monthly;
  const colors = gains.map(v => v > 0 ? RED_A : BLUE_A);
  const ctx = document.getElementById("terrChart").getContext("2d");

  charts.terr = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [{
        data: gains,
        backgroundColor: colors,
        borderRadius: 2,
      }],
    },
    options: baseOpts({
      scales: {
        x: { ...baseOpts().scales.x, ticks: { ...baseOpts().scales.x.ticks, maxRotation: 45, font: { size: 9 } } },
        y: { ...baseOpts().scales.y, ticks: { ...baseOpts().scales.y.ticks, callback: v => v + " mi²" } },
      },
      plugins: {
        ...baseOpts().plugins,
        tooltip: {
          ...baseOpts().plugins.tooltip,
          callbacks: {
            title: ([item]) => item.label,
            label: (item) => item.raw > 0
              ? ` Russian gain: ${item.raw} mi²`
              : ` Russian loss: ${Math.abs(item.raw)} mi²`,
          },
        },
      },
    }),
  });

  document.getElementById("terrRange").addEventListener("click", (e) => {
    const btn = e.target.closest(".range-btn");
    if (!btn) return;
    document.querySelectorAll(".range-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const range = btn.dataset.range;
    let filteredMonths, filteredGains;

    if (range === "2025") {
      const idxs = months.reduce((a, m, i) => m.includes("25") ? [...a, i] : a, []);
      filteredMonths = idxs.map(i => months[i]);
      filteredGains  = idxs.map(i => gains[i]);
    } else if (range === "2026") {
      const idxs = months.reduce((a, m, i) => m.includes("26") ? [...a, i] : a, []);
      filteredMonths = idxs.map(i => months[i]);
      filteredGains  = idxs.map(i => gains[i]);
    } else {
      filteredMonths = months;
      filteredGains  = gains;
    }

    charts.terr.data.labels = filteredMonths;
    charts.terr.data.datasets[0].data = filteredGains;
    charts.terr.data.datasets[0].backgroundColor = filteredGains.map(v => v > 0 ? RED_A : BLUE_A);
    charts.terr.update();
  });
}

// ─────────────────────────────────────────────────────────────
// CHART 5 — IRAN (donut / bar toggle)
// ─────────────────────────────────────────────────────────────
function buildIranChart() {
  const { labels, values, colors } = DATA.iran_casualties;
  const ctx = document.getElementById("iranChart").getContext("2d");

  charts.iran = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: PAPER2,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      cutout: "52%",
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: INK4,
            font: { family: "'DM Sans', sans-serif", size: 10 },
            boxWidth: 10,
            padding: 10,
          },
        },
        tooltip: {
          backgroundColor: "#0f0e0c",
          titleColor: "#f5f1ea",
          bodyColor: "rgba(245,241,234,0.72)",
          callbacks: {
            label: (item) => ` ${item.label}: ${item.raw.toLocaleString()}`,
          },
        },
      },
    },
  });

  document.querySelectorAll('[data-chart="iran"]').forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll('[data-chart="iran"]').forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (btn.dataset.view === "bar") {
        charts.iran.config.type = "bar";
        charts.iran.options = baseOpts({
          plugins: {
            ...baseOpts().plugins,
            legend: { display: false },
          },
          scales: {
            x: { ...baseOpts().scales.x, ticks: { ...baseOpts().scales.x.ticks, font: { size: 9 } } },
            y: { ...baseOpts().scales.y },
          },
        });
        charts.iran.data.datasets[0].backgroundColor = colors;
        charts.iran.data.datasets[0].borderWidth = 0;
        charts.iran.data.datasets[0].borderRadius = 2;
        delete charts.iran.data.datasets[0].hoverOffset;
      } else {
        charts.iran.config.type = "doughnut";
        charts.iran.options = {
          responsive: true, maintainAspectRatio: false,
          animation: { duration: 500 },
          cutout: "52%",
          plugins: {
            legend: { display: true, position: "bottom",
              labels: { color: INK4, font: { family: "'DM Sans',sans-serif", size: 10 }, boxWidth: 10, padding: 10 }},
            tooltip: {
              backgroundColor: "#0f0e0c", titleColor: "#f5f1ea",
              bodyColor: "rgba(245,241,234,0.72)",
              callbacks: { label: (i) => ` ${i.label}: ${i.raw.toLocaleString()}` },
            },
          },
        };
        charts.iran.data.datasets[0].borderWidth = 2;
        charts.iran.data.datasets[0].hoverOffset = 8;
      }
      charts.iran.update();
    });
  });
}

// ─────────────────────────────────────────────────────────────
// CHART 6 — CUMULATIVE TERRITORY
// ─────────────────────────────────────────────────────────────
function buildCumulChart() {
  const { labels, values } = DATA.cumulative_territory;
  const ctx = document.getElementById("cumulChart").getContext("2d");

  charts.cumul = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: RED,
        backgroundColor: "rgba(192,57,43,0.07)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: RED,
        pointHoverRadius: 7,
        borderWidth: 2,
      }],
    },
    options: baseOpts({
      scales: {
        x: { ...baseOpts().scales.x, ticks: { ...baseOpts().scales.x.ticks, maxRotation: 35, font: { size: 9 } } },
        y: { ...baseOpts().scales.y,
          ticks: { ...baseOpts().scales.y.ticks, callback: v => (v/1000).toFixed(0)+"K mi²" },
          min: 0,
        },
      },
      plugins: {
        ...baseOpts().plugins,
        tooltip: {
          ...baseOpts().plugins.tooltip,
          callbacks: {
            title: ([item]) => item.label,
            label: (item) => ` Territory held: ${item.raw.toLocaleString()} mi²`,
          },
        },
      },
    }),
  });
}

// ─────────────────────────────────────────────────────────────
// SCROLL — Active nav spy
// ─────────────────────────────────────────────────────────────
function setupNavSpy() {
  const sections = document.querySelectorAll("[data-section]");
  const links    = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(l => {
            l.classList.toggle("active", l.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );

  sections.forEach(s => observer.observe(s));
}

// ─────────────────────────────────────────────────────────────
// SCROLL — Fade-up animations
// ─────────────────────────────────────────────────────────────
function setupScrollAnimations() {
  const elements = document.querySelectorAll("[data-animate]");

  // Apply delay from data-delay attribute
  elements.forEach(el => {
    const delay = el.dataset.delay || 0;
    el.style.transitionDelay = `${delay}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -60px 0px", threshold: 0.1 }
  );

  elements.forEach(el => observer.observe(el));
}

// ─────────────────────────────────────────────────────────────
// MASTHEAD — Add shadow on scroll
// ─────────────────────────────────────────────────────────────
function setupMastheadScroll() {
  const masthead = document.querySelector(".masthead");
  const onScroll = () => {
    masthead.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}

// ─────────────────────────────────────────────────────────────
// FALLBACK DATA (used if fetch fails — e.g. opened as file://)
// ─────────────────────────────────────────────────────────────
const FALLBACK_DATA = {
  headline_stats: [
    { value: "~130", label: "Active armed conflicts worldwide" },
    { value: "2M+",  label: "Ukraine war casualties (est.)" },
    { value: "20%",  label: "Ukrainian territory under Russian control" },
    { value: "2,000+", label: "Killed in 2026 Iran conflict" },
  ],
  conflicts: [
    { name: "Russia – Ukraine",    region: "Eastern Europe", tier: 1, intensity: 100, status: "Year 4 — Attrition",   since: 2022 },
    { name: "Israel – Gaza",       region: "Middle East",    tier: 1, intensity: 97,  status: "Active combat",         since: 2023 },
    { name: "US / Israel – Iran",  region: "Middle East",    tier: 1, intensity: 94,  status: "Erupted Feb. 2026",     since: 2026 },
    { name: "North Korea tensions",region: "East Asia",      tier: 1, intensity: 80,  status: "Escalatory risk",       since: 2023 },
    { name: "Sudan civil war",     region: "Africa",         tier: 2, intensity: 75,  status: "Ongoing since 2023",    since: 2023 },
    { name: "West Bank",           region: "Middle East",    tier: 2, intensity: 68,  status: "Active raids",          since: 2023 },
    { name: "Myanmar",             region: "SE Asia",        tier: 2, intensity: 58,  status: "Civil war ongoing",     since: 2021 },
    { name: "DRC / Sahel",         region: "Africa",         tier: 3, intensity: 45,  status: "Fragmented groups",     since: 2012 },
  ],
  global_trend: {
    years:  [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2026],
    counts: [52,55,59,65,72,79,84,88,93,96,102,108,118,124,130,130],
  },
  ukraine_casualties: {
    labels:  ["Russia", "Ukraine"],
    killed:  [400000, 100000],
    wounded: [800000, 450000],
  },
  equipment_losses: {
    categories: ["Tanks & vehicles", "Aircraft", "Naval vessels"],
    russia:  [13855, 339, 29],
    ukraine: [5571,  194, 42],
  },
  territory_monthly: {
    months: ["Jan 25","Feb 25","Mar 25","Apr 25","May 25","Jun 25","Jul 25","Aug 25","Sep 25","Oct 25","Nov 25","Dec 25","Jan 26","Feb 26","Mar 26*"],
    gains:  [180,190,171,130,160,155,145,190,210,180,200,74,106,50,-57],
  },
  iran_casualties: {
    labels: ["Killed in Iran","Killed in Lebanon","Killed in Israel","Displaced (×1000s)"],
    values: [1700,200,100,300],
    colors: ["#c0392b","#b5680a","#3b6fbf","#5a7a3a"],
  },
  cumulative_territory: {
    labels: ["Feb 22","Jun 22","Oct 22","Feb 23","Jun 23","Oct 23","Feb 24","Jun 24","Oct 24","Feb 25","Jun 25","Oct 25","Dec 25","Mar 26"],
    values: [3000,18000,22000,24000,24500,25200,25800,26800,27600,28400,29000,29100,29100,29183],
  },
};

// ─────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
