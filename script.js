/* =========================================================
   Happy Birthday, Mom — script.js
   Vanilla JavaScript only. No dependencies.

   Flow:
   Gate (surprise button) -> Countdown (10..0, balloons, cake)
   -> Celebration burst -> Reveal full site content
   ========================================================= */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------------------------------------------------
     Elements
     --------------------------------------------------------- */
  var gate = document.getElementById("gate");
  var surpriseBtn = document.getElementById("surpriseBtn");
  var gateParticles = document.getElementById("gateParticles");

  var countdownScreen = document.getElementById("countdownScreen");
  var countdownNumber = document.getElementById("countdownNumber");
  var countdownParticles = document.getElementById("countdownParticles");
  var balloonLayer = document.getElementById("balloonLayer");
  var cakeStage = document.getElementById("cakeStage");
  var burstLayer = document.getElementById("burstLayer");

  var siteContent = document.getElementById("siteContent");
  var ambientParticles = document.getElementById("ambientParticles");
  var heroTitle = document.querySelector(".hero-title");

  var sequenceStarted = false;

  /* ---------------------------------------------------------
     Sparks — a small reusable floating-particle generator
     used on the gate screen and during the countdown.
     --------------------------------------------------------- */
  var GOLD_TONES = ["#F2D9A0", "#CBA35C", "#F3EEE3"];

  function spawnSpark(container) {
    if (!container) return;
    var spark = document.createElement("span");
    spark.className = "spark";

    var left = Math.random() * 100;
    var bottom = Math.random() * 30;
    var drift = (Math.random() * 60 - 30).toFixed(0) + "px";
    var duration = 4 + Math.random() * 4;
    var color = GOLD_TONES[Math.floor(Math.random() * GOLD_TONES.length)];

    spark.style.left = left + "%";
    spark.style.bottom = bottom + "%";
    spark.style.background = color;
    spark.style.setProperty("--drift", drift);
    spark.style.animationDuration = duration + "s";

    container.appendChild(spark);

    window.setTimeout(function () {
      if (spark.parentNode) spark.parentNode.removeChild(spark);
    }, duration * 1000 + 200);
  }

  function startSparkStream(container, intervalMs) {
    spawnSpark(container);
    return window.setInterval(function () {
      spawnSpark(container);
    }, intervalMs);
  }

  /* Gentle continuous sparks behind the surprise button */
  var gateSparkTimer = null;
  if (!prefersReducedMotion) {
    gateSparkTimer = startSparkStream(gateParticles, 380);
  }

  /* ---------------------------------------------------------
     Ambient particles for the revealed site (persistent, looping)
     --------------------------------------------------------- */
  function seedAmbientParticles() {
    if (!ambientParticles || prefersReducedMotion) return;
    var count = 16;
    for (var i = 0; i < count; i++) {
      var dot = document.createElement("span");
      dot.className = "spark";
      dot.style.left = Math.random() * 100 + "%";
      dot.style.top = Math.random() * 100 + "%";
      dot.style.animationDuration = 5 + Math.random() * 5 + "s";
      dot.style.animationDelay = Math.random() * 4 + "s";
      ambientParticles.appendChild(dot);
    }
  }

  /* ---------------------------------------------------------
     Balloons — continuously fall while the countdown runs
     --------------------------------------------------------- */
  var BALLOON_COLORS = ["#8C1C3A", "#CBA35C", "#0F4A3C", "#1B2A4A", "#E8D9B5"];
  var balloonSpawnTimer = null;

  function spawnBalloon() {
    if (!balloonLayer) return;
    var balloon = document.createElement("div");
    balloon.className = "balloon";

    var color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    var left = Math.random() * 96;
    var size = 0.75 + Math.random() * 0.6;
    var duration = 6.5 + Math.random() * 4.5;

    balloon.style.left = left + "%";
    balloon.style.transform = "scale(" + size.toFixed(2) + ")";
    balloon.style.color = color;
    balloon.style.animationDuration = duration + "s";

    balloon.innerHTML =
      '<div class="balloon-body" style="background:' +
      color +
      '"><span class="balloon-shine"></span></div>' +
      '<span class="balloon-string"></span>';

    balloonLayer.appendChild(balloon);

    window.setTimeout(function () {
      if (balloon.parentNode) balloon.parentNode.removeChild(balloon);
    }, duration * 1000 + 300);
  }

  function startBalloons() {
    if (prefersReducedMotion) return;
    spawnBalloon();
    spawnBalloon();
    balloonSpawnTimer = window.setInterval(spawnBalloon, 260);
  }

  function stopBalloons() {
    if (balloonSpawnTimer) {
      window.clearInterval(balloonSpawnTimer);
      balloonSpawnTimer = null;
    }
  }

  /* ---------------------------------------------------------
     Celebration burst — golden particle explosion at 0
     --------------------------------------------------------- */
  function triggerCelebration() {
    if (!burstLayer) return;

    var flash = document.createElement("div");
    flash.className = "burst-flash";
    burstLayer.appendChild(flash);

    if (!prefersReducedMotion) {
      var pieceCount = 46;
      var EMOJI_TONES = ["🎉", "✨", "🤍", "💛", "🎂"];

      for (var i = 0; i < pieceCount; i++) {
        var angle = Math.random() * Math.PI * 2;
        var distance = 140 + Math.random() * 220;
        var tx = Math.cos(angle) * distance;
        var ty = Math.sin(angle) * distance - 60;
        var rot = Math.random() * 360;
        var duration = 1 + Math.random() * 0.8;
        var isEmoji = Math.random() > 0.72;

        var piece = document.createElement("span");

        if (isEmoji) {
          piece.className = "burst-piece is-emoji";
          piece.textContent =
            EMOJI_TONES[Math.floor(Math.random() * EMOJI_TONES.length)];
        } else {
          piece.className =
            "burst-piece" + (Math.random() > 0.6 ? " is-square" : "");
          piece.style.background =
            GOLD_TONES[Math.floor(Math.random() * GOLD_TONES.length)];
        }

        piece.style.setProperty("--tx", tx.toFixed(0) + "px");
        piece.style.setProperty("--ty", ty.toFixed(0) + "px");
        piece.style.setProperty("--rot", rot.toFixed(0) + "deg");
        piece.style.animationDuration = duration + "s";

        burstLayer.appendChild(piece);
      }
    }

    window.setTimeout(function () {
      burstLayer.innerHTML = "";
    }, 2200);
  }

  /* ---------------------------------------------------------
     Reveal the full site after the countdown finishes
     --------------------------------------------------------- */
  function revealSite() {
    stopBalloons();
    balloonLayer.innerHTML = "";
    countdownParticles.innerHTML = "";

    countdownScreen.classList.add("is-hidden");
    countdownScreen.setAttribute("aria-hidden", "true");

    siteContent.hidden = false;
    seedAmbientParticles();
    initScrollReveal();
    initHeroParallax();
    initClosingHearts();

    /* force reflow so the opacity transition plays */
    void siteContent.offsetWidth;
    siteContent.classList.add("is-visible");

    document.body.style.overflow = "";
    window.scrollTo({ top: 0, behavior: "auto" });

    if (heroTitle) {
      heroTitle.setAttribute("tabindex", "-1");
      heroTitle.focus({ preventScroll: true });
    }
  }

  /* ---------------------------------------------------------
     Closing hearts — a few soft hearts drift up through the
     farewell section once the visitor reaches it.
     --------------------------------------------------------- */
  var HEART_EMOJI = ["🤍", "💛", "✨"];
  var heartTimer = null;

  function spawnHeart(container) {
    if (!container) return;
    var heart = document.createElement("span");
    heart.className = "drift-emoji";
    heart.textContent =
      HEART_EMOJI[Math.floor(Math.random() * HEART_EMOJI.length)];

    var left = 6 + Math.random() * 88;
    var drift = (Math.random() * 50 - 25).toFixed(0) + "px";
    var duration = 7 + Math.random() * 5;
    var size = 0.9 + Math.random() * 0.7;

    heart.style.left = left + "%";
    heart.style.fontSize = size.toFixed(2) + "rem";
    heart.style.setProperty("--drift", drift);
    heart.style.animationDuration = duration + "s";

    container.appendChild(heart);

    window.setTimeout(function () {
      if (heart.parentNode) heart.parentNode.removeChild(heart);
    }, duration * 1000 + 200);
  }

  function startClosingHearts() {
    var heartLayer = document.getElementById("heartLayer");
    if (!heartLayer || prefersReducedMotion || heartTimer) return;

    spawnHeart(heartLayer);
    heartTimer = window.setInterval(function () {
      spawnHeart(heartLayer);
    }, 1500);
  }

  function initClosingHearts() {
    var finalSection = document.getElementById("final");
    if (!finalSection || prefersReducedMotion || !("IntersectionObserver" in window)) {
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startClosingHearts();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(finalSection);
  }

  /* ---------------------------------------------------------
     Scroll reveal — sections gather into focus as they enter
     view. Runs continuously once the full site is visible;
     harmless if it starts before that (elements simply wait
     off-screen, hidden behind the gate/countdown anyway).
     --------------------------------------------------------- */
  function initScrollReveal() {
    var targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------
     Hero parallax — a single gentle depth cue as the visitor
     starts to scroll away from the opening title.
     --------------------------------------------------------- */
  function initHeroParallax() {
    if (prefersReducedMotion) return;
    var heroContent = document.getElementById("heroContent");
    var hero = document.getElementById("hero");
    if (!heroContent || !hero) return;

    var ticking = false;

    function update() {
      ticking = false;
      var heroHeight = hero.offsetHeight || window.innerHeight;
      var progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);

      heroContent.style.transform =
        "translateY(" + (progress * 46).toFixed(1) + "px)";
      heroContent.style.opacity = String(1 - progress * 1.05);
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  /* ---------------------------------------------------------
     Countdown sequence: 10 -> 0
     --------------------------------------------------------- */
  var STEPS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
  var STEP_MS = 850;

  function runCountdown() {
    var stepIndex = 0;

    var countdownSparkTimer = null;
    if (!prefersReducedMotion) {
      countdownSparkTimer = startSparkStream(countdownParticles, 220);
    }
    startBalloons();

    function showStep() {
      var n = STEPS[stepIndex];
      var progress = stepIndex / (STEPS.length - 1);

      countdownNumber.textContent = String(n);
      countdownNumber.classList.remove("is-animating");
      void countdownNumber.offsetWidth; /* restart animation */
      countdownNumber.classList.add("is-animating");

      cakeStage.style.opacity = String(progress);
      cakeStage.style.filter = "blur(" + (6 * (1 - progress)).toFixed(1) + "px)";

      if (n === 0) {
        stopBalloons();
        if (countdownSparkTimer) window.clearInterval(countdownSparkTimer);

        window.setTimeout(function () {
          triggerCelebration();
        }, STEP_MS * 0.35);

        window.setTimeout(function () {
          revealSite();
        }, STEP_MS * 0.35 + 1500);

        return;
      }

      stepIndex++;
      window.setTimeout(showStep, STEP_MS);
    }

    showStep();
  }

  /* ---------------------------------------------------------
     Kick off: surprise button click
     --------------------------------------------------------- */
  function startExperience() {
    if (sequenceStarted) return;
    sequenceStarted = true;

    surpriseBtn.disabled = true;
    if (gateSparkTimer) window.clearInterval(gateSparkTimer);

    gate.classList.add("is-hidden");
    gate.setAttribute("aria-hidden", "true");

    if (prefersReducedMotion) {
      /* Respect reduced motion: skip the cinematic sequence entirely
         and reveal the site gently, without balloons/countdown/burst. */
      window.setTimeout(revealSite, 350);
      return;
    }

    countdownScreen.classList.add("is-active");
    countdownScreen.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    window.setTimeout(runCountdown, 500);
  }

  if (surpriseBtn) {
    surpriseBtn.addEventListener("click", startExperience);
  }

  /* Prevent any residual scroll before the reveal */
  document.body.style.overflow = "hidden";
})();
