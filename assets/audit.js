/* Listora — Listing SEO Audit engine (client-side, zero cost)
 * Scores an Etsy listing the way Etsy search rewards signals:
 *   Title optimization, Tags coverage, Keyword strategy, Description quality, Completeness.
 * Weights sum to 100. All logic runs in-browser; no network calls for scoring.
 */
(function () {
  "use strict";

  var form = document.getElementById("auditForm");
  var result = document.getElementById("auditResult");
  var titleEl = document.getElementById("fTitle");
  var tagsEl = document.getElementById("fTags");
  var descEl = document.getElementById("fDesc");
  var kwEl = document.getElementById("fKeyword");
  var titleCount = document.getElementById("titleCount");
  var tagCount = document.getElementById("tagCount");
  var heroScore = document.getElementById("heroScore");
  var heroGrade = document.getElementById("heroGrade");

  var MAX_TITLE = 140;
  var MAX_TAGS = 13;

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function gradeFor(score) {
    if (score >= 85) return { g: "A", color: "var(--good)" };
    if (score >= 70) return { g: "B", color: "var(--brand)" };
    if (score >= 55) return { g: "C", color: "var(--warn)" };
    return { g: "D", color: "var(--bad)" };
  }

  // ---- live counters ----
  function updateCounts() {
    titleCount.textContent = titleEl.value.length + " / " + MAX_TITLE;
    var tags = parseTags(tagsEl.value);
    tagCount.textContent = tags.length + " / " + MAX_TAGS;
  }
  function parseTags(raw) {
    return raw
      .split(",")
      .map(function (t) { return t.trim().toLowerCase(); })
      .filter(function (t) { return t.length > 0; });
  }
  function wordCount(s) { return (s.trim().match(/\S+/g) || []).length; }
  function hasMultiWord(tags) {
    return tags.filter(function (t) { return t.split(/\s+/).length >= 2; }).length;
  }

  titleEl.addEventListener("input", updateCounts);
  tagsEl.addEventListener("input", updateCounts);

  // ---- scoring ----
  function scoreListing(input) {
    var title = input.title;
    var tags = input.tags;
    var desc = input.desc;
    var kw = input.keyword;
    var tips = [];
    var dims = {};

    // 1) Title (25)
    var tLen = title.length;
    var tScore = 0;
    if (tLen >= 120 && tLen <= MAX_TITLE) tScore = 25;
    else if (tLen >= 80) tScore = 20;
    else if (tLen >= 40) tScore = 12;
    else if (tLen > 0) tScore = 4;
    if (tLen === 0) tScore = 0;
    // keyword near front bonus
    if (kw && tLen) {
      var firstWords = title.toLowerCase().split(/\s+/).slice(0, 4).join(" ");
      if (firstWords.indexOf(kw.toLowerCase()) !== -1) tScore = clamp(tScore + 2, 0, 25);
      else tips.push("Put your main keyword “" + kw + "” near the front of the title — Etsy weighs the first words most.");
    }
    if (tLen < 120 && tLen > 0) tips.push("Title is " + tLen + " chars. Etsy gives you 140 — use more of it with relevant phrases buyers search.");
    if (tLen < 40) tips.push("Title is very short. Aim for 120–140 chars packed with search phrases, not just the product name.");
    dims.Title = { score: tScore, max: 25 };

    // 2) Tags (25): need 13, reward multi-word
    var nTags = tags.length;
    var tagFill = (Math.min(nTags, MAX_TAGS) / MAX_TAGS) * 18;
    var multi = hasMultiWord(tags);
    var tagPhrase = (multi / MAX_TAGS) * 7; // up to 7 for all multi-word
    var tagScore = Math.round(tagFill + tagPhrase);
    if (nTags < MAX_TAGS) tips.push("You have " + nTags + " tags. Etsy allows 13 — fill all of them; each is a free search entry point.");
    if (nTags > 0 && multi < nTags) tips.push("Use multi-word tags (e.g. “printable planner” not “planner”). Etsy matches phrases buyers actually type.");
    dims.Tags = { score: tagScore, max: 25 };

    // 3) Keyword strategy (20): present in title/tags/desc
    var kwScore = 0;
    if (kw) {
      var kwL = kw.toLowerCase();
      var inTitle = title.toLowerCase().indexOf(kwL) !== -1;
      var inTags = tags.indexOf(kwL) !== -1 || tags.some(function (t) { return t.indexOf(kwL) !== -1; });
      var inDesc = desc.toLowerCase().indexOf(kwL) !== -1;
      if (inTitle) kwScore += 8; else tips.push("Your target keyword isn’t in the title — add it.");
      if (inTags) kwScore += 6; else tips.push("Add your target keyword as one of the 13 tags.");
      if (inDesc) kwScore += 6; else tips.push("Mention your target keyword in the description too.");
      // duplicate tag check
      if (tags.length !== new Set(tags).size) tips.push("You have duplicate tags — each tag should be unique to maximize reach.");
    } else {
      kwScore = 12; // neutral when no keyword provided
      tips.push("Add a target keyword to get a deeper keyword-coverage analysis.");
    }
    dims.Keywords = { score: kwScore, max: 20 };

    // 4) Description (15): length + signal words
    var dLen = desc.length;
    var dScore = 0;
    if (dLen >= 600) dScore = 15;
    else if (dLen >= 300) dScore = 12;
    else if (dLen >= 120) dScore = 8;
    else if (dLen > 0) dScore = 3;
    if (dLen < 300 && dLen > 0) tips.push("Description is " + dLen + " chars. Aim for 300+ with what’s included, format, and who it’s for.");
    if (dLen === 0) tips.push("Add a description — it’s indexable and builds buyer trust.");
    dims.Description = { score: dScore, max: 15 };

    // 5) Completeness (15)
    var comp = 0;
    if (tLen > 0) comp += 5;
    if (nTags === MAX_TAGS) comp += 5; else if (nTags > 0) comp += Math.round((nTags / MAX_TAGS) * 5);
    if (dLen > 0) comp += 5;
    dims.Completeness = { score: comp, max: 15 };

    var total = Math.round(dims.Title.score + dims.Tags.score + dims.Keywords.score + dims.Description.score + dims.Completeness.score);
    // if no input at all, nothing to show
    if (tLen === 0 && nTags === 0 && dLen === 0) total = 0;

    if (tips.length === 0) tips.push("Solid listing — keep an eye on ranking and refresh tags as trends shift.");
    return { total: total, dims: dims, tips: tips };
  }

  // ---- render ----
  function ring(el, score) {
    var deg = (score / 100) * 360;
    el.style.background = "conic-gradient(var(--brand) " + deg + "deg, #f0e6dd " + deg + "deg)";
  }

  function render(res) {
    var gr = gradeFor(res.total);
    document.getElementById("resScore").textContent = res.total;
    var gEl = document.getElementById("resGrade");
    gEl.textContent = "Grade " + gr.g;
    gEl.style.background = gr.color;
    gEl.style.color = "#fff";
    document.getElementById("resSummary").textContent =
      res.total >= 85 ? "Strong listing — minor tweaks only."
      : res.total >= 70 ? "Good foundation, a few quick wins left."
      : res.total >= 55 ? "Workable, but leaving ranking points on the table."
      : "Needs real work before it can compete.";

    ring(document.querySelector("#auditResult .score-ring"), res.total);

    var bars = document.getElementById("resBars");
    bars.innerHTML = "";
    Object.keys(res.dims).forEach(function (k) {
      var d = res.dims[k];
      var pct = Math.round((d.score / d.max) * 100);
      var row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML =
        '<span>' + k + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="bar-val">' + d.score + '/' + d.max + '</span>';
      bars.appendChild(row);
    });

    var tipsEl = document.getElementById("resTips");
    tipsEl.innerHTML = "";
    res.tips.forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      tipsEl.appendChild(li);
    });

    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var res = scoreListing({
      title: titleEl.value,
      tags: parseTags(tagsEl.value),
      desc: descEl.value,
      keyword: kwEl.value.trim()
    });
    render(res);
  });

  // hero demo score (static illustrative until user runs audit)
  heroScore.textContent = 68;
  heroGrade.textContent = "B";

  // ---- email capture (Formspree free tier, graceful demo fallback) ----
  // Get a FREE form ID at https://formspree.io (no payment). Paste it into FORMSPREE_ID below.
  var emailForm = document.getElementById("emailForm");
  var FORMSPREE_ID = "meeyzkdp"; // free form ID from formspree.io (no payment)
  emailForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("fEmail").value;
    var note = document.getElementById("emailNote");
    if (FORMSPREE_ID.indexOf("YOUR_") === 0) {
      // demo mode: store locally so the flow is testable without an ID
      try {
        var store = JSON.parse(localStorage.getItem("listora_leads") || "[]");
        store.push({ email: email, ts: new Date().toISOString() });
        localStorage.setItem("listora_leads", JSON.stringify(store));
      } catch (err) {}
      note.textContent = "✓ Demo mode: lead saved locally (" + email + "). Add a free Formspree ID to receive real emails.";
      note.style.color = "var(--good)";
    } else {
      fetch("https://formspree.io/f/" + FORMSPREE_ID, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, subject: "Listora audit lead", source: "Listora landing" })
      })
        .then(function (r) {
          if (r.ok) { note.textContent = "✓ Subscribed! We'll email you launch + Etsy SEO tips."; note.style.color = "var(--good)"; }
          else { note.textContent = "Couldn't send — try again or email us."; note.style.color = "var(--bad)"; }
        })
        .catch(function () { note.textContent = "Couldn't send — try again or email us."; note.style.color = "var(--bad)"; });
    }
    emailForm.reset();
  });

  updateCounts();
})();
