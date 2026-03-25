(() => {
  const sampleHistory = [
    {
      id: 1,
      listingId: 101,
      portfolioNo: "MRD-101",
      title: "Yenişehir 3+1 Lüks Daire",
      location: "Mersin / Yenişehir",
      owner: {
        name: "Ahmet Yılmaz",
        phone: "0532 111 22 33",
        email: "ahmetyilmaz@example.com"
      },
      oldPrice: 3250000,
      newPrice: 3490000,
      changeType: "increase",
      reason: "Piyasa artışı ve iç tadilat sonrası güncelleme",
      changedAt: "2026-03-18T10:45:00",
      changedBy: "Admin Arda",
      notes: "Salon ve mutfak tamamen yenilendi."
    },
    {
      id: 2,
      listingId: 102,
      portfolioNo: "MRD-102",
      title: "Mezitli Deniz Manzaralı 2+1",
      location: "Mersin / Mezitli",
      owner: {
        name: "Fatma Kara",
        phone: "0533 987 45 67",
        email: "fatmakara@example.com"
      },
      oldPrice: 4180000,
      newPrice: 3995000,
      changeType: "decrease",
      reason: "Hızlı satış için fiyat düşürüldü",
      changedAt: "2026-03-17T15:10:00",
      changedBy: "Editör Merve",
      notes: "Satış sürecini hızlandırmak için indirim yapıldı."
    },
    {
      id: 3,
      listingId: 103,
      portfolioNo: "MRD-103",
      title: "Erdemli Yazlık Bahçeli Villa",
      location: "Mersin / Erdemli",
      owner: {
        name: "Hasan Doğan",
        phone: "0536 222 10 90",
        email: "hasandogan@example.com"
      },
      oldPrice: 7850000,
      newPrice: 8250000,
      changeType: "increase",
      reason: "Sezon başlangıcı ve yoğun talep",
      changedAt: "2026-03-15T12:25:00",
      changedBy: "Admin Arda",
      notes: "Yaz dönemi öncesi fiyat optimizasyonu."
    },
    {
      id: 4,
      listingId: 104,
      portfolioNo: "MRD-104",
      title: "Toroslar Yatırımlık 1+1",
      location: "Mersin / Toroslar",
      owner: {
        name: "Elif Demir",
        phone: "0541 987 12 34",
        email: "elifdemir@example.com"
      },
      oldPrice: 1750000,
      newPrice: 1750000,
      changeType: "neutral",
      reason: "Sistemsel alan düzenlemesi",
      changedAt: "2026-03-13T09:05:00",
      changedBy: "Operasyon User",
      notes: "Net fiyat değişmedi."
    },
    {
      id: 5,
      listingId: 105,
      portfolioNo: "MRD-105",
      title: "Akdeniz Merkezi Konumda Ofis",
      location: "Mersin / Akdeniz",
      owner: {
        name: "Murat Güneş",
        phone: "0552 456 77 90",
        email: "muratgunes@example.com"
      },
      oldPrice: 2590000,
      newPrice: 2790000,
      changeType: "increase",
      reason: "Ticari bölge değeri arttı",
      changedAt: "2026-03-10T16:40:00",
      changedBy: "Editör Merve",
      notes: "Benzer portföy analizi sonrası güncellendi."
    },
    {
      id: 6,
      listingId: 106,
      portfolioNo: "MRD-106",
      title: "Tarsus Geniş Aile Dairesi",
      location: "Mersin / Tarsus",
      owner: {
        name: "Zehra Şahin",
        phone: "0531 998 41 52",
        email: "zehrasahin@example.com"
      },
      oldPrice: 2980000,
      newPrice: 2890000,
      changeType: "decrease",
      reason: "Alıcı geri bildirimine göre revize edildi",
      changedAt: "2026-03-08T11:15:00",
      changedBy: "Admin Arda",
      notes: "Pazarlık payı azaltıldı."
    }
  ];

  const chartData = {
    6: [
      { label: "Eki", value: 8 },
      { label: "Kas", value: 11 },
      { label: "Ara", value: 7 },
      { label: "Oca", value: 14 },
      { label: "Şub", value: 13 },
      { label: "Mar", value: 18 }
    ],
    12: [
      { label: "Nis", value: 4 },
      { label: "May", value: 5 },
      { label: "Haz", value: 6 },
      { label: "Tem", value: 5 },
      { label: "Ağu", value: 7 },
      { label: "Eyl", value: 10 },
      { label: "Eki", value: 8 },
      { label: "Kas", value: 11 },
      { label: "Ara", value: 7 },
      { label: "Oca", value: 14 },
      { label: "Şub", value: 13 },
      { label: "Mar", value: 18 }
    ]
  };

  const state = {
    currentRange: 6,
    records: [...sampleHistory],
    filteredRecords: [...sampleHistory]
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
    btnClearFilters: document.getElementById("btnClearFilters"),
    btnRefresh: document.getElementById("btnRefresh"),
    btnExport: document.getElementById("btnExport"),
    detailDrawer: document.getElementById("detailDrawer"),
    drawerOverlay: document.getElementById("drawerOverlay"),
    closeDrawer: document.getElementById("closeDrawer"),
    drawerContent: document.getElementById("drawerContent")
  };

  function formatPrice(value) {
    return `${Number(value || 0).toLocaleString("tr-TR")} ₺`;
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
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
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Az önce";
    if (diffHours < 24) return `${diffHours} saat önce`;
    return `${diffDays} gün önce`;
  }

  function getChangeAmount(record) {
    return (record.newPrice || 0) - (record.oldPrice || 0);
  }

  function getChangePercent(record) {
    if (!record.oldPrice) return 0;
    return (getChangeAmount(record) / record.oldPrice) * 100;
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

  function renderSummaryCards() {
    if (!el.summaryCards) return;

    const records = state.filteredRecords;
    const totalChanges = records.length;
    const increaseCount = records.filter(item => item.changeType === "increase").length;
    const decreaseCount = records.filter(item => item.changeType === "decrease").length;
    const totalVolume = records.reduce((sum, item) => sum + Math.abs(getChangeAmount(item)), 0);

    const cards = [
      {
        title: "Toplam Kayıt",
        value: totalChanges,
        note: "Seçili filtreye göre",
        tone: "bg-slate-900 text-white"
      },
      {
        title: "Artış",
        value: increaseCount,
        note: "Fiyatı yükselen ilanlar",
        tone: "bg-white text-slate-900 border border-slate-200"
      },
      {
        title: "Düşüş",
        value: decreaseCount,
        note: "Fiyatı düşen ilanlar",
        tone: "bg-white text-slate-900 border border-slate-200"
      },
      {
        title: "Toplam Hacim",
        value: formatPrice(totalVolume),
        note: "Farkların toplamı",
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

    const data = chartData[state.currentRange] || [];
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

    el.recentActivity.innerHTML = rows.map(item => {
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
            <span class="text-slate-500">${formatPrice(item.oldPrice)} → ${formatPrice(item.newPrice)}</span>
            <span class="font-bold ${amountClass}">${amount > 0 ? "+" : ""}${formatPrice(amount)}</span>
          </div>
        </button>
      `;
    }).join("");
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
              <div class="text-xs text-slate-500 mt-1">${escapeHtml(item.portfolioNo)} • ${escapeHtml(item.location)}</div>
            </div>
          </td>

          <td class="px-5 py-4 whitespace-nowrap font-medium">${formatPrice(item.oldPrice)}</td>
          <td class="px-5 py-4 whitespace-nowrap font-semibold text-slate-900">${formatPrice(item.newPrice)}</td>

          <td class="px-5 py-4">
            <div class="font-bold ${amountClass}">${amount > 0 ? "+" : ""}${formatPrice(amount)}</div>
            <div class="text-xs text-slate-500 mt-1">${percent > 0 ? "+" : ""}${percent.toFixed(2)}%</div>
          </td>

          <td class="px-5 py-4 text-slate-600 min-w-[220px]">${escapeHtml(item.reason)}</td>
          <td class="px-5 py-4 whitespace-nowrap text-slate-500">${formatDate(item.changedAt)}</td>
          <td class="px-5 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
              ${escapeHtml(item.changedBy)}
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
    const users = [...new Set(state.records.map(item => item.changedBy))];

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

    state.filteredRecords = state.records.filter(item => {
      const searchable = [
        item.title,
        item.portfolioNo,
        item.location,
        item.owner.name,
        item.changedBy,
        item.reason
      ].join(" ").toLowerCase();

      const changedDate = new Date(item.changedAt);

      const matchesSearch = !search || searchable.includes(search);
      const matchesType = !changeType || item.changeType === changeType;
      const matchesUser = !user || item.changedBy === user;
      const matchesStart = !startDate || changedDate >= new Date(`${startDate}T00:00:00`);

      return matchesSearch && matchesType && matchesUser && matchesStart;
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
        <p class="text-xs uppercase tracking-[0.18em] text-white/70">${escapeHtml(item.portfolioNo)}</p>
        <h4 class="mt-2 text-2xl font-extrabold">${escapeHtml(item.title)}</h4>
        <p class="mt-2 text-white/70">${escapeHtml(item.location)}</p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div class="rounded-2xl bg-white/10 p-4">
            <p class="text-white/60 text-sm">Eski Fiyat</p>
            <p class="mt-2 text-lg font-bold">${formatPrice(item.oldPrice)}</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-4">
            <p class="text-white/60 text-sm">Yeni Fiyat</p>
            <p class="mt-2 text-lg font-bold">${formatPrice(item.newPrice)}</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-4">
            <p class="text-white/60 text-sm">Fark</p>
            <p class="mt-2 text-lg font-bold ${amountClass}">${amount > 0 ? "+" : ""}${formatPrice(amount)}</p>
            <p class="text-sm text-white/70 mt-1">${percent > 0 ? "+" : ""}${percent.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div class="rounded-3xl border border-slate-200 p-5">
          <h5 class="text-lg font-bold text-slate-900">İşlem Bilgileri</h5>
          <div class="mt-4 space-y-3 text-sm">
            <div>
              <p class="text-slate-500">İşlemi Yapan</p>
              <p class="font-semibold text-slate-900 mt-1">${escapeHtml(item.changedBy)}</p>
            </div>
            <div>
              <p class="text-slate-500">İşlem Tarihi</p>
              <p class="font-semibold text-slate-900 mt-1">${formatDate(item.changedAt)}</p>
            </div>
            <div>
              <p class="text-slate-500">Değişim Nedeni</p>
              <p class="font-semibold text-slate-900 mt-1">${escapeHtml(item.reason)}</p>
            </div>
            <div>
              <p class="text-slate-500">Not</p>
              <p class="font-semibold text-slate-900 mt-1">${escapeHtml(item.notes || "-")}</p>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 p-5">
          <h5 class="text-lg font-bold text-slate-900">Mülk Sahibi</h5>
          <div class="mt-4 space-y-3 text-sm">
            <div>
              <p class="text-slate-500">Ad Soyad</p>
              <p class="font-semibold text-slate-900 mt-1">${escapeHtml(item.owner.name)}</p>
            </div>
            <div>
              <p class="text-slate-500">Telefon</p>
              <p class="font-semibold text-slate-900 mt-1">${escapeHtml(item.owner.phone)}</p>
            </div>
            <div>
              <p class="text-slate-500">E-posta</p>
              <p class="font-semibold text-slate-900 mt-1">${escapeHtml(item.owner.email)}</p>
            </div>
          </div>
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
      "Değişim Türü",
      "Değişim Nedeni",
      "İşlemi Yapan",
      "İşlem Tarihi"
    ];

    const csvRows = rows.map(item => [
      item.portfolioNo,
      item.title,
      item.location,
      item.owner.name,
      item.oldPrice,
      item.newPrice,
      item.changeType,
      item.reason,
      item.changedBy,
      item.changedAt
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
    if (el.btnClearFilters) el.btnClearFilters.addEventListener("click", clearFilters);

    if (el.btnRefresh) {
      el.btnRefresh.addEventListener("click", () => {
        applyFilters();
        renderChart();
      });
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
    renderUserOptions();
    renderSummaryCards();
    renderChart();
    renderRecentActivity();
    renderTable();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();