(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---- dars progressi ---- */
  var KEY = "ilmiy-yol-progress";
  function load() { try { var v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  function paint() {
    var done = load();
    var items = document.querySelectorAll("li[data-lesson]");
    var n = 0;
    items.forEach(function (li) {
      var d = done.indexOf(li.getAttribute("data-lesson")) >= 0;
      li.classList.toggle("is-done", d);
      if (d) n++;
    });
    var prog = $("prog");
    if (prog) {
      var t = parseInt(prog.getAttribute("data-total"), 10) || items.length;
      prog.textContent = n + " / " + t + " dars tugatildi";
      var bar = $("pbar");
      if (bar && bar.firstElementChild) bar.firstElementChild.style.width = (t ? Math.round(n / t * 100) : 0) + "%";
    }
    var btn = document.querySelector("button[data-done]");
    if (btn) {
      var isDone = done.indexOf(btn.getAttribute("data-done")) >= 0;
      btn.textContent = isDone ? "Tugatildi (bekor qilish)" : "Darsni tugatdim";
      btn.classList.toggle("btn-ghost", isDone);
      btn.classList.toggle("btn-primary", !isDone);
    }
  }
  var doneBtn = document.querySelector("button[data-done]");
  if (doneBtn) {
    doneBtn.addEventListener("click", function () {
      var id = doneBtn.getAttribute("data-done");
      var a = load(); var i = a.indexOf(id);
      if (i >= 0) a.splice(i, 1); else a.push(id);
      save(a); paint();
    });
  }
  paint();

  /* ---- Q kalkulyatori ---- */
  (function () {
    var rank = $("rank"), total = $("total"), badge = $("qbadge"), text = $("qtext"), form = $("qform");
    if (!rank || !total || !badge || !text) return;
    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });
    function update() {
      var r = parseInt(rank.value, 10), t = parseInt(total.value, 10);
      if (!(r >= 1 && t >= 1 && r <= t)) {
        badge.className = "qbadge q4"; badge.textContent = "?";
        text.textContent = "O'rin 1 dan sohadagi jurnallar soniga qadar bo'lishi kerak.";
        return;
      }
      var p = (r / t) * 100;
      var q = p <= 25 ? 1 : p <= 50 ? 2 : p <= 75 ? 3 : 4;
      var words = { 1: "sohadagi eng yuqori to'rtdan biriga kiradi.", 2: "sohadagi ikkinchi to'rtdan birga kiradi.", 3: "sohadagi uchinchi to'rtdan birga kiradi.", 4: "sohadagi eng quyi to'rtdan birga kiradi." };
      badge.className = "qbadge q" + q; badge.textContent = "Q" + q;
      text.textContent = "";
      var s = el("span", "pct", (Math.round(p * 10) / 10) + "%");
      text.appendChild(s);
      text.appendChild(document.createTextNode(" bilan " + words[q]));
    }
    rank.addEventListener("input", update); total.addEventListener("input", update); update();
  })();

  /* ---- soxta jurnal belgilari ---- */
  (function () {
    var form = $("pform"); if (!form) return;
    var boxes = form.querySelectorAll("input[type=checkbox]");
    var verdict = $("verdict"), title = $("vtitle"), count = $("vcount"), body = $("vtext");
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    function update() {
      var n = 0; boxes.forEach(function (b) { if (b.checked) n++; });
      count.textContent = n + " / " + boxes.length + " belgi";
      if (n === 0) {
        verdict.dataset.level = "none"; title.textContent = "Belgi tanlanmadi";
        body.textContent = "Jurnal haqida bilganlaringizni belgilang. Belgi bo'lmasa ham jurnalni Scopus Sources yoki Web of Science Master Journal List'da tekshirishni unutmang.";
      } else if (n <= 2) {
        verdict.dataset.level = "warn"; title.textContent = "Ehtiyot bo'ling";
        body.textContent = "Bir necha belgi bor. Yuborishdan oldin jurnalni Scopus Sources va Web of Science Master Journal List'da tekshiring, hamkasblardan so'rang.";
      } else {
        verdict.dataset.level = "bad"; title.textContent = "Yuqori xavf";
        body.textContent = "Bu soxta (predatory) jurnal bo'lishi ehtimoli yuqori. Maqola yuborishdan va to'lov qilishdan oldin yana bir bor mustaqil tekshiring.";
      }
    }
    boxes.forEach(function (b) { b.addEventListener("change", update); }); update();
  })();

  /* ---- namuna so'rovni nusxalash ---- */
  (function () {
    var btn = $("copy-btn"), pre = $("prompt-text"); if (!btn || !pre) return;
    var timer;
    function reset() { btn.textContent = "Nusxalash"; }
    function selectText() { var r = document.createRange(); r.selectNodeContents(pre); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
    btn.addEventListener("click", function () {
      clearTimeout(timer);
      var ok = function () { btn.textContent = "Nusxalandi"; timer = setTimeout(reset, 2000); };
      var fail = function () { selectText(); btn.textContent = "Matn belgilandi, nusxalang"; timer = setTimeout(reset, 3000); };
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) { fail(); return; }
        navigator.clipboard.writeText(pre.textContent).then(ok, fail);
      } catch (e) { fail(); }
    });
  })();

  /* ---- matn tekshiruvi (qoidalar asosida, brauzerda) ---- */
  (function () {
    var ta = $("txt"), out = $("txt-out"); if (!ta || !out) return;
    var SAMPLE = ta.value;
    var PHRASES = [
      ["in order to", "to"], ["due to the fact that", "because"], ["given the fact that", "because"],
      ["in spite of the fact that", "although"], ["a large number of", "many"], ["a number of", "several"],
      ["at the present time", "now"], ["in the event that", "if"], ["with regard to", "about"],
      ["for the purpose of", "for"], ["it is important to note that", "(olib tashlang)"],
      ["it should be noted that", "(olib tashlang)"], ["has the ability to", "can"], ["is able to", "can"],
      ["on the basis of", "based on"], ["a wide variety of", "many"],
      ["the subject of", "(ortiqcha bo'lishi mumkin)"], ["the use of", "(ortiqcha bo'lishi mumkin)"]
    ];
    var WEAK = ["very", "really", "extremely", "quite", "basically"];
    var STOP = "about above after again against also among because been before being between both could does doing during each from further have having here into itself just more most other over same should some such than that their them then there these they this those through under until were what when where which while will with would your".split(" ");
    function words(t) { return t.match(/[A-Za-z0-9'’-]+/g) || []; }
    function sentences(t) { return (t.match(/[^.!?]+[.!?]*/g) || []).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; }); }
    function section(title, items, empty) {
      var box = el("div"); box.appendChild(el("h4", null, title));
      if (!items.length) { box.appendChild(el("p", "rnone", empty)); return box; }
      var ul = el("ul", "rlist"); items.forEach(function (x) { ul.appendChild(el("li", null, x)); }); box.appendChild(ul); return box;
    }
    function run() {
      var t = ta.value, ws = words(t), ss = sentences(t), n = ws.length;
      out.textContent = "";
      if (!n) { out.appendChild(el("p", "rnone", "Matn kiriting.")); return; }
      var stats = el("div", "stats");
      [[n, "so'z"], [ss.length, "jumla"], [Math.round(n / ss.length), "o'rtacha jumla uzunligi"]].forEach(function (p) {
        var s = el("div", "stat"); s.appendChild(el("b", null, String(p[0]))); s.appendChild(el("span", null, p[1])); stats.appendChild(s);
      });
      out.appendChild(stats);

      var found = [];
      PHRASES.forEach(function (p) {
        var re = new RegExp("\\b" + p[0].replace(/ /g, "\\s+") + "\\b", "gi");
        var m = t.match(re);
        if (m) found.push("“" + p[0] + "” → " + p[1] + (m.length > 1 ? " (" + m.length + " marta)" : ""));
      });
      out.appendChild(section("Ortiqcha iboralar", found, "Topilmadi."));

      var lower = ws.map(function (w) { return w.toLowerCase(); });
      var weak = [];
      WEAK.forEach(function (w) { var c = lower.filter(function (x) { return x === w; }).length; if (c) weak.push(w + " (" + c + " marta)"); });
      out.appendChild(section("Kuchsiz kuchaytirgichlar", weak, "Topilmadi. Bunday so'zlar (very, really) o'rniga aniq so'z tanlang."));

      var long = [];
      ss.forEach(function (s) { var c = words(s).length; if (c > 30) long.push(words(s).slice(0, 7).join(" ") + "... (" + c + " so'z)"); });
      out.appendChild(section("Uzun jumlalar (30 so'zdan ortiq)", long, "Topilmadi."));

      var freq = {};
      lower.forEach(function (w) { if (w.length >= 5 && STOP.indexOf(w) < 0) freq[w] = (freq[w] || 0) + 1; });
      var rep = Object.keys(freq).filter(function (w) { return freq[w] >= 4; }).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 5).map(function (w) { return w + " (" + freq[w] + " marta)"; });
      out.appendChild(section("Ko'p takrorlangan so'zlar", rep, "Topilmadi."));

      out.appendChild(el("p", "example", "Bu Grammarly emas. Vosita grammatikani tekshirmaydi va faqat oddiy qoidalar bo'yicha ishlaydi. Matn brauzeringizda qoladi, hech qayerga yuborilmaydi. Abstract uchun so'zlar sonini jurnal talabi bilan solishtiring."));
    }
    ta.addEventListener("input", run);
    var reset = $("txt-reset");
    if (reset) reset.addEventListener("click", function () { ta.value = SAMPLE; run(); });
    run();
  })();
})();
