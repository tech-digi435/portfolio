/* =========================================================
   PORTFOLIO SCRIPT
   Sections:
   1. Mobile navigation menu
   2. Navbar scroll state + active link highlighting
   3. Smooth scrolling for anchor links
   4. Scroll-reveal animations (IntersectionObserver)
   5. Animated stat counters
   6. Contact form validation
   7. Back-to-top button
   8. Footer current year
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. MOBILE NAVIGATION MENU ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  function closeMobileNav() {
    mobileNav.classList.remove('is-open');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }

  function toggleMobileNav() {
    const isOpen = mobileNav.classList.toggle('is-open');
    navToggle.classList.toggle('is-active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  navToggle.addEventListener('click', toggleMobileNav);

  // Close the mobile menu whenever a link inside it is clicked
  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMobileNav);
  });

  // Close mobile menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileNav();
  });

  /* ---------- 2. NAVBAR SCROLL STATE + ACTIVE LINK ---------- */
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('[data-nav]');

  function updateNavbarBackground() {
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      const isMatch = link.getAttribute('href') === '#' + id;
      link.classList.toggle('active', isMatch);
    });
  }

  // Use IntersectionObserver to know which section is currently in view
  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );
  sections.forEach(function (section) { sectionObserver.observe(section); });

  window.addEventListener('scroll', updateNavbarBackground, { passive: true });
  updateNavbarBackground();

  /* ---------- 3. SMOOTH SCROLLING FOR ANCHOR LINKS ---------- */
  // CSS `scroll-behavior: smooth` already handles most of this;
  // this JS just accounts for the fixed navbar height on click.
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length <= 1) return; // ignore bare "#"
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = document.getElementById('navbar').offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;

      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });

  /* ---------- 4. SCROLL-REVEAL ANIMATIONS ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ---------- 5. ANIMATED STAT COUNTERS ---------- */
  const statNumbers = document.querySelectorAll('.stat__number');

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      // ease-out for a natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  statNumbers.forEach(function (el) { statObserver.observe(el); });

  /* ---------- 6. CONTACT FORM VALIDATION ---------- */
  const form = document.getElementById('contactForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const formStatus = document.getElementById('formStatus');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(input, errorId, message) {
    document.getElementById(errorId).textContent = message;
    input.closest('.form-group').classList.toggle('has-error', Boolean(message));
  }

  function validateField(input) {
    const value = input.value.trim();

    if (input === nameInput) {
      if (!value) return (showError(nameInput, 'nameError', 'Please enter your name.'), false);
      showError(nameInput, 'nameError', '');
      return true;
    }

    if (input === emailInput) {
      if (!value) return (showError(emailInput, 'emailError', 'Please enter your email.'), false);
      if (!emailPattern.test(value)) return (showError(emailInput, 'emailError', 'Please enter a valid email address.'), false);
      showError(emailInput, 'emailError', '');
      return true;
    }

    if (input === messageInput) {
      if (!value) return (showError(messageInput, 'messageError', 'Please write a short message.'), false);
      if (value.length < 10) return (showError(messageInput, 'messageError', 'Message should be at least 10 characters.'), false);
      showError(messageInput, 'messageError', '');
      return true;
    }

    return true;
  }

  // Validate a field as soon as the user leaves it
  [nameInput, emailInput, messageInput].forEach(function (input) {
    input.addEventListener('blur', function () { validateField(input); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const isNameValid = validateField(nameInput);
    const isEmailValid = validateField(emailInput);
    const isMessageValid = validateField(messageInput);

    if (!isNameValid || !isEmailValid || !isMessageValid) {
      formStatus.textContent = 'Please fix the highlighted fields.';
      formStatus.className = 'form-status error';
      return;
    }

    // NOTE: There is no backend here. This simulates a successful submit.
    // Replace this block with a real fetch()/API call, or a service like
    // Formspree / EmailJS, when you're ready to receive real messages.
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.querySelector('.btn__label').textContent;
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn__label').textContent = 'Sending...';

    setTimeout(function () {
      formStatus.textContent = 'Thanks! Your message has been sent — I\'ll reply soon.';
      formStatus.className = 'form-status success';
      form.reset();
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn__label').textContent = originalLabel;
    }, 900);
  });

  /* ---------- 7. BACK-TO-TOP BUTTON ---------- */
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    backToTop.classList.toggle('is-visible', window.scrollY > 480);
  }, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 8. FOOTER CURRENT YEAR ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

});