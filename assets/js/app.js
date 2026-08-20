/* =============================================================
   STARTVATE — interaction layer
   All data below is illustrative sample data for the demo.
   ============================================================= */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };
  var icon = function (id, style) { return '<svg' + (style ? ' style="' + style + '"' : '') + '><use href="#' + id + '"/></svg>'; };
  var initials = function (name) {
    return name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  };
  var AV = ['', 'avatar--b', 'avatar--c', 'avatar--d', 'avatar--e'];

  /* ---------------------------------------------------------
     1. Year, nav, mobile menu
  --------------------------------------------------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var nav = $('#nav');
  var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 12); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = $('#navToggle');
  var mobileMenu = $('#mobileMenu');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('#mobileMenu a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------
     2. Scroll reveal
  --------------------------------------------------------- */
  var revealIO = null;
  if ('IntersectionObserver' in window && !reduceMotion) {
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (el) { revealIO.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }
  var watchReveal = function (root) {
    $$('.reveal', root).forEach(function (el) { revealIO ? revealIO.observe(el) : el.classList.add('is-in'); });
  };

  /* ---------------------------------------------------------
     3. Hero typewriter
  --------------------------------------------------------- */
  var typeTarget = $('#heroType');
  if (typeTarget) {
    var phrases = ['AI Agriculture Startup', 'Technical co-founder in Chennai', 'Pre-seed climate funding', 'AgriTech accelerators'];
    if (reduceMotion) {
      typeTarget.textContent = phrases[0];
    } else {
      var pi = 0, ci = 0, deleting = false;
      (function tick() {
        var word = phrases[pi];
        ci += deleting ? -1 : 1;
        typeTarget.textContent = word.slice(0, ci);
        var delay = deleting ? 34 : 62;
        if (!deleting && ci === word.length) { deleting = true; delay = 2100; }
        else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 380; }
        setTimeout(tick, delay);
      })();
    }
  }

  /* ---------------------------------------------------------
     4. Search datasets
  --------------------------------------------------------- */
  var DATA = {
    agri: {
      match: /agri|farm|crop|food|rural/i,
      total: 49,
      people: [
        { n: 'Meera Krishnan', r: 'ML Engineer · Bengaluru', d: 'Three years on computer-vision crop disease models. Open to founding a company in this space.', t: ['Co-founder', 'ML', 'Python'], m: 92, k: 'Potential co-founder' },
        { n: 'Dr. Rohan Patel', r: 'Agri-science researcher · Pune', d: 'Runs field trials with 200+ smallholder farms. Mentors two AgriTech teams a year.', t: ['Mentor', 'Field trials'], m: 87, k: 'Mentor' },
        { n: 'Nila Capital', r: 'Pre-seed fund · India', d: 'Writes ₹50L–₹3Cr first cheques into AgriTech and ClimateTech.', t: ['Investor', 'Pre-seed'], m: 81, k: 'Investor' },
        { n: 'Kabir Shah', r: 'Android engineer · Ahmedabad', d: 'Built offline-first apps for low-connectivity rural users. Looking to join a founding team.', t: ['Team member', 'Kotlin'], m: 78, k: 'Team member' },
        { n: 'Ananya Rao', r: 'Founder, HarvestLoop · Hyderabad', d: 'Building produce logistics. Happy to share early unit economics with new founders.', t: ['Founder', 'Logistics'], m: 74, k: 'Founder' },
        { n: 'Ishaan Mehta', r: 'Product designer · Remote', d: 'Designs for farmer-facing interfaces in five Indian languages.', t: ['Designer', 'UX research'], m: 71, k: 'Designer' }
      ],
      startups: [
        { n: 'CropSense AI', i: 'AgriTech · Seed', d: 'Satellite + sensor yield prediction for mid-size farms across three states.', t: ['Computer vision', '14 people', 'Bengaluru'] },
        { n: 'TerraGrid', i: 'AgriTech · Pre-seed', d: 'Soil intelligence API returning nitrogen and moisture forecasts seven days out.', t: ['API', '6 people', 'Pune'] },
        { n: 'HarvestLoop', i: 'AgriTech · Seed', d: 'Direct farm-to-restaurant produce marketplace with cold-chain routing.', t: ['Marketplace', '22 people', 'Hyderabad'] },
        { n: 'AgroNimbus', i: 'ClimateTech · Series A', d: 'Weather-risk models sold to crop insurers and lenders.', t: ['Risk models', '48 people', 'Singapore'] },
        { n: 'RootLayer', i: 'DeepTech · Pre-seed', d: 'Low-cost soil spectrometry hardware for village-level testing labs.', t: ['Hardware', '4 people', 'Coimbatore'] }
      ],
      opps: [
        { n: 'AgriTech Innovation Challenge', o: 'National AgriTech Mission', c: 'Competition', dl: 'Closes in 12 days', l: 'Hybrid · Delhi', m: 94 },
        { n: 'GreenField Accelerator — Cohort 7', o: 'GreenField Ventures', c: 'Accelerator', dl: 'Closes in 21 days', l: 'Remote', m: 89 },
        { n: 'Rural Innovation Grant', o: 'Dept. of Science & Technology', c: 'Grant', dl: 'Closes in 34 days', l: 'India', m: 84 },
        { n: 'AgriFuture Summit 2026', o: 'AgriFuture', c: 'Conference', dl: 'Registration open', l: 'Hyderabad', m: 80 },
        { n: 'Climate & Food Systems Fellowship', o: 'Terra Foundation', c: 'Fellowship', dl: 'Closes in 46 days', l: 'Global · Remote', m: 76 }
      ],
      knowledge: [
        { n: 'Precision farming market brief 2026', r: 'Research · 6 min read', d: 'Where the spend is actually moving: satellite-first models over sensor hardware.' },
        { n: 'AgriTech seed rounds up 28% YoY in South Asia', r: 'Funding news · 2h ago', d: 'Twelve pre-seed rounds closed this quarter in crop intelligence alone.' },
        { n: 'AgriTech Builders', r: 'Community · 4,240 members', d: 'Weekly build threads, pilot swaps and honest post-mortems.' },
        { n: 'Field study: advisory apps raised yields 11%', r: 'Research · 2 seasons', d: 'Evidence base worth citing in accelerator and grant applications.' },
        { n: 'Why three AgriTech startups pivoted away from B2C', r: 'Discussion · 58 replies', d: 'Founders break down what broke in direct-to-farmer distribution.' }
      ]
    },

    fintech: {
      match: /fintech|finance|payment|bank|lending|credit/i,
      total: 44,
      people: [
        { n: 'Priya Nair', r: 'Backend engineer · Chennai', d: 'Built payment rails at two fintechs. Wants to co-found something in credit infrastructure.', t: ['Co-founder', 'Go', 'Payments'], m: 90, k: 'Potential co-founder' },
        { n: 'Vikram Desai', r: 'Ex-banking risk lead · Mumbai', d: 'Advises early fintechs on regulation, licensing and underwriting models.', t: ['Mentor', 'Compliance'], m: 85, k: 'Mentor' },
        { n: 'Ledgerpoint Capital', r: 'Seed fund · India + SEA', d: 'Backs fintech infrastructure at seed. Twelve investments in the last 18 months.', t: ['Investor', 'Seed'], m: 79, k: 'Investor' },
        { n: 'Sara Iqbal', r: 'Product manager · Bengaluru', d: 'Shipped lending products for thin-file customers across three markets.', t: ['Team member', 'Lending'], m: 76, k: 'Team member' }
      ],
      startups: [
        { n: 'StackLedger', i: 'FinTech · Seed', d: 'Ledger-as-a-service for companies building their own wallets.', t: ['Infrastructure', '19 people', 'Bengaluru'] },
        { n: 'ThinFile', i: 'FinTech · Pre-seed', d: 'Alternative-data underwriting for first-time borrowers.', t: ['Underwriting', '7 people', 'Mumbai'] },
        { n: 'PaySeam', i: 'FinTech · Series A', d: 'Cross-border payouts for freelancer marketplaces.', t: ['Payments', '61 people', 'Singapore'] }
      ],
      opps: [
        { n: 'FinTech Founders Program', o: 'Ledgerpoint Capital', c: 'Accelerator', dl: 'Closes in 18 days', l: 'Bengaluru', m: 91 },
        { n: 'RegTech Sandbox Cohort', o: 'Central regulator sandbox', c: 'Incubator', dl: 'Closes in 29 days', l: 'India', m: 86 },
        { n: 'Global FinTech Fest', o: 'FinTech Council', c: 'Conference', dl: 'Registration open', l: 'Mumbai', m: 78 },
        { n: 'Payments Infrastructure Hackathon', o: 'OpenRails', c: 'Hackathon', dl: 'Closes in 9 days', l: 'Online', m: 74 }
      ],
      knowledge: [
        { n: 'Where fintech seed capital moved in 2026', r: 'Research · 8 min read', d: 'Infrastructure over consumer apps, for the third year running.' },
        { n: 'Licensing paths for early-stage lenders', r: 'Resource · Guide', d: 'What you can build before you need a licence, and what you cannot.' },
        { n: 'FinTech Builders', r: 'Community · 12,600 members', d: 'Regulation threads, pricing teardowns and hiring boards.' }
      ]
    },

    climate: {
      match: /climate|energy|carbon|clean|solar|sustain/i,
      total: 41,
      people: [
        { n: 'Aditi Sharma', r: 'Hardware engineer · Bengaluru', d: 'Designs low-cost sensing hardware. Looking for a commercial co-founder.', t: ['Co-founder', 'Hardware'], m: 88, k: 'Potential co-founder' },
        { n: 'Marcus Lin', r: 'Climate fund partner · Singapore', d: 'Invests in early climate hardware and industrial decarbonisation.', t: ['Investor', 'Pre-seed'], m: 83, k: 'Investor' },
        { n: 'Dr. Leela Menon', r: 'Energy systems researcher', d: 'Advises founders on grid integration and pilot design.', t: ['Mentor', 'Energy'], m: 80, k: 'Mentor' }
      ],
      startups: [
        { n: 'VoltMesh', i: 'ClimateTech · Seed', d: 'Distributed battery orchestration for industrial rooftops.', t: ['Energy', '16 people', 'Chennai'] },
        { n: 'CarbonLedger', i: 'ClimateTech · Pre-seed', d: 'Measurement and verification for small-scale carbon projects.', t: ['MRV', '5 people', 'Remote'] },
        { n: 'AgroNimbus', i: 'ClimateTech · Series A', d: 'Weather-risk models for insurers and agricultural lenders.', t: ['Risk', '48 people', 'Singapore'] }
      ],
      opps: [
        { n: 'Climate Hardware Grant', o: 'Terra Foundation', c: 'Grant', dl: 'Closes in 16 days', l: 'Global', m: 93 },
        { n: 'Decarb Accelerator', o: 'GreenField Ventures', c: 'Accelerator', dl: 'Closes in 25 days', l: 'Remote', m: 87 },
        { n: 'Clean Energy Innovation Prize', o: 'National Energy Board', c: 'Competition', dl: 'Closes in 40 days', l: 'Hybrid', m: 82 },
        { n: 'Climate Founders Fellowship', o: 'Terra Foundation', c: 'Fellowship', dl: 'Closes in 46 days', l: 'Global · Remote', m: 77 }
      ],
      knowledge: [
        { n: 'Hardware climate startups: capital timing', r: 'Research · 9 min read', d: 'Why grant capital before equity changes the whole funding path.' },
        { n: 'Pilot design for industrial customers', r: 'Resource · Playbook', d: 'How early climate teams structure a first paid pilot.' },
        { n: 'ClimateTech Builders', r: 'Community · 6,800 members', d: 'Hardware sourcing, pilot leads and grant deadlines.' }
      ]
    },

    student: {
      match: /student|hackathon|college|university|intern|beginner/i,
      total: 38,
      people: [
        { n: 'Sana Verma', r: 'Student founder · Delhi', d: 'Second-year student validating a farm-to-restaurant marketplace.', t: ['Founder', 'Student'], m: 86, k: 'Founder' },
        { n: 'Rahul Iyer', r: 'CS undergrad · Coimbatore', d: 'Three hackathon wins. Looking for a serious team to build with beyond weekends.', t: ['Team member', 'Full-stack'], m: 82, k: 'Team member' },
        { n: 'Prof. Anita Ghosh', r: 'Entrepreneurship cell mentor', d: 'Mentors student teams through their first customer conversations.', t: ['Mentor', 'Campus'], m: 79, k: 'Mentor' }
      ],
      startups: [
        { n: 'CampusLoop', i: 'EdTech · Pre-seed', d: 'Peer-learning network started by two final-year students.', t: ['EdTech', '4 people', 'Delhi'] },
        { n: 'RootLayer', i: 'DeepTech · Pre-seed', d: 'Soil spectrometry hardware spun out of a university lab.', t: ['Hardware', '4 people', 'Coimbatore'] }
      ],
      opps: [
        { n: 'National Student Startup Hackathon', o: 'Startup India Cell', c: 'Hackathon', dl: 'Closes in 6 days', l: 'Online', m: 95 },
        { n: 'Campus Founders Fellowship', o: 'Builder Foundation', c: 'Fellowship', dl: 'Closes in 23 days', l: 'India', m: 88 },
        { n: 'University Incubator Intake', o: 'IIT-affiliated incubator', c: 'Incubator', dl: 'Closes in 31 days', l: 'Chennai', m: 84 },
        { n: 'Student Innovation Grant', o: 'Dept. of Science & Technology', c: 'Grant', dl: 'Closes in 34 days', l: 'India', m: 80 }
      ],
      knowledge: [
        { n: 'How student founders find their first users', r: 'Resource · Playbook', d: 'Campus distribution is an advantage — most teams use it too late.' },
        { n: 'Student Founders', r: 'Community · 9,100 members', d: 'Idea feedback, teammate search and deadline reminders.' },
        { n: 'Balancing a degree and a startup', r: 'Discussion · 112 replies', d: 'Founders who did both on what they would change.' }
      ]
    },

    health: {
      match: /health|medical|clinic|patient|bio|diagnos/i,
      total: 40,
      people: [
        { n: 'Dr. Neha Suri', r: 'Clinician-founder · Mumbai', d: 'Practising physician building diagnostics workflows. Wants a technical co-founder.', t: ['Co-founder', 'Clinical'], m: 89, k: 'Potential co-founder' },
        { n: 'Arjun Bose', r: 'ML engineer · Remote', d: 'Medical imaging models with published validation studies.', t: ['Team member', 'ML'], m: 84, k: 'Team member' },
        { n: 'Meridian Health Fund', r: 'Seed investor', d: 'Backs clinical-workflow and diagnostics startups at seed.', t: ['Investor', 'Seed'], m: 78, k: 'Investor' }
      ],
      startups: [
        { n: 'ClinicOS', i: 'HealthTech · Seed', d: 'Operating system for small multi-speciality clinics.', t: ['SaaS', '24 people', 'Mumbai'] },
        { n: 'ScanPath', i: 'HealthTech · Pre-seed', d: 'Radiology triage models for high-volume public hospitals.', t: ['Imaging', '8 people', 'Bengaluru'] }
      ],
      opps: [
        { n: 'HealthTech Innovation Challenge', o: 'Meridian Health Fund', c: 'Competition', dl: 'Closes in 14 days', l: 'Hybrid', m: 92 },
        { n: 'MedTech Incubator Intake', o: 'National Health Incubator', c: 'Incubator', dl: 'Closes in 27 days', l: 'Delhi', m: 85 },
        { n: 'Clinical AI Summit', o: 'HealthAI Council', c: 'Conference', dl: 'Registration open', l: 'Bengaluru', m: 79 }
      ],
      knowledge: [
        { n: 'Regulatory basics for clinical AI', r: 'Resource · Guide', d: 'What validation you need before a hospital will pilot with you.' },
        { n: 'HealthTech Builders', r: 'Community · 5,400 members', d: 'Clinical partnerships, validation studies and hiring.' }
      ]
    }
  };

  function genericSet(q) {
    var topic = q.replace(/\b(startup|startups|company|idea|find|for|in|a|an|the)\b/gi, '').trim() || q;
    var Topic = topic.charAt(0).toUpperCase() + topic.slice(1);
    return {
      total: 36,
      people: [
        { n: 'Aarav Menon', r: 'Engineer · Remote', d: 'Working on ' + topic + ' problems for two years. Open to co-founding.', t: ['Co-founder', 'Engineering'], m: 88, k: 'Potential co-founder' },
        { n: 'Divya Raman', r: 'Operator turned mentor', d: 'Scaled a company in an adjacent market. Mentors two teams a year.', t: ['Mentor'], m: 82, k: 'Mentor' },
        { n: 'Northline Ventures', r: 'Pre-seed fund', d: 'Writes first cheques into early teams working on ' + topic + '.', t: ['Investor', 'Pre-seed'], m: 77, k: 'Investor' },
        { n: 'Tara Joshi', r: 'Product designer · Bengaluru', d: 'Looking to join an early founding team in this space.', t: ['Team member', 'Design'], m: 73, k: 'Team member' }
      ],
      startups: [
        { n: Topic + ' Labs', i: 'Early stage', d: 'Building in the same space with an infrastructure-first approach.', t: ['Pre-seed', '5 people'] },
        { n: 'Northpoint', i: 'Seed', d: 'Adjacent product, overlapping customer base — worth studying before you build.', t: ['Seed', '18 people'] },
        { n: 'Kestrel', i: 'Series A', d: 'The incumbent to benchmark against on pricing and positioning.', t: ['Series A', '54 people'] }
      ],
      opps: [
        { n: Topic + ' Innovation Challenge', o: 'Ecosystem partner', c: 'Competition', dl: 'Closes in 15 days', l: 'Hybrid', m: 90 },
        { n: 'Founders Accelerator — Spring cohort', o: 'GreenField Ventures', c: 'Accelerator', dl: 'Closes in 24 days', l: 'Remote', m: 85 },
        { n: 'Early Builders Grant', o: 'Builder Foundation', c: 'Grant', dl: 'Closes in 33 days', l: 'Global', m: 79 },
        { n: 'Build Weekend Hackathon', o: 'STARTVATE community', c: 'Hackathon', dl: 'Closes in 8 days', l: 'Online', m: 75 }
      ],
      knowledge: [
        { n: Topic + ' market brief', r: 'Research · 7 min read', d: 'Market size, active buyers and where the current gaps sit.' },
        { n: 'Builders working on ' + topic, r: 'Community · Active', d: 'Ongoing threads from people solving the same problem.' },
        { n: 'What to validate before you build', r: 'Resource · Playbook', d: 'Five questions to answer with customers in the first two weeks.' }
      ]
    };
  }

  function pickSet(q) {
    for (var key in DATA) {
      if (DATA[key].match && DATA[key].match.test(q)) return DATA[key];
    }
    return genericSet(q);
  }

  /* ---------------------------------------------------------
     5. Result rendering
  --------------------------------------------------------- */
  function personCard(p, i) {
    return '<div class="rcard">' +
      '<span class="avatar ' + AV[i % AV.length] + '">' + esc(initials(p.n)) + '</span>' +
      '<div class="rcard__body">' +
        '<div class="rcard__t">' + esc(p.n) + ' <span class="badge badge--people">' + esc(p.k) + '</span></div>' +
        '<div class="rcard__r">' + esc(p.r) + '</div>' +
        '<div class="rcard__d">' + esc(p.d) + '</div>' +
        '<div class="rcard__f">' + p.t.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div>' +
      '</div>' +
      '<div class="rcard__side"><div class="match">' + p.m + '%<small>match</small></div>' +
      '<button class="btn btn--ghost btn--xs">Connect</button></div></div>';
  }

  function startupCard(s) {
    return '<div class="rcard">' +
      '<span class="startup__logo">' + esc(initials(s.n)) + '</span>' +
      '<div class="rcard__body">' +
        '<div class="rcard__t">' + esc(s.n) + ' <span class="badge badge--startup">' + esc(s.i) + '</span></div>' +
        '<div class="rcard__d">' + esc(s.d) + '</div>' +
        '<div class="rcard__f">' + s.t.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div>' +
      '</div>' +
      '<div class="rcard__side"><button class="btn btn--ghost btn--xs">View</button></div></div>';
  }

  function oppCardSm(o) {
    return '<div class="rcard">' +
      '<span class="proj__ic" style="background:var(--brand-50);color:var(--brand-700)">' + icon('i-target') + '</span>' +
      '<div class="rcard__body">' +
        '<div class="rcard__t">' + esc(o.n) + ' <span class="badge badge--opp">' + esc(o.c) + '</span></div>' +
        '<div class="rcard__r">' + esc(o.o) + '</div>' +
        '<div class="rcard__f"><span class="chip">' + icon('i-clock', 'width:12px;height:12px') + ' ' + esc(o.dl) + '</span>' +
        '<span class="chip">' + icon('i-pin', 'width:12px;height:12px') + ' ' + esc(o.l) + '</span></div>' +
      '</div>' +
      '<div class="rcard__side"><div class="match">' + o.m + '%<small>match</small></div>' +
      '<button class="btn btn--ghost btn--xs">Apply</button></div></div>';
  }

  function knowCard(k) {
    return '<div class="rcard">' +
      '<span class="proj__ic">' + icon('i-book') + '</span>' +
      '<div class="rcard__body">' +
        '<div class="rcard__t">' + esc(k.n) + '</div>' +
        '<div class="rcard__r">' + esc(k.r) + '</div>' +
        '<div class="rcard__d">' + esc(k.d) + '</div>' +
      '</div></div>';
  }

  var GROUPS = [
    { id: 'people', label: 'People', hint: 'Founders · co-founders · mentors · investors', badge: 'badge--people', render: personCard },
    { id: 'startups', label: 'Startups', hint: 'Similar companies · competitors · technologies', badge: 'badge--startup', render: startupCard },
    { id: 'opps', label: 'Opportunities', hint: 'Hackathons · accelerators · grants · events', badge: 'badge--opp', render: oppCardSm },
    { id: 'knowledge', label: 'Knowledge', hint: 'Research · news · communities · resources', badge: 'badge--know', render: knowCard }
  ];

  var results = $('#results');
  var resultsBody = $('#resultsBody');
  var currentTab = 'all';
  var currentSet = null;

  function renderResults(q, set, tab) {
    var html = '';
    GROUPS.forEach(function (g) {
      var items = set[g.id] || [];
      if (!items.length) return;
      var shown = tab === 'all' ? items.slice(0, 2) : items;
      var isShown = (tab === 'all' || tab === g.id);
      html += '<section class="res-group' + (isShown ? ' is-shown' : '') + '" data-group="' + g.id + '">' +
        '<div class="res-group__head"><span class="badge ' + g.badge + '">' + g.label + '</span>' +
        '<h4 class="muted" style="font-weight:500">' + g.hint + '</h4><span class="rule"></span>' +
        '<span class="tiny muted">' + items.length + ' results</span></div>' +
        '<div class="grid ' + (g.id === 'people' || g.id === 'startups' ? 'g-2' : 'g-2') + '" style="gap:12px">' +
        shown.map(function (it, i) { return g.render(it, i); }).join('') + '</div>';
      if (tab === 'all' && items.length > shown.length) {
        html += '<div style="margin-top:12px"><button class="link-arrow" data-jump="' + g.id + '">See all ' + items.length + ' ' + g.label.toLowerCase() + ' ' + icon('i-arrow') + '</button></div>';
      }
      html += '</section>';
    });

    resultsBody.innerHTML = html;
    $('#resultsQuery').textContent = q;
    var total = GROUPS.reduce(function (acc, g) { return acc + ((set[g.id] || []).length); }, 0);
    $('#resultsCount').textContent = set.total || total;
    $$('#tabs .n').forEach(function (n) {
      var g = n.getAttribute('data-count');
      n.textContent = (set[g] || []).length;
    });
    $$('[data-jump]', resultsBody).forEach(function (b) {
      b.addEventListener('click', function () { setTab(b.getAttribute('data-jump')); });
    });
    results.classList.add('is-live');
  }

  function setTab(tab) {
    currentTab = tab;
    $$('#tabs .tab').forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-tab') === tab); });
    renderResults($('#resultsQuery').textContent, currentSet, tab);
  }

  function runSearch(q) {
    q = (q || '').trim();
    if (!q) return;
    currentSet = pickSet(q);
    results.classList.remove('is-live');
    currentTab = 'all';
    $$('#tabs .tab').forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-tab') === 'all'); });
    setTimeout(function () { renderResults(q, currentSet, 'all'); }, reduceMotion ? 0 : 180);
  }

  var searchForm = $('#searchForm');
  var searchInput = $('#searchInput');
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      runSearch(searchInput.value);
      results.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    });
    $$('#suggest .sugg').forEach(function (b) {
      b.addEventListener('click', function () {
        searchInput.value = b.getAttribute('data-q');
        runSearch(searchInput.value);
      });
    });
    $$('#tabs .tab').forEach(function (t) {
      t.addEventListener('click', function () { setTab(t.getAttribute('data-tab')); });
    });
    currentSet = pickSet(searchInput.value);
    renderResults(searchInput.value, currentSet, 'all');
  }

  /* ---------------------------------------------------------
     6. Opportunities
  --------------------------------------------------------- */
  var OPPS = [
    { n: 'AgriTech Innovation Challenge', o: 'National AgriTech Mission', c: 'Competition', dl: 'Application closes in 12 days', l: 'Hybrid · Delhi', e: 'Early-stage teams, prototype required', t: ['AgriTech', 'AI', 'Prototype'], m: 94 },
    { n: 'GreenField Accelerator — Cohort 7', o: 'GreenField Ventures', c: 'Accelerator', dl: 'Application closes in 21 days', l: 'Remote · 12 weeks', e: 'Pre-seed, incorporated or incorporating', t: ['Pre-seed', 'Mentorship', 'Equity'], m: 89 },
    { n: 'Rural Innovation Grant', o: 'Dept. of Science & Technology', c: 'Grant', dl: 'Application closes in 34 days', l: 'India', e: 'Registered entity, rural impact focus', t: ['Non-dilutive', 'Impact'], m: 84 },
    { n: 'National Student Startup Hackathon', o: 'Startup India Cell', c: 'Hackathon', dl: 'Registration closes in 6 days', l: 'Online · 48 hours', e: 'Enrolled students, teams of 2–4', t: ['Students', 'Weekend', 'Prizes'], m: 91 },
    { n: 'University Incubator Intake', o: 'IIT-affiliated incubator', c: 'Incubator', dl: 'Application closes in 31 days', l: 'Chennai · On-site', e: 'Idea to prototype stage, any domain', t: ['Lab access', 'Seed grant'], m: 82 },
    { n: 'Pre-seed Cheque Program', o: 'Nila Capital', c: 'Funding', dl: 'Rolling applications', l: 'India', e: 'Working prototype, first users', t: ['₹50L–₹3Cr', 'Pre-seed'], m: 87 },
    { n: 'AgriFuture Summit 2026', o: 'AgriFuture', c: 'Conference', dl: 'Registration open · 3 weeks out', l: 'Hyderabad', e: 'Open · founder passes discounted', t: ['Networking', '34 matches attending'], m: 80 },
    { n: 'Founding Engineer — CropSense AI', o: 'CropSense AI', c: 'Job', dl: 'Actively hiring', l: 'Bengaluru · Hybrid', e: '3+ years, ML or backend', t: ['Equity', 'Seed stage'], m: 76 },
    { n: 'Climate & Food Systems Fellowship', o: 'Terra Foundation', c: 'Fellowship', dl: 'Application closes in 46 days', l: 'Global · Remote', e: 'Founders and researchers under 30', t: ['Stipend', 'Global cohort'], m: 78 }
  ];

  function oppCard(o) {
    return '<article class="card card--hover opp reveal" data-cat="' + esc(o.c) + '">' +
      '<div class="opp__top"><div>' +
        '<span class="badge badge--opp">' + esc(o.c) + '</span>' +
        '<div class="opp__t">' + esc(o.n) + '</div>' +
        '<div class="opp__org">' + esc(o.o) + '</div>' +
      '</div>' +
      '<div class="ring" data-ring="' + o.m + '"><svg viewBox="0 0 52 52"><circle class="bgc" cx="26" cy="26" r="22"/><circle class="fgc" cx="26" cy="26" r="22"/></svg><b>' + o.m + '%</b></div>' +
      '</div>' +
      '<div class="opp__facts">' +
        '<div>' + icon('i-pin') + esc(o.l) + '</div>' +
        '<div>' + icon('i-shield') + esc(o.e) + '</div>' +
      '</div>' +
      '<div class="tagline-row">' + o.t.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="opp__foot">' +
        '<span class="deadline">' + icon('i-clock') + esc(o.dl) + '</span>' +
        '<button class="link-arrow">View ' + icon('i-arrow') + '</button>' +
      '</div></article>';
  }

  var oppGrid = $('#oppGrid');
  var ringIO = null;
  if ('IntersectionObserver' in window) {
    ringIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var pct = parseInt(e.target.getAttribute('data-ring'), 10) || 0;
        var fg = e.target.querySelector('.fgc');
        if (fg) fg.style.strokeDashoffset = String(138 - (138 * pct) / 100);
        ringIO.unobserve(e.target);
      });
    }, { threshold: 0.4 });
  }

  function paintOpps(filter) {
    if (!oppGrid) return;
    var list = filter === 'all' ? OPPS : OPPS.filter(function (o) { return o.c === filter; });
    oppGrid.innerHTML = list.map(oppCard).join('');
    watchReveal(oppGrid);
    $$('.ring', oppGrid).forEach(function (r) {
      if (ringIO) { ringIO.observe(r); }
      else { r.querySelector('.fgc').style.strokeDashoffset = String(138 - (138 * parseInt(r.getAttribute('data-ring'), 10)) / 100); }
    });
  }
  paintOpps('all');
  $$('#oppFilters .filter').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#oppFilters .filter').forEach(function (x) { x.classList.remove('is-active'); });
      b.classList.add('is-active');
      paintOpps(b.getAttribute('data-filter'));
    });
  });

  /* ---------------------------------------------------------
     7. Startup discovery
  --------------------------------------------------------- */
  var STARTUPS = [
    { n: 'CropSense AI', c: ['AgriTech', 'AI'], d: 'Satellite and sensor fusion for yield prediction on mid-size farms.', st: 'Seed', team: '14 people', tech: 'Computer vision · Python', loc: 'Bengaluru', f: 'Meera-adjacent network', w: 'cropsense.ai' },
    { n: 'TerraGrid', c: ['AgriTech', 'DeepTech'], d: 'Soil intelligence API with seven-day nitrogen and moisture forecasts.', st: 'Pre-seed', team: '6 people', tech: 'Sensors · Go', loc: 'Pune', f: 'Ravi Deshpande', w: 'terragrid.io' },
    { n: 'StackLedger', c: ['FinTech', 'SaaS'], d: 'Ledger-as-a-service for teams building wallets and payment products.', st: 'Seed', team: '19 people', tech: 'Rust · Postgres', loc: 'Bengaluru', f: 'Priya Nair', w: 'stackledger.dev' },
    { n: 'ClinicOS', c: ['HealthTech', 'SaaS'], d: 'Operating system for small multi-speciality clinics and their staff.', st: 'Seed', team: '24 people', tech: 'React · FHIR', loc: 'Mumbai', f: 'Dr. Neha Suri', w: 'clinicos.health' },
    { n: 'VoltMesh', c: ['ClimateTech', 'DeepTech'], d: 'Distributed battery orchestration for industrial rooftop solar.', st: 'Seed', team: '16 people', tech: 'Embedded · ML', loc: 'Chennai', f: 'Aditi Sharma', w: 'voltmesh.energy' },
    { n: 'CampusLoop', c: ['EdTech', 'SaaS'], d: 'Peer-learning and project network for university builders.', st: 'Pre-seed', team: '4 people', tech: 'Next.js', loc: 'Delhi', f: 'Sana Verma', w: 'campusloop.app' },
    { n: 'ScanPath', c: ['HealthTech', 'AI'], d: 'Radiology triage models built for high-volume public hospitals.', st: 'Pre-seed', team: '8 people', tech: 'PyTorch', loc: 'Bengaluru', f: 'Arjun Bose', w: 'scanpath.ai' },
    { n: 'ThinFile', c: ['FinTech', 'AI'], d: 'Alternative-data underwriting for first-time borrowers.', st: 'Pre-seed', team: '7 people', tech: 'Python · Risk models', loc: 'Mumbai', f: 'Sara Iqbal', w: 'thinfile.co' },
    { n: 'RootLayer', c: ['DeepTech', 'AgriTech'], d: 'Low-cost soil spectrometry hardware for village testing labs.', st: 'Pre-seed', team: '4 people', tech: 'Optics · Firmware', loc: 'Coimbatore', f: 'University spin-out', w: 'rootlayer.in' }
  ];

  function startupTile(s) {
    return '<article class="card card--hover startup reveal">' +
      '<div class="startup__top">' +
        '<span class="startup__logo">' + esc(initials(s.n)) + '</span>' +
        '<div><div class="startup__n">' + esc(s.n) + '</div><div class="startup__i">' + s.c.join(' · ') + '</div></div>' +
      '</div>' +
      '<p class="startup__d">' + esc(s.d) + '</p>' +
      '<div class="startup__facts">' +
        '<div><div class="k">Stage</div><div class="v">' + esc(s.st) + '</div></div>' +
        '<div><div class="k">Team</div><div class="v">' + esc(s.team) + '</div></div>' +
        '<div><div class="k">Technology</div><div class="v">' + esc(s.tech) + '</div></div>' +
        '<div><div class="k">Location</div><div class="v">' + esc(s.loc) + '</div></div>' +
      '</div>' +
      '<div class="startup__foot">' +
        '<span class="tiny muted">' + icon('i-link', 'width:12px;height:12px;display:inline-block;vertical-align:-2px') + ' ' + esc(s.w) + '</span>' +
        '<button class="link-arrow">Open profile ' + icon('i-arrow') + '</button>' +
      '</div></article>';
  }

  var startupGrid = $('#startupGrid');
  function paintStartups(cat) {
    if (!startupGrid) return;
    var list = cat === 'all' ? STARTUPS : STARTUPS.filter(function (s) { return s.c.indexOf(cat) > -1; });
    startupGrid.innerHTML = list.length ? list.map(startupTile).join('')
      : '<p class="muted">No startups mapped in this category yet — the ecosystem map fills in as builders join.</p>';
    watchReveal(startupGrid);
  }
  paintStartups('all');
  $$('#startupFilters .filter').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#startupFilters .filter').forEach(function (x) { x.classList.remove('is-active'); });
      b.classList.add('is-active');
      paintStartups(b.getAttribute('data-cat'));
    });
  });

  /* ---------------------------------------------------------
     8. Counters, match numbers, journey
  --------------------------------------------------------- */
  function animateNumber(el, to, suffix) {
    if (reduceMotion) { el.textContent = to + (suffix || ''); return; }
    var start = performance.now(), dur = 1100;
    (function frame(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased) + (suffix || '');
      if (p < 1) requestAnimationFrame(frame);
    })(start);
  }

  if ('IntersectionObserver' in window) {
    var numIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.hasAttribute('data-count-to')) animateNumber(el, parseInt(el.getAttribute('data-count-to'), 10), '');
        if (el.hasAttribute('data-match')) {
          var small = el.querySelector('small');
          var label = small ? small.outerHTML : '';
          var to = parseInt(el.getAttribute('data-match'), 10);
          var start = performance.now();
          (function frame(now) {
            var p = Math.min(1, (now - start) / 1100);
            var eased = 1 - Math.pow(1 - p, 3);
            el.innerHTML = Math.round(to * eased) + '%' + label;
            if (p < 1) requestAnimationFrame(frame);
          })(start);
        }
        numIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    $$('[data-count-to], [data-match]').forEach(function (el) { numIO.observe(el); });

    var journey = $('#journey');
    if (journey) {
      var jIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          $$('[data-j]', journey).forEach(function (step, i) {
            setTimeout(function () { step.classList.add('is-lit'); }, reduceMotion ? 0 : i * 190);
          });
          jIO.unobserve(journey);
        });
      }, { threshold: 0.4 });
      jIO.observe(journey);
    }
  } else {
    $$('[data-count-to]').forEach(function (el) { el.textContent = el.getAttribute('data-count-to'); });
    $$('[data-j]').forEach(function (el) { el.classList.add('is-lit'); });
  }

  /* ---------------------------------------------------------
     9. Feed micro-interactions
  --------------------------------------------------------- */
  $$('[data-like]').forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.classList.toggle('is-on');
      var span = b.querySelector('span');
      if (span) {
        var n = parseInt(span.textContent, 10) || 0;
        span.textContent = on ? n + 1 : n - 1;
      }
    });
  });
  $$('[data-save]').forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.classList.toggle('is-on');
      b.innerHTML = icon('i-bookmark') + (on ? ' Saved' : ' Save');
    });
  });

  /* ---------------------------------------------------------
     10. AI assistant
  --------------------------------------------------------- */
  var panel = $('#aiPanel');
  var log = $('#aiLog');
  var fab = $('#aiFab');

  var REPLIES = [
    {
      k: /co-?founder|cofounder|partner|team/i,
      html: '<b>Eight profiles match your co-founder criteria.</b> The strongest signal comes from people whose <i>looking for</i> field mirrors yours — not just people with matching skills.' +
        '<ul><li><b>Meera Krishnan</b> — 92%. ML + crop vision, explicitly looking to co-found in AgriTech.</li>' +
        '<li><b>Kabir Shah</b> — 78%. Android, offline-first, wants to join a founding team.</li></ul>' +
        'Before you reach out: put a one-line "what I need from a co-founder" on your Builder Profile. Matched intros with that filled in get replied to about twice as often in our early tests.'
    },
    {
      k: /accelerat|incubat|program|apply|cohort/i,
      html: '<b>Four accelerators fit your stage and domain.</b>' +
        '<ul><li><b>GreenField Accelerator, Cohort 7</b> — 89% match, closes in 21 days, remote, 12 weeks.</li>' +
        '<li><b>University Incubator Intake</b> — 82% match, lab access plus a seed grant.</li></ul>' +
        'GreenField is the one to prioritise: they have funded two comparable teams at prototype stage, so your pilot data is enough for the application.'
    },
    {
      k: /validat|market|research|competitor|study/i,
      html: '<b>Validation path for an AI + agriculture idea.</b>' +
        '<ul><li>Study the 13 similar startups mapped in your space — three of them pivoted away from direct-to-farmer, which is the risk in your current model.</li>' +
        '<li>Talk to 20 farms and 5 buyers before writing more code.</li>' +
        '<li>Use the AgriTech Builders community — several members run pilots and share unit economics.</li></ul>' +
        'The market itself is validated. What is unproven is distribution, so test that first.'
    },
    {
      k: /fund|invest|money|grant|capital|raise/i,
      html: '<b>Funding routes open to you right now.</b>' +
        '<ul><li><b>Rural Innovation Grant</b> — non-dilutive, closes in 34 days, and your pilot qualifies.</li>' +
        '<li><b>Nila Capital</b> — 81% match, pre-seed, ₹50L–₹3Cr, rolling applications.</li></ul>' +
        'At prototype stage grant capital is usually the better first move — it buys you runway without a valuation you cannot yet justify.'
    },
    {
      k: /next step|this week|what should i do|start|begin/i,
      html: '<b>What I would do this week.</b>' +
        '<ul><li><b>Mon–Tue:</b> message the 6 agriculture founders open to conversations.</li>' +
        '<li><b>Wed:</b> start the GreenField application — 21 days left, and it needs two references.</li>' +
        '<li><b>Thu:</b> register for AgriFuture Summit; 34 matched builders are attending.</li>' +
        '<li><b>Fri:</b> post your co-founder requirement to the Builder Feed.</li></ul>' +
        'One deadline actually matters: the hackathon registration closes in 6 days.'
    },
    {
      k: /mentor|advice|guidance/i,
      html: '<b>Two mentors match your domain.</b>' +
        '<ul><li><b>Dr. Rohan Patel</b> — 87%. Runs field trials with 200+ smallholder farms.</li>' +
        '<li><b>Prof. Anita Ghosh</b> — campus mentor, good for first customer conversations.</li></ul>' +
        'Send a specific question rather than a request for "mentorship" — the response rate is far higher.'
    },
    {
      k: /startvate|platform|how does|what is|work/i,
      html: '<b>How STARTVATE works.</b> You describe what you are building. AI reads the intent behind it — industry, technology, stage and what you are likely to need — then returns four things: people, startups, opportunities and knowledge.' +
        '<ul><li>Every result carries a match score based on your profile, not on popularity.</li>' +
        '<li>Every search ends with recommended next steps.</li></ul>' +
        'We are not replacing LinkedIn, X or Reddit. We connect the fragmented startup journey around your intent.'
    }
  ];

  function aiReply(q) {
    for (var i = 0; i < REPLIES.length; i++) {
      if (REPLIES[i].k.test(q)) return REPLIES[i].html;
    }
    return '<b>Here is how I would approach that.</b> I can search the ecosystem for people, startups, opportunities and knowledge around any idea, then turn what I find into next steps.' +
      '<ul><li>Try: "find me a technical co-founder"</li><li>Try: "which accelerators should I apply to?"</li>' +
      '<li>Try: "how do I validate my idea?"</li></ul>' +
      'This is a product demonstration, so the answers are illustrative.';
  }

  function pushMsg(kind, html) {
    var el = document.createElement('div');
    el.className = 'msg msg--' + kind;
    el.innerHTML = html;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function ask(q) {
    pushMsg('user', esc(q));
    var t = pushMsg('ai', '<span class="ai-typing"><i></i><i></i><i></i></span>');
    setTimeout(function () {
      t.innerHTML = aiReply(q);
      log.scrollTop = log.scrollHeight;
    }, reduceMotion ? 60 : 720);
  }

  function openPanel() {
    panel.classList.add('is-open');
    fab.classList.add('is-hidden');
    if (!log.children.length) {
      pushMsg('ai', '<b>Hi — I\'m the intelligence layer under STARTVATE.</b> Ask me about people to meet, opportunities to apply to, or what to do next with an idea.');
    }
    setTimeout(function () { $('#aiInput').focus(); }, 220);
  }
  function closePanel() {
    panel.classList.remove('is-open');
    fab.classList.remove('is-hidden');
  }

  $$('[data-ai-open]').forEach(function (b) { b.addEventListener('click', openPanel); });
  $('#aiClose').addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
  });
  $('#aiForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = $('#aiInput');
    var v = input.value.trim();
    if (!v) return;
    input.value = '';
    ask(v);
  });
  $$('#aiPrompts button').forEach(function (b) {
    b.addEventListener('click', function () { ask(b.getAttribute('data-p')); });
  });

  /* Hide the FAB until the visitor has seen the product section */
  if ('IntersectionObserver' in window && fab) {
    fab.classList.add('is-hidden');
    var fabIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !panel.classList.contains('is-open')) fab.classList.remove('is-hidden');
      });
    }, { threshold: 0.05 });
    var prod = $('#product');
    if (prod) fabIO.observe(prod);
  }

  /* ---------------------------------------------------------
     11. Waitlist
  --------------------------------------------------------- */
  var wl = $('#waitlistForm');
  if (wl) {
    var wlEmail = $('#waitlistEmail');
    var wlBtn = $('#waitlistSubmit');
    var wlMsg = $('#waitlistMsg');
    var wlBusy = false;

    var showMsg = function (kind, text) {
      wlMsg.className = 'cta__msg is-shown ' + (kind === 'ok' ? 'is-ok' : 'is-err');
      wlMsg.textContent = text;
    };

    wlEmail.addEventListener('input', function () {
      wlEmail.classList.remove('is-invalid');
    });

    wl.addEventListener('submit', function (e) {
      e.preventDefault();
      if (wlBusy) return;

      var value = wlEmail.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        wlEmail.classList.add('is-invalid');
        wlEmail.focus();
        showMsg('err', 'Please enter a valid email address.');
        return;
      }

      wlEmail.classList.remove('is-invalid');
      wlBusy = true;
      wlBtn.classList.add('is-loading');
      wlBtn.setAttribute('aria-busy', 'true');
      wlMsg.className = 'cta__msg';

      var store = window.startvateWaitlist;
      var request = store && store.submit
        ? store.submit(value)
        : Promise.resolve({ ok: false, message: 'Waitlist storage is not configured yet.' });

      request.then(function (res) {
        if (res.ok && res.duplicate) {
          showMsg('ok', "You're already on the list! We're launching soon — keep an eye on your inbox.");
          wlEmail.value = '';
        } else if (res.ok) {
          showMsg('ok', "Welcome aboard! Check your inbox for a greeting email — we're launching soon!");
          wlEmail.value = '';
        } else {
          showMsg('err', res.message || 'Something went wrong. Please try again.');
        }
      }).then(function () {
        wlBusy = false;
        wlBtn.classList.remove('is-loading');
        wlBtn.removeAttribute('aria-busy');
      });
    });
  }
})();
