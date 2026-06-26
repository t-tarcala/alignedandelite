document.addEventListener('DOMContentLoaded', function() {
  
  // GENERAL JAVASCRIPT SETTINGS
  
  let lastWidth = window.innerWidth;
  
  window.addEventListener('resize', () => {
    // Debounce
    clearTimeout(window.__resizeTimer);
    window.__resizeTimer = setTimeout(() => {
      if (window.innerWidth !== lastWidth) {
        location.reload();
      }
      lastWidth = window.innerWidth;
    }, 300);
  });
  
  gsap.registerPlugin(ScrollTrigger);
  
  const mm = gsap.matchMedia();

  const computedStyle = getComputedStyle(document.documentElement);


  
  // LENIS SMOOTH SCROLL
  
  // Initialize Lenis smooth scroll
  const lenis = new Lenis({
    duration: 0.8,  // Slow scroll duration for ease-out effect
    easing: t => 1 - Math.pow(1 - t, 3),  // Quartic easing for smooth deceleration
    smooth: true,  // Enable smooth scrolling
    direction: 'vertical',  // Scroll direction
    smoothTouch: true,  // Smooth scroll on touch devices
    });
  
  // Make it globally accessible for other scripts
  window.lenis = lenis;
  
  // Function to update scroll frame
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  
  // Start the request animation frame loop
  requestAnimationFrame(raf);
  
  // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
  lenis.on('scroll', ScrollTrigger.update);
  
  // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
  // This ensures Lenis's smooth scroll animation updates on each GSAP tick
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Convert time from seconds to milliseconds
  });
  
  // Disable lag smoothing in GSAP to prevent any delay in scroll animations
  gsap.ticker.lagSmoothing(0);


  
  // SCROLL SNAPPING
  
  (function() {
    // === CONFIGURATION ===
    const SNAP_ATTR = 'data-snap'; // attribute selector, e.g. <div data-snap>
    const SNAP_THRESHOLD = 0.2;   // fraction of viewport height (0.25 = 25%)
    const SNAP_DURATION = 0.8;     // Lenis scroll duration
    const SNAP_DELAY = 100;        // ms to wait after scroll stops before snapping
    const SNAP_LOCK_TIME = 1000;   // ms lockout to avoid repeated snaps
    
    // === INIT ===
    const snapElements = [...document.querySelectorAll('[data-snap]')].filter(el => {
      const style = window.getComputedStyle(el, '::before');
      return style.content.replace(/['"]/g, '') === 'active';
    });
    let snapTimeout;
    let isSnapping = false;
    
    if (!window.lenis) {
      console.warn('Lenis instance not found. Make sure Lenis is initialized globally.');
      return;
    }
    const lenis = window.lenis; // use your existing Lenis instance
    
    // === HELPERS ===
    function getClosestSnapElement() {
      const viewportCenter = window.innerHeight / 2;
      let closest = null;
      let minDistance = Infinity;
      
      snapElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - elCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closest = el;
        }
      });
      
      // Only snap if within threshold
      if (closest) {
        const closestRect = closest.getBoundingClientRect();
        const distanceFromCenter = Math.abs((closestRect.top + closestRect.height / 2) - viewportCenter);
        const triggerDistance = window.innerHeight * SNAP_THRESHOLD;
        if (distanceFromCenter > triggerDistance) return null;
      }
      
      return closest;
    }
    function snapToClosest() {
      if (isSnapping) return;
      isSnapping = true;
      
      const target = getClosestSnapElement();
      if (!target) {
        isSnapping = false;
        return;
      }
      
      // Scroll so the element’s center aligns with viewport center
      const targetTop = window.scrollY + target.getBoundingClientRect().top;
      const targetCenterOffset = target.offsetHeight / 2 - window.innerHeight / 2;
      const targetY = targetTop + targetCenterOffset;
      
      lenis.scrollTo(targetY, { duration: SNAP_DURATION });
      
      setTimeout(() => {
        isSnapping = false;
      }, SNAP_LOCK_TIME);
    }
    
    // === MAIN EVENT LOOP ===
    // Use Lenis’s internal scroll event (fires each frame)
    let scrollTimeout;
    lenis.on('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(snapToClosest, SNAP_DELAY);
    });
  })();



  // NAVBAR DARK SECTION ANIMATIONS

  const navbar = document.querySelector('.navbar');
  const darkSections = document. querySelectorAll('[data-is-dark]');

  darkSections.forEach(darkSection => {

    ScrollTrigger.create({
      trigger: darkSection,
      start: `top ${navbar.offsetHeight}px`,
      end: `bottom ${navbar.offsetHeight}px`,
      onEnter: () => navbar.classList.add('navbar--dark'),
      onLeave: () => navbar.classList.remove('navbar--dark'),
      onEnterBack: () => navbar.classList.add('navbar--dark'),
      onLeaveBack: () => navbar.classList.remove('navbar--dark'),
    });
    
  });


  // FOOTER ANIMATION
  
  const footer = document.querySelector(".footer__wrap");
  const footerLogo = document.querySelector(".footer__logo-wrap");
  
  gsap.set(footerLogo, { scale: 0.8, opacity: 0.5 });
  
  gsap.to(footerLogo, {
    scale: 1,
    opacity: 1,
    ease: "power1.inOut",
    scrollTrigger: {
      trigger: footer,
      start: "top bottom",
      end: "bottom bottom",
      scrub: 0.5,
      markers: false,
    },
  });



  // HERO ANIMATION
  
  const hero = document.querySelector(".section__hero_full-page");
  const logo = document.querySelector(".hero__symbol-wrap");
  //const pattern = document.querySelector(".bg__pattern");
  const subheading = document.querySelector(".hero__subheading");
  
  mm.add("(min-width: 480px)", () => {
    const logoAnim = gsap.to(logo, {
      scale: 1.5,
      yPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "center top",
        scrub: 0.5,
        markers: false,
      },
    });
  });
  
  const subheadingAnim = gsap.to(subheading, {
    opacity: 0,
    yPercent: 50,
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "10% top",
      scrub: true,
      markers: false,
    },
  });

  /*
  const bgAnim = gsap.from(pattern, {
    scale: 0.8,
    color: "#eee2d7",
    ease: "power1.inOut",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "center top",
      scrub: true,
      markers: false,
    },
  });
  */



  // PURPOSE SLIDER
  
  const purposeSliderComponents = document.querySelectorAll('.purpose-slider-component');
  
  purposeSliderComponents.forEach(purposeSliderComponent => {

    const fractionPagination = purposeSliderComponent.querySelector('.purpose-slider__pagination');
    
    const purposeSlider = new Swiper('.swiper.swiper__purpose', {
      // Optional parameters
      loop: false,
      slidesPerView: 1,
      speed: 400,
      centeredSlides: true,
      direction: 'vertical',
      mousewheel: {
        forceToAxis: true,
        sensitivity: 0.75,
        releaseOnEdges: true,
        thresholdDelta: 5,
      },
      touchReleaseOnEdges: true,
      threshold: 0,
      grabCursor: false,
      freeMode: false,
      effect: 'fade',
      fadeEffect: {
        crossFade: true,
      },
      pagination: {
        el: fractionPagination,
        type: 'fraction',
      },
    });
  });

  
  // SWIPER INTEGRATION WITH LENIS SNAP LOCK
  
  (function () {
    const swiperEl = document.querySelector('.swiper');
    if (!swiperEl) return;
    
    const lenis = window.lenis;
    const swiper = swiperEl.swiper;
    
    if (!swiper) {
      console.warn('Swiper instance not found on element.');
      return;
    }
    
    let swiperActive = false;
    
    // --- State controls (now separated) ---
    
    function enableSwiper() {
      if (swiperActive) return;
      swiperActive = true;
      swiper.enable();
      swiper.mousewheel.enable();
      // Lenis intentionally NOT stopped here
    }
    
    function disableSwiper() {
      swiperActive = false;
      swiper.mousewheel.disable();
      swiper.disable();
      lenis.start(); // always release scroll when swiper goes inactive
    }
    
    function lockScroll() {
      if (!swiperActive) return;
      lenis.stop();
    }
    
    function unlockScroll() {
      lenis.start();
    }
    
    // Start fully inactive
    disableSwiper();
    
    // --- Snap settle detection ---
    const CENTERED_TOLERANCE = 5;
    
    function isSwiperCentered() {
      const rect = swiperEl.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      return Math.abs(window.innerHeight / 2 - elCenter) < CENTERED_TOLERANCE;
    }
    
    let scrollSettleTimer = null;
    
    lenis.on('scroll', () => {
      if (swiperActive) return;
      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = setTimeout(() => {
        if (isSwiperCentered()) {
          enableSwiper();
          // Start unlocked — scroll locks only once user moves away from an edge
          // If already mid-slides somehow, lock immediately
          if (!swiper.isBeginning && !swiper.isEnd) {
            lockScroll();
          }
        }
      }, 50);
    });
    
    // --- Swiper event handlers ---
    
    // User moved away from an edge — lock scroll so Swiper handles input
    swiper.on('fromEdge', () => {
      lockScroll();
    });
    
    // User reached an edge — unlock scroll so page can continue
    swiper.on('reachBeginning', () => {
      setTimeout(unlockScroll, 800);
    });
    
    swiper.on('reachEnd', () => {
      setTimeout(unlockScroll, 800);
    });
    
    // When slider leaves the viewport centre (user scrolled away), fully deactivate so it resets cleanly for next visit
    lenis.on('scroll', () => {
      if (!swiperActive) return;
      if (!isSwiperCentered()) {
        disableSwiper();
      }
    });
  
  })();



  // CARD ICON ANIMATION
  
  (function() {
    const isTouchDevice =
      window.matchMedia('(hover: none)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) return; // Only run on touch devices
    
    const processGrids = gsap.utils.toArray('.process-grid');
    const packageGrids = gsap.utils.toArray('.package-grid');
    
    const clrPrimary = computedStyle.getPropertyValue("--clr_primary-100");
    const clrGold = computedStyle.getPropertyValue("--clr_primary-700");
    const clrHighlight = computedStyle.getPropertyValue("--clr_highlight-A-100");

    // PROCESS HORIZONTAL
    ScrollTrigger.matchMedia({ "(min-width: 1280px)": function() {
      
      processGrids.forEach(processGrid => {
        
        const cardIcons = gsap.utils.toArray('.icon-card__icon', processGrid);
        
        gsap.set(cardIcons, { opacity: 0 });
        
        gsap.to(cardIcons, {
          duration: 0.4,
          opacity: 1,
          stagger: 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: processGrid,
            start: "40% 80%",
            end: "60% 60%",
            scrub: true,
            markers: false,
          },
        });
      });
    }});

    // PROCESS VERTICAL
    ScrollTrigger.matchMedia({ "(max-width: 1279px)": function() {
      
      const processCards = document.querySelectorAll('.process-card');
      
      processCards.forEach((processCard) => {
        
        const cardIcon = processCard.querySelector('.icon-card__icon');
        
        gsap.set(cardIcon, { opacity: 0 });
        
        gsap.to(cardIcon, {
          duration: 0.4,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: processCard,
            start: "40% 75%",
            end: "60% 75%",
            scrub: true,
            markers: false,
          },
        });
      });
    }});

    // PACKAGES HORIZONTAL
    ScrollTrigger.matchMedia({ "(min-width: 768px)": function() {

      packageGrids.forEach(packageGrid => {
        const cardIcons  = gsap.utils.toArray('.icon-card__icon', packageGrid);
        const cardTitles = gsap.utils.toArray('.package-card__title', packageGrid);
        const cardTexts  = gsap.utils.toArray('.package-card__text-anim-wrap', packageGrid);
        const cardTags   = gsap.utils.toArray('.package-card__tag', packageGrid);
        
        gsap.set(cardIcons, { opacity: 0 });
        gsap.set(cardTexts, { opacity: 0 });
        
        const offsetStep   = 10;
        const animDuration = 0.4;
        const animEase     = "power3.out";
        const common       = { duration: animDuration, ease: animEase };
        
        // One entry per "layer" of elements, with its enter/leave values
        const layers = [
          { targets: cardIcons,  enter: { opacity: 1 }, leave: { opacity: 0 } },
          { targets: cardTitles, enter: { color: clrPrimary }, leave: { color: clrGold } },
          { targets: cardTexts,  enter: { opacity: 1 }, leave: { opacity: 0 } },
          { targets: cardTags, enter: {
              color: clrHighlight,
              borderColor: clrPrimary,
            }, leave: {
              color: clrGold,
              borderColor: clrGold,
            },
          },
        ];
        
        cardIcons.forEach((_, i) => {
          const pos = `40% ${60 - i * offsetStep}%`;
          
          ScrollTrigger.create({
            trigger: packageGrid,
            start: pos,
            end: pos,
            onEnter:     () => layers.forEach(l => gsap.to(l.targets[i], { ...l.enter, ...common })),
            onLeaveBack: () => layers.forEach(l => gsap.to(l.targets[i], { ...l.leave, ...common })),
          });
        });
      });
    }});

    // PACKAGES VERTICAL
    ScrollTrigger.matchMedia({ "(max-width: 767px)": function() {

      const packageCards = document.querySelectorAll('.package-card');
      packageCards.forEach((packageCard) => {
        const cardIcon  = packageCard.querySelector('.icon-card__icon');
        const cardTitle = packageCard.querySelector('.package-card__title');
        const cardText  = packageCard.querySelector('.package-card__text-anim-wrap');
        const cardTag   = packageCard.querySelector('.package-card__tag');
        
        gsap.set(cardIcon, { opacity: 0 });
        gsap.set(cardText, { opacity: 0 });
        
        const animDuration = 0.4;
        const animEase     = "none";
        const animStart    = "40% 75%";
        const animEnd      = "60% 75%";
        const common       = { duration: animDuration, ease: animEase };
        
        const layers = [
          { target: cardIcon,  enter: { opacity: 1 }, leave: { opacity: 0 } },
          { target: cardTitle, enter: { opacity: 1 }, leave: { opacity: 0 } },
          { target: cardText,  enter: { opacity: 1 }, leave: { opacity: 0 } },
          { target: cardTag, enter: {
              color: clrHighlight,
              borderColor: clrPrimary,
            }, leave: {
              color: clrGold,
              borderColor: clrGold,
            },
          },
        ];
        
        ScrollTrigger.create({
          trigger: packageCard,
          start: animStart,
          end: animEnd,
          markers: false,
          onEnter:     () => layers.forEach(l => gsap.to(l.target, { ...l.enter, ...common })),
          onLeaveBack: () => layers.forEach(l => gsap.to(l.target, { ...l.leave, ...common })),
        });
      });
    }});
    
  })();

  

  // CLIENT SLIDER
  
  const clientSliderComponents = document.querySelectorAll('.client-slider-component');
  
  clientSliderComponents.forEach(clientSliderComponent => {
    
    const buttonNext = clientSliderComponent.querySelector('.swiper-button__next');
    const buttonPrev = clientSliderComponent.querySelector('.swiper-button__prev');
    
    const clientSlider = new Swiper('.swiper.swiper__client', {
      // Optional parameters
      loop: true,
      slidesPerView: 1,
      speed: 400,
      centeredSlides: true,
      mousewheel: {
        forceToAxis: true,
        sensitivity: 0.75,
      },
      grabCursor: true,
      freeMode: false,
      navigation: {
        nextEl: buttonNext,
        prevEl: buttonPrev,
      },
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
    });
  });



  // COACHING PROS ANIMATION

  const coachProComp = document.querySelectorAll('.coach-pro-component');
  
  const joe = document.querySelector('.coach-pro.joe');
  const marisa = document.querySelector('.coach-pro.marisa');
  const kathleen = document.querySelector('.coach-pro.kathleen');

  mm.add("(min-aspect-ratio: 1/0.99999999)", () => {

    const tl = gsap.timeline({ paused: true });
    
    tl.from(marisa,  { xPercent:  100, opacity: 0, ease: "power1.inOut" }, 0)
      .from(kathleen,{ xPercent:  -100, opacity: 0, ease: "power1.inOut" }, 0);

    ScrollTrigger.create({
      trigger: coachProComp,
      start: "top bottom",
      end: "top center",
      markers: true,
      scrub: 0.5,
      animation: tl,
      //toggleActions: "play none none none",
      onLeave: (self) => {
        gsap.set([marisa, kathleen], { xPercent: 0, opacity: 1, overwrite: true, }); // snap to final state
        self.kill();
      },
    });
    
  });



  /*
  
  // BG ANIMATION
  
  const bgPattern = document.querySelector(".bg__pattern-wrap.is-home");
  const page = document.querySelector("body");
  
  gsap.to(pattern, {
    yPercent: -33,
    ease: "none",
    scrollTrigger: {
      trigger: page,
      start: window.innerHeight + "top",
      end: "bottom bottom",
      scrub: true,
      markers: false,
    },
  });


  
  // NAVBAR LOGO ANIMATION
  
  const hero = document.querySelector(".section__hero_full-page");
  const placeholder = document.querySelector(".hero__symbol-placeholder");
  const logo = document.querySelector(".navbar__symbol-wrap");
  const pattern = document.querySelector(".bg__pattern");
  
  const placeholderRect = placeholder.getBoundingClientRect();
  const logoRect = logo.getBoundingClientRect();
  const scrollY = window.scrollY;
  
  let yOffset = (placeholderRect.top + scrollY) - (logoRect.top + scrollY);
  
  const logoAnim = gsap.from(logo, {
    scale: 3,
    y: () => yOffset,
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "500 top",
      scrub: true,
      pin: true,
      markers: false,
      onRefresh: () => {
        // runs after pin-spacer exists
        const pinSpacer = hero.parentElement.classList.contains("pin-spacer") ? hero.parentElement : null;
        if (pinSpacer) {
          const spacerPadding = parseFloat(getComputedStyle(pinSpacer).paddingTop) || 0;
          yOffset += spacerPadding;
        }
      },
    },
  });
  
  const bgAnim = gsap.from(pattern, {
    scale: 0.8,
    color: "#eee2d7",
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "-400px top",
      end: "400px top",
      scrub: true,
      pin: false,
      markers: false,
    },
  });



  // PURPOSE HIGHLIGHTS ANIMATION
  
  const purposeWrap = gsap.utils.toArray('.purpose-highlight__wrap');
  const purposeIntro = gsap.utils.toArray('.purpose-highlight__intro-wrap');
  const purposeIntroText = gsap.utils.toArray('.purpose-highlight__intro-text');
  const purposeHighlights = gsap.utils.toArray('.purpose-highlight__grid');
  
  purposeHighlights.forEach(purposeHighlight => {
    
    const purposeTitle = gsap.utils.toArray('.purpose-highlight__title', purposeHighlight);
    const purposeText = gsap.utils.toArray('.purpose-highlight__text', purposeHighlight);
    const purposeIcon = gsap.utils.toArray('.purpose-highlight__icon-wrap', purposeHighlight);
    
    mm.add("(min-width: 768px)", () => {
      
      gsap.set(purposeText, { opacity: 0, xPercent: 10 });
      
      gsap.to(purposeText, {
        opacity: 1,
        xPercent: 0,
        duration: 0.4,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: purposeHighlight,
          start: "top center",
          end: "bottom center",
          toggleActions: "play reverse play reverse",
          scrub: false,
        },
      });
      
      gsap.set(purposeIntroText, { opacity: 0 });
      
      gsap.to(purposeIntroText, {
        opacity: 1,
        duration: 0.4,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: purposeWrap,
          start: "top center",
          end: "bottom center",
          toggleActions: "play reverse play reverse",
          scrub: false,
          markers: false,
        },
      });
    });

    gsap.to(purposeTitle, {
      color: "var(--clr_highlight-A-100)",
      duration: 0.4,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: purposeHighlight,
        start: "top center",
        end: "bottom center",
        toggleActions: "play reverse play reverse",
        scrub: false,
      },
    });
    
    gsap.to(purposeIcon, {
      color: "var(--clr_highlight-A-100)",
      duration: 0.4,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: purposeHighlight,
        start: "top center",
        end: "bottom center",
        toggleActions: "play reverse play reverse",
        scrub: false,
      },
    });
    
  });



  // COACHING PROS ANIMATION
  
  const coachProComp = document.querySelectorAll('.coach-pro-component');
  
  const joe = document.querySelector('.coach-pro.joe');
  const marisa = document.querySelector('.coach-pro.marisa');
  const kathleen = document.querySelector('.coach-pro.kathleen');
  
  const coachLine = document.querySelector('.coach-pro__line');
  const coachTexts = document.querySelectorAll('.coach-pro__text-wrap');
  const coachPics = document.querySelectorAll('.coach-pro__pic-wrap');
  const coachFrames = document.querySelectorAll('.coach-pro__frame');
  
  const coachLogoDiamond = document.querySelector('#logoDiamond');
  const coachLogoSquare = document.querySelector('#logoSquare');
  const coachLogoAE = document.querySelector('#logoAE');
  const coachLogoMask = document.querySelector('#logoMask');
  
  const coachLogo = document.querySelector('.coach-pro__logo-wrap');
  const coachNextSec = document.querySelector('#coachNextSec');
  
  const clrPrimary400 = computedStyle.getPropertyValue("--clr_primary-400");
  const clrPrimary700 = computedStyle.getPropertyValue("--clr_primary-700");
  
  mm.add("(min-aspect-ratio: 1/0.99999999)", () => {
    gsap.set(coachLine, { scaleX: 4 });
    gsap.set(coachLogoDiamond, { opacity: 0, scale: 1.5, color: clrPrimary400 });
    gsap.set(coachLogoSquare, { opacity: 0, scale: 1, color: clrPrimary400 });
    gsap.set(coachLogoMask, { opacity: 0, scale: 1.5 });
    gsap.set(coachLogoAE, { opacity: 0, scale: 1.7 });
    
    const coachTl = gsap.timeline({ defaults: { ease: "power1.inOut" } })
      .to(joe, { xPercent: 0, duration: 1 }, "phase0")
      .to(marisa, { xPercent: 125, duration: 4 }, "phase1")
      .to(kathleen, { xPercent: -125, duration: 4 }, "phase1")
      .to(coachLine, { scaleX: 1, duration: 4 }, "phase1")
      .to(coachTexts, { opacity: 0, duration: 2 }, "phase1+=1")
      .to(coachPics, { opacity: 0, scale: 1.5, duration: 3 }, "phase1+=1")
      .to(coachFrames, { color: clrPrimary700, scale: 1.5, duration: 3 }, "phase1+=1")
      .to(coachLogoMask, { opacity: 1, duration: 1 }, "phase1+=3")
      .to(coachLine, { opacity: 0, duration: 0 }, "phase2")
      .to(coachFrames, { opacity: 0, duration: 0 }, "phase2")
      .to(coachLogoDiamond, { opacity: 1, duration: 0 }, "phase2")
      .to(coachLogoSquare, { opacity: 1, duration: 0 }, "phase2")
      .to(coachLogoSquare, { scale: 1.5, duration: 2 }, "phase3")
      .to(coachLogoAE, { opacity: 1, scale: 1.5, duration: 1 }, "phase3+=1")
      .to(joe, { xPercent: 0, duration: 1 }, "phase4")
      
    ScrollTrigger.create({
      animation: coachTl,
      trigger: coachProComp,
      start: "center center",
      end: () => `+=${window.innerWidth * 1.5} bottom`,
      scrub: 0.5,
      pin: true,
      pinSpacing: true,
      markers: false,
    });
  });
  
  mm.add("(max-aspect-ratio: 1/1)", () => {
    gsap.set(joe, { scale: 0.95, opacity: 0 });
    gsap.set(kathleen, { scale: 0.95, opacity: 0 });
    gsap.set(coachLogoDiamond, { opacity: 0, scale: 0.8, color: clrPrimary400 });
    gsap.set(coachLogoSquare, { opacity: 0, scale: 0.5, color: clrPrimary400 });
    gsap.set(coachLogoMask, { opacity: 0, scale: 0.8 });
    gsap.set(coachLogoAE, { opacity: 0, scale: 0.9 });
    
    const coachTl = gsap.timeline({ defaults: { ease: "power1.inOut" } })
      .to(marisa, { opacity: 1, duration: 1 }, "start")
      .to(marisa, { scale: 0.95, duration: 0.75 }, "switch1")
      .to(marisa, { scale: 1, opacity: 0, duration: 0.75 }, "switch1+=0.75")
      .to(joe, { scale: 1, opacity: 1, duration: 0.75 }, "switch1+=0.75")
      .to(coachTexts, { opacity: 0, duration: 0.5 }, "switch1")
      .to(coachTexts, { opacity: 1, duration: 0.5 }, "switch1+=1")
      .to(joe, { opacity: 1, duration: 1.5 }, "pause1")
      .to(joe, { scale: 0.95, duration: 0.75 }, "switch2")
      .to(joe, { scale: 1, opacity: 0, duration: 0.75 }, "switch2+=0.75")
      .to(kathleen, { scale: 1, opacity: 1, duration: 0.75 }, "switch2+=0.75")
      .to(coachTexts, { opacity: 0, duration: 0.5 }, "switch2")
      .to(coachTexts, { opacity: 1, duration: 0.5 }, "switch2+=1")
      .to(kathleen, { opacity: 1, duration: 1.5 }, "pause2")
      .to(coachPics, { opacity: 0, scale: 0.8, duration: 1 }, "logo1")
      .to(coachFrames, { color: clrPrimary700, scale: 0.8, duration: 1 }, "logo1")
      .to(coachTexts, { opacity: 0, duration: 1 }, "logo1")
      .to(coachLogoMask, { opacity: 1, scale: 0.8, duration: 0.5 }, "logo1+=0.5")
      .to(coachFrames, { opacity: 0, duration: 0 }, "logo2")
      .to(coachLogoDiamond, { opacity: 1, duration: 0 }, "logo2")
      .to(coachLogoSquare, { opacity: 1, duration: 0 }, "logo2")
      .to(coachLogoDiamond, { scale: 1, duration: 4, ease: "elastic.out(1,0.5)" }, "logo3")
      .to(coachLogoMask, { scale: 1, duration: 4, ease: "elastic.out(1,0.5)" }, "logo3")
      .to(coachLogoSquare, { scale: 1, duration: 4, ease: "elastic.out(1,0.75)" }, "logo3")
      .to(coachLogoAE, { opacity: 1, scale: 1, duration: 3, ease: "elastic.out(1,0.75)" }, "logo3+=1")
      .to(marisa, { opacity: 0, duration: 1 }, "end")
    
    ScrollTrigger.create({
      animation: coachTl,
      trigger: coachProComp,
      start: "center center",
      end: () => `+=${window.innerWidth * 4} bottom`,
      scrub: 0.5,
      pin: true,
      pinSpacing: true,
      markers: false,
    });
  });
  
  gsap.to(coachLogo, {
    scale: 1.5,
    yPercent: -1,
    ease: "power2.in",
    scrollTrigger: {
      trigger: coachNextSec,
      start: "top bottom",
      end: "bottom center",
      scrub: 0.5,
      markers: false,
    },
  });

*/

});
