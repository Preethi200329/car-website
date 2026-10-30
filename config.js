/**
 * NOCTIS — Configuration & Content Tuning
 * All section heights, chapter ranges, frame counts, paths, and callout coordinates.
 */

const NOCTIS_CONFIG = {
  // Brand details
  brand: {
    name: 'NOCTIS',
    tagline: 'Drive the night.',
    year: '2026',
    disclaimer: 'NOCTIS is a fictional electric automotive marque created for scrollytelling demonstration.'
  },

  // Color Tokens
  colors: {
    asphalt: '#07080A',
    graphite: '#121418',
    fog: '#8A8F98',
    bone: '#EDEAE4',
    xenon: '#CFE3FF',
    taillight: '#E1251B',
    hairline: 'rgba(237, 234, 228, 0.12)'
  },

  // Global Cursor Settings
  cursor: {
    lerp: 0.18,
    dotSize: 6,
    ringSize: 28,
    barWidth: 44,
    barHeight: 2
  },

  // Noise Tile Settings
  noise: {
    fps: 8,
    opacity: 0.035,
    size: 128
  },

  // SECTION 1: HERO
  hero: {
    wrapperHeightVh: 600, // 600vh scroll height
    frameCount: 600,
    preloadInitialCount: 40, // Frames 1-40 needed before preloader completes
    framePathDesktop: (i) => `assets/frames/hero/frame_${String(i).padStart(4, '0')}.webp`,
    framePathMobile: (i) => `assets/frames/hero-mobile/frame_${String(i).padStart(4, '0')}.webp`,
    fadeToBlackStart: 0.95, // Progress at which canvas fades to solid black
    hud: {
      speedMax: 118,      // KM/H
      distanceMax: 4.2    // KM
    },
    chapters: [
      {
        id: 'c1',
        start: 0.00,
        end: 0.14,
        hudIndex: '01/04',
        title: 'NOCTIS',
        subtitle: 'The city is asleep.',
        hint: 'SCROLL TO WAKE IT'
      },
      {
        id: 'c2',
        start: 0.22,
        end: 0.40,
        hudIndex: '02/04',
        headline: "It doesn't need the city's light."
      },
      {
        id: 'c3',
        start: 0.50,
        end: 0.68,
        hudIndex: '03/04',
        headline: 'It brings its own.'
      },
      {
        id: 'c4',
        start: 0.80,
        end: 1.00,
        hudIndex: '04/04',
        title: 'GT-E',
        specs: '0–100 KM/H 3.1S · 640 KM RANGE · DUAL MOTOR',
        ctaText: 'Discover the GT-E',
        ctaHref: '#lineup'
      }
    ]
  },

  // SECTION 2: STATEMENT
  statement: {
    label: '02 — ENGINEERING',
    text: 'Every part was designed to disappear into one line of light.'
  },

  // SECTION 3: DISMANTLE
  dismantle: {
    wrapperHeightVh: 350, // 350vh scroll height
    frameCount: 200,
    framePathDesktop: (i) => `assets/frames/dismantle/frame_${String(i).padStart(4, '0')}.webp`,
    framePathMobile: (i) => `assets/frames/dismantle-mobile/frame_${String(i).padStart(4, '0')}.webp`,
    sectionTitle: 'Look closer.',
    sectionLabel: '03 — ARCHITECTURE',
    calloutsThreshold: 0.70, // Callouts begin fading in after 70% progress
    callouts: [
      {
        id: 'body',
        code: 'BODY',
        title: 'Carbon composite monocoque',
        desc: 'Single-piece carbon tub with aerospace-grade torsional rigidity.',
        xPercent: 36, // Coordinate on car image (% of width)
        yPercent: 30, // Coordinate on car image (% of height)
        dir: 'top-left',
        start: 0.72
      },
      {
        id: 'battery',
        code: 'BATTERY',
        title: '110 kWh structural pack',
        desc: 'Cell-to-pack architecture integrated into the lower chassis floor.',
        xPercent: 44,
        yPercent: 70,
        dir: 'bottom-left',
        start: 0.79
      },
      {
        id: 'drive',
        code: 'DRIVE',
        title: 'Dual axial-flux motors, 680 kW',
        desc: 'Direct-drive torque vectoring delivering instant throttle response.',
        xPercent: 70,
        yPercent: 64,
        dir: 'bottom-right',
        start: 0.86
      },
      {
        id: 'light',
        code: 'LIGHT',
        title: 'Single-line LED signature',
        desc: 'Ultra-narrow 8mm micro-optic beam illuminating 450 meters ahead.',
        xPercent: 84,
        yPercent: 44,
        dir: 'top-right',
        start: 0.92
      }
    ]
  },

  // SECTION 4: LINEUP
  lineup: {
    label: '04 — THE LINEUP',
    heading: 'Five ways to drive the night.',
    hoverDebounceMs: 80,
    defaultOpenIndex: 0,
    cars: [
      {
        id: 'gt-e',
        number: '01',
        name: 'GT-E',
        tagline: 'The grand tourer.',
        description: 'Effortless cross-continental velocity wrapped in silent aerodynamic perfection.',
        image: 'assets/cars/gt-e.webp',
        alt: 'NOCTIS GT-E matte graphite grand tourer coupe in side profile',
        specs: [
          { label: 'RANGE', value: '640 km' },
          { label: '0–100 KM/H', value: '3.1 s' },
          { label: 'POWER', value: '680 kW' }
        ],
        swatches: [
          { name: 'Matte Graphite', color: '#121418' },
          { name: 'Satin Bone', color: '#EDEAE4' },
          { name: 'Midnight Blue', color: '#1A2433' },
          { name: 'Deep Asphalt', color: '#0A0C10' }
        ]
      },
      {
        id: 's',
        number: '02',
        name: 'S',
        tagline: 'Four doors, no compromise.',
        description: 'Executive poise and razor agility with room for four passengers in absolute quiet.',
        image: 'assets/cars/s.webp',
        alt: 'NOCTIS S satin bone white electric sport sedan in side profile',
        specs: [
          { label: 'RANGE', value: '600 km' },
          { label: '0–100 KM/H', value: '3.6 s' },
          { label: 'POWER', value: '520 kW' }
        ],
        swatches: [
          { name: 'Satin Bone', color: '#EDEAE4' },
          { name: 'Matte Graphite', color: '#121418' },
          { name: 'Midnight Blue', color: '#1A2433' },
          { name: 'Fog Grey', color: '#8A8F98' }
        ]
      },
      {
        id: 'x',
        number: '03',
        name: 'X',
        tagline: 'Higher, never heavier.',
        description: 'Elevated stance with an aerodynamic fastback silhouette engineered for all terrain.',
        image: 'assets/cars/x.webp',
        alt: 'NOCTIS X midnight blue electric coupe SUV in side profile',
        specs: [
          { label: 'RANGE', value: '560 km' },
          { label: '0–100 KM/H', value: '4.2 s' },
          { label: 'POWER', value: '480 kW' }
        ],
        swatches: [
          { name: 'Midnight Blue', color: '#1A2433' },
          { name: 'Matte Graphite', color: '#121418' },
          { name: 'Satin Bone', color: '#EDEAE4' },
          { name: 'Dark Carbon', color: '#181B20' }
        ]
      },
      {
        id: 'r',
        number: '04',
        name: 'R',
        tagline: 'Built for the track.',
        description: 'Swan-neck downforce, dual active diffusers, and brutal sub-two-and-a-half second launches.',
        image: 'assets/cars/r.webp',
        alt: 'NOCTIS R track-focused electric sports car with carbon wing in side profile',
        specs: [
          { label: 'RANGE', value: '420 km' },
          { label: '0–100 KM/H', value: '2.4 s' },
          { label: 'POWER', value: '900 kW' }
        ],
        swatches: [
          { name: 'Satin Black / Red', color: '#0E0F12' },
          { name: 'Taillight Red', color: '#E1251B' },
          { name: 'Raw Carbon', color: '#1A1C20' },
          { name: 'Alabaster Track', color: '#EDEAE4' }
        ]
      },
      {
        id: 'one',
        number: '05',
        name: 'ONE',
        tagline: 'The future, early.',
        description: 'Our ultimate statement: a liquid metal speedform previewing the next decade of electric velocity.',
        image: 'assets/cars/one.webp',
        alt: 'NOCTIS ONE liquid silver electric hypercar concept in side profile',
        specs: [
          { label: 'RANGE', value: 'Concept' },
          { label: '0–100 KM/H', value: '< 2.0 s' },
          { label: 'POWER', value: '1100 kW' }
        ],
        swatches: [
          { name: 'Liquid Silver', color: '#C8CCD4' },
          { name: 'Matte Graphite', color: '#121418' },
          { name: 'Pure Obsidian', color: '#07080A' },
          { name: 'Xenon Tint', color: '#CFE3FF' }
        ]
      }
    ]
  },

  // SECTION 5: RESERVE
  reserve: {
    heading: 'Drive the night.',
    subtitle: 'Limited production allocation for the 2027 delivery cycle. Bespoke commission begins upon reservation.',
    cta: 'RESERVE YOUR NOCTIS'
  },

  // FOOTER
  footer: {
    links: [
      {
        colTitle: 'MODELS',
        items: [
          { label: 'GT-E Coupe', href: '#lineup' },
          { label: 'S Sport Sedan', href: '#lineup' },
          { label: 'X Coupe SUV', href: '#lineup' },
          { label: 'R Track Edition', href: '#lineup' },
          { label: 'ONE Concept', href: '#lineup' }
        ]
      },
      {
        colTitle: 'INNOVATION',
        items: [
          { label: 'Axial-Flux Motors', href: '#dismantle' },
          { label: 'Structural 110 kWh', href: '#dismantle' },
          { label: 'Carbon Monocoque', href: '#dismantle' },
          { label: 'Xenon Optic Array', href: '#dismantle' }
        ]
      },
      {
        colTitle: 'EXPERIENCE',
        items: [
          { label: 'Private Ateliers', href: '#reserve' },
          { label: 'Night Drive Program', href: '#reserve' },
          { label: 'Fleet Allocation', href: '#reserve' },
          { label: 'Global Concierge', href: '#reserve' }
        ]
      }
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NOCTIS_CONFIG;
}

