(function () {
  "use strict";

  /* -------------------------------------------------------------- */
  /* TEMA CLARO / ESCURO                                             */
  /* -------------------------------------------------------------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeToggle");
  var iconSun = document.getElementById("iconSun");
  var iconMoon = document.getElementById("iconMoon");

  function setTheme(dark) {
    root.classList.toggle("dark", dark);
    if (themeBtn) themeBtn.setAttribute("aria-pressed", String(dark));
    if (iconSun) iconSun.style.display = dark ? "" : "none";
    if (iconMoon) iconMoon.style.display = dark ? "none" : "";
    try { localStorage.setItem("oficina-theme", dark ? "dark" : "light"); } catch (e) { }
  }

  (function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem("oficina-theme"); } catch (e) { }
    var prefersDark = !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(stored ? stored === "dark" : prefersDark);
  })();

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(!root.classList.contains("dark"));
    });
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------------------- */
  /* NAVEGAÇÃO ENTRE SLIDES                                          */
  /* -------------------------------------------------------------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var total = slides.length;
  var current = 0;
  var closingPlayed = false;

  var counterEl = document.getElementById("slideCounter");
  var progressEl = document.getElementById("progressBar");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");

  function pad(n) { return String(n).padStart(2, "0"); }

  /* Manage will-change on adjacent slides only for performance */
  function updateWillChange() {
    slides.forEach(function (s, i) {
      s.classList.toggle("will-change-active", Math.abs(i - current) <= 1);
    });
  }

  function renderSlides() {
    slides.forEach(function (s, i) {
      s.style.transform = "translateX(" + (i - current) * 100 + "%)";
      s.setAttribute("aria-hidden", i === current ? "false" : "true");
    });
    counterEl.textContent = pad(current + 1) + " / " + pad(total);
    progressEl.style.width = ((current + 1) / total) * 100 + "%";
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    updateWillChange();

    if (current === total - 1 && !closingPlayed) {
      closingPlayed = true;
      playTypewriter(document.getElementById("closingTyped"), "Obrigado(a) por participar!", 40);
    }
  }

  function goTo(i) {
    current = Math.max(0, Math.min(total - 1, i));
    renderSlides();
  }

  prevBtn.addEventListener("click", function () { goTo(current - 1); });
  nextBtn.addEventListener("click", function () { goTo(current + 1); });

  document.addEventListener("keydown", function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); goTo(current + 1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); goTo(current - 1); }
    else if (e.key === "Home") { e.preventDefault(); goTo(0); }
    else if (e.key === "End") { e.preventDefault(); goTo(total - 1); }
  });

  renderSlides();

  /* -------------------------------------------------------------- */
  /* MÁQUINA DE ESCREVER (capa + fechamento)                         */
  /* -------------------------------------------------------------- */
  function playTypewriter(el, text, speed) {
    if (!el) return;
    if (reduceMotion) { el.textContent = text; return; }
    el.textContent = "";
    var i = 0;
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed || 45);
      }
    })();
  }
  playTypewriter(document.getElementById("coverTyped"), "Aja como um assistente de comunicação corporativa...", 35);

  /* -------------------------------------------------------------- */
  /* COPIAR PROMPT (com fallback robusto)                            */
  /* -------------------------------------------------------------- */
  function fallbackCopy(text, cb) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.left = "-1000px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      cb(ok);
    } catch (err) {
      cb(false);
    }
  }

  function copyText(text, btn) {
    var original = btn.textContent;
    function finish(ok) {
      btn.textContent = ok ? "Copiado!" : "Não foi possível";
      btn.classList.add(ok ? "copy-success" : "copy-fail");
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("copy-success", "copy-fail");
      }, 1700);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { finish(true); }).catch(function () {
        fallbackCopy(text, finish);
      });
    } else {
      fallbackCopy(text, finish);
    }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".copy-btn") : null;
    if (!btn) return;
    var target = document.getElementById(btn.dataset.target);
    if (!target) return;
    copyText(target.textContent.trim(), btn);
  });

  /* -------------------------------------------------------------- */
  /* REVELAR RESPOSTA SIMULADA                                       */
  /* -------------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".reveal-btn") : null;
    if (!btn) return;
    var panel = document.getElementById(btn.dataset.reveal);
    if (!panel) return;
    var willShow = panel.classList.contains("hidden");
    panel.classList.toggle("hidden");
    btn.textContent = willShow ? "Ocultar resposta simulada" : "Ver resposta simulada";
    btn.setAttribute("aria-expanded", String(willShow));
  });

  /* -------------------------------------------------------------- */
  /* FILTRO DE FERRAMENTAS                                           */
  /* -------------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("#toolFilters .filter-btn") : null;
    if (!btn) return;
    document.querySelectorAll("#toolFilters .filter-btn").forEach(function (b) { b.classList.remove("is-active"); });
    btn.classList.add("is-active");
    var f = btn.dataset.filter;
    /* Scoped to #toolGrid to avoid affecting material cards */
    document.querySelectorAll("#toolGrid .tool-card").forEach(function (card) {
      card.style.display = card.dataset.cat === f ? "" : "none";
    });
  });

  /* -------------------------------------------------------------- */
  /* SOUVENIR — TROCA DE ESTILO DA IMAGEM                            */
  /* -------------------------------------------------------------- */
  function renderSouvenirPrompt(style) {
    var el = document.getElementById("p3-imagem");
    if (!el) return;
    el.textContent = "Crie uma ilustração digital, em estilo " + style + ", representando um(a) [minha profissão] confiante e realizado(a) no futuro. Use tons de azul e dourado, com uma composição inspiradora e positiva.";
  }
  var styleChips = document.getElementById("styleChips");
  if (styleChips) {
    styleChips.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest(".style-chip") : null;
      if (!btn) return;
      styleChips.querySelectorAll(".style-chip").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      renderSouvenirPrompt(btn.dataset.style);
    });
    renderSouvenirPrompt("aquarela");
  }

  /* -------------------------------------------------------------- */
  /* CONSTRUTOR DE PROMPT (P.A.C.F.)                                 */
  /* -------------------------------------------------------------- */
  var bPersona = document.getElementById("bPersona");
  var bAcao = document.getElementById("bAcao");
  var bContexto = document.getElementById("bContexto");
  var bFormato = document.getElementById("bFormato");
  var builderOutput = document.getElementById("builderOutput");

  function buildPrompt() {
    if (!builderOutput) return;
    var persona = (bPersona.value || "").trim() || "[persona]";
    var acao = (bAcao.value || "").trim() || "[ação]";
    var contexto = (bContexto.value || "").trim() || "[contexto]";
    var formato = (bFormato.value || "").trim() || "[formato]";
    builderOutput.textContent = "Aja como " + persona + ". " + acao + " para " + contexto + ". Apresente no formato de " + formato + ".";
  }
  [bPersona, bAcao, bContexto, bFormato].forEach(function (input) {
    if (input) input.addEventListener("input", buildPrompt);
  });
  buildPrompt();

  /* -------------------------------------------------------------- */
  /* CRONÔMETRO DA DINÂMICA                                          */
  /* -------------------------------------------------------------- */
  var timerDisplay = document.getElementById("timerDisplay");
  var timerFill = document.getElementById("timerFill");
  var timerStart = document.getElementById("timerStart");
  var timerPause = document.getElementById("timerPause");
  var timerReset = document.getElementById("timerReset");
  var timerPresetsWrap = document.getElementById("timerPresets");

  if (timerDisplay && timerStart) {
    var totalSeconds = 15 * 60;
    var remaining = totalSeconds;
    var intervalId = null;

    function formatTime(s) {
      var m = Math.floor(s / 60);
      var sec = s % 60;
      return pad(m) + ":" + pad(sec);
    }

    function updateTimerUI() {
      var finished = remaining <= 0 && totalSeconds > 0;
      var urgent = remaining <= 60 && remaining > 0;

      timerDisplay.classList.toggle("timer-urgent", urgent);
      timerFill.classList.toggle("is-urgent", urgent);
      timerFill.style.width = (remaining / totalSeconds) * 100 + "%";
      timerStart.disabled = !!intervalId || remaining <= 0;
      timerPause.disabled = !intervalId;

      /* Visual feedback when timer reaches zero */
      if (finished) {
        timerDisplay.textContent = "Tempo!";
        timerDisplay.classList.remove("timer-urgent");
        timerDisplay.classList.add("timer-finished");
      } else {
        timerDisplay.textContent = formatTime(remaining);
        timerDisplay.classList.remove("timer-finished");
      }
    }

    function tick() {
      remaining = Math.max(0, remaining - 1);
      updateTimerUI();
      if (remaining <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        updateTimerUI();
      }
    }

    timerStart.addEventListener("click", function () {
      if (intervalId || remaining <= 0) return;
      intervalId = setInterval(tick, 1000);
      updateTimerUI();
    });
    timerPause.addEventListener("click", function () {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      updateTimerUI();
    });
    timerReset.addEventListener("click", function () {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      remaining = totalSeconds;
      updateTimerUI();
    });
    if (timerPresetsWrap) {
      timerPresetsWrap.addEventListener("click", function (e) {
        var btn = e.target.closest ? e.target.closest(".timer-preset") : null;
        if (!btn) return;
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
        document.querySelectorAll(".timer-preset").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        totalSeconds = Number(btn.dataset.mins) * 60;
        remaining = totalSeconds;
        updateTimerUI();
      });
    }

    updateTimerUI();
  }

  /* -------------------------------------------------------------- */
  /* DESAFIO-RELÂMPAGO — PLACAR AO VIVO                              */
  /* -------------------------------------------------------------- */
  var teams = [];
  var teamSeq = 0;
  var scoreboardList = document.getElementById("scoreboardList");
  var scoreboardEmpty = document.getElementById("scoreboardEmpty");
  var teamNameInput = document.getElementById("teamNameInput");
  var addTeamBtn = document.getElementById("addTeamBtn");
  var resetScoreboardBtn = document.getElementById("resetScoreboard");

  /* Uses createElement instead of innerHTML for XSS safety */
  function renderScoreboard() {
    if (!scoreboardList) return;
    if (scoreboardEmpty) scoreboardEmpty.style.display = teams.length ? "none" : "";

    var sorted = teams.slice().sort(function (a, b) { return b.score - a.score; });

    scoreboardList.innerHTML = "";

    sorted.forEach(function (t, i) {
      var row = document.createElement("div");
      row.className = "score-row";

      var rank = document.createElement("span");
      rank.className = "score-rank";
      rank.textContent = i + 1;

      var name = document.createElement("span");
      name.className = "score-name";
      name.textContent = t.name;

      var value = document.createElement("span");
      value.className = "score-value";
      value.textContent = t.score;

      var minusBtn = document.createElement("button");
      minusBtn.className = "score-btn";
      minusBtn.dataset.action = "minus";
      minusBtn.dataset.id = t.id;
      minusBtn.setAttribute("aria-label", "Tirar ponto de " + t.name);
      minusBtn.textContent = "\u2212";

      var plusBtn = document.createElement("button");
      plusBtn.className = "score-btn";
      plusBtn.dataset.action = "plus";
      plusBtn.dataset.id = t.id;
      plusBtn.setAttribute("aria-label", "Somar ponto para " + t.name);
      plusBtn.textContent = "+";

      var removeBtn = document.createElement("button");
      removeBtn.className = "score-btn score-remove";
      removeBtn.dataset.action = "remove";
      removeBtn.dataset.id = t.id;
      removeBtn.setAttribute("aria-label", "Remover " + t.name);
      removeBtn.textContent = "\u00d7";

      row.appendChild(rank);
      row.appendChild(name);
      row.appendChild(value);
      row.appendChild(minusBtn);
      row.appendChild(plusBtn);
      row.appendChild(removeBtn);

      scoreboardList.appendChild(row);
    });
  }

  if (addTeamBtn && teamNameInput) {
    addTeamBtn.addEventListener("click", function () {
      var name = (teamNameInput.value || "").trim();
      if (!name) { teamNameInput.focus(); return; }
      teamSeq++;
      teams.push({ id: teamSeq, name: name, score: 0 });
      teamNameInput.value = "";
      renderScoreboard();
      teamNameInput.focus();
    });
    teamNameInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); addTeamBtn.click(); }
    });
  }

  if (scoreboardList) {
    scoreboardList.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest(".score-btn") : null;
      if (!btn) return;
      var id = Number(btn.dataset.id);
      var action = btn.dataset.action;
      var team = null;
      for (var i = 0; i < teams.length; i++) { if (teams[i].id === id) { team = teams[i]; break; } }
      if (!team) return;
      if (action === "plus") team.score++;
      else if (action === "minus") team.score = Math.max(0, team.score - 1);
      else if (action === "remove") teams = teams.filter(function (t) { return t.id !== id; });
      renderScoreboard();
    });
  }

  if (resetScoreboardBtn) {
    resetScoreboardBtn.addEventListener("click", function () {
      teams = [];
      renderScoreboard();
    });
  }

  renderScoreboard();

  /* -------------------------------------------------------------- */
  /* SORTEIO DE DESAFIOS (sem repetição consecutiva)                 */
  /* -------------------------------------------------------------- */
  var challenges = [
    "Crie um prompt para planejar uma festa de aniversário surpresa.",
    "Crie um prompt para montar uma legenda de Instagram para o primeiro dia de trabalho.",
    "Crie um prompt para explicar uma matéria difícil da escola para uma criança de 8 anos.",
    "Crie um prompt para montar um cardápio de lanche saudável e barato.",
    "Crie um prompt para escrever uma mensagem pedindo um ajuste de horário no trabalho de meio período.",
    "Crie um prompt para montar um roteiro de vídeo de 30 segundos sobre um hobby seu.",
    "Crie um prompt para organizar um cronograma de estudos para a prova da semana.",
    "Crie um prompt para escrever um pedido de desculpas educado por um atraso no trabalho."
  ];
  var lastChallengeIndex = -1;
  var drawChallengeBtn = document.getElementById("drawChallenge");
  var challengeTextEl = document.getElementById("challengeText");
  if (drawChallengeBtn && challengeTextEl) {
    drawChallengeBtn.addEventListener("click", function () {
      var pick;
      do {
        pick = Math.floor(Math.random() * challenges.length);
      } while (pick === lastChallengeIndex && challenges.length > 1);
      lastChallengeIndex = pick;
      challengeTextEl.textContent = challenges[pick];
    });
  }

})();
