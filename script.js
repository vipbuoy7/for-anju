(function () {
  "use strict";

  const C = window.BIRTHDAY;
  const $ = (s, r = document) => r.querySelector(s);
  const params = new URLSearchParams(location.search);
  const TEST = C.previewMode === true || C.forceTest === true || (!!C.testKey && params.get("test") === C.testKey);
  const KEY = "tenstops-done-v1";
  const TKEY = "tenstops-test-v1";
  const P = C.photos || {};

  /* test mode: unlock everything, or pretend today is some date */
  let sim = { all: true, date: "" };
  if (TEST) { try { sim = Object.assign(sim, JSON.parse(localStorage.getItem(TKEY) || "{}")); } catch (e) {} }
  const saveSim = () => { try { localStorage.setItem(TKEY, JSON.stringify(sim)); } catch (e) {} };
  const DAY_MS = 864e5;
  const ORDER = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  /* ---------- progress (saved on her phone) ---------- */
  function loadDone() {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch (e) { return new Set(); }
  }
  function saveDone() {
    try { localStorage.setItem(KEY, JSON.stringify([...done])); } catch (e) { /* storage blocked */ }
  }
  let done = loadDone();
  if (params.has("reset")) { done = new Set(); saveDone(); }

  /* ---------- dates ---------- */
  const parseDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const unlockAt = (n) => { const d = parseDate(C.startDate); d.setDate(d.getDate() + (10 - n)); return d; };
  const revealAt = () => (C.revealDate ? parseDate(C.revealDate) : unlockAt(0));
  const now = () => {
    if (TEST && !sim.all && sim.date) {
      const d = parseDate(sim.date), r = new Date();
      d.setHours(r.getHours(), r.getMinutes(), r.getSeconds());
      return d.getTime();
    }
    return Date.now();
  };
  const unlockedAll = () => TEST && sim.all;
  const isOpen = (n) => unlockedAll() || now() >= unlockAt(n).getTime();
  const allDone = () => ORDER.every((n) => done.has(n));
  const finalOpen = () => unlockedAll() || (now() >= revealAt().getTime() && allDone());
  const today0 = () => { const d = new Date(now()); d.setHours(0, 0, 0, 0); return d; };
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const fmt = (d) => d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  const fill = (s) => String(s || "").split("{name}").join(C.herName).split("{from}").join(C.fromName);
  const dur = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (h ? h + "h " : "") + String(m).padStart(2, "0") + "m " + String(sec).padStart(2, "0") + "s";
  };

  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* ---------- views ---------- */
  let token = 0;          // bumps on every view change so old games stop
  let ticker = null;
  function show(id) {
    token++;
    clearInterval(ticker);
    ["home", "chapter", "final"].forEach((v) => { $("#" + v).hidden = v !== id; });
    window.scrollTo(0, 0);
  }
  function paragraphs(el, list) {
    el.innerHTML = "";
    (list || []).forEach((t, i) => {
      const p = document.createElement("p");
      p.textContent = fill(t);
      p.style.setProperty("--i", i);
      el.appendChild(p);
    });
    return (list || []).length;
  }

  /* ---------- test bar (only with ?test=<testKey>) ---------- */
  function renderTestBar() {
    const bar = $("#testbar");
    if (!TEST || C.previewMode === true) { bar.hidden = true; return; }
    bar.hidden = false;
    bar.innerHTML =
      '<strong>Test mode</strong>' +
      '<label><input type="radio" name="tmode" id="tmAll"' + (sim.all ? " checked" : "") + '> Unlock everything</label>' +
      '<label><input type="radio" name="tmode" id="tmDate"' + (!sim.all ? " checked" : "") + '> Pretend today is</label>' +
      '<input type="date" id="tmDay" value="' + (sim.date || iso(new Date())) + '">' +
      '<button type="button" id="tmDone">Mark all 10 done</button>' +
      '<button type="button" id="tmReset">Reset progress</button>';
    const apply = () => {
      sim.all = $("#tmAll").checked;
      sim.date = $("#tmDay").value;
      saveSim();
      renderHome();
    };
    $("#tmAll").onchange = apply;
    $("#tmDate").onchange = apply;
    $("#tmDay").onchange = () => { $("#tmDate").checked = true; apply(); };
    $("#tmDone").onclick = () => { ORDER.forEach((n) => done.add(n)); saveDone(); renderHome(); };
    $("#tmReset").onclick = () => { done = new Set(); saveDone(); renderHome(); };
  }

  /* ---------- home ---------- */
  function renderHome() {
    show("home");
    document.title = fill(C.title);
    $("#homeTitle").textContent = fill(C.title);
    $("#homeSub").textContent = fill(C.subtitle);
    const left = Math.max(0, Math.round((revealAt() - today0()) / DAY_MS));
    $("#homeNum").textContent = left;
    $("#homeNumLabel").textContent = left === 0 ? "It's today" : left === 1 ? "day to go" : "days to go";

    const track = $("#track");
    track.innerHTML = "";
    ORDER.forEach((n) => track.appendChild(stopEl(n)));
    track.appendChild(finalEl());

    const my = token;
    const tick = () => { if (my === token) $("#nextBox").textContent = nextLine(); };
    tick();
    ticker = setInterval(tick, 1000);
  }

  function stopEl(n) {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    const open = isOpen(n), fin = done.has(n);
    b.className = "stop " + (fin ? "is-done" : open ? "is-open" : "is-locked");
    b.innerHTML = '<span class="stop-num">' + n + '</span><span class="stop-state">' +
      (fin ? "Ridden" : open ? "Open" : fmt(unlockAt(n))) + "</span>";
    b.setAttribute("aria-label", "Stop " + n + ", " + (fin ? "done" : open ? "open" : "opens " + fmt(unlockAt(n))));
    b.onclick = () => {
      if (open) openDay(n);
      else tease(b, "Stop " + n + " opens on " + fmt(unlockAt(n)) + ". Abhi " + dur(unlockAt(n) - now()) + " baaki.");
    };
    li.appendChild(b);
    return li;
  }

  function finalEl() {
    const li = document.createElement("li");
    li.className = "final";
    const b = document.createElement("button");
    b.type = "button";
    const open = finalOpen();
    b.className = "stop " + (open ? "is-open" : "is-locked");
    b.innerHTML = '<span class="stop-num">' + fill(C.final.stopLabel) + '</span><span class="stop-state">' +
      (open ? "Open" : fmt(revealAt())) + "</span>";
    b.onclick = () => {
      if (open) openFinal();
      else if (now() >= revealAt().getTime()) tease(b, "Finish every stop first. The last door only opens for someone who rode the whole way.");
      else tease(b, "Opens on " + fmt(revealAt()) + ". Your day.");
    };
    li.appendChild(b);
    return li;
  }

  /* teasing pop-up for locked stops */
  let lastTease = -1, toastTimer = null;
  function tease(btn, sub) {
    const list = C.teases && C.teases.length ? C.teases : ["Be patient."];
    let i = Math.floor(Math.random() * list.length);
    if (list.length > 1 && i === lastTease) i = (i + 1) % list.length;
    lastTease = i;
    $("#toastLine").textContent = fill(list[i]);
    $("#toastSub").textContent = sub;
    const t = $("#toast");
    t.hidden = false;
    restart(t, "pop");
    restart(btn, "nope");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
  }

  function nextLine() {
    const waiting = ORDER.find((n) => isOpen(n) && !done.has(n));
    if (waiting) return "Stop " + waiting + " is open. Go on.";
    const locked = ORDER.find((n) => !isOpen(n));
    if (locked) return "Stop " + locked + " opens in " + dur(unlockAt(locked) - now());
    if (finalOpen()) return "The last stop is open.";
    return "The last stop opens in " + dur(revealAt() - now());
  }

  /* ---------- a day ---------- */
  function openDay(n) {
    show("chapter");
    const my = token;
    const alive = () => my === token;
    const day = C.days[n];

    $("#chNum").textContent = n;
    $("#chEyebrow").textContent = "Stop " + n + (done.has(n) ? " · ridden" : "");
    $("#chTitle").textContent = fill(day.title);
    const count = paragraphs($("#chStory"), day.story);

    const start = $("#startBtn"), stage = $("#stage"), after = $("#after");
    stage.hidden = true;
    stage.className = "stage";
    stage.innerHTML = "";
    after.hidden = true;
    start.hidden = false;
    start.textContent = fill(day.button || "I'm ready");
    start.style.setProperty("--d", (count * 0.5 + 0.3) + "s");

    start.onclick = () => {
      start.hidden = true;
      stage.hidden = false;
      const game = GAMES[day.activity] || GAMES.envelope;
      game(stage, complete, day, alive);
      stage.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    function complete() {
      if (!alive()) return;
      done.add(n);
      saveDone();
      stage.classList.add("won");
      confetti(110);
      $("#afterText").textContent = fill(day.done);
      $("#afterNext").textContent = n > 1
        ? "Stop " + (n - 1) + " opens " + fmt(unlockAt(n - 1)) + "."
        : "The last stop opens " + fmt(revealAt()) + ".";
      after.hidden = false;
      setTimeout(() => after.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    }
  }

  /* ---------- the last page ---------- */
  function openFinal() {
    show("final");
    const my = token;
    const F = C.final;
    $("#finalTitle").textContent = fill(F.title || "Happy Birthday");
    $("#finalName").textContent = fill(C.herName);
    const fig = $("#finalFig"), img = $("#finalImg");
    fig.classList.remove("empty");
    img.onerror = () => fig.classList.add("empty");
    img.alt = fill(C.herName);
    img.src = F.photo || P.her;
    $("#finalCaption").textContent = fill(F.caption);

    // graffiti tags scattered around the wall
    const tags = $("#tags");
    tags.innerHTML = "";
    const spots = [[3, 4, -12], [70, 2, 8], [2, 30, -6], [78, 26, 10], [4, 58, 9], [74, 54, -9], [8, 80, -4], [66, 82, 6], [38, 1, -3], [42, 92, 4]];
    const cols = ["--pink", "--gold", "--teal", "--coral", "--cream"];
    (F.tags || []).forEach((t, i) => {
      const sp = spots[i % spots.length];
      const el = document.createElement("span");
      el.className = "tag";
      el.textContent = fill(t);
      el.style.left = sp[0] + "%";
      el.style.top = sp[1] + "%";
      el.style.setProperty("--rot", sp[2] + "deg");
      el.style.setProperty("--c", "var(" + cols[i % cols.length] + ")");
      el.style.animationDelay = 0.4 + i * 0.15 + "s";
      tags.appendChild(el);
    });

    const count = paragraphs($("#finalStory"), F.story);
    const sign = $("#finalSign");
    sign.textContent = fill(F.signoff);
    sign.style.setProperty("--d", (1.4 + count * 0.6) + "s");

    $("#showerBtn").onclick = () => shower(6000);
    setTimeout(() => { if (my === token) { confetti(220); shower(12000); } }, 300);
  }

  /* ---------- confetti + heart shower ---------- */
  const cv = $("#confetti"), cx = cv.getContext("2d");
  let parts = [], running = false, showerUntil = 0;
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function palette() {
    const cs = getComputedStyle(document.documentElement);
    return ["--gold", "--pink", "--teal", "--coral", "--cream"].map((v) => cs.getPropertyValue(v).trim());
  }
  function sizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function addPart(kind, cols, y) {
    parts.push({
      kind,
      x: Math.random() * innerWidth, y: y !== undefined ? y : -20 - Math.random() * innerHeight * 0.4,
      vx: (Math.random() - 0.5) * (kind === "heart" ? 1.2 : 3), vy: kind === "heart" ? 1 + Math.random() * 1.6 : 2 + Math.random() * 3,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * (kind === "heart" ? 0.04 : 0.3),
      w: kind === "heart" ? 10 + Math.random() * 14 : 6 + Math.random() * 6, h: 4 + Math.random() * 4,
      sway: Math.random() * 6,
      c: kind === "heart" ? (Math.random() < 0.7 ? cols[1] : cols[3]) : cols[Math.floor(Math.random() * cols.length)]
    });
  }
  function confetti(count) {
    if (reduced()) return;
    sizeCanvas();
    const cols = palette();
    for (let i = 0; i < count; i++) addPart(i % 4 === 0 ? "heart" : "bit", cols);
    if (!running) { running = true; requestAnimationFrame(step); }
  }
  function shower(ms) {
    if (reduced()) return;
    sizeCanvas();
    showerUntil = Date.now() + ms;
    if (!running) { running = true; requestAnimationFrame(step); }
  }
  function heartPath(s) {
    cx.beginPath();
    cx.moveTo(0, s * 0.35);
    cx.bezierCurveTo(-s * 0.9, -s * 0.2, -s * 0.45, -s * 0.85, 0, -s * 0.35);
    cx.bezierCurveTo(s * 0.45, -s * 0.85, s * 0.9, -s * 0.2, 0, s * 0.35);
    cx.fill();
  }
  function step() {
    if (Date.now() < showerUntil) {
      const cols = palette();
      for (let i = 0; i < 2; i++) if (Math.random() < 0.6) addPart(Math.random() < 0.6 ? "heart" : "bit", cols, -20);
    }
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach((p) => {
      p.sway += 0.03;
      p.x += p.vx + (p.kind === "heart" ? Math.sin(p.sway) * 0.6 : 0);
      p.y += p.vy;
      p.vy += p.kind === "heart" ? 0.005 : 0.03;
      p.r += p.vr;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.kind === "heart" ? Math.sin(p.r) * 0.4 : p.r);
      cx.fillStyle = p.c;
      if (p.kind === "heart") { cx.globalAlpha = 0.9; heartPath(p.w); }
      else cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx.restore();
    });
    parts = parts.filter((p) => p.y < innerHeight + 30);
    if (parts.length || Date.now() < showerUntil) requestAnimationFrame(step);
    else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  /* ---------- the games ----------
     Each game gets (stage element, done callback, day config, alive()).
     Call done() once when she wins. Stop loops when alive() is false. */
  const GAMES = {};

  GAMES.envelope = (el, done) => {
    el.innerHTML = '<p class="hint">Knock three times.</p>' +
      '<button class="envelope" type="button" aria-label="Knock on the envelope"><span class="flap"></span><span class="seal">♥</span></button>' +
      '<p class="count" aria-live="polite">0 / 3</p>';
    const b = $(".envelope", el), c = $(".count", el);
    let k = 0;
    b.onclick = () => {
      if (k >= 3) return;
      k++;
      c.textContent = k + " / 3";
      restart(b, "shake");
      if (k === 3) { b.classList.add("open"); c.textContent = "Come in."; setTimeout(done, 800); }
    };
  };

  GAMES.balloons = (el, done) => {
    const N = 7;
    el.innerHTML = '<p class="hint">Pop all ' + N + ' balloons.</p><div class="sky"></div><p class="count" aria-live="polite">0 / ' + N + "</p>";
    const sky = $(".sky", el), c = $(".count", el);
    const cols = ["--pink", "--gold", "--teal", "--coral"];
    let popped = 0;
    for (let i = 0; i < N; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "balloon";
      b.setAttribute("aria-label", "Pop balloon");
      b.style.left = (9 + i * (82 / (N - 1))) + "%";
      b.style.bottom = (20 + (i % 3) * 38) + "px";
      b.style.setProperty("--d", -((i * 0.37) % 2.4) + "s");
      b.style.setProperty("--c", "var(" + cols[i % cols.length] + ")");
      b.onclick = () => {
        b.disabled = true;
        b.classList.add("pop");
        popped++;
        c.textContent = popped + " / " + N;
        setTimeout(() => b.remove(), 300);
        if (popped === N) setTimeout(done, 400);
      };
      sky.appendChild(b);
    }
  };

  GAMES.hold = (el, done, day, alive) => {
    const heart = "M50 86 C20 64 4 48 4 28 A23 23 0 0 1 50 16 A23 23 0 0 1 96 28 C96 48 80 64 50 86Z";
    el.innerHTML = '<p class="hint">Press and hold the heart until it\'s full.</p>' +
      '<button class="bigheart" type="button" aria-label="Hold to fill the heart">' +
      '<svg viewBox="0 0 100 90"><defs><clipPath id="heartClip"><path d="' + heart + '"/></clipPath></defs>' +
      '<path class="hh-bg" d="' + heart + '"/>' +
      '<rect class="hh-fill" x="0" y="90" width="100" height="90" clip-path="url(#heartClip)"/>' +
      '<path class="hh-line" d="' + heart + '"/></svg></button>' +
      '<p class="count" aria-live="off">0%</p>';
    const b = $(".bigheart", el), rect = $(".hh-fill", el), c = $(".count", el);
    let v = 0, holding = false, last = 0, fin = false;
    const set = (on) => { holding = on; b.classList.toggle("holding", on); };
    b.addEventListener("pointerdown", (e) => { set(true); try { b.setPointerCapture(e.pointerId); } catch (_) {} });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => b.addEventListener(ev, () => set(false)));
    b.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); set(true); } });
    b.addEventListener("keyup", () => set(false));
    b.addEventListener("contextmenu", (e) => e.preventDefault());
    const loop = (t) => {
      if (!alive() || fin) return;
      const dt = last ? Math.min(0.1, (t - last) / 1000) : 0;
      last = t;
      v = Math.max(0, Math.min(1, v + (holding ? dt / 2.4 : -dt / 3)));
      rect.setAttribute("y", 90 - 90 * v);
      c.textContent = Math.round(v * 100) + "%";
      if (v >= 1) { fin = true; set(false); c.textContent = "100%"; setTimeout(done, 300); return; }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  GAMES.scratch = (el, done, day) => {
    el.innerHTML = '<p class="hint">Scratch the foil off.</p>' +
      '<div class="scratch"><p class="secret"></p><canvas aria-label="Scratch card"></canvas></div>';
    $(".secret", el).textContent = fill(day.secret || "You win.");
    const box = $(".scratch", el), cv = $("canvas", el), g = cv.getContext("2d");
    const r = box.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    g.scale(dpr, dpr);
    const grad = g.createLinearGradient(0, 0, r.width, r.height);
    grad.addColorStop(0, "#c39a45"); grad.addColorStop(0.5, "#f3dc94"); grad.addColorStop(1, "#b5872f");
    g.fillStyle = grad; g.fillRect(0, 0, r.width, r.height);
    g.fillStyle = "rgba(70,35,10,.55)";
    g.font = "700 14px Unbounded, sans-serif";
    g.textAlign = "center";
    g.fillText("SCRATCH HERE", r.width / 2, r.height / 2 + 5);
    g.globalCompositeOperation = "destination-out";
    g.lineWidth = 36; g.lineCap = "round"; g.lineJoin = "round";

    let down = false, prev = null, moves = 0, fin = false, rect = r;
    const pt = (e) => ({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    const check = () => {
      const data = g.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0, total = 0;
      for (let i = 3; i < data.length; i += 4 * 16) { total++; if (data[i] === 0) clear++; }
      if (clear / total > 0.55) { fin = true; cv.style.opacity = 0; setTimeout(done, 600); }
    };
    cv.addEventListener("pointerdown", (e) => {
      if (fin) return;
      down = true; rect = cv.getBoundingClientRect(); prev = pt(e);
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      g.beginPath(); g.arc(prev.x, prev.y, 18, 0, Math.PI * 2); g.fill();
    });
    cv.addEventListener("pointermove", (e) => {
      if (!down || fin) return;
      const p = pt(e);
      g.beginPath(); g.moveTo(prev.x, prev.y); g.lineTo(p.x, p.y); g.stroke();
      prev = p;
      if (++moves % 8 === 0) check();
    });
    ["pointerup", "pointercancel"].forEach((ev) => cv.addEventListener(ev, () => { down = false; if (!fin) check(); }));
  };

  GAMES.drag = (el, done) => {
    el.innerHTML = '<p class="hint">Drag the star into the jar.</p>' +
      '<div class="dragzone"><button class="star" type="button" aria-label="Star. Drag it into the jar, or press Enter to drop it in.">★</button>' +
      '<div class="jar"><span class="jar-lid"></span><span class="jar-label">wishes</span></div></div>';
    const star = $(".star", el), jar = $(".jar", el);
    let sx = 0, sy = 0, dx = 0, dy = 0, dragging = false, fin = false;
    const over = () => {
      const a = star.getBoundingClientRect(), j = jar.getBoundingClientRect();
      const cx = a.left + a.width / 2, cy = a.top + a.height / 2;
      return cx > j.left - 10 && cx < j.right + 10 && cy > j.top - 30 && cy < j.bottom;
    };
    const land = () => {
      fin = true;
      const a = star.getBoundingClientRect(), j = jar.getBoundingClientRect();
      dx += (j.left + j.width / 2) - (a.left + a.width / 2);
      dy += (j.top + j.height * 0.55) - (a.top + a.height / 2);
      star.classList.remove("held");
      star.classList.add("landed");
      star.style.transform = "translate(" + dx + "px," + dy + "px) scale(.8)";
      jar.classList.add("near");
      setTimeout(done, 650);
    };
    star.addEventListener("pointerdown", (e) => {
      if (fin) return;
      dragging = true;
      try { star.setPointerCapture(e.pointerId); } catch (_) {}
      sx = e.clientX - dx; sy = e.clientY - dy;
      star.classList.add("held");
    });
    star.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      star.style.transform = "translate(" + dx + "px," + dy + "px)";
      jar.classList.toggle("near", over());
    });
    const release = () => {
      if (!dragging || fin) return;
      dragging = false;
      if (over()) land();
      else { star.classList.remove("held"); dx = dy = 0; star.style.transform = ""; jar.classList.remove("near"); }
    };
    star.addEventListener("pointerup", release);
    star.addEventListener("pointercancel", release);
    star.addEventListener("click", (e) => { if (e.detail === 0 && !fin) land(); });
  };

  GAMES.arrow = (el, done, day, alive) => {
    const need = day.hits || 2;
    el.innerHTML = '<p class="hint">Shoot the arrow through the heart. ' + need + " hits to pass.</p>" +
      '<div class="range"><span class="target" aria-hidden="true">♥</span><span class="aimline"></span><span class="arrow"></span></div>' +
      '<button class="btn shoot" type="button">Shoot</button><p class="count" aria-live="polite">0 / ' + need + "</p>";
    const tg = $(".target", el), ar = $(".arrow", el), c = $(".count", el), btn = $(".shoot", el);
    let hits = 0, flying = false, fin = false, x = 0.5, phase = 0, speed = 1.7, last = 0;
    const loop = (t) => {
      if (!alive() || fin) return;
      const dt = last ? (t - last) / 1000 : 0;
      last = t;
      phase += dt * speed;
      x = 0.5 + 0.4 * Math.sin(phase);
      tg.style.left = x * 100 + "%";
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    btn.onclick = () => {
      if (flying || fin) return;
      flying = true;
      restart(ar, "fly");
      setTimeout(() => {
        if (!alive()) return;
        if (Math.abs(x - 0.5) < 0.075) {
          hits++;
          restart(tg, "hit");
          speed += 0.8;
          c.textContent = hits + " / " + need;
          if (hits >= need) { fin = true; btn.disabled = true; c.textContent = "Bullseye."; setTimeout(done, 600); }
        } else {
          c.textContent = hits + " / " + need + " · missed. Again.";
        }
      }, 370);
      setTimeout(() => { flying = false; ar.classList.remove("fly"); }, 560);
    };
  };

  GAMES.catch = (el, done, day, alive) => {
    const need = day.need || 6;
    el.innerHTML = '<p class="hint">Catch ' + need + ' hearts before they hit the ground.</p><div class="rain"></div><p class="count" aria-live="polite">0 / ' + need + "</p>";
    const rain = $(".rain", el), c = $(".count", el);
    const cols = ["var(--pink)", "var(--coral)", "var(--gold)"];
    let got = 0, fin = false, iv = null;
    const spawn = () => {
      if (!alive() || fin) { clearInterval(iv); return; }
      const b = document.createElement("button");
      b.type = "button";
      b.className = "drop";
      b.textContent = "♥";
      b.setAttribute("aria-label", "Catch heart");
      b.style.left = 8 + Math.random() * 84 + "%";
      b.style.color = cols[Math.floor(Math.random() * cols.length)];
      b.style.animationDuration = 2.4 + Math.random() * 1.4 + "s";
      b.addEventListener("animationend", () => b.remove());
      b.addEventListener("click", () => {
        if (b.dataset.got) return;
        b.dataset.got = "1";
        const tr = getComputedStyle(b).transform;
        b.style.animation = "none";
        b.style.transform = tr === "none" ? "" : tr;
        void b.offsetWidth;
        b.style.transition = "transform .3s ease, opacity .3s ease";
        b.style.transform = (tr === "none" ? "" : tr) + " scale(1.9)";
        b.style.opacity = "0";
        setTimeout(() => b.remove(), 320);
        got++;
        c.textContent = got + " / " + need;
        if (got >= need && !fin) { fin = true; clearInterval(iv); setTimeout(done, 400); }
      });
      rain.appendChild(b);
    };
    spawn();
    iv = setInterval(spawn, 620);
  };

  GAMES.letters = (el, done) => {
    const raw = String(C.herName || "").toUpperCase().replace(/[^A-Z]/g, "");
    const word = raw.length >= 3 && raw.length <= 10 ? raw : "LOVE";
    el.innerHTML = '<p class="hint">Tap the letters in the right order.</p><div class="slots"></div><div class="tiles"></div>';
    const slots = $(".slots", el), tiles = $(".tiles", el);
    const slotEls = [...word].map(() => { const s = document.createElement("span"); s.className = "slot"; slots.appendChild(s); return s; });
    let letters = [...word];
    for (let tries = 0; tries < 20; tries++) {
      letters.sort(() => Math.random() - 0.5);
      if (letters.join("") !== word) break;
    }
    let k = 0;
    letters.forEach((ch) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tile";
      b.textContent = ch;
      b.onclick = () => {
        if (k >= word.length) return;
        if (ch === word[k]) {
          slotEls[k].textContent = ch;
          slotEls[k].classList.add("on");
          b.classList.add("used");
          b.disabled = true;
          k++;
          if (k === word.length) setTimeout(done, 500);
        } else {
          restart(b, "wrong");
          setTimeout(() => b.classList.remove("wrong"), 320);
        }
      };
      tiles.appendChild(b);
    });
  };

  GAMES.candle = (el, done, day, alive) => {
    el.innerHTML = '<p class="hint">Make a wish first. Then blow the candle out.</p>' +
      '<div class="cake" aria-hidden="true"><span class="smoke"></span><span class="flame"></span><span class="wick"></span><span class="candle"></span><span class="tier"></span></div>' +
      '<div class="row"><button class="btn mic" type="button">Blow into the mic</button><button class="btn ghost holdblow" type="button">Hold to blow</button></div>' +
      '<p class="count" aria-live="polite"></p>';
    const flame = $(".flame", el), cake = $(".cake", el), c = $(".count", el);
    const mic = $(".mic", el), hb = $(".holdblow", el);
    let fin = false, stream = null, ac = null;

    const stop = () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (ac) ac.close().catch(() => {});
      stream = null; ac = null;
    };
    const out = () => {
      if (fin) return;
      fin = true;
      stop();
      flame.style.transform = "";
      flame.classList.add("out");
      cake.classList.add("smoking");
      mic.disabled = true; hb.disabled = true;
      c.textContent = "Out. Wish sealed.";
      setTimeout(done, 1100);
    };

    mic.onclick = async () => {
      if (fin) return;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        c.textContent = "This browser can't use the mic. Use the hold button."; return;
      }
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) { c.textContent = "No mic access. Use the hold button instead."; return; }
      ac = new (window.AudioContext || window.webkitAudioContext)();
      const an = ac.createAnalyser();
      an.fftSize = 512;
      ac.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.fftSize);
      let acc = 0, last = 0;
      mic.disabled = true;
      c.textContent = "Listening. Blow.";
      const loop = (t) => {
        if (fin) return;
        if (!alive()) { stop(); return; }
        an.getByteTimeDomainData(buf);
        let s = 0;
        for (let i = 0; i < buf.length; i++) { const d = (buf[i] - 128) / 128; s += d * d; }
        const rms = Math.sqrt(s / buf.length);
        const dt = last ? (t - last) / 1000 : 0;
        last = t;
        acc = rms > 0.1 ? acc + dt : Math.max(0, acc - dt * 0.5);
        flame.style.transform = "scale(" + Math.max(0.3, 1 - acc * 1.4) + "," + (1 - Math.min(rms * 2, 0.6)) + ") skewX(" + Math.min(rms * 80, 30) + "deg)";
        if (acc > 0.45) out(); else requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    };

    let holding = false, hv = 0, hlast = 0, looping = false;
    const hloop = (t) => {
      if (fin || !alive()) { looping = false; return; }
      const dt = hlast ? Math.min(0.1, (t - hlast) / 1000) : 0;
      hlast = t;
      hv = Math.max(0, hv + (holding ? dt : -dt * 0.7));
      const k = Math.min(1, hv / 1.6);
      flame.style.transform = "scale(" + (1 - k * 0.75) + "," + (1 - k * 0.5) + ") skewX(" + k * 25 + "deg)";
      if (hv >= 1.6) { out(); looping = false; return; }
      if (!holding && hv === 0) { looping = false; hlast = 0; return; }
      requestAnimationFrame(hloop);
    };
    const press = (on) => {
      holding = on;
      if (on && !looping && !fin) { looping = true; hlast = 0; requestAnimationFrame(hloop); }
    };
    hb.addEventListener("pointerdown", (e) => { press(true); try { hb.setPointerCapture(e.pointerId); } catch (_) {} });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => hb.addEventListener(ev, () => press(false)));
    hb.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); press(true); } });
    hb.addEventListener("keyup", () => press(false));
    hb.addEventListener("contextmenu", (e) => e.preventDefault());
  };

  GAMES.slide = (el, done) => {
    el.innerHTML = '<p class="hint">Slide the key all the way across.</p>' +
      '<div class="slider"><span class="slabel">slide to unlock →</span><input id="slideKey" type="range" min="0" max="100" value="0" aria-label="Slide to unlock"></div>';
    const r = $("input", el), lab = $(".slabel", el), wrap = $(".slider", el);
    let fin = false;
    const update = () => {
      lab.style.opacity = Math.max(0, 1 - r.value / 50);
      wrap.style.setProperty("--p", r.value + "%");
      if (+r.value >= 98 && !fin) { fin = true; r.disabled = true; lab.textContent = "unlocked"; lab.style.opacity = 1; setTimeout(done, 300); }
    };
    r.addEventListener("input", update);
    const release = () => {
      if (fin) return;
      const back = () => {
        if (fin) return;
        r.value = Math.max(0, r.value - 7);
        update();
        if (+r.value > 0) requestAnimationFrame(back);
      };
      requestAnimationFrame(back);
    };
    r.addEventListener("pointerup", release);
    r.addEventListener("touchend", release);
  };

  const bg = (el, src) => { el.style.backgroundImage = 'url("' + src + '")'; };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* memory cards: her photo, his photo and four symbols, six pairs */
  GAMES.match = (el, done) => {
    el.innerHTML = '<p class="hint">Find all six pairs.</p><div class="cards"></div><p class="count" aria-live="polite">0 / 6</p>';
    const grid = $(".cards", el), c = $(".count", el);
    const faces = [{ img: P.herSquare || P.her }, { img: P.him }, { t: "♥" }, { t: "★" }, { t: "✿" }, { t: "☾" }];
    const deck = shuffle(faces.concat(faces).map((f, i) => Object.assign({ id: faces.indexOf(f) }, f)));
    let open = [], pairs = 0, busy = false;
    deck.forEach((f) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "card";
      b.setAttribute("aria-label", "Card");
      b.innerHTML = '<span class="card-in"><span class="card-back">♥</span><span class="card-front"></span></span>';
      const front = $(".card-front", b);
      if (f.img) { front.classList.add("pic"); bg(front, f.img); } else front.textContent = f.t;
      b.onclick = () => {
        if (busy || b.classList.contains("flip")) return;
        b.classList.add("flip");
        open.push({ b, id: f.id });
        if (open.length < 2) return;
        const [x, y] = open;
        open = [];
        if (x.id === y.id) {
          x.b.classList.add("matched"); y.b.classList.add("matched");
          pairs++;
          c.textContent = pairs + " / 6";
          if (pairs === 6) setTimeout(done, 600);
        } else {
          busy = true;
          setTimeout(() => { x.b.classList.remove("flip"); y.b.classList.remove("flip"); busy = false; }, 800);
        }
      };
      grid.appendChild(b);
    });
  };

  /* two half-hearts: his stays put, she drags hers across to join */
  GAMES.join = (el, done) => {
    el.innerHTML = '<p class="hint">Drag your half to mine.</p>' +
      '<div class="joinzone"><div class="half left" aria-hidden="true"></div>' +
      '<button class="half right" type="button" aria-label="Your half of the heart. Drag it to the other half, or press Enter."></button></div>' +
      '<p class="count" aria-live="polite"></p>';
    const zone = $(".joinzone", el), his = $(".half.left", el), hers = $(".half.right", el), c = $(".count", el);
    bg(his, P.him); bg(hers, P.her);
    let sx = 0, sy = 0, dx = 0, dy = 0, dragging = false, fin = false;
    const gap = () => {
      const a = his.getBoundingClientRect(), b = hers.getBoundingClientRect();
      return { x: b.left - a.right, y: b.top - a.top };
    };
    const snap = () => {
      fin = true;
      const g = gap();
      dx -= g.x; dy -= g.y;
      hers.classList.remove("held");
      hers.classList.add("landed");
      hers.style.transform = "translate(" + dx + "px," + dy + "px)";
      zone.classList.add("joined");
      c.textContent = "♥";
      setTimeout(done, 900);
    };
    hers.addEventListener("pointerdown", (e) => {
      if (fin) return;
      dragging = true;
      try { hers.setPointerCapture(e.pointerId); } catch (_) {}
      sx = e.clientX - dx; sy = e.clientY - dy;
      hers.classList.add("held");
    });
    hers.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      hers.style.transform = "translate(" + dx + "px," + dy + "px)";
      const g = gap();
      zone.classList.toggle("near", Math.abs(g.x) < 40 && Math.abs(g.y) < 40);
    });
    const release = () => {
      if (!dragging || fin) return;
      dragging = false;
      const g = gap();
      if (Math.abs(g.x) < 40 && Math.abs(g.y) < 40) snap();
      else { hers.classList.remove("held"); dx = dy = 0; hers.style.transform = ""; zone.classList.remove("near"); c.textContent = "Closer. Right up against mine."; }
    };
    hers.addEventListener("pointerup", release);
    hers.addEventListener("pointercancel", release);
    hers.addEventListener("click", (e) => { if (e.detail === 0 && !fin) snap(); });
  };

  /* 3x3 photo puzzle: tap two tiles to swap them */
  GAMES.puzzle = (el, done) => {
    const src = P.herSquare || P.her;
    el.innerHTML = '<p class="hint">Tap two pieces to swap them. Put the picture back together.</p>' +
      '<div class="puzzle-wrap"><div class="board"></div><div class="peek" aria-hidden="true"></div></div>' +
      '<p class="count" aria-live="polite">0 moves</p>';
    const board = $(".board", el), c = $(".count", el);
    bg($(".peek", el), src);
    let order;
    do { order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]); } while (order.every((v, i) => v === i));
    let pick = null, moves = 0, fin = false;
    const tiles = [];
    const paint = () => order.forEach((piece, slot) => {
      const t = tiles[slot];
      t.style.backgroundPosition = (piece % 3) * 50 + "% " + Math.floor(piece / 3) * 50 + "%";
      t.classList.toggle("right", piece === slot);
    });
    for (let slot = 0; slot < 9; slot++) {
      const t = document.createElement("button");
      t.type = "button";
      t.className = "piece";
      t.setAttribute("aria-label", "Piece " + (slot + 1));
      bg(t, src);
      t.onclick = () => {
        if (fin) return;
        if (pick === null) { pick = slot; t.classList.add("picked"); return; }
        tiles[pick].classList.remove("picked");
        if (pick !== slot) {
          [order[pick], order[slot]] = [order[slot], order[pick]];
          moves++;
          c.textContent = moves + (moves === 1 ? " move" : " moves");
          paint();
        }
        pick = null;
        if (order.every((v, i) => v === i)) {
          fin = true;
          board.classList.add("solved");
          c.textContent = "Solved in " + moves + " moves.";
          setTimeout(done, 900);
        }
      };
      tiles.push(t);
      board.appendChild(t);
    }
    paint();
  };

  /* ---------- wire up ---------- */
  $("#backBtn").onclick = renderHome;
  $("#backBtn2").onclick = renderHome;
  $("#homeBtn").onclick = renderHome;
  renderTestBar();
  renderHome();
})();
