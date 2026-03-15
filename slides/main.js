/* ═══════════════════ REVEAL INIT ═══════════════════ */
(function () {
  "use strict";

  var narrow = window.innerWidth < 640;

  var deck = new Reveal({
    hash: true,
    controls: true,
    progress: true,
    transition: "fade",
    backgroundTransition: "fade",
    center: false,
    margin: narrow ? 0.02 : 0.04,
    width: narrow ? 430 : 1280,
    height: narrow ? 860 : 720,
    minScale: narrow ? 0.8 : 0.2,
    maxScale: narrow ? 1.4 : 1.5
  });

  deck.initialize().then(function () {
    window.deck = deck;
    setupModelStepper();
    goToStep(1);
    setupPubReveal();
    setupResize();
  });

  /* ═══════════════════ PUB AUTO-UNFOLD ═══════════════════ */
  function revealPubs() {
    var items = document.querySelectorAll("#question .pub-reveal");
    items.forEach(function (item) {
      item.classList.remove("pub-visible");
    });
    items.forEach(function (item) {
      var i = parseInt(item.style.getPropertyValue("--i"), 10) || 0;
      setTimeout(function () {
        item.classList.add("pub-visible");
      }, 300 + i * 450);
    });
  }

  function hidePubs() {
    var items = document.querySelectorAll("#question .pub-reveal");
    items.forEach(function (item) {
      item.classList.remove("pub-visible");
    });
  }

  function setupPubReveal() {
    deck.on("slidechanged", function (ev) {
      if (ev.currentSlide && ev.currentSlide.id === "question") {
        revealPubs();
      } else {
        hidePubs();
      }
    });
    if (deck.getCurrentSlide() && deck.getCurrentSlide().id === "question") {
      revealPubs();
    }
  }

  /* ═══════════════════ MODEL STEPPER ═══════════════════ */
  var stepTexts = {
    1: "Через кишечник проходит огромная масса минерального субстрата с тонким пищевым компонентом — бактерии, диатомеи, органический детрит.",
    2: "Частицы и растворённая органика соприкасаются с апикальной мембраной энтероцитов. Классическая модель предполагала захват внутрь клетки.",
    3: "Амёбоциты (целомоциты) мигрируют через базальную мембрану в эпителий, фагоцитируют пищевые частицы и уносят их в целомическую полость.",
    4: "Внутри амёбоцита фагосома сливается с лизосомами — ферментативный гидролиз завершает переваривание. Этот этап никто не переизмерил современными методами."
  };

  var currentStep = 1;

  function goToStep(step) {
    currentStep = step;
    var buttons = document.querySelectorAll("#model .m-step");
    var detail = document.getElementById("step-detail");
    buttons.forEach(function (b) {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    var activeBtn = document.querySelector('.m-step-' + step);
    if (activeBtn) {
      activeBtn.classList.add("active");
      activeBtn.setAttribute("aria-pressed", "true");
    }
    if (detail && stepTexts[step]) {
      detail.innerHTML = "<p>" + stepTexts[step] + "</p>";
      detail.setAttribute("data-active-step", step);
    }
    animateModelStep(step);
    /* hide hint after first interaction */
    var hint = document.querySelector(".step-hint");
    if (hint && step > 1) hint.style.opacity = "0";
  }

  function setupModelStepper() {
    var buttons = document.querySelectorAll("#model .m-step");
    var detail = document.getElementById("step-detail");
    if (!buttons.length || !detail) return;

    /* button clicks */
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var step = parseInt(btn.dataset.step, 10);
        goToStep(step);
      });
    });

    /* Reveal.js fragment events — arrow keys advance steps */
    deck.on("fragmentshown", function (ev) {
      var frag = ev.fragment;
      if (frag && frag.classList.contains("model-frag")) {
        var step = parseInt(frag.dataset.modelStep, 10);
        if (step) goToStep(step);
      }
    });
    deck.on("fragmenthidden", function (ev) {
      var frag = ev.fragment;
      if (frag && frag.classList.contains("model-frag")) {
        var step = parseInt(frag.dataset.modelStep, 10);
        if (step > 1) goToStep(step - 1);
      }
    });

    /* sync step to fragment state when entering the slide */
    deck.on("slidechanged", function (ev) {
      if (ev.currentSlide && ev.currentSlide.id === "model") {
        /* count visible fragments to determine current step */
        var shown = ev.currentSlide.querySelectorAll(".model-frag.visible");
        var step = shown.length + 1; /* 0 frags = step 1, 1 frag = step 2, etc. */
        goToStep(step);
        /* show hint only at step 1 */
        var hint = document.querySelector(".step-hint");
        if (hint) hint.style.opacity = step === 1 ? "1" : "0";
      }
    });
  }

  function attr(node, attrs) {
    if (!node) return;
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        node.setAttribute(key, String(attrs[key]));
      }
    }
  }

  function animateModelStep(step) {
    var svg = document.querySelector("#model .epi-svg");
    if (!svg) return;

    /* ── gather elements ── */
    var zones = {
      lumen: svg.querySelector(".zone-lumen"),
      epi: svg.querySelector(".zone-epi"),
      bm: svg.querySelector(".zone-bm"),
      coelom: svg.querySelector(".zone-coelom")
    };
    var dims = {
      lumen: svg.querySelector(".dim-lumen"),
      epi: svg.querySelector(".dim-epi"),
      coelom: svg.querySelector(".dim-coelom")
    };
    var arrows = svg.querySelectorAll(".sarr");
    var foodDots = svg.querySelectorAll(".food-dot");
    var contactHalo = svg.querySelector(".contact-halo");
    var apicalVesicles = svg.querySelectorAll(".apical-vesicle");
    var entA = svg.querySelector(".enterocyte-a");
    var amoeboGroup = svg.querySelector(".amoebocyte-group");
    var phago = svg.querySelector(".coel-phago");
    var pseudopods = svg.querySelectorAll(".pseudopod");
    var particle = svg.querySelector(".coel-particle");
    var phagoRing = svg.querySelector(".phagosome-ring");
    var lyso = svg.querySelector(".coel-lyso");
    var lysoLabel = svg.querySelector(".lyso-label");
    var fusionHalo = svg.querySelector(".fusion-halo");

    /* ── clear all animations ── */
    svg.querySelectorAll("[style*='animation']").forEach(function (el) {
      el.style.animation = "";
    });

    /* ── reset arrows: hide all ── */
    arrows.forEach(function (a) {
      attr(a, { opacity: 0, "stroke-width": 2 });
    });

    /* ── reset dim overlays: all transparent ── */
    Object.keys(dims).forEach(function (k) {
      if (dims[k]) attr(dims[k], { opacity: 0 });
    });

    /* ── reset zones: remove dim/active classes ── */
    Object.keys(zones).forEach(function (k) {
      if (zones[k]) {
        zones[k].classList.remove("zone-dimmed", "zone-active");
      }
    });

    /* ── reset specific elements ── */
    foodDots.forEach(function (d) {
      attr(d, { opacity: 0.5, r: parseFloat(d.getAttribute("r")) || 7 });
      d.style.animation = "";
    });
    attr(contactHalo, { opacity: 0, "stroke-width": 0 });
    apicalVesicles.forEach(function (v) { attr(v, { opacity: 0 }); });
    if (entA) attr(entA, { "stroke-width": 1.5, stroke: "#8b7355" });
    if (phago) attr(phago, { "stroke-width": 2.5, stroke: "#a67c52" });
    pseudopods.forEach(function (p) { attr(p, { opacity: 0.4 }); p.style.animation = ""; });
    attr(particle, { opacity: 0.15, r: 11 });
    attr(phagoRing, { opacity: 0, "stroke-width": 0 });
    attr(lyso, { opacity: 0.4, r: 13, "stroke-width": 1.5, fill: "#f0a0a0", stroke: "#c06060" });
    if (lysoLabel) attr(lysoLabel, { opacity: 0.3, "font-size": 9 });
    attr(fusionHalo, { opacity: 0, r: 22, "stroke-width": 0 });
    if (amoeboGroup) amoeboGroup.classList.remove("glow");

    /* ── show step arrows ── */
    var stepArrows = svg.querySelectorAll(".sarr-" + step);
    stepArrows.forEach(function (a) {
      attr(a, { opacity: 0.9, "stroke-width": 3.5 });
    });

    /* ═══════════════ STEP 1: SUBSTRATE IN LUMEN ═══════════════ */
    if (step === 1) {
      /* spotlight: lumen bright, epi+coelom dimmed */
      zones.lumen && zones.lumen.classList.add("zone-active");
      zones.epi && zones.epi.classList.add("zone-dimmed");
      zones.bm && zones.bm.classList.add("zone-dimmed");
      zones.coelom && zones.coelom.classList.add("zone-dimmed");

      /* food particles: big, bright, floating */
      foodDots.forEach(function (d, i) {
        attr(d, { opacity: 1, r: 10 });
        d.style.animation = "foodFloat 2s ease-in-out " + (i * 0.2) + "s infinite";
      });
    }

    /* ═══════════════ STEP 2: CONTACT WITH ENTEROCYTE ═══════════════ */
    if (step === 2) {
      /* spotlight: epi bright, lumen+coelom dimmed */
      zones.epi && zones.epi.classList.add("zone-active");
      zones.lumen && zones.lumen.classList.add("zone-dimmed");
      zones.bm && zones.bm.classList.add("zone-dimmed");
      zones.coelom && zones.coelom.classList.add("zone-dimmed");

      /* highlight enterocyte A */
      if (entA) attr(entA, { "stroke-width": 4, stroke: "#2a9a7a" });

      /* contact halo pulses */
      attr(contactHalo, { opacity: 1, r: 24, "stroke-width": 4 });
      if (contactHalo) contactHalo.style.animation = "svgPulse 1.4s ease-in-out infinite";

      /* apical vesicles visible */
      apicalVesicles.forEach(function (v, i) {
        attr(v, { opacity: 1 });
        v.style.animation = "svgPulse 1.8s ease-in-out " + (i * 0.3) + "s infinite";
      });

      /* food particles subdued */
      foodDots.forEach(function (d) { attr(d, { opacity: 0.3 }); });
    }

    /* ═══════════════ STEP 3: AMOEBOCYTE PHAGOCYTOSIS ═══════════════ */
    if (step === 3) {
      /* spotlight: BM + coelom bright, lumen dimmed */
      zones.bm && zones.bm.classList.add("zone-active");
      zones.coelom && zones.coelom.classList.add("zone-active");
      zones.lumen && zones.lumen.classList.add("zone-dimmed");
      zones.epi && zones.epi.classList.add("zone-dimmed");

      /* amoebocyte highlighted */
      if (phago) attr(phago, { "stroke-width": 5, stroke: "#7b5ea7" });
      if (amoeboGroup) amoeboGroup.classList.add("glow");

      /* pseudopods wiggle */
      pseudopods.forEach(function (p, i) {
        attr(p, { opacity: 1 });
        p.style.animation = "pseudopodWiggle 2s ease-in-out " + (i * 0.5) + "s infinite";
      });

      /* particle being captured */
      attr(particle, { opacity: 1, r: 15 });
      if (particle) particle.style.animation = "svgPulse 1.5s ease-in-out infinite";

      /* phagosome ring forming */
      attr(phagoRing, { opacity: 0.8, "stroke-width": 2.5 });
      if (phagoRing) phagoRing.style.animation = "svgPulse 2s ease-in-out 0.3s infinite";

      /* food gone from lumen */
      foodDots.forEach(function (d) { attr(d, { opacity: 0.15, r: 5 }); });
    }

    /* ═══════════════ STEP 4: LYSOSOME FUSION ═══════════════ */
    if (step === 4) {
      /* spotlight: coelom (amoebocyte interior) bright, everything else dimmed */
      zones.coelom && zones.coelom.classList.add("zone-active");
      zones.lumen && zones.lumen.classList.add("zone-dimmed");
      zones.epi && zones.epi.classList.add("zone-dimmed");
      zones.bm && zones.bm.classList.add("zone-dimmed");

      /* amoebocyte body emphasized */
      if (phago) attr(phago, { "stroke-width": 4, stroke: "#c06060" });
      if (amoeboGroup) amoeboGroup.classList.add("glow");

      /* particle inside */
      attr(particle, { opacity: 0.9, r: 13 });

      /* phagosome ring visible */
      attr(phagoRing, { opacity: 0.7, "stroke-width": 2 });

      /* lysosome: big, red, pulsing */
      attr(lyso, { opacity: 1, r: 20, "stroke-width": 4, fill: "#ff5050", stroke: "#b03030" });
      if (lyso) lyso.style.animation = "svgBounce 1.6s ease-in-out infinite";
      if (lysoLabel) attr(lysoLabel, { opacity: 1, "font-size": 11 });

      /* fusion halo — dramatic burst */
      attr(fusionHalo, { opacity: 0.9, r: 30, "stroke-width": 4 });
      if (fusionHalo) fusionHalo.style.animation = "fusionBurst 1.8s ease-in-out infinite";

      /* food gone */
      foodDots.forEach(function (d) { attr(d, { opacity: 0.1, r: 4 }); });
    }
  }

  /* ═══════════════════ RESIZE LISTENER ═══════════════════ */
  function setupResize() {
    var wasNarrow = narrow;
    window.addEventListener("resize", function () {
      var isNarrow = window.innerWidth < 640;
      if (isNarrow !== wasNarrow) {
        wasNarrow = isNarrow;
        deck.configure({
          width: isNarrow ? 430 : 1280,
          height: isNarrow ? 860 : 720,
          margin: isNarrow ? 0.02 : 0.04,
          minScale: isNarrow ? 0.8 : 0.2,
          maxScale: isNarrow ? 1.4 : 1.5
        });
      }
    });
  }

  /* timeline uses Reveal.js vertical sub-slides — no custom handler needed */
})();
