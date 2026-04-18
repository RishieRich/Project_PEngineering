/* ============================================================
   app.js — Pawan Engineering Copilot Demo
   Vanilla JS. No build step. No external libs.
   Custom SVG charts + WhatsApp-style chat copilot.
============================================================ */

(function () {
  const D = window.PE_DATA;

  /* ============ Helpers ============ */
  const $  = (sel) => document.querySelector(sel);
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const fmtINR = (n) => {
    if (n == null) return "—";
    const abs = Math.abs(n);
    if (abs >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
    if (abs >= 1e3) return `₹${(n / 1e3).toFixed(1)} K`;
    return `₹${Math.round(n)}`;
  };
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const nowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  const COLOR = { green: "#25D366", greenDeep: "#128C7E", greenDark: "#075E54", muted: "#667781", line: "#E9EDEF", line2: "#F0F2F5" };

  /* ============ Inline icon helper ============ */
  const ICON = {
    up:    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
    truck: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    bars:  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    users: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    checks:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 6 8 16 4 12"/><polyline points="22 8 13 17"/></svg>',
  };

  /* ============ KPI cards ============ */
  function renderKpis() {
    const grid = $("#kpi-grid");
    const rows = [
      { label: "Total sales (FY)",       value: fmtINR(D.headline.sales),       sub: `${D.headline.salesCount} invoices`, icon: ICON.up },
      { label: "Total purchases (FY)",   value: fmtINR(D.headline.purchases),   sub: `${D.headline.purchaseCount} POs`,    icon: ICON.truck },
      { label: "Gross profit (trading)", value: fmtINR(D.headline.grossProfit), sub: `${D.headline.grossMarginPct}% margin · before overheads`, accent: true, icon: ICON.bars, big: true },
      { label: "Customers · Vendors",    value: `${D.headline.customers} · ${D.headline.vendors}`, sub: `${D.headline.products} active products`, icon: ICON.users }
    ];
    rows.forEach(r => {
      const card = el("div", "kpi" + (r.big ? " kpi-accent" : ""));
      card.innerHTML = `
        <div class="kpi-row">
          <div class="kpi-text">
            <div class="kpi-label">${r.label}</div>
            <div class="kpi-value">${r.value}</div>
            <div class="kpi-sub${r.accent ? " accent" : ""}">${r.sub}</div>
          </div>
          <div class="kpi-icon">${r.icon}</div>
        </div>`;
      grid.appendChild(card);
    });
  }

  /* ============ Row bars ============ */
  function renderRowBars(sel, data, color) {
    const c = $(sel);
    const max = data[0].share;
    data.forEach((row, i) => {
      const w = Math.max(4, Math.round((row.share / max) * 100));
      const node = el("div", "rowbar");
      node.innerHTML = `
        <div class="rowbar-top">
          <div class="rb-left">
            <span class="rb-rank">${i + 1}</span>
            <span class="rb-label" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</span>
          </div>
          <div class="rb-right">
            <span class="rb-value">${fmtINR(row.value)}</span>
            <span class="rb-share">${row.share}%</span>
          </div>
        </div>
        <div class="rb-track"><div class="rb-fill" style="width:0; background:${color}"></div></div>`;
      c.appendChild(node);
      // animate after mount
      requestAnimationFrame(() => {
        node.querySelector(".rb-fill").style.width = w + "%";
      });
    });
  }

  /* ============ Alerts + Notes ============ */
  function renderAlerts() {
    const c = $("#alerts");
    const labels = { high: "Urgent", medium: "Watch", low: "FYI" };
    D.alerts.forEach(a => {
      const node = el("div", "alert");
      node.innerHTML = `
        <div class="dot ${a.sev}"></div>
        <div class="body">
          <div class="title-row">
            <div class="title">${escapeHtml(a.t)}</div>
            <span class="chip ${a.sev}">${labels[a.sev]}</span>
          </div>
          <div class="detail">${escapeHtml(a.d)}</div>
        </div>`;
      c.appendChild(node);
    });
  }
  function renderNotes() {
    const c = $("#data-notes");
    D.dataNotes.forEach(n => {
      const li = el("li", null, `${ICON.check}<span>${escapeHtml(n)}</span>`);
      c.appendChild(li);
    });
  }

  /* ============================================================
     SVG CHARTS — fully custom, dependency free
  ============================================================ */

  const SVG_NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs) => {
    const e = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };

  function tooltipFor(host) {
    const tip = el("div", "chart-tooltip");
    tip.style.display = "none";
    host.appendChild(tip);
    return {
      show(x, y, html) {
        tip.innerHTML = html;
        tip.style.display = "block";
        // clamp x within container
        const w = tip.offsetWidth || 140;
        const hostW = host.clientWidth;
        const left = Math.max(w / 2 + 6, Math.min(hostW - w / 2 - 6, x));
        tip.style.left = left + "px";
        tip.style.top = y + "px";
      },
      hide() { tip.style.display = "none"; }
    };
  }

  function niceMaxLakhs(maxValue) {
    const maxL = maxValue / 1e5;
    if (maxL <= 5)  return 5;
    if (maxL <= 10) return 10;
    if (maxL <= 20) return 20;
    if (maxL <= 30) return 30;
    if (maxL <= 40) return 40;
    return Math.ceil(maxL / 10) * 10;
  }

  /* --- Grouped bar chart: Monthly sales vs purchases --- */
  function renderMonthlyBarChart() {
    const host = $("#chart-monthly");
    host.innerHTML = "";
    const tip = tooltipFor(host);

    const W = host.clientWidth || 700, H = 240;
    const pL = 38, pR = 8, pT = 8, pB = 26;
    const cw = W - pL - pR, ch = H - pT - pB;

    const maxV = Math.max(...D.monthly.flatMap(d => [d.sales, d.purchases]));
    const maxL = niceMaxLakhs(maxV);
    const yTo = (lakhs) => pT + ch - (lakhs / maxL) * ch;

    const svg = svgEl("svg", { class: "chart-svg", viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none" });

    // Y grid + labels
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const v = (maxL / ticks) * i;
      const y = yTo(v);
      svg.appendChild(svgEl("line", { x1: pL, x2: W - pR, y1: y, y2: y, stroke: COLOR.line2, "stroke-width": 1 }));
      const tx = svgEl("text", { x: pL - 6, y: y + 3, "text-anchor": "end", "font-size": 10, fill: COLOR.muted });
      tx.textContent = v % 1 === 0 ? `₹${v}L` : `₹${v.toFixed(1)}L`;
      svg.appendChild(tx);
    }

    // Bars
    const n = D.monthly.length;
    const groupW = cw / n;
    const barGap = 3;
    const barW = Math.max(5, (groupW - 14) / 2);

    D.monthly.forEach((d, i) => {
      const gx = pL + i * groupW + (groupW - (barW * 2 + barGap)) / 2;

      const sH = (d.sales / 1e5 / maxL) * ch;
      const pH = (d.purchases / 1e5 / maxL) * ch;

      // Hover hit area (per group)
      const hit = svgEl("rect", { x: pL + i * groupW, y: pT, width: groupW, height: ch, fill: "transparent" });
      hit.style.cursor = "default";
      svg.appendChild(hit);

      // Sales bar
      const salesBar = svgEl("rect", {
        x: gx, y: pT + ch - sH, width: barW, height: Math.max(0, sH),
        fill: COLOR.green, rx: 2, ry: 2,
      });
      salesBar.style.transition = "opacity 0.15s";
      svg.appendChild(salesBar);

      // Purchases bar
      const purBar = svgEl("rect", {
        x: gx + barW + barGap, y: pT + ch - pH, width: barW, height: Math.max(0, pH),
        fill: COLOR.greenDark, rx: 2, ry: 2, "fill-opacity": "0.85",
      });
      purBar.style.transition = "opacity 0.15s";
      svg.appendChild(purBar);

      // X label
      const xt = svgEl("text", {
        x: pL + i * groupW + groupW / 2, y: H - 8,
        "text-anchor": "middle", "font-size": 10, fill: COLOR.muted,
      });
      xt.textContent = d.m;
      svg.appendChild(xt);

      // Hover tooltip on group
      const onEnter = () => {
        salesBar.setAttribute("fill-opacity", "0.78");
        purBar.setAttribute("fill-opacity", "1");
        const cx = pL + i * groupW + groupW / 2;
        const yPos = Math.min(yTo(d.sales / 1e5), yTo(d.purchases / 1e5));
        tip.show(cx, yPos, `
          <div class="tt-month">${d.m}</div>
          <div class="tt-row"><span class="tt-label"><span class="swatch" style="display:inline-block;width:8px;height:8px;background:${COLOR.green};border-radius:2px;margin-right:6px"></span>Sales</span><span class="tt-val">${fmtINR(d.sales)}</span></div>
          <div class="tt-row"><span class="tt-label"><span class="swatch" style="display:inline-block;width:8px;height:8px;background:${COLOR.greenDark};border-radius:2px;margin-right:6px"></span>Purchases</span><span class="tt-val">${fmtINR(d.purchases)}</span></div>
          <div class="tt-row"><span class="tt-label">Gross</span><span class="tt-val" style="color:${d.gp >= 0 ? COLOR.greenDeep : '#B91C1C'}">${fmtINR(d.gp)}</span></div>
        `);
      };
      const onLeave = () => {
        salesBar.setAttribute("fill-opacity", "1");
        purBar.setAttribute("fill-opacity", "0.85");
        tip.hide();
      };
      hit.addEventListener("mouseenter", onEnter);
      hit.addEventListener("mouseleave", onLeave);
      hit.addEventListener("touchstart", onEnter, { passive: true });
      hit.addEventListener("touchend", onLeave);
    });

    host.appendChild(svg);
  }

  /* --- Line chart: Monthly gross profit --- */
  function renderGpLineChart() {
    const host = $("#chart-gp");
    host.innerHTML = "";
    const tip = tooltipFor(host);

    const W = host.clientWidth || 700, H = 175;
    const pL = 40, pR = 12, pT = 14, pB = 22;
    const cw = W - pL - pR, ch = H - pT - pB;

    const vals = D.monthly.map(d => d.gp / 1e5);
    const min = Math.min(0, ...vals);
    const max = Math.max(...vals);
    // Range for y axis
    const yMin = Math.floor(min / 5) * 5;
    const yMax = Math.ceil(max / 5) * 5;
    const range = yMax - yMin || 1;
    const yTo = (lakhs) => pT + ch - ((lakhs - yMin) / range) * ch;

    const svg = svgEl("svg", { class: "chart-svg", viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none" });

    // grid
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const v = yMin + (range / ticks) * i;
      const y = yTo(v);
      svg.appendChild(svgEl("line", { x1: pL, x2: W - pR, y1: y, y2: y, stroke: v === 0 ? "#cdd5d8" : COLOR.line2, "stroke-width": v === 0 ? 1.2 : 1 }));
      const tx = svgEl("text", { x: pL - 6, y: y + 3, "text-anchor": "end", "font-size": 10, fill: COLOR.muted });
      tx.textContent = `₹${Math.round(v)}L`;
      svg.appendChild(tx);
    }

    // X positions
    const n = D.monthly.length;
    const stepX = cw / (n - 1);
    const points = D.monthly.map((d, i) => ({
      x: pL + i * stepX,
      y: yTo(d.gp / 1e5),
      d
    }));

    // Filled area under line (only positive)
    const baseY = yTo(0);
    let areaPath = `M ${points[0].x} ${baseY}`;
    points.forEach(p => { areaPath += ` L ${p.x} ${p.y}`; });
    areaPath += ` L ${points[points.length - 1].x} ${baseY} Z`;

    const grad = svgEl("linearGradient", { id: "gpgrad", x1: "0", y1: "0", x2: "0", y2: "1" });
    const s1 = svgEl("stop", { offset: "0%",  "stop-color": COLOR.green, "stop-opacity": "0.25" });
    const s2 = svgEl("stop", { offset: "100%","stop-color": COLOR.green, "stop-opacity": "0.02" });
    grad.appendChild(s1); grad.appendChild(s2);
    const defs = svgEl("defs"); defs.appendChild(grad); svg.appendChild(defs);

    svg.appendChild(svgEl("path", { d: areaPath, fill: "url(#gpgrad)" }));

    // Line itself
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) linePath += ` L ${points[i].x} ${points[i].y}`;
    svg.appendChild(svgEl("path", { d: linePath, fill: "none", stroke: COLOR.greenDeep, "stroke-width": 2.5, "stroke-linecap": "round", "stroke-linejoin": "round" }));

    // X labels
    points.forEach(p => {
      const xt = svgEl("text", { x: p.x, y: H - 6, "text-anchor": "middle", "font-size": 10, fill: COLOR.muted });
      xt.textContent = p.d.m;
      svg.appendChild(xt);
    });

    // Dots + hover hit
    points.forEach(p => {
      const isNeg = p.d.gp < 0;
      const dot = svgEl("circle", { cx: p.x, cy: p.y, r: 3.5, fill: isNeg ? "#E84A4A" : COLOR.greenDeep, stroke: "#fff", "stroke-width": 1.5 });
      svg.appendChild(dot);

      const hit = svgEl("rect", { x: p.x - stepX / 2, y: pT, width: stepX, height: ch, fill: "transparent" });
      svg.appendChild(hit);

      const onEnter = () => {
        dot.setAttribute("r", "5.5");
        tip.show(p.x, p.y, `
          <div class="tt-month">${p.d.m}</div>
          <div class="tt-row"><span class="tt-label">Gross profit</span><span class="tt-val" style="color:${isNeg ? '#B91C1C' : COLOR.greenDeep}">${fmtINR(p.d.gp)}</span></div>
        `);
      };
      const onLeave = () => { dot.setAttribute("r", "3.5"); tip.hide(); };
      hit.addEventListener("mouseenter", onEnter);
      hit.addEventListener("mouseleave", onLeave);
      hit.addEventListener("touchstart", onEnter, { passive: true });
      hit.addEventListener("touchend", onLeave);
    });

    host.appendChild(svg);
  }

  /* ============================================================
     COPILOT — Hinglish, deterministic, grounded
  ============================================================ */

  function answer(q) {
    const s = q.toLowerCase().trim();
    const has = (...keys) => keys.some(k => s.includes(k));

    if (has("total sale", "kitna sale", "kitna sales", "total revenue", "mera total")) {
      return {
        head: `Total FY 25-26 sales: ${fmtINR(D.headline.sales)} 💰`,
        body: `${D.headline.salesCount} invoices, ${D.headline.customers} customers, ${D.headline.products} products. Gross profit ${fmtINR(D.headline.grossProfit)} aaya — yaani ${D.headline.grossMarginPct}% margin (overheads ke pehle).`
      };
    }
    if (has("top customer", "biggest customer", "main customer", "top 5 customer", "kaun customer", "customer")) {
      return {
        head: "Aapke top customers (FY 25-26)",
        table: D.topCustomers.slice(0, 5).map(c => [c.name, fmtINR(c.value), `${c.share}%`]),
        cols: ["Customer", "Sales", "Share"],
        body: `Top 5 milke ${D.headline.top5CustShare}% revenue dete hain. Yash Seals akele 36.4% — yeh thoda risk hai, 2-3 aur accounts develop karne chahiye.`
      };
    }
    if (has("top vendor", "vendor", "supplier", "buy from", "kaun vendor", "kis se")) {
      return {
        head: "Top vendors (FY 25-26 purchases)",
        table: D.topVendors.slice(0, 5).map(v => [v.name, fmtINR(v.value), `${v.share}%`]),
        cols: ["Vendor", "Purchases", "Share"],
        body: `Top 3 vendors milke ${D.headline.top3VendShare}% supply dete hain. SS coil ke liye ek backup supplier qualify karna chahiye, warna risk hai.`
      };
    }
    if (has("march", "mar 26", "mar 2026", "loss", "negative", "kya hua march")) {
      return {
        head: "March 2026 — gross loss flag 🚩",
        body: `March mein sales ₹3.78L aur purchases ₹4.87L — yaani ₹1.09L ka gross loss. Pure FY mein yahi ek month negative hai.\n\nMost likely reason: maal aaya March mein, par invoicing April mein hui — ya stock build-up. Real loss nahi lagta, lekin accounts team se confirm karwa lijiye.`
      };
    }
    if (has("best month", "best sales", "spike", "highest", "peak", "top month")) {
      return {
        head: "Best month: December 2025 🎯",
        body: `Dec 2025 = ${fmtINR(3661259)} — pure FY ka peak. Sep se Dec tak strong run tha (₹17.5L → ₹36.6L).\n\nPhir Jan 2026 mein gir ke ₹8.88L pe aaya — 75.8% drop. Lagta hai bade orders Q3 mein bunched the. Sales team se poochhiye Q3 mein kya kya close hua tha.`
      };
    }
    if (has("yash", "biggest account", "main account")) {
      return {
        head: "Yash Seals Pvt. Ltd. — aapka #1 customer",
        body: `₹61.19L sales, 58 invoices = total revenue ka 36.4%. Door se number 2 customer (Unisto) sirf 11.2%.\n\nRelationship strong hai, lekin concentration risk bhi hai. 2 cheezein karein:\n1) Lamba commercial commitment lock karne ki koshish\n2) Customers #2-#5 ko aggressive develop karein`
      };
    }
    if (has("top product", "best product", "product", "kya banta", "kya bechte")) {
      return {
        head: "Top selling products",
        table: D.topProducts.map(p => [p.name, fmtINR(p.value), `${p.share}%`]),
        cols: ["Product", "Sales", "Share"],
        body: `Top 5 products milke 78.4% revenue. Sirf 2 SKUs (Seal-Spring HIFI CROC + Hi-Tech Seal Lock) 55% kar dete hain. Customer side jaisa hi product side bhi concentrated hai.`
      };
    }
    if (has("material", "ss coil", "ss cr", "steel", "raw material", "kacha maal", "kachcha")) {
      return {
        head: "SS CR Coils sabse zyada use hota hai",
        body: `SS CR COILS akele ₹44.9L = total purchases ka 48.4%. Stainless steel coil family overall 70%+ inputs hai.\n\nIska matlab — SS sheet ka market rate badla, toh seedha aapke margin pe asar. Suggest karunga:\n1) Monthly SS sheet index track karein\n2) Ratan Steel aur Golden Metal ke rate change pe alert lagayein`
      };
    }
    if (has("risk", "concentration", "dependency", "depend")) {
      return {
        head: "3 concentration risks attention chahiye 🟠",
        body: `1) Yash Seals = 36.4% revenue\n2) Top 5 customers = 70.4%\n3) Top 3 vendors = 72.1% purchases\n\nYeh "bura" nahi hai — most growing MSMEs aise hi dikhte hain — par matlab yeh hai ki ek bhi bada change donon side hard hit karega. 2026-27 ke liye diversification plan banana chahiye.`
      };
    }
    if (has("profit", "margin", "gross", "munafa")) {
      return {
        head: `Gross profit: ${fmtINR(D.headline.grossProfit)} (${D.headline.grossMarginPct}%)`,
        body: `FY sales ${fmtINR(D.headline.sales)} − FY purchases ${fmtINR(D.headline.purchases)} = ${fmtINR(D.headline.grossProfit)} gross.\n\nDhyan dein — ismein salaries, rent, bijli, transport, finance, tax shamil nahi. Net profit ismein se kam hoga. Best margin month May 2025 (77.9%), worst March 2026 (–28.8%).`
      };
    }
    if (has("alert", "what should i", "attention", "kya dekhna", "kya check", "is hafte")) {
      return {
        head: "Is hafte 3 cheezein check karein 📋",
        body: `1) March 2026 ka gross loss — accounts team se confirm karein billing-timing ka issue hai ya nahi\n2) Yash Seals ka next PO pipeline — woh 36% revenue dete hain\n3) Ratan Steel + Golden Metal ka rate change — donon milke 55% input cost`
      };
    }
    if (has("what can you", "help me", "what do you", "kya kar")) {
      return {
        head: "Main aapki books se yeh sab bata sakta hoon",
        body: `Try karein:\n• "Top 5 customers"\n• "Top vendors"\n• "March mein kya hua?"\n• "Best month kaun sa tha?"\n• "Yash Seals ke baare mein batao"\n• "Material dependency?"\n• "Gross profit kitna hai?"\n• "Is hafte kya check karna chahiye?"`
      };
    }

    // Match by customer/vendor name keyword
    for (let i = 0; i < D.topCustomers.length; i++) {
      const c = D.topCustomers[i];
      if (s.includes(c.name.toLowerCase().split(" ")[0])) {
        return { head: c.name, body: `Sales ${fmtINR(c.value)}, ${c.lines} invoices = total ka ${c.share}%. Aapke #${i+1} customer hain.` };
      }
    }
    for (let i = 0; i < D.topVendors.length; i++) {
      const v = D.topVendors[i];
      if (s.includes(v.name.toLowerCase().split(" ")[0])) {
        return { head: v.name, body: `Purchases ${fmtINR(v.value)}, ${v.lines} POs = FY purchases ka ${v.share}%. Aapke #${i+1} vendor hain.` };
      }
    }

    return {
      head: "Yeh question abhi demo mein cover nahi hai",
      body: `Try karein: top customers, top vendors, March 2026, best month, Yash Seals, material dependency, gross profit, ya "is hafte kya check karein".`
    };
  }

  function renderTable(cols, rows) {
    const head = `<thead><tr>${cols.map(c => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead>`;
    const body = `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
    return `<table>${head}${body}</table>`;
  }

  function renderUserBubble(text, time) {
    const node = el("div", "msg-user");
    node.innerHTML = `
      <div class="text">${escapeHtml(text)}</div>
      <div class="msg-meta">${time} <span class="checks">${ICON.checks}</span></div>`;
    return node;
  }
  function renderBotBubble(a, time) {
    const node = el("div", "msg-bot");
    let inner = `<div class="head">${escapeHtml(a.head)}</div>`;
    if (a.body)  inner += `<div class="body">${escapeHtml(a.body)}</div>`;
    if (a.table) inner += renderTable(a.cols, a.table);
    inner += `<div class="msg-meta">${time}</div>`;
    node.innerHTML = inner;
    return node;
  }
  function renderTyping() {
    const node = el("div", "typing");
    node.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
    return node;
  }

  function setupCopilot() {
    const messages = $("#messages");
    const suggestionsEl = $("#suggestions");
    const input = $("#ask-input");
    const btn = $("#ask-btn");

    const suggestions = [
      "Top 5 customers",
      "March mein kya hua?",
      "Top vendors batao",
      "Yash Seals ke baare mein",
      "Material dependency?",
      "Is hafte kya check karein?",
    ];
    suggestions.forEach(s => {
      const b = el("button", "suggestion", escapeHtml(s));
      b.type = "button";
      b.addEventListener("click", () => { input.value = s; ask(); });
      suggestionsEl.appendChild(b);
    });

    // Greeting
    messages.appendChild(renderBotBubble({
      head: "Namaste! Main aapka Business Copilot hoon 👋",
      body: "Aapki FY 25-26 sales aur purchase books pe grounded hoon. Hindi, English ya Hinglish mein puchhiye — neeche se shortcuts dabaiye ya khud type kijiye."
    }, nowTime()));

    function scrollDown() { messages.scrollTop = messages.scrollHeight; }
    scrollDown();

    function ask() {
      const text = input.value.trim();
      if (!text) return;
      const t = nowTime();
      messages.appendChild(renderUserBubble(text, t));
      input.value = "";
      scrollDown();

      const typing = renderTyping();
      messages.appendChild(typing);
      scrollDown();

      setTimeout(() => {
        typing.remove();
        const a = answer(text);
        messages.appendChild(renderBotBubble(a, nowTime()));
        scrollDown();
      }, 600);
    }

    btn.addEventListener("click", ask);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") ask(); });
  }

  /* ============================================================
     INIT + responsive re-render of charts
  ============================================================ */

  function renderAll() {
    renderKpis();
    renderRowBars("#top-customers", D.topCustomers, COLOR.green);
    renderRowBars("#top-vendors",   D.topVendors,   COLOR.greenDeep);
    renderRowBars("#top-products",  D.topProducts,  COLOR.green);
    renderRowBars("#top-materials", D.topMaterials, COLOR.greenDark);
    renderAlerts();
    renderNotes();
    renderMonthlyBarChart();
    renderGpLineChart();
    setupCopilot();
  }

  // Re-render charts on resize (debounced)
  let rT;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(() => {
      renderMonthlyBarChart();
      renderGpLineChart();
    }, 150);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll);
  } else {
    renderAll();
  }
})();
