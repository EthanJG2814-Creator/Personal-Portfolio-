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
  var sectionIds = { about: 'card-section-about', personal: 'card-section-personal', academic: 'card-section-academic' };

  function showMain() {
    if (cardEl) cardEl.classList.remove('card-expanded');
    if (cardMain) cardMain.style.display = '';
    document.querySelectorAll('.card-section').forEach(function (section) {
      section.setAttribute('aria-hidden', 'true');
    });
  }

  function showSection(sectionKey) {
    var id = sectionIds[sectionKey];
    if (!id) return;
    var section = document.getElementById(id);
    if (!section) return;
    if (cardEl) cardEl.classList.add('card-expanded');
    if (cardMain) cardMain.style.display = 'none';
    document.querySelectorAll('.card-section').forEach(function (s) {
      s.setAttribute('aria-hidden', s === section ? 'false' : 'true');
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
})();

/**
 * Time-of-day background: white (day) to black (night), with fade during sunrise/sunset.
 * Sunrise 5–7, Day 7–17, Sunset 17–20, Night 20–5 (24h).
 */
(function () {
  'use strict';

  var DAY_BG = [255, 255, 255];
  var NIGHT_BG = [18, 18, 22];
  var SUNRISE_START = 5;
  var SUNRISE_END = 7;
  var SUNSET_START = 17;
  var SUNSET_END = 20;
  var UPDATE_MS = 60000;

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

  function updateBackground() {
    var now = new Date();
    var h = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    var isNight = h >= SUNSET_END || h < SUNRISE_START;

    document.documentElement.style.setProperty('--page-bg', getBackgroundColor());
    if (isNight) {
      document.body.classList.add('stars-visible');
      createStarsOnce();
      scheduleShootingStar();
    } else {
      document.body.classList.remove('stars-visible');
      cancelShootingStar();
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
