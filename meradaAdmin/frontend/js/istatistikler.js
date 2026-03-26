(() => {
const cfg = window.MERADA_CONFIG || {};
const RAW_API =
  cfg.API_URL ||
  "http://127.0.0.1:5000";

const API_BASE = RAW_API.replace(/\/+$/, "");
const TOKEN_KEY = cfg.TOKEN_KEY || "adminToken";
  const state = {
    currentRange: 6,
    records: [],
    filteredRecords: [],
    overview: {
      totalProperties: 0,
      totalChanges: 0,
      increaseCount: 0,
      decreaseCount: 0,
      neutralCount: 0,
      totalVolume: 0
    },
    chartData: {
      6: [],
      12: []
    }
  };

  const el = {
    summaryCards: document.getElementById("summaryCards"),
    chartArea: document.getElementById("chartArea"),
    chartTooltip: document.getElementById("chartTooltip"),
    recentActivity: document.getElementById("recentActivity"),
    historyTableBody: document.getElementById("historyTableBody"),
    tableCount: document.getElementById("tableCount"),
    searchInput: document.getElementById("searchInput"),
    changeTypeFilter: document.getElementById("changeTypeFilter"),
    userFilter: document.getElementById("userFilter"),
    startDateFilter: document.getElementById("startDateFilter"),
    endDateFilter: document.getElementById("endDateFilter"),
    btnClearFilters: document.getElementById("btnClearFilters"),
    btnRefresh: document.getElementById("btnRefresh"),
    btnExport: document.getElementById("btnExport"),
    detailDrawer: document.getElementById("detailDrawer"),
    drawerOverlay: document.getElementById("drawerOverlay"),
    closeDrawer: document.getElementById("closeDrawer"),
    drawerContent: document.getElementById("drawerContent")
  };

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function authHeaders() {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  function formatPrice(value, currency = "₺") {
    return `${Number(value || 0).toLocaleString("tr-TR")} ${currency === "TRY" ? "₺" : currency}`;
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function timeAgo(value) {
    const now = new Date();
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Az önce";
    if (diffHours < 24) return `${diffHours} saat önce`;
    return `${diffDays} gün önce`;
  }

  function getChangeAmount(record) {
    return Number(record.newPrice || 0) - Number(record.oldPrice || 0);
  }

  function getChangePercent(record) {
    const oldPrice = Number(record.oldPrice || 0);
    if (!oldPrice) return 0;
    return (getChangeAmount(record) / oldPrice) * 100;
  }

  function getChangeBadge(type) {
    if (type === "increase") {
      return `<span class="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs">Artış</span>`;
    }
    if (type === "decrease") {
      return `<span class="inline-flex items-center px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-semibold text-xs">Düşüş</span>`;
    }
    return `<span class="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-xs">Düzeltme</span>`;
  }

  function monthLabel(dateStr) {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(d);
  }

  function buildChartData(records, monthsCount) {
    const now = new Date();
    const buckets = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.push({
        key,
        label: monthLabel(d),
        value: 0
      });
    }

    records.forEach(item => {
      const d = new Date(item.changedAt);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const bucket = buckets.find(x => x.key === key);
      if (bucket) bucket.value += 1;
    });

    return buckets.map(({ label, value }) => ({ label, value }));
  }

  function recalcOverview(records) {
    const totalChanges = records.length;
    const increaseCount = records.filter(item => item.changeType === "increase").length;
    const decreaseCount = records.filter(item => item.changeType === "decrease").length;
    const neutralCount = records.filter(item => item.changeType === "neutral").length;
    const totalVolume = records.reduce((sum, item) => sum + Math.abs(getChangeAmount(item)), 0);

    return {
      totalProperties: state.overview.totalProperties || 0,
      totalChanges,
      increaseCount,
      decreaseCount,
      neutralCount,
      totalVolume
    };
  }

  async function fetchStatsData() {
    const token = getToken();
    if (!token) {
      alert("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
      return;
    }

    try {
      const [overviewRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/api/stats/dashboard`, {
          headers: authHeaders()
        }),
        fetch(`${API_BASE}/api/price-history`, {
          headers: authHeaders()
        })
      ]);

      if (!overviewRes.ok) {
        const err = await overviewRes.json().catch(() => ({}));
        throw new Error(err.error || "İstatistik özeti alınamadı");
      }

      if (!historyRes.ok) {
        const err = await historyRes.json().catch(() => ({}));
        throw new Error(err.error || "Fiyat geçmişi alınamadı");
      }

      const overview = await overviewRes.json();
      const history = await historyRes.json();

      state.overview = {
        totalProperties: Number(overview.totalProperties || 0),
        totalChanges: Number(overview.totalChanges || 0),
        increaseCount: Number(overview.increaseCount || 0),
        decreaseCount: Number(overview.decreaseCount || 0),
        neutralCount: Number(overview.neutralCount || 0),
        totalVolume: Number(overview.totalVolume || 0)
      };

      state.records = Array.isArray(history)
        ? history.map((item, index) => ({
            id: item.id ?? index + 1,
            listingId: item.listingId ?? "",
            portfolioNo: item.portfolioNo || item.listingId || "",
            title: item.title || "Başlıksız İlan",
            location: item.location || "-",
            owner: {
              name: item.owner?.name || "",
              phone: item.owner?.phone || "",
              email: item.owner?.email || ""
            },
            oldPrice: Number(item.oldPrice || 0),
            newPrice: Number(item.newPrice || 0),
            currency: item.currency || "TRY",
            changeType: item.changeType || "neutral",
            reason: item.reason || "-",
            changedAt: item.changedAt || null,
            changedBy: item.changedBy || "-",
            notes: item.notes || ""
          }))
        : [];

      state.filteredRecords = [...state.records];
      state.chartData[6] = buildChartData(state.records, 6);
      state.chartData[12] = buildChartData(state.records, 12);

      renderUserOptions();
      renderSummaryCards();
      renderChart();
      renderRecentActivity();
      renderTable();
    } catch (err) {
      console.error("istatistik verisi alınamadı:", err);
      alert(err.message || "Veriler alınamadı.");
    }
  }

  function renderSummaryCards() {
    if (!el.summaryCards) return;

    const dynamicOverview = recalcOverview(state.filteredRecords);
    const cards = [
      {
        title: "Toplam İlan",
        value: dynamicOverview.totalProperties,
        note: "Veritabanındaki aktif ilan sayısı",
        tone: "bg-slate-900 text-white"
      },
      {
        title: "Toplam Değişim",
        value: dynamicOverview.totalChanges,
        note: "Filtreye uyan kayıt",
        tone: "bg-white text-slate-900 border border-slate-200"
      },
      {
        title: "Artış",
        value: dynamicOverview.increaseCount,
        note: "Fiyatı yükselen ilanlar",
        tone: "bg-white text-slate-900 border border-slate-200"
      },
      {
        title: "Düşüş",
        value: dynamicOverview.decreaseCount,
        note: "Fiyatı düşen ilanlar",
        tone: "bg-white text-slate-900 border border-slate-200"
      },
      {
        title: "Toplam Hacim",
        value: formatPrice(dynamicOverview.totalVolume),
        note: "Mutlak farkların toplamı",
        tone: "bg-merada-50 text-merada-900 border border-merada-100"
      }
    ];

    el.summaryCards.innerHTML = cards.map(card => `
      <div class="rounded-3xl p-5 shadow-soft ${card.tone}">
        <p class="text-sm font-medium opacity-80">${card.title}</p>
        <h3 class="mt-3 text-2xl lg:text-3xl font-extrabold">${card.value}</h3>
        <p class="mt-2 text-sm opacity-70">${card.note}</p>
      </div>
    `).join("");
  }

  function buildLineChartSVG(data) {
    const width = 900;
    const height = 280;
    const padding = { top: 20, right: 20, bottom: 40, left: 20 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    if (!data.length) {
      return `
        <svg viewBox="0 0 ${width} ${height}" class="w-full h-full">
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-size="16">
            Grafik verisi yok
          </text>
        </svg>
      `;
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const minValue = 0;
    const stepX = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;

    const points = data.map((item, index) => {
      const x = padding.left + (index * stepX);
      const y = padding.top + innerHeight - ((item.value - minValue) / (maxValue - minValue || 1)) * innerHeight;
      return { ...item, x, y };
    });

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`;

    const gridLines = 4;
    const gridSvg = Array.from({ length: gridLines + 1 }).map((_, i) => {
      const y = padding.top + (innerHeight / gridLines) * i;
      return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="4 4" />`;
    }).join("");

    const labelsSvg = points.map(p => `
      <text x="${p.x}" y="${height - 12}" text-anchor="middle" font-size="12" fill="#64748b">${p.label}</text>
    `).join("");

    const pointsSvg = points.map((p, index) => `
      <g class="chart-point" data-index="${index}" data-label="${p.label}" data-value="${p.value}">
        <circle cx="${p.x}" cy="${p.y}" r="6" fill="#24301a" class="cursor-pointer transition-all duration-200"></circle>
        <circle cx="${p.x}" cy="${p.y}" r="12" fill="transparent" class="cursor-pointer"></circle>
      </g>
    `).join("");

    return `
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#7f945d" stop-opacity="0.35"></stop>
            <stop offset="100%" stop-color="#7f945d" stop-opacity="0.02"></stop>
          </linearGradient>
        </defs>

        ${gridSvg}
        <path d="${areaPath}" fill="url(#areaGradient)"></path>
        <path d="${linePath}" fill="none" stroke="#24301a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
        ${pointsSvg}
        ${labelsSvg}
      </svg>
    `;
  }

  function attachChartHover() {
    const points = el.chartArea.querySelectorAll(".chart-point");
    if (!points.length || !el.chartTooltip) return;

    points.forEach(point => {
      point.addEventListener("mouseenter", (event) => {
        const label = point.dataset.label;
        const value = point.dataset.value;
        el.chartTooltip.innerHTML = `<div class="font-semibold">${label}</div><div>${value} değişim</div>`;
        el.chartTooltip.classList.remove("hidden");

        const rect = el.chartArea.getBoundingClientRect();
        const targetRect = event.target.getBoundingClientRect();

        el.chartTooltip.style.left = `${targetRect.left - rect.left - 20}px`;
        el.chartTooltip.style.top = `${targetRect.top - rect.top - 48}px`;

        const circle = point.querySelector("circle");
        if (circle) circle.setAttribute("r", "8");
      });

      point.addEventListener("mouseleave", () => {
        el.chartTooltip.classList.add("hidden");
        const circle = point.querySelector("circle");
        if (circle) circle.setAttribute("r", "6");
      });
    });
  }

  function renderChart() {
    if (!el.chartArea) return;
    const data = state.chartData[state.currentRange] || [];
    el.chartArea.innerHTML = buildLineChartSVG(data);

    document.querySelectorAll(".chart-range-btn").forEach(btn => {
      const isActive = Number(btn.dataset.range) === state.currentRange;
      btn.className = isActive
        ? "chart-range-btn px-4 py-2 rounded-xl text-sm font-semibold bg-white text-slate-900 shadow-sm"
        : "chart-range-btn px-4 py-2 rounded-xl text-sm font-semibold text-slate-500";
    });

    attachChartHover();
  }

  function renderRecentActivity() {
    if (!el.recentActivity) return;

    const rows = state.filteredRecords
      .slice()
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
      .slice(0, 6);

    el.recentActivity.innerHTML = rows.length
      ? rows.map(item => {
          const amount = getChangeAmount(item);
          const amountClass = amount > 0 ? "text-emerald-600" : amount < 0 ? "text-rose-600" : "text-amber-600";

          return `
            <button data-detail-id="${item.id}" class="detail-trigger w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-merada-300 hover:bg-slate-50 transition">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h4 class="font-bold text-slate-900 truncate">${escapeHtml(item.title)}</h4>
                  <p class="text-sm text-slate-500 mt-1">${escapeHtml(item.changedBy)} • ${timeAgo(item.changedAt)}</p>
                </div>
                ${getChangeBadge(item.changeType)}
              </div>

              <div class="mt-3 text-sm flex items-center justify-between gap-3">
                <span class="text-slate-500">${formatPrice(item.oldPrice, item.currency)} → ${formatPrice(item.newPrice, item.currency)}</span>
                <span class="font-bold ${amountClass}">${amount > 0 ? "+" : ""}${formatPrice(amount, item.currency)}</span>
              </div>
            </button>
          `;
        }).join("")
      : `
        <div class="p-6 rounded-2xl bg-slate-50 text-slate-500 text-sm">
          Son hareket bulunamadı.
        </div>
      `;
  }

  function renderTable() {
    if (!el.historyTableBody || !el.tableCount) return;

    const rows = state.filteredRecords
      .slice()
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));

    el.tableCount.textContent = `${rows.length} kayıt`;

    if (!rows.length) {
      el.historyTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="px-5 py-14 text-center">
            <div class="max-w-md mx-auto">
              <div class="text-5xl mb-4">📭</div>
              <h3 class="text-lg font-bold text-slate-900">Kayıt bulunamadı</h3>
              <p class="text-slate-500 mt-2">Filtreye uygun sonuç yok.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    el.historyTableBody.innerHTML = rows.map(item => {
      const amount = getChangeAmount(item);
      const percent = getChangePercent(item);
      const amountClass = amount > 0 ? "text-emerald-600" : amount < 0 ? "text-rose-600" : "text-amber-600";

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="px-5 py-4 align-top">
            <div class="min-w-[240px]">
              <div class="font-bold text-slate-900">${escapeHtml(item.title)}</div>
              <div class="text-xs text-slate-500 mt-1">${escapeHtml(String(item.portfolioNo || "-"))} • ${escapeHtml(item.location || "-")}</div>
            </div>
          </td>

          <td class="px-5 py-4 whitespace-nowrap font-medium">${formatPrice(item.oldPrice, item.currency)}</td>
          <td class="px-5 py-4 whitespace-nowrap font-semibold text-slate-900">${formatPrice(item.newPrice, item.currency)}</td>

          <td class="px-5 py-4">
            <div class="font-bold ${amountClass}">${amount > 0 ? "+" : ""}${formatPrice(amount, item.currency)}</div>
            <div class="text-xs text-slate-500 mt-1">${percent > 0 ? "+" : ""}${percent.toFixed(2)}%</div>
          </td>

          <td class="px-5 py-4 text-slate-600 min-w-[220px]">${escapeHtml(item.reason || "-")}</td>
          <td class="px-5 py-4 whitespace-nowrap text-slate-500">${formatDate(item.changedAt)}</td>
          <td class="px-5 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
              ${escapeHtml(item.changedBy || "-")}
            </span>
          </td>
          <td class="px-5 py-4">
            <button data-detail-id="${item.id}" class="detail-trigger px-4 py-2 rounded-2xl bg-slate-100 hover:bg-merada-900 hover:text-white transition font-semibold">
              Detay
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  function renderUserOptions() {
    if (!el.userFilter) return;
    const users = [...new Set(state.records.map(item => item.changedBy).filter(Boolean))];

    el.userFilter.innerHTML = `
      <option value="">Tümü</option>
      ${users.map(user => `<option value="${escapeHtml(user)}">${escapeHtml(user)}</option>`).join("")}
    `;
  }

  function applyFilters() {
    const search = (el.searchInput?.value || "").trim().toLowerCase();
    const changeType = el.changeTypeFilter?.value || "";
    const user = el.userFilter?.value || "";
    const startDate = el.startDateFilter?.value || "";
    const endDate = el.endDateFilter?.value || "";

    state.filteredRecords = state.records.filter(item => {
      const searchable = [
        item.title,
        item.portfolioNo,
        item.location,
        item.owner?.name,
        item.changedBy,
        item.reason,
        item.notes
      ].join(" ").toLowerCase();

      const changedDate = new Date(item.changedAt);

      const matchesSearch = !search || searchable.includes(search);
      const matchesType = !changeType || item.changeType === changeType;
      const matchesUser = !user || item.changedBy === user;
      const matchesStart = !startDate || changedDate >= new Date(`${startDate}T00:00:00`);
      const matchesEnd = !endDate || changedDate <= new Date(`${endDate}T23:59:59`);

      return matchesSearch && matchesType && matchesUser && matchesStart && matchesEnd;
    });

    renderSummaryCards();
    renderRecentActivity();
    renderTable();
  }

  function openDrawer(id) {
    if (!el.detailDrawer || !el.drawerContent) return;

    const item = state.records.find(record => String(record.id) === String(id));
    if (!item) return;

    const amount = getChangeAmount(item);
    const percent = getChangePercent(item);
    const amountClass = amount > 0 ? "text-emerald-600" : amount < 0 ? "text-rose-600" : "text-amber-600";

    el.drawerContent.innerHTML = `
      <div class="rounded-3xl bg-slate-900 text-white p-5">
        <p class="text-xs uppercase tracking-[0.18em] text-white/70">${escapeHtml(String(item.portfolioNo || "-"))}</p>
        <h4 class="mt-2 text-2xl font-extrabold">${escapeHtml(item.title)}</h4>
        <p class="mt-2 text-white/70">${escapeHtml(item.location || "-")}</p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div class="rounded-2xl bg-white/10 p-4">
            <p class="text-white/60 text-sm">Eski Fiyat</p>
            <p class="mt-2 text-lg font-bold">${formatPrice(item.oldPrice, item.currency)}</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-4">
            <p class="text-white/60 text-sm">Yeni Fiyat</p>
            <p class="mt-2 text-lg font-bold">${formatPrice(item.newPrice, item.currency)}</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-4">
            <p class="text-white/60 text-sm">Fark</p>
            <p class="mt-2 text-lg font-bold ${amountClass}">${amount > 0 ? "+" : ""}${formatPrice(amount, item.currency)}</p>
            <p class="text-xs text-white/70 mt-1">${percent > 0 ? "+" : ""}${percent.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div class="mt-6 space-y-5">
        <div class="rounded-3xl border border-slate-200 p-5">
          <h5 class="font-bold text-slate-900 mb-3">Mülk Sahibi</h5>
          <div class="space-y-2 text-sm">
            <p><span class="font-semibold">Ad Soyad:</span> ${escapeHtml(item.owner?.name || "-")}</p>
            <p><span class="font-semibold">Telefon:</span> ${escapeHtml(item.owner?.phone || "-")}</p>
            <p><span class="font-semibold">E-posta:</span> ${escapeHtml(item.owner?.email || "-")}</p>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 p-5">
          <h5 class="font-bold text-slate-900 mb-3">İşlem Bilgisi</h5>
          <div class="space-y-2 text-sm">
            <p><span class="font-semibold">Değişim Türü:</span> ${getChangeBadge(item.changeType)}</p>
            <p><span class="font-semibold">İşlemi Yapan:</span> ${escapeHtml(item.changedBy || "-")}</p>
            <p><span class="font-semibold">Tarih:</span> ${formatDate(item.changedAt)}</p>
            <p><span class="font-semibold">Sebep:</span> ${escapeHtml(item.reason || "-")}</p>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 p-5">
          <h5 class="font-bold text-slate-900 mb-3">Notlar</h5>
          <p class="text-sm text-slate-600 whitespace-pre-line">${escapeHtml(item.notes || "-")}</p>
        </div>
      </div>
    `;

    el.detailDrawer.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }

  function closeDrawer() {
    if (!el.detailDrawer) return;
    el.detailDrawer.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  function clearFilters() {
    if (el.searchInput) el.searchInput.value = "";
    if (el.changeTypeFilter) el.changeTypeFilter.value = "";
    if (el.userFilter) el.userFilter.value = "";
    if (el.startDateFilter) el.startDateFilter.value = "";
    if (el.endDateFilter) el.endDateFilter.value = "";
    applyFilters();
  }

  function exportReport() {
    const rows = state.filteredRecords;
    if (!rows.length) {
      alert("Dışa aktarılacak kayıt yok.");
      return;
    }

    const headers = [
      "Portföy No",
      "İlan Başlığı",
      "Lokasyon",
      "Mülk Sahibi",
      "Eski Fiyat",
      "Yeni Fiyat",
      "Değişim Tutarı",
      "Değişim Yüzdesi",
      "Değişim Türü",
      "Değişim Nedeni",
      "İşlemi Yapan",
      "İşlem Tarihi"
    ];

    const csvRows = rows.map(item => [
      item.portfolioNo || "",
      item.title || "",
      item.location || "",
      item.owner?.name || "",
      item.oldPrice || 0,
      item.newPrice || 0,
      getChangeAmount(item),
      getChangePercent(item).toFixed(2),
      item.changeType || "",
      item.reason || "",
      item.changedBy || "",
      item.changedAt || ""
    ]);

    const csvContent = [headers, ...csvRows]
      .map(row => row.map(val => `"${String(val ?? "").replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "merada-istatistik-raporu.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    if (el.searchInput) el.searchInput.addEventListener("input", applyFilters);
    if (el.changeTypeFilter) el.changeTypeFilter.addEventListener("change", applyFilters);
    if (el.userFilter) el.userFilter.addEventListener("change", applyFilters);
    if (el.startDateFilter) el.startDateFilter.addEventListener("change", applyFilters);
    if (el.endDateFilter) el.endDateFilter.addEventListener("change", applyFilters);
    if (el.btnClearFilters) el.btnClearFilters.addEventListener("click", clearFilters);

    if (el.btnRefresh) {
      el.btnRefresh.addEventListener("click", fetchStatsData);
    }

    if (el.btnExport) el.btnExport.addEventListener("click", exportReport);
    if (el.drawerOverlay) el.drawerOverlay.addEventListener("click", closeDrawer);
    if (el.closeDrawer) el.closeDrawer.addEventListener("click", closeDrawer);

    document.addEventListener("click", (event) => {
      const detailBtn = event.target.closest(".detail-trigger");
      if (detailBtn) {
        openDrawer(detailBtn.dataset.detailId);
      }

      const chartBtn = event.target.closest(".chart-range-btn");
      if (chartBtn) {
        state.currentRange = Number(chartBtn.dataset.range);
        renderChart();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeDrawer();
    });
  }

  function init() {
    bindEvents();
    fetchStatsData();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();