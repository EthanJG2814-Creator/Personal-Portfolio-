/**
 * Business card: tilt toward mouse when cursor is OFF the card; flat when over the card.
 */
(function () {
  'use strict';

  var card = document.querySelector('.card-inner');
  if (!card) return;

  var maxTilt = 12;
  var rect;
  var centerX, centerY;

  function isOverCard(clientX, clientY) {
    rect = card.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }

  function setTilt(e) {
    if (isOverCard(e.clientX, e.clientY)) {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
      return;
    }
    getRect();
    var x = e.clientX - centerX;
    var y = e.clientY - centerY;
    var w = rect.width / 2;
    var h = rect.height / 2;
    var rotateY = (x / w) * maxTilt;
    var rotateX = -(y / h) * maxTilt;
    card.style.transform =
      'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
  }

  function getRect() {
    rect = card.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
  }

  function resetTilt() {
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
  }

  document.addEventListener('mousemove', setTilt);
  document.addEventListener('mouseleave', resetTilt);
})();

/**
 * Resume PDF iframe: #view=FitH fits width and often crops badly on phones; use plain PDF on narrow viewports.
 */
(function () {
  'use strict';
  var iframe = document.querySelector('.resume-pdf-iframe');
  if (!iframe) return;
  var base = './assets/resume.pdf';
  function syncResumePdfSrc() {
    var narrow = window.matchMedia('(max-width: 768px)').matches;
    iframe.setAttribute('src', narrow ? base : base + '#view=FitH');
  }
  syncResumePdfSrc();
  window.addEventListener('resize', syncResumePdfSrc);
})();

/**
 * Easter egg: click top-right corner of card to flip to back (quote side).
 * Only active on the main card view (not when a section is expanded).
 */
(function () {
  'use strict';
  var card = document.getElementById('card');
  var triggers = document.querySelectorAll('.card-easter-egg');
  if (!card || !triggers.length) return;
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      if (card.classList.contains('card-expanded')) return;
      card.classList.toggle('card-flipped');
    });
  });
})();

/**
 * Easter egg: click the moon at night to toggle blood moon.
 * Moon phase is preserved (handled by moon-phase-mask).
 */
(function () {
  'use strict';
  var moon = document.getElementById('moon');
  if (!moon) return;
  moon.addEventListener('click', function (e) {
    e.stopPropagation();
    if (document.body.classList.contains('stars-visible')) {
      moon.classList.toggle('moon-blood');
    }
  });
})();

/**
 * Card sections: Personal Projects, Academic Projects, About.
 * Click a nav button -> card expands, only that section title + sub-headings show.
 * Click the section title -> back to main card.
 */
(function () {
  'use strict';

  var cardEl = document.getElementById('card');
  var cardMain = document.getElementById('card-main');
  var navButtons = document.querySelectorAll('.card-nav[data-section]');
  var backButtons = document.querySelectorAll('.card-back[data-back="main"]');
  var sectionIds = { about: 'card-section-about', resume: 'card-section-resume' };

  function showMain() {
    if (cardEl) cardEl.classList.remove('card-expanded');
    if (cardMain) cardMain.style.display = '';
    document.querySelectorAll('.card-section').forEach(function (section) {
      section.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('.card-nav').forEach(function (btn) {
      btn.classList.remove('card-nav-active');
    });
  }

  function showSection(sectionKey) {
    var id = sectionIds[sectionKey];
    if (!id) return;
    var section = document.getElementById(id);
    if (!section) return;
    if (cardEl) {
      cardEl.classList.add('card-expanded');
      cardEl.classList.remove('card-flipped');
    }
    if (cardMain) cardMain.style.display = 'none';
    document.querySelectorAll('.card-section').forEach(function (s) {
      s.setAttribute('aria-hidden', s === section ? 'false' : 'true');
    });
    document.querySelectorAll('.card-nav').forEach(function (btn) {
      btn.classList.toggle('card-nav-active', btn.getAttribute('data-section') === sectionKey);
    });
    if (id === 'card-section-about') {
      setAboutTab('about');
    }
  }

  function setAboutTab(tab) {
    var tabs = document.querySelectorAll('.about-tab-btn');
    var panels = document.querySelectorAll('.about-tab-panel');
    tabs.forEach(function (btn) {
      var t = btn.getAttribute('data-about-tab');
      btn.classList.toggle('about-tab-active', t === tab);
      btn.setAttribute('aria-selected', t === tab ? 'true' : 'false');
    });
    panels.forEach(function (panel) {
      var panelTab = panel.id.replace('about-panel-', '');
      panel.setAttribute('aria-hidden', panelTab === tab ? 'false' : 'true');
    });
  }

  navButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var section = btn.getAttribute('data-section');
      if (section) showSection(section);
    });
  });

  backButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      showMain();
    });
  });

  /* About section tabs: About | Personal Projects | Academic Projects */
  var aboutTabBtns = document.querySelectorAll('.about-tab-btn');
  aboutTabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tab = btn.getAttribute('data-about-tab');
      if (!tab) return;
      setAboutTab(tab);
    });
  });
})();

/**
 * Portfolio PDF export: layout matches project pages (html2pdf + clone). Order: Bio, Personal, Academic.
 */
(function () {
  'use strict';

  function stripCloneIds(root) {
    root.querySelectorAll('[id]').forEach(function (el) {
      el.removeAttribute('id');
    });
  }

  function cloneForPdf(node) {
    if (!node) return null;
    var c = node.cloneNode(true);
    stripCloneIds(c);
    return c;
  }

  function waitForImages(container) {
    var imgs = container.querySelectorAll('img');
    var promises = [];
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (img.complete) continue;
      promises.push(
        new Promise(function (resolve) {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        })
      );
    }
    return promises.length ? Promise.all(promises) : Promise.resolve();
  }

  function removeExportShell(shell) {
    if (shell && shell.parentNode) shell.parentNode.removeChild(shell);
  }

  function exportPortfolioPdf() {
    var html2pdfFn = typeof window.html2pdf === 'function' ? window.html2pdf : null;
    if (!html2pdfFn) {
      window.alert('PDF export could not load. Please refresh and try again.');
      return;
    }

    var aboutContent = document.querySelector('#about-panel-about .card-section-about-content');
    var personalContent = document.querySelector('#about-panel-personal .card-section-content');
    var academicContent = document.querySelector('#about-panel-academic .card-section-content');

    var shell = document.createElement('div');
    shell.className = 'portfolio-pdf-export-shell';
    shell.setAttribute('aria-hidden', 'true');

    var root = document.createElement('div');
    root.className = 'portfolio-pdf-export-root';

    var title = document.createElement('h1');
    title.className = 'portfolio-pdf-main-title';
    title.textContent = 'Portfolio';
    root.appendChild(title);

    function addSection(heading, contentNode) {
      var section = document.createElement('section');
      section.className = 'portfolio-pdf-section';
      var h2 = document.createElement('h2');
      h2.className = 'portfolio-pdf-section-title';
      h2.textContent = heading;
      section.appendChild(h2);
      var cloned = cloneForPdf(contentNode);
      if (cloned) {
        cloned.classList.remove('card-section-content--scroll');
        section.appendChild(cloned);
      }
      root.appendChild(section);
    }

    addSection('Bio', aboutContent);
    addSection('Personal Projects', personalContent);
    addSection('Academic Projects', academicContent);

    shell.appendChild(root);
    document.body.appendChild(shell);

    var btn = document.getElementById('portfolio-export-pdf');
    if (btn) {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
    }

    function runPdf() {
      var opt = {
        margin: [10, 10, 10, 10],
        filename: 'portfolio.pdf',
        image: { type: 'jpeg', quality: 0.92 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          letterRendering: true,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.project-block', 'figure', 'img'] }
      };

      var worker = html2pdfFn().set(opt).from(root);
      var savePromise = worker.save();
      if (!savePromise || typeof savePromise.then !== 'function') {
        removeExportShell(shell);
        if (btn) {
          btn.disabled = false;
          btn.removeAttribute('aria-busy');
        }
        window.alert('PDF export failed to start. Please refresh and try again.');
        return;
      }
      savePromise
        .then(function () {
          removeExportShell(shell);
        })
        .catch(function () {
          removeExportShell(shell);
          window.alert('Could not create the PDF. Try again or check your network connection.');
        })
        .then(function () {
          if (btn) {
            btn.disabled = false;
            btn.removeAttribute('aria-busy');
          }
        });
    }

    waitForImages(root)
      .then(function () {
        return new Promise(function (resolve) {
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              setTimeout(resolve, 50);
            });
          });
        });
      })
      .then(function () {
        runPdf();
      })
      .catch(function () {
        removeExportShell(shell);
        if (btn) {
          btn.disabled = false;
          btn.removeAttribute('aria-busy');
        }
      });
  }

  var exportBtn = document.getElementById('portfolio-export-pdf');
  if (exportBtn) {
    exportBtn.addEventListener('click', function (e) {
      e.preventDefault();
      exportPortfolioPdf();
    });
  }
})();

/**
 * Time-of-day background: sky blue (day) to black (night), eggshell card by day.
 * Sun moves across sky during day; moon moves at night with phase by date.
 * Sunrise 5–7, Day 7–17, Sunset 17–20, Night 20–5 (24h).
 */
(function () {
  'use strict';

  var DAY_BG = [135, 206, 235];   /* sky blue */
  var NIGHT_BG = [18, 18, 22];
  var SUNRISE_START = 5;
  var SUNRISE_END = 7;
  var SUNSET_START = 17;
  var SUNSET_END = 20;
  var UPDATE_MS = 60000;
  var WEATHER_CACHE_KEY = 'portfolio_weather_cache';
  var WEATHER_CACHE_MS = 60 * 60 * 1000; /* 60 minutes */

  function getCachedWeather() {
    try {
      var raw = localStorage.getItem(WEATHER_CACHE_KEY);
      if (!raw) return null;
      var cached = JSON.parse(raw);
      if (Date.now() - cached.fetchedAt > WEATHER_CACHE_MS) return null;
      return cached;
    } catch (e) {
      return null;
    }
  }

  function setCachedWeather(cloudy, rain, snow, thunder) {
    try {
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
        cloudy: cloudy,
        rain: rain,
        snow: snow,
        thunder: thunder,
        fetchedAt: Date.now()
      }));
    } catch (e) {}
  }

  function applyWeatherEffects(cached) {
    document.body.classList.toggle('sky-cloudy', cached.cloudy);
    document.body.classList.toggle('sky-rain', cached.rain);
    document.body.classList.toggle('sky-snow', cached.snow);
    document.body.classList.toggle('sky-thunder', cached.thunder);
    updatePrecipitationParticles(cached.rain, cached.snow);
  }

  function updatePrecipitationParticles(rain, snow) {
    var rainEl = document.getElementById('sky-rain');
    var snowEl = document.getElementById('sky-snow');
    if (rainEl) {
      rainEl.innerHTML = '';
      if (rain) {
        for (var i = 0; i < 55; i++) {
          var drop = document.createElement('div');
          drop.className = 'rain-drop';
          drop.style.left = Math.random() * 100 + '%';
          drop.style.animationDuration = (0.6 + Math.random() * 0.5) + 's';
          drop.style.animationDelay = Math.random() * 0.5 + 's';
          rainEl.appendChild(drop);
        }
      }
    }
    if (snowEl) {
      snowEl.innerHTML = '';
      if (snow) {
        for (var j = 0; j < 45; j++) {
          var flake = document.createElement('div');
          flake.className = 'snow-flake';
          flake.style.left = Math.random() * 100 + '%';
          flake.style.animationDuration = (3 + Math.random() * 4) + 's';
          flake.style.animationDelay = Math.random() * 2 + 's';
          snowEl.appendChild(flake);
        }
      }
    }
  }

  function fetchWeatherForClouds() {
    var cached = getCachedWeather();
    if (cached !== null) {
      applyWeatherEffects(cached);
      return;
    }
    if (!navigator.geolocation) {
      fetchWeatherWithCoords(52.52, 13.41);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (position) {
        fetchWeatherWithCoords(position.coords.latitude, position.coords.longitude);
      },
      function () {
        /* Permission denied or unavailable: use default location so weather still loads */
        fetchWeatherWithCoords(52.52, 13.41);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  function fetchWeatherWithCoords(lat, lon) {
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + encodeURIComponent(lat) + '&longitude=' + encodeURIComponent(lon) + '&current=rain,cloud_cover,snowfall,showers,precipitation,weather_code,precipitation_probability&timezone=auto&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch';
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var cur = data.current;
        if (!cur) {
          clearWeatherEffects();
          return;
        }
        var cloudCover = typeof cur.cloud_cover === 'number' ? cur.cloud_cover : 0;
        var rain = typeof cur.rain === 'number' ? cur.rain : 0;
        var showers = typeof cur.showers === 'number' ? cur.showers : 0;
        var precipitation = typeof cur.precipitation === 'number' ? cur.precipitation : 0;
        var snowfall = typeof cur.snowfall === 'number' ? cur.snowfall : 0;
        var weatherCode = typeof cur.weather_code === 'number' ? cur.weather_code : 0;
        var precipProb = typeof cur.precipitation_probability === 'number' ? cur.precipitation_probability : 0;
        var hasRain = rain > 0 || showers > 0 || (precipitation > 0 && snowfall === 0);
        var hasSnow = snowfall > 0;
        var hasThunder = (weatherCode >= 95 && weatherCode <= 99) || precipProb >= 70;
        var cloudy = cloudCover >= 40 || hasRain || hasSnow || hasThunder;
        setCachedWeather(cloudy, hasRain, hasSnow, hasThunder);
        applyWeatherEffects({ cloudy: cloudy, rain: hasRain, snow: hasSnow, thunder: hasThunder });
      })
      .catch(function () {
        clearWeatherEffects();
      });
  }

  function clearWeatherEffects() {
    document.body.classList.remove('sky-cloudy', 'sky-rain', 'sky-snow', 'sky-thunder');
    updatePrecipitationParticles(false, false);
  }

  function lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  function rgbString(r, g, b) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function getBackgroundColor() {
    var now = new Date();
    var h = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    var r, g, b;

    if (h >= SUNRISE_END && h < SUNSET_START) {
      r = DAY_BG[0];
      g = DAY_BG[1];
      b = DAY_BG[2];
    } else if (h >= SUNSET_END || h < SUNRISE_START) {
      r = NIGHT_BG[0];
      g = NIGHT_BG[1];
      b = NIGHT_BG[2];
    } else if (h >= SUNRISE_START && h < SUNRISE_END) {
      var t = (h - SUNRISE_START) / (SUNRISE_END - SUNRISE_START);
      r = lerp(NIGHT_BG[0], DAY_BG[0], t);
      g = lerp(NIGHT_BG[1], DAY_BG[1], t);
      b = lerp(NIGHT_BG[2], DAY_BG[2], t);
    } else {
      var tSunset = (h - SUNSET_START) / (SUNSET_END - SUNSET_START);
      r = lerp(DAY_BG[0], NIGHT_BG[0], tSunset);
      g = lerp(DAY_BG[1], NIGHT_BG[1], tSunset);
      b = lerp(DAY_BG[2], NIGHT_BG[2], tSunset);
    }
    return rgbString(r, g, b);
  }

  /* Lunar phase 0 = new, 0.5 = full, 1 = new again (29.53-day cycle) */
  function getLunarPhase(date) {
    var jd = date.getTime() / 86400000 + 2440587.5;
    var lunarAge = ((jd - 2451550.1) % 29.530588853 + 29.530588853) % 29.530588853;
    return lunarAge / 29.530588853;
  }

  /* Sun position: arc from sunrise (5) to sunset (20), high at solar noon */
  function getSunPosition(h) {
    if (h < SUNRISE_START || h >= SUNSET_END) return null;
    var dayLength = SUNSET_END - SUNRISE_START;
    var t = (h - SUNRISE_START) / dayLength;
    var left = 10 + 80 * t;
    var top = 75 - 65 * Math.sin(Math.PI * t);
    return { left: left, top: top };
  }

  /* Moon position at night: arc from left (evening) to right (early morning) */
  function getMoonPosition(h) {
    if (h >= SUNRISE_END && h < SUNSET_END) return null;
    var nightT = h >= SUNSET_END ? h - SUNSET_END : h + (24 - SUNSET_END);
    var totalNight = (24 - SUNSET_END) + SUNRISE_START;
    if (nightT >= totalNight) nightT -= totalNight;
    var t = nightT / totalNight;
    var left = 10 + 80 * t;
    var top = 75 - 65 * Math.sin(Math.PI * t);
    return { left: left, top: top };
  }

  function updateBackground() {
    var now = new Date();
    var h = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    var isNight = h >= SUNSET_END || h < SUNRISE_START;

    document.documentElement.style.setProperty('--page-bg', getBackgroundColor());

    if (isNight) {
      document.body.classList.remove('day-mode');
      document.body.classList.remove('sky-cloudy');
      document.body.classList.add('stars-visible');
      fetchWeatherForClouds();
      createStarsOnce();
      scheduleShootingStar();
      /* Moon position and phase */
      var moonPos = getMoonPosition(h);
      var moon = document.getElementById('moon');
      var mask = document.getElementById('moon-phase-mask');
      if (moon && moonPos) {
        moon.style.left = moonPos.left + '%';
        moon.style.top = moonPos.top + '%';
      }
      if (mask) {
        var phase = getLunarPhase(now);
        var maskX = phase <= 0.5 ? 2 * phase * 100 : (2 - 2 * phase) * 100;
        mask.style.transform = 'translateX(' + maskX + '%)';
      }
    } else {
      document.body.classList.add('day-mode');
      document.body.classList.remove('stars-visible');
      cancelShootingStar();
      fetchWeatherForClouds();
      /* Sun position (visible during sunrise, day, and sunset 5–20) */
      var sunPos = getSunPosition(h);
      var sun = document.getElementById('sun');
      if (sun) {
        if (sunPos) {
          sun.style.left = sunPos.left + '%';
          sun.style.top = sunPos.top + '%';
        }
      }
    }
  }

  var shootingStarTimeout = null;

  function scheduleShootingStar() {
    if (!document.body.classList.contains('stars-visible')) return;
    var delay = 18000 + Math.random() * 27000; // 18–45 seconds
    shootingStarTimeout = setTimeout(function () {
      showShootingStar();
      if (document.body.classList.contains('stars-visible')) {
        scheduleShootingStar();
      }
    }, delay);
  }

  function cancelShootingStar() {
    if (shootingStarTimeout) {
      clearTimeout(shootingStarTimeout);
      shootingStarTimeout = null;
    }
    var container = document.getElementById('shooting-stars');
    if (container) {
      while (container.firstChild) container.removeChild(container.firstChild);
    }
  }

  function showShootingStar() {
    var container = document.getElementById('shooting-stars');
    if (!container) return;

    var streak = document.createElement('div');
    streak.className = 'shooting-star';
    streak.style.left = (70 + Math.random() * 25) + '%';
    streak.style.top = (-5 + Math.random() * 20) + '%';
    container.appendChild(streak);

    setTimeout(function () {
      if (streak.parentNode) streak.parentNode.removeChild(streak);
    }, 1500);
  }

  function createStarsOnce() {
    var container = document.getElementById('stars');
    if (!container || container.querySelector('.star')) return;

    var count = 70;
    for (var i = 0; i < count; i++) {
      var star = document.createElement('span');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 12 + 's';
      star.style.animationDuration = (8 + Math.random() * 6) + 's';
      container.appendChild(star);
    }
  }

  updateBackground();
  setInterval(updateBackground, UPDATE_MS);
})();
