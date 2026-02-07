/**
 * Ethan Guerrero - Portfolio
 * Minimal JS for: mobile nav toggle, Projects dropdown, project tabs
 */

(function () {
  'use strict';

  // ========== Mobile nav toggle ==========
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
    });

    // Close mobile menu when clicking a nav link
    navMenu.querySelectorAll('.nav-link, .nav-dropdown-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ========== Projects dropdown (desktop) ==========
  var projectsTrigger = document.getElementById('projectsTrigger');
  var projectsDropdown = document.getElementById('projectsDropdown');
  var navDropdown = projectsTrigger ? projectsTrigger.closest('.nav-dropdown') : null;

  if (projectsTrigger && navDropdown) {
    projectsTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      navDropdown.classList.toggle('open');
      projectsTrigger.setAttribute(
        'aria-expanded',
        navDropdown.classList.contains('open')
      );
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
      if (!navDropdown.contains(e.target)) {
        navDropdown.classList.remove('open');
        projectsTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ========== Project tabs: Personal vs School ==========
  var tabs = document.querySelectorAll('.projects-tab');
  var panels = document.querySelectorAll('.projects-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabName = tab.getAttribute('data-tab');

      // Update tab states
      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update panel visibility
      panels.forEach(function (panel) {
        if (panel.id === 'panel-' + tabName) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // ========== Projects dropdown links: switch to correct tab ==========
  var dropdownLinks = document.querySelectorAll('.nav-dropdown-link[data-tab]');

  dropdownLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var tabName = link.getAttribute('data-tab');
      var targetTab = document.querySelector('.projects-tab[data-tab="' + tabName + '"]');
      if (targetTab) {
        targetTab.click();
      }
    });
  });
})();
