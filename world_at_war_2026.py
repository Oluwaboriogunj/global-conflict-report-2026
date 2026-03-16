"""
The World at War — March 2026
=================================
Reproduces all six charts from the editorial HTML report using matplotlib.
Each chart is saved as a high-resolution PNG and all six are composed into
a single multi-panel figure (world_at_war_2026_charts.png).

Data sources:
  - CFR Preventive Priorities Survey 2026
  - Center for Strategic and International Studies (CSIS), Jan. 2026
  - Russia Matters / Institute for the Study of War (ISW), March 2026
  - Al Jazeera, Feb. 2026 · ICRC Humanitarian Outlook 2026
  - ACLED armed conflict data
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.ticker as mticker
import numpy as np
from pathlib import Path

# ── Output directory ──────────────────────────────────────────────────────────
OUT = Path("war_charts")
OUT.mkdir(exist_ok=True)

# ── Colour palette (mirrors the HTML CSS variables) ───────────────────────────
RED        = "#c0392b"
RED_LIGHT  = "#f5e8e7"
BLUE       = "#3b6fbf"
AMBER      = "#b5680a"
GREEN      = "#5a7a3a"
INK        = "#0f0e0c"
INK2       = "#2c2b28"
INK3       = "#5a5751"
INK4       = "#8a8780"
PAPER      = "#f5f1ea"
PAPER2     = "#ede8df"
PAPER3     = "#e2dcd1"

# ── Global matplotlib style ───────────────────────────────────────────────────
plt.rcParams.update({
    "figure.facecolor":     PAPER,
    "axes.facecolor":       PAPER2,
    "axes.edgecolor":       PAPER3,
    "axes.linewidth":       0.6,
    "axes.grid":            True,
    "grid.color":           PAPER3,
    "grid.linewidth":       0.5,
    "grid.alpha":           1.0,
    "xtick.color":          INK4,
    "ytick.color":          INK4,
    "xtick.labelsize":      8,
    "ytick.labelsize":      8,
    "xtick.major.size":     0,
    "ytick.major.size":     0,
    "font.family":          "serif",
    "font.size":            9,
    "axes.spines.top":      False,
    "axes.spines.right":    False,
    "axes.spines.left":     False,
    "axes.spines.bottom":   False,
    "legend.frameon":       False,
    "legend.fontsize":      8,
})


def label_style(ax, title: str, subtitle: str = "") -> None:
    """Apply consistent title/subtitle styling to an axes."""
    ax.set_title(title, loc="left", fontsize=9, fontweight="bold",
                 color=INK2, pad=8, fontfamily="sans-serif")
    if subtitle:
        ax.text(0, 1.04, subtitle, transform=ax.transAxes,
                fontsize=7, color=INK4, fontfamily="sans-serif")


def source_note(ax, text: str) -> None:
    """Add a small source note below an axes."""
    ax.text(0, -0.18, text, transform=ax.transAxes,
            fontsize=6.5, color=INK4, fontfamily="sans-serif")


# ══════════════════════════════════════════════════════════════════════════════
# 1. GLOBAL ARMED CONFLICTS — TREND LINE
# ══════════════════════════════════════════════════════════════════════════════
def chart_global_trend(ax=None, standalone=True):
    years = [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,
             2020,2021,2022,2023,2024,2026]
    count = [52,55,59,65,72,79,84,88,93,96,102,108,118,124,130,130]

    if ax is None:
        fig, ax = plt.subplots(figsize=(8, 3.6), facecolor=PAPER)

    ax.fill_between(years, count, alpha=0.08, color=RED)
    ax.plot(years, count, color=RED, linewidth=1.8, solid_capstyle="round")
    ax.scatter(years, count, color=RED, s=18, zorder=5)

    # Annotate final point
    ax.annotate("~130 conflicts", xy=(2026, 130), xytext=(-60, -18),
                textcoords="offset points", fontsize=7.5, color=RED,
                fontfamily="sans-serif",
                arrowprops=dict(arrowstyle="-", color=RED, lw=0.8))

    ax.set_xlim(2009, 2027)
    ax.set_ylim(40, 145)
    ax.set_xticks(years[::2])
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"{int(v)}"))

    label_style(ax, "Global Armed Conflicts — Long-run Count",
                "Number of active armed conflicts worldwide, 2010–2026")
    source_note(ax, "Source: ACLED · ICRC Humanitarian Outlook 2026")

    if standalone:
        plt.tight_layout()
        path = OUT / "01_global_trend.png"
        plt.savefig(path, dpi=180, bbox_inches="tight", facecolor=PAPER)
        plt.close()
        print(f"  Saved {path}")
    return ax


# ══════════════════════════════════════════════════════════════════════════════
# 2. UKRAINE — MILITARY CASUALTIES BY SIDE
# ══════════════════════════════════════════════════════════════════════════════
def chart_casualties(ax=None, standalone=True):
    labels = ["Russia", "Ukraine"]
    values = [1_200_000, 550_000]
    colors = [RED, BLUE]

    if ax is None:
        fig, ax = plt.subplots(figsize=(4.2, 3.4), facecolor=PAPER)

    bars = ax.bar(labels, values, color=colors, width=0.45,
                  edgecolor="none", zorder=3)

    # Value labels on bars
    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width() / 2,
                bar.get_height() + 18_000,
                f"{val/1_000_000:.1f}M" if val >= 1_000_000 else f"{val//1000}K",
                ha="center", va="bottom", fontsize=8.5, color=INK2,
                fontfamily="sans-serif", fontweight="bold")

    ax.set_ylim(0, 1_500_000)
    ax.yaxis.set_major_formatter(
        mticker.FuncFormatter(lambda v, _:
            f"{v/1e6:.1f}M" if v >= 1e6 else f"{int(v/1000)}K" if v >= 1000 else ""))

    legend_patches = [mpatches.Patch(color=c, label=l)
                      for c, l in zip(colors, labels)]
    ax.legend(handles=legend_patches, loc="upper right")

    label_style(ax, "Military Casualties by Side",
                "Estimated killed & wounded, Feb. 2022 – Dec. 2025")
    source_note(ax, "Source: CSIS Jan. 2026 · Al Jazeera Feb. 2026")

    if standalone:
        plt.tight_layout()
        path = OUT / "02_casualties.png"
        plt.savefig(path, dpi=180, bbox_inches="tight", facecolor=PAPER)
        plt.close()
        print(f"  Saved {path}")
    return ax


# ══════════════════════════════════════════════════════════════════════════════
# 3. UKRAINE — EQUIPMENT LOSSES
# ══════════════════════════════════════════════════════════════════════════════
def chart_equipment(ax=None, standalone=True):
    categories = ["Tanks &\nvehicles", "Aircraft", "Naval\nvessels"]
    russia  = [13_855, 339, 29]
    ukraine = [5_571,  194, 42]
    x = np.arange(len(categories))
    w = 0.32

    if ax is None:
        fig, ax = plt.subplots(figsize=(4.2, 3.4), facecolor=PAPER)

    bars_r = ax.bar(x - w/2, russia,  width=w, color=RED,  edgecolor="none",
                    label="Russia",  zorder=3)
    bars_u = ax.bar(x + w/2, ukraine, width=w, color=BLUE, edgecolor="none",
                    label="Ukraine", zorder=3)

    for bar, val in zip(list(bars_r) + list(bars_u),
                        russia + ukraine):
        label = f"{val/1000:.1f}K" if val >= 1000 else str(val)
        ax.text(bar.get_x() + bar.get_width() / 2,
                bar.get_height() + 80,
                label, ha="center", va="bottom",
                fontsize=7, color=INK2, fontfamily="sans-serif")

    ax.set_xticks(x)
    ax.set_xticklabels(categories, fontsize=8)
    ax.yaxis.set_major_formatter(
        mticker.FuncFormatter(lambda v, _:
            f"{int(v/1000)}K" if v >= 1000 else int(v)))
    ax.legend(loc="upper right")

    label_style(ax, "Equipment Losses",
                "Tanks, aircraft & naval vessels destroyed")
    source_note(ax, "Source: Russia Matters / ISW data, Feb. 2026")

    if standalone:
        plt.tight_layout()
        path = OUT / "03_equipment.png"
        plt.savefig(path, dpi=180, bbox_inches="tight", facecolor=PAPER)
        plt.close()
        print(f"  Saved {path}")
    return ax


# ══════════════════════════════════════════════════════════════════════════════
# 4. UKRAINE — MONTHLY TERRITORIAL GAINS / LOSSES
# ══════════════════════════════════════════════════════════════════════════════
def chart_territory_monthly(ax=None, standalone=True):
    months = ["Jan 25","Feb 25","Mar 25","Apr 25","May 25","Jun 25","Jul 25",
              "Aug 25","Sep 25","Oct 25","Nov 25","Dec 25",
              "Jan 26","Feb 26","Mar 26*"]
    gains  = [180,190,171,130,160,155,145,190,210,180,200,74,106,50,-57]

    colors = [RED if v > 0 else BLUE for v in gains]
    x = np.arange(len(months))

    if ax is None:
        fig, ax = plt.subplots(figsize=(8, 3.6), facecolor=PAPER)

    ax.bar(x, gains, color=colors, edgecolor="none", zorder=3, width=0.7)
    ax.axhline(0, color=INK3, linewidth=0.7, zorder=4)

    ax.set_xticks(x)
    ax.set_xticklabels(months, rotation=45, ha="right", fontsize=7.5)
    ax.yaxis.set_major_formatter(
        mticker.FuncFormatter(lambda v, _: f"{int(v)} mi²"))

    legend_patches = [
        mpatches.Patch(color=RED,  label="Russian gains"),
        mpatches.Patch(color=BLUE, label="Russian losses"),
    ]
    ax.legend(handles=legend_patches, loc="upper right")

    label_style(ax, "Russian Territorial Gains/Losses — sq miles per month",
                "Net change in Russian control, 2025 – early 2026")
    source_note(ax, "Source: Russia Matters analysis of ISW data, March 2026  "
                    "  * partial month")

    if standalone:
        plt.tight_layout()
        path = OUT / "04_territory_monthly.png"
        plt.savefig(path, dpi=180, bbox_inches="tight", facecolor=PAPER)
        plt.close()
        print(f"  Saved {path}")
    return ax


# ══════════════════════════════════════════════════════════════════════════════
# 5. IRAN WAR — CASUALTIES BY LOCATION
# ══════════════════════════════════════════════════════════════════════════════
def chart_iran(ax=None, standalone=True):
    labels = ["Killed in Iran", "Killed in Lebanon",
              "Killed in Israel", "Displaced (×1 000s)"]
    values = [1_700, 200, 100, 300]
    colors = [RED, AMBER, BLUE, GREEN]

    if ax is None:
        fig, ax = plt.subplots(figsize=(4.8, 3.6), facecolor=PAPER)

    wedges, texts, autotexts = ax.pie(
        values,
        labels=None,
        colors=colors,
        autopct="%1.0f%%",
        startangle=140,
        pctdistance=0.72,
        wedgeprops=dict(linewidth=1.8, edgecolor=PAPER2),
    )
    for at in autotexts:
        at.set_fontsize(8)
        at.set_color("white")
        at.set_fontfamily("sans-serif")

    # Draw as donut
    centre = plt.Circle((0, 0), 0.48, color=PAPER2)
    ax.add_patch(centre)

    legend_patches = [mpatches.Patch(color=c, label=f"{l}  ({v:,})")
                      for c, l, v in zip(colors, labels, values)]
    ax.legend(handles=legend_patches, loc="lower center",
              bbox_to_anchor=(0.5, -0.18), ncol=2, fontsize=7.5)

    label_style(ax, "2026 Iran War — Casualties by Location",
                "Feb. 28 – Mar. 17, 2026 (estimated)")
    source_note(ax, "Source: CSIS · Britannica · Al Jazeera")

    if standalone:
        plt.tight_layout()
        path = OUT / "05_iran_casualties.png"
        plt.savefig(path, dpi=180, bbox_inches="tight", facecolor=PAPER)
        plt.close()
        print(f"  Saved {path}")
    return ax


# ══════════════════════════════════════════════════════════════════════════════
# 6. UKRAINE — CUMULATIVE RUSSIAN TERRITORIAL CONTROL
# ══════════════════════════════════════════════════════════════════════════════
def chart_cumulative_territory(ax=None, standalone=True):
    labels = ["Feb 22","Jun 22","Oct 22","Feb 23","Jun 23","Oct 23",
              "Feb 24","Jun 24","Oct 24","Feb 25","Jun 25","Oct 25",
              "Dec 25","Mar 26"]
    data   = [3_000,18_000,22_000,24_000,24_500,25_200,
              25_800,26_800,27_600,28_400,29_000,29_100,
              29_100,29_183]
    x = np.arange(len(labels))

    if ax is None:
        fig, ax = plt.subplots(figsize=(8, 3.6), facecolor=PAPER)

    ax.fill_between(x, data, alpha=0.08, color=RED)
    ax.plot(x, data, color=RED, linewidth=1.8, solid_capstyle="round")
    ax.scatter(x, data, color=RED, s=18, zorder=5)

    ax.annotate("29,183 mi²\n(Mar 26)", xy=(13, 29_183),
                xytext=(-75, -22), textcoords="offset points",
                fontsize=7.5, color=RED, fontfamily="sans-serif",
                arrowprops=dict(arrowstyle="-", color=RED, lw=0.8))

    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=35, ha="right", fontsize=7.5)
    ax.yaxis.set_major_formatter(
        mticker.FuncFormatter(lambda v, _: f"{int(v/1000)}K mi²"))
    ax.set_ylim(0, 34_000)

    label_style(ax, "Cumulative Russian Territorial Control",
                "Total sq miles held since Feb. 2022 (incl. pre-invasion Crimea baseline)")
    source_note(ax, "Source: Russia Matters / ISW, March 2026")

    if standalone:
        plt.tight_layout()
        path = OUT / "06_cumulative_territory.png"
        plt.savefig(path, dpi=180, bbox_inches="tight", facecolor=PAPER)
        plt.close()
        print(f"  Saved {path}")
    return ax


# ══════════════════════════════════════════════════════════════════════════════
# MULTI-PANEL FIGURE  — all six charts on one page
# ══════════════════════════════════════════════════════════════════════════════
def build_multi_panel():
    fig = plt.figure(figsize=(16, 18), facecolor=PAPER)

    # --- Title block ---
    fig.text(0.5, 0.975, "THE WORLD AT WAR — MARCH 2026",
             ha="center", va="top", fontsize=20, fontweight="bold",
             color=INK, fontfamily="serif")
    fig.text(0.5, 0.962, "Nine major armed conflicts · Data visualisation companion",
             ha="center", va="top", fontsize=11, color=INK3,
             fontfamily="sans-serif", style="italic")

    # Thin red rule under title
    fig.add_artist(plt.Line2D([0.08, 0.92], [0.955, 0.955],
                              transform=fig.transFigure,
                              color=RED, linewidth=1.2))

    # --- Axes layout ---
    gs = fig.add_gridspec(
        4, 2,
        top=0.945, bottom=0.04,
        left=0.07, right=0.96,
        hspace=0.58, wspace=0.28
    )

    ax1 = fig.add_subplot(gs[0, :])   # full-width: global trend
    ax2 = fig.add_subplot(gs[1, 0])   # casualties
    ax3 = fig.add_subplot(gs[1, 1])   # equipment
    ax4 = fig.add_subplot(gs[2, :])   # monthly territory
    ax5 = fig.add_subplot(gs[3, 0])   # iran
    ax6 = fig.add_subplot(gs[3, 1])   # cumulative territory

    chart_global_trend(ax=ax1,           standalone=False)
    chart_casualties(ax=ax2,             standalone=False)
    chart_equipment(ax=ax3,              standalone=False)
    chart_territory_monthly(ax=ax4,      standalone=False)
    chart_iran(ax=ax5,                   standalone=False)
    chart_cumulative_territory(ax=ax6,   standalone=False)

    # Footer
    fig.text(0.5, 0.014,
             "Sources: CFR Preventive Priorities Survey 2026 · CSIS Jan. 2026 · "
             "Russia Matters/ISW March 2026 · Al Jazeera Feb. 2026 · "
             "ICRC Humanitarian Outlook 2026 · ACLED · Britannica. "
             "All casualty figures are estimates.",
             ha="center", fontsize=6.5, color=INK4, fontfamily="sans-serif")

    path = OUT / "world_at_war_2026_all_charts.png"
    fig.savefig(path, dpi=180, bbox_inches="tight", facecolor=PAPER)
    plt.close()
    print(f"\n  ✓ Multi-panel saved → {path}")
    return path


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("Rendering individual charts …")
    chart_global_trend()
    chart_casualties()
    chart_equipment()
    chart_territory_monthly()
    chart_iran()
    chart_cumulative_territory()

    print("\nComposing multi-panel figure …")
    build_multi_panel()

    print(f"\nDone. All files written to  ./{OUT}/")
