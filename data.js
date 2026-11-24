/* ==========================================================================
   data.js — the content of the site, in one place.

   The site is drawn as a metro map. Each LINE is one track of my work and
   each STATION is a project, a job or a milestone. The map, the arrivals
   board, the search box and the detail panels all read from this file.

   To add a project: copy a station block, give it a new id, set `lines`,
   and give it x/y on the map (see the map grid notes below).
   ========================================================================== */

/* The four lines. `code` is the letter shown in the round line badge. */
const LINES = {
  H: { name: "Health AI",          colour: "#e2231a" },
  A: { name: "AI & ML",            colour: "#1666c5" },
  P: { name: "Product & research", colour: "#0f9d58" },
  B: { name: "Building things",    colour: "#f28c00" },
};

/* Map grid (SVG units, the map is 1700 × 840):
     Product line runs at y = 200, Health at 330, AI & ML at 470,
     Building at 630. The early AI & ML stations sit at y = 720.
   Each line is drawn through `path` points in order; `future` is the
   dashed part that is still under construction.                        */
const LINE_PATHS = {
  A: { path: [[60, 720], [400, 720], [650, 470], [1395, 470]], future: [[1395, 470], [1600, 470]] },
  P: { path: [[660, 200], [1490, 200]],                         future: [[1490, 200], [1600, 200]] },
  B: { path: [[660, 630], [1330, 630]],                         future: [[1330, 630], [1600, 630]] },
  H: { path: [[880, 630], [1180, 330], [1400, 330]],            future: [[1400, 330], [1600, 330]] },
};

/* Stations.
   kind:   project | work | study | milestone | next
   status: ongoing | recent | past
   x, y:   position on the map. A station on two or more lines that are
           stacked above each other is drawn as a long "pill" from y to y2.
   label:  where the name goes on the map: "up" (slanted, above the line),
           "down" (slanted, below) or "below" (flat, under the station). */
const STATIONS = [
  /* ---------- Where it started ---------- */
  {
    id: "sanjivani", title: "B.Tech, Sanjivani", kind: "study", status: "past",
    lines: ["A"], x: 60, y: 720, label: "down",
    when: "2019 – 2023", sort: "2023-05",
    tag: "B.Tech, Honours in Data Science",
    role: "Sanjivani College of Engineering, Kopargaon",
    short: "Where the AI & ML line starts. Engineering degree with an honours track in data science.",
    problem: "",
    did: [
      "Honours in Data Science alongside the main degree.",
      "Executive member of the ISTE Students' Chapter (2022–23): led event volunteer teams and raised turnout by 30%.",
    ],
    stats: [], stack: [], img: null,
    links: [{ label: "College website", url: "https://sanjivanicoe.org.in/" }],
  },
  {
    id: "carprice", title: "Car price prediction", kind: "project", status: "past",
    lines: ["A"], x: 140, y: 720, label: "down",
    when: "Apr 2023", sort: "2023-04",
    tag: "First ML project", role: "Individual",
    short: "Regression models on 10,000+ used-car listings to find what sets the price.",
    problem: "Dealers and buyers guess used-car prices. I wanted to see which features actually decide the price.",
    did: ["Compared linear regression, a decision tree and a random forest.", "Served the model through a small Flask page."],
    stats: [], stack: ["Python", "scikit-learn", "Flask"], img: null,
    links: [{ label: "Code on GitHub", url: "https://github.com/Pakkabhabad18/Car-Price-Prediction-using-Python-and-Machine-Learning" }],
  },
  {
    id: "lidar", title: "LiDAR rover", kind: "project", status: "past",
    lines: ["A"], x: 220, y: 720, label: "down",
    when: "2022 – 2023", sort: "2023-05",
    tag: "B.Tech capstone", role: "B.Tech capstone",
    short: "A small vehicle that avoids obstacles and follows lines in real time.",
    problem: "Getting cheap hardware to navigate without hitting anything, using LiDAR, ultrasonic and IR sensors together.",
    did: ["Viola-Jones detection to find obstacles, and vector geometry to plan a path around them.", "Control code in C and C++ on an Arduino."],
    stats: [], stack: ["Computer vision", "C/C++", "Arduino"], img: null,
    links: [{ label: "Repo on GitHub", url: "https://github.com/Pakkabhabad18/lidar-vision-autonomous-navigation" }],
  },
  {
    id: "orange", title: "Orange Business", kind: "work", status: "past",
    lines: ["A"], x: 300, y: 720, label: "down",
    when: "Feb – Aug 2023", sort: "2023-08",
    tag: "Data Science Intern",
    role: "Business Intelligence & Continuous Improvement team, Supply Chain and Operations. Mumbai",
    short: "My first real job: demand and inventory analysis, report automation and dashboards for operations teams.",
    problem: "Weekly reporting ran on manual work and old VBA macros, and stockouts were hard to see coming.",
    did: [
      "Analysed demand and inventory data with 3 operations teams; the findings helped cut stockouts by 15%.",
      "Replaced VBA macros and a manual weekly report with Python and SQL, saving 14 hours a week.",
      "Built 4 Power BI dashboards after agreeing the metrics with the teams, who then used them.",
    ],
    stats: [{ n: "15%", l: "fewer stockouts" }, { n: "14 h", l: "saved every week" }, { n: "4", l: "dashboards adopted" }],
    stack: ["Python", "SQL", "Power BI", "Excel"], img: null,
    links: [{ label: "Orange Business", url: "https://www.orange-business.com/en" }],
  },
  {
    id: "gate", title: "GATE DA & CS", kind: "milestone", status: "past",
    lines: ["A"], x: 380, y: 720, label: "down",
    when: "2024 – 2025", sort: "2025-03",
    tag: "Exams", role: "",
    short: "Qualified GATE Data Science & AI in 2024 and GATE Computer Science in 2025.",
    problem: "", did: [], stats: [], stack: [], img: null, links: [],
  },

  /* ---------- IIIT Hyderabad: where three lines begin ---------- */
  {
    id: "iiit", title: "IIIT Hyderabad", kind: "study", status: "ongoing",
    lines: ["P", "A", "B"], x: 660, y: 200, y2: 630, label: "up",
    when: "2025 – 2027", sort: "2027-06",
    tag: "M.Tech, Product Design and Management",
    role: "International Institute of Information Technology, Hyderabad. CGPA 8.06",
    short: "The big interchange. Product, AI and building all run from here.",
    problem: "",
    did: [
      "Coursework in product management, business finance, user research methods, AI for product managers, language models and agents, and statistical methods in AI.",
      "Most of the stations on this map are projects from these two years.",
    ],
    stats: [], stack: [], img: null,
    links: [{ label: "IIIT Hyderabad", url: "https://www.iiit.ac.in/" }],
  },

  /* ---------- Product & research line ---------- */
  {
    id: "adstudy", title: "Purchase intent study", kind: "project", status: "past",
    lines: ["P"], x: 750, y: 200, label: "up",
    when: "Sep – Nov 2025", sort: "2025-11",
    tag: "Randomised experiment", role: "Research project, team of 3. Guide: Dr. Priyanka Srivastava",
    short: "Five ad levers tested against each other on Indian consumers aged 18 to 35.",
    problem: "Brands spend heavily on celebrity ads for young buyers without knowing which part of an ad actually moves purchase intent.",
    did: [
      "Designed a between-subjects experiment: each person saw one ad from one category only.",
      "Ran it through a custom survey app that handled consent, random assignment and watch-time logging.",
      "Celebrity ads did worse than creative ads, the opposite of what we expected going in.",
    ],
    stats: [{ n: "103", l: "valid responses" }, { n: "p = 0.009", l: "celebrity vs creative ads" }, { n: "R² ≈ 0.5", l: "for story and for price" }],
    stack: ["Python", "pandas", "Regression", "ANOVA"],
    img: "assets/work/adstudy.jpg", imgAlt: "Five scatter plots with regression lines, one per ad lever",
    links: [
      { label: "Full report (PDF)", url: "https://github.com/Pakkabhabad18/ad-effectiveness-purchase-intent/blob/main/report.pdf" },
      { label: "Code on GitHub", url: "https://github.com/Pakkabhabad18/ad-effectiveness-purchase-intent" },
    ],
  },
  {
    id: "infokiosk", title: "InfoKiosk", kind: "project", status: "past",
    lines: ["P"], x: 840, y: 200, label: "up",
    when: "Aug – Dec 2025", sort: "2025-12",
    tag: "Design thinking", role: "Team lead, Team Idearc",
    short: "A multilingual information kiosk for parents visiting IIIT Hyderabad.",
    problem: "Parents meet more campus people than any other visitor group (security, reception, mess, administration) but have no single place to find where to go or what is on.",
    did: [
      "Mapped 11 visitor groups and picked parents as the group with the least support.",
      "Interviewed 8 parents, built personas and journey maps, and wrote 4 How-Might-We statements.",
      "Chose the problem with RICE, prototyped the kiosk and tested it with about 10 to 12 parents.",
    ],
    stats: [{ n: "11", l: "visitor groups mapped" }, { n: "8", l: "parent interviews" }],
    stack: ["Interviews", "Journey maps", "RICE", "Prototyping"],
    img: "assets/work/infokiosk.jpg", imgAlt: "InfoKiosk project poster with personas, journey maps and the final solution",
    links: [
      { label: "Clickable prototype", url: "https://app.visily.ai/projects/5c24a1c6-3af7-4dcb-81da-dcb8bda9e784/boards/2365425/presenter?play-mode=All+screens" },
      { label: "Demo video", url: "https://drive.google.com/file/d/1Fl8Bs8gzErr4GsTOVKuYdgMzHNChK3Bw/view?usp=drive_link" },
      { label: "Poster", url: "https://github.com/Pakkabhabad18/infokiosk-visitor-system/blob/main/poster.png" },
      { label: "Repo on GitHub", url: "https://github.com/Pakkabhabad18/infokiosk-visitor-system" },
    ],
  },
  {
    id: "spotify", title: "Spotify Wrapped teardown", kind: "project", status: "past",
    lines: ["P"], x: 930, y: 200, label: "up",
    when: "Dec 2025", sort: "2025-12",
    tag: "Product case study", role: "Individual",
    short: "How 5 design choices make people share Wrapped, and where the idea stops working.",
    problem: "Most consumer products lose attention over time and buy it back with ads and push notifications. Wrapped ships once a year and still gets a huge spike of use and free sharing.",
    did: [
      "Split Wrapped into two machines: engagement inside the app and virality outside it.",
      "Mapped it as 4 layers: data, narrative, UX and social.",
      "Traced 5 design choices to the behaviour and outcome each one drives.",
      "Listed where the pattern fails: B2B tools, low-emotion utilities, thin data, private data.",
    ],
    stats: [{ n: "5", l: "design choices traced" }, { n: "13", l: "slides" }],
    stack: ["Product teardown", "Growth loops", "Consumer psychology"],
    img: "assets/work/spotify.jpg", imgAlt: "Cover slide: Impact of Spotify Wrapped, a virality and engagement case study",
    links: [
      { label: "Read it on this page", url: "#case-study" },
      { label: "Deck (PDF)", url: "docs/spotify-wrapped-case-study.pdf" },
    ],
  },
  {
    id: "campusconnect", title: "CampusConnect", kind: "project", status: "past",
    lines: ["P"], x: 1020, y: 200, label: "up",
    when: "Jan – Apr 2026", sort: "2026-04",
    tag: "UX research & design", role: "Team of 3",
    short: "An anonymous, campus-verified way for students to find people with the same interests.",
    problem: "Saying hello on Instagram means exposing your whole profile. Students called it an \"interaction tax\", and it hits introverted, lateral-entry and international students hardest.",
    did: [
      "Checked three sources against each other: AI personas, a 42-student survey and 12 interviews.",
      "The AI personas missed the language barrier that real interviews surfaced.",
      "Designed campus-verified anonymity with step-by-step identity reveal, then tested it.",
    ],
    stats: [{ n: "76.5", l: "SUS usability score" }, { n: "12/12", l: "said campus verification builds trust" }],
    stack: ["Interviews", "Survey", "Figma", "Usability testing"],
    img: "assets/work/campusconnect.jpg", imgAlt: "CampusConnect prototype showing the email verification screen on a phone",
    links: [
      { label: "Try the prototype", url: "https://shock-cookie-82906039.figma.site/" },
      { label: "Demo video", url: "https://www.youtube.com/watch?v=Q0B2lknfVRQ" },
      { label: "Paper (PDF)", url: "https://github.com/Pakkabhabad18/campusconnect/blob/main/docs/paper.pdf" },
      { label: "Poster (PDF)", url: "https://github.com/Pakkabhabad18/campusconnect/blob/main/docs/poster.pdf" },
      { label: "Repo on GitHub", url: "https://github.com/Pakkabhabad18/campusconnect" },
    ],
  },
  {
    id: "continuum", title: "Continuum", kind: "project", status: "past",
    lines: ["P"], x: 1110, y: 200, label: "up",
    when: "2026", sort: "2026-04",
    tag: "Business model", role: "Business finance project",
    short: "A B2B SaaS idea that links employee engagement spend to retention, with a 3-year financial model.",
    problem: "Companies spend on engagement programmes but can't connect that spend to attrition or any business result.",
    did: [
      "Designed a 3-layer offer: a corporate licence, add-ons and an analytics layer.",
      "Built the 3-year model: revenue mix, unit economics, EBITDA path and funding plan.",
    ],
    stats: [], stack: ["Business model", "Unit economics", "Financial projections"],
    img: "assets/work/continuum.jpg", imgAlt: "Continuum investor presentation cover slide",
    links: [{ label: "Deck (PDF)", url: "docs/continuum.pdf" }],
  },
  {
    id: "anjani", title: "Anjani Innovations", kind: "work", status: "past",
    lines: ["P", "H"], x: 1200, y: 200, y2: 330, label: "up",
    when: "May – Aug 2026", sort: "2026-08",
    tag: "Product Management Intern, AI Health Products",
    role: "Anjani Innovations (AI) Network Pvt. Ltd., Hyderabad",
    short: "Requirements and a data plan for an AI stethoscope (auscultation device).",
    problem: "An AI device that listens to heart and lung sounds needs clear clinical requirements, and a lot of labelled recordings before any model can be trained.",
    did: [
      "Mapped clinician workflows and wrote requirements, acceptance criteria and validation metrics, with an 80% murmur detection target.",
      "Opened partnerships with 5 hospitals, starting with NIMS Hyderabad, and planned how 40,000+ heart and lung recordings would be collected. The company adopted the plan.",
      "Kept the AI, engineering and clinical teams on one shared timeline and flagged risks before they slowed work.",
    ],
    stats: [{ n: "5", l: "hospital partnerships" }, { n: "40,000+", l: "recordings planned" }, { n: "80%", l: "murmur detection target" }],
    stack: ["Requirements", "Acceptance criteria", "Clinical workflows", "Stakeholder management"],
    img: null, links: [],
  },
  {
    id: "nourishcart", title: "NourishCart", kind: "project", status: "recent",
    lines: ["P", "H"], x: 1400, y: 200, y2: 330, label: "up",
    when: "Completed Nov 2026", sort: "2026-11",
    tag: "Live product", role: "Team Nutrion (4 people)",
    short: "Nutrition targets, a week of Indian meals and a grocery basket that fits the budget. Starting in Hyderabad.",
    problem: "Eating to a goal at home means working out your needs, planning a week of meals, and turning that into a grocery list you can afford. Most people give up during setup, long before they see a plan.",
    did: [
      "Scoped version 1 for one person, from a persona and a job to be done.",
      "Tested with 100 people. A long typed setup left people unsure, so it became a spoken chat that asks one question at a time.",
      "Wrote 107 hand-labelled test cases and 441 checks for 4 AI features. The weak spots became the next roadmap items.",
      "AI reads Zepto and Instamart prices, code checks every price, and the cart stops before checkout.",
    ],
    stats: [{ n: "100", l: "people tested it" }, { n: "441", l: "checks on 4 AI features" }, { n: "95.9%", l: "passed, no safety failures" }],
    stack: ["Persona & JTBD", "AI evals", "TypeScript", "Supabase", "PWA"],
    img: "assets/work/nourishcart.jpg", imgAlt: "NourishCart home page: Meals for your goal, groceries in your cart, with an example day plan",
    links: [
      { label: "Open the live app", url: "https://nourishcart.vercel.app" },
      { label: "Code on GitHub", url: "https://github.com/Pakkabhabad18/nourishcart" },
    ],
  },
  {
    id: "driveros", title: "DriverOS", kind: "project", status: "ongoing",
    lines: ["P"], x: 1490, y: 200, label: "up",
    when: "Oct 2026 – mid 2027", sort: "2027-05",
    tag: "M.Tech capstone", role: "Individual project. Mentor: Prof. Ramesh Loganathan",
    short: "Shows drivers who work on several ride apps what they actually keep from each ride.",
    problem: "Auto and cab drivers in Hyderabad switch between Rapido, Uber, Ola and Namma Yatri through the day. Each app shows its own fare. None of them shows what the driver keeps after fuel and commission, or how the week adds up across apps.",
    did: [
      "Profit shown on each ride request. The driver still accepts the ride in the ride app.",
      "Daily, weekly and monthly take-home across all apps in one place.",
      "An income statement a driver can show when applying for a loan.",
    ],
    stats: [{ n: "4", l: "ride apps in one view" }],
    stack: ["Customer discovery", "Willingness to pay", "Product scoping"],
    img: null, links: [{ label: "Progress on this page", url: "#now" }],
  },

  /* ---------- AI & ML line (after IIIT) ---------- */
  {
    id: "lm", title: "Marathi & Konkani LMs", kind: "project", status: "past",
    lines: ["A"], x: 1140, y: 470, label: "down",
    when: "Aug – Oct 2026", sort: "2026-10",
    tag: "Built from scratch", role: "Individual project",
    short: "Two Transformer language models built from scratch: one for a language with lots of text online, one for a language with very little.",
    problem: "Marathi has plenty of text online and Konkani has very little. Building both under the same size and token budget shows what a low-resource language costs at every stage.",
    did: [
      "Crawlers, OCR for scanned books, cleaning, and splits checked for leakage.",
      "My own tokenizers (2,500 tokens each, 0% unknown) and a decoder-only Transformer in PyTorch.",
      "Pretraining, reasoning fine-tuning, and an ablation that removes positional embeddings.",
      "Logged 60 numbered decisions, with corrections kept next to what they replaced.",
    ],
    stats: [{ n: "24.9M", l: "parameters per model" }, { n: "8.62", l: "Marathi test perplexity" }, { n: "26.56", l: "Konkani test perplexity" }],
    stack: ["PyTorch", "Tokenizers", "OCR", "GitHub Actions CI"],
    img: "assets/work/lm.jpg", imgAlt: "Validation loss and perplexity curves: Marathi model ends far lower than Konkani on the same budget",
    links: [
      { label: "Final report (PDF)", url: "https://github.com/Pakkabhabad18/marathi-konkani-transformer-lm/blob/phase-3/report/final_report.pdf" },
      { label: "Code on GitHub", url: "https://github.com/Pakkabhabad18/marathi-konkani-transformer-lm" },
    ],
  },
  {
    id: "rag", title: "RAG on the GDPR", kind: "project", status: "past",
    lines: ["A"], x: 1230, y: 470, label: "down",
    when: "Oct 2026", sort: "2026-10",
    tag: "Retrieval study", role: "Individual study",
    short: "Does a cross-encoder re-ranker get the right legal passage to the LLM more often?",
    problem: "The GDPR has 173 recitals and 99 articles that share vocabulary, so plain vector search often returns a recital when the answer sits in an article.",
    did: [
      "Split the 88-page regulation into 434 chunks at recital and article boundaries.",
      "Wrote 29 trap queries (keyword, exception, negation, recital vs article), each with one gold passage.",
      "Kept the prompt and model fixed so any difference comes from retrieval alone.",
    ],
    stats: [{ n: "0.48 → 0.59", l: "Hit@3 after re-ranking" }, { n: "29", l: "trap queries" }],
    stack: ["FAISS", "MiniLM", "Cross-encoder", "Gemini"], img: null,
    links: [
      { label: "Report (PDF)", url: "https://github.com/Pakkabhabad18/lma-rag-reranking-gdpr/blob/main/report/rag_report.pdf" },
      { label: "Notebook on GitHub", url: "https://github.com/Pakkabhabad18/lma-rag-reranking-gdpr" },
    ],
  },
  {
    id: "trialguide", title: "TrialGuide", kind: "project", status: "recent",
    lines: ["H", "A"], x: 1310, y: 330, y2: 470, label: "down",
    when: "Completed Nov 2026", sort: "2026-11",
    tag: "Clinical AI agent", role: "Team Zenith (4 people)",
    short: "Matches patients to clinical trials, and asks the doctor instead of guessing when the notes are unclear.",
    problem: "Trial-matching systems check a patient note against every eligibility rule. When the note doesn't settle a rule, they either drop trials the patient may qualify for, or quietly fill the gap and can show an ineligible patient as eligible.",
    did: [
      "For each unclear rule, the agent infers it from quoted evidence, asks the doctor, or leaves it open.",
      "At most 3 questions per patient, picked by how much the answer could change the top 10 trials.",
      "Conformal risk control keeps harmful inferences under a 5% target.",
      "Fine-tuned Qwen3-8B with QLoRA; BM25 and MedCPT retrieval; eGFR and BMI tools so the model never guesses those values.",
    ],
    stats: [{ n: "22.6%", l: "of 3,728 open rules resolved" }, { n: "3.9%", l: "harmful inferences (target < 5%)" }, { n: "73", l: "held-out test patients" }],
    stack: ["Python", "RAG", "Qwen3-8B", "QLoRA", "BM25", "MedCPT"],
    img: "assets/work/trialguide.jpg", imgAlt: "TrialGuide demo on Hugging Face: Meet TrialGuide, with the five steps of a patient check",
    links: [
      { label: "Try the live demo", url: "https://huggingface.co/spaces/Pakkabhabad18/trialguide-demo" },
      { label: "Final report (PDF)", url: "https://github.com/Pakkabhabad18/trialguide/blob/main/docs/final_report/Zenith_final_report.pdf" },
      { label: "Poster (PDF)", url: "https://github.com/Pakkabhabad18/trialguide/blob/main/docs/poster/TrialGuide_poster.pdf" },
      { label: "Code on GitHub", url: "https://github.com/Pakkabhabad18/trialguide" },
    ],
  },
  {
    id: "fraud", title: "Card fraud below 1%", kind: "project", status: "ongoing",
    lines: ["A"], x: 1395, y: 470, label: "down",
    when: "Sep – Nov 2026 (final 30 Nov)", sort: "2026-11",
    tag: "Research project", role: "Individual project",
    short: "Do tabular foundation models beat XGBoost when only 0.17% of transactions are fraud?",
    problem: "TabPFN v2 and TabICLv2 predict from a table passed in as context, with no training. Published results say they match tuned tree models, but those tests skip heavily imbalanced data and score on ROC-AUC, which stays high even when a model misses most of the fraud.",
    did: [
      "Compared both model families from a 20% fraud rate down to 0.172%, scored on PR-AUC over 5 seeds.",
      "Trained XGBoost on the same rows the foundation models see, to separate the model from the data it is shown.",
      "Tested 6 ways of choosing context rows. Showing the model every training fraud closes most of the gap.",
      "Ran leakage, duplicate and shuffled-label checks before trusting any number.",
    ],
    stats: [{ n: "0.858", l: "PR-AUC, 5 balanced contexts" }, { n: "0.865", l: "PR-AUC, XGBoost on all data" }, { n: "0.98", l: "ROC-AUC everywhere, which is why it misleads" }],
    stack: ["Python", "XGBoost", "Optuna", "TabPFN v2", "TabICLv2", "Bootstrap tests"],
    img: "assets/work/fraud.jpg", imgAlt: "Line chart: PR-AUC falls for every model as fraud gets rarer, from 20% to 0.172%",
    links: [
      { label: "Code and results", url: "https://github.com/Pakkabhabad18/tabular-fm-fraud-detection" },
      { label: "Mid-evaluation slides (PDF)", url: "https://github.com/Pakkabhabad18/tabular-fm-fraud-detection/blob/main/docs/mid_evaluation_slides.pdf" },
      { label: "Proposal (PDF)", url: "https://github.com/Pakkabhabad18/tabular-fm-fraud-detection/blob/main/docs/proposal.pdf" },
    ],
  },

  /* ---------- Building line ---------- */
  {
    id: "civicvoice", title: "CivicVoice", kind: "project", status: "past",
    lines: ["B"], x: 760, y: 630, label: "down",
    when: "Aug – Dec 2025", sort: "2025-12",
    tag: "Civic platform", role: "Team lead (5 people)",
    short: "Citizens report potholes, garbage and water problems; the city routes them, fixes them and reports back.",
    problem: "Citizens rarely hear back after a complaint, and the city gets scattered reports with no exact location.",
    did: [
      "OTP sign-in, photo and map-pin reporting, and a public map of every complaint.",
      "AI summarises each complaint and suggests the department.",
      "Anything unresolved for 7 days escalates automatically, with SMS updates to the citizen.",
    ],
    stats: [{ n: "7 days", l: "then automatic escalation" }, { n: "3", l: "roles: citizen, admin, department" }],
    stack: ["REST APIs", "MongoDB Atlas", "Twilio", "Gemini"],
    img: "assets/work/civicvoice.jpg", imgAlt: "CivicVoice citizen journey: secure login, submit complaint, auto-summarisation, track status, feedback",
    links: [
      { label: "Demo video", url: "https://youtu.be/XP3ObswnLxI" },
      { label: "Project report (PDF)", url: "docs/civicvoice-report.pdf" },
      { label: "Slides", url: "https://gamma.app/docs/CivicVoice-orq6xynmw7e701h?mode=doc" },
      { label: "Code on GitHub", url: "https://github.com/Pakkabhabad18/civicvoice-grievance-platform" },
    ],
  },
  {
    id: "stayfit", title: "StayFit", kind: "project", status: "past",
    lines: ["B", "H"], x: 880, y: 630, label: "down",
    when: "Jan – Apr 2026", sort: "2026-04",
    tag: "System design", role: "Team lead (5 people)",
    short: "An AI calorie tracker from food photos, redesigned so a slow AI call can't freeze the app. The Health AI line starts here.",
    problem: "Photo analysis took 5 to 15 seconds and could freeze the whole app while it ran.",
    did: [
      "Set latency, availability and security targets with 6 stakeholder groups.",
      "Split the backend into 4 services behind a gateway and moved AI work onto queues.",
      "Recorded each trade-off as an architecture decision record, and tested fault isolation against a monolith.",
    ],
    stats: [{ n: "2 ms", l: "added by the gateway" }, { n: "2 of 4", l: "parts still up when the AI is down" }],
    stack: ["Python", "Flask", "PostgreSQL", "Redis", "Celery", "Gemini API"], img: null,
    links: [
      { label: "Design document (PDF)", url: "https://github.com/Pakkabhabad18/stayfit-ai-nutrition-platform/blob/main/docs/Project3_31.pdf" },
      { label: "Code on GitHub", url: "https://github.com/Pakkabhabad18/stayfit-ai-nutrition-platform" },
    ],
  },
  {
    id: "cpgrams", title: "CPGRAMS 2036", kind: "project", status: "past",
    lines: ["B"], x: 1180, y: 630, label: "down",
    when: "Oct 2026", sort: "2026-10",
    tag: "Prototype", role: "Individual prototype",
    short: "A citizen-first companion for India's public grievance system.",
    problem: "Filing a grievance with the government means knowing which option fits, preparing the complaint well, and then following where it goes.",
    did: [
      "Helps a citizen understand grievance options, prepare the grievance and follow the path to resolution.",
      "Hosted free on GitHub Pages so it works whenever someone opens it.",
    ],
    stats: [], stack: ["TypeScript", "Vite", "Google AI Studio"],
    img: "assets/work/cpgrams.jpg", imgAlt: "CPGRAMS 2036 home screen: Let's get things moving, with a grievance text box",
    links: [
      { label: "Open the prototype", url: "https://pakkabhabad18.github.io/CPGRAMS/" },
      { label: "Code on GitHub", url: "https://github.com/Pakkabhabad18/CPGRAMS" },
    ],
  },
  {
    id: "masonrylab", title: "MasonryLab", kind: "project", status: "past",
    lines: ["B"], x: 1330, y: 630, label: "down",
    when: "Nov 2026", sort: "2026-11",
    tag: "Side build", role: "Individual",
    short: "An interactive 2D visualiser that shows how masonry walls crack and fail.",
    problem: "Wall failure modes are hard to picture from a textbook figure. A teaching tool that shows them stage by stage helps.",
    did: [
      "Wrote the spec, built it in React and TypeScript, and deployed it on Vercel.",
      "Kept it honest: a qualitative teaching tool, with no solver and no claim of validation.",
    ],
    stats: [], stack: ["React", "TypeScript", "Vite", "Vercel"],
    img: "assets/work/masonrylab.jpg", imgAlt: "MasonryLab: a brick wall under lateral load with controls for load type and material strength",
    links: [
      { label: "Open the app", url: "https://masonrylab.vercel.app" },
      { label: "Code on GitHub", url: "https://github.com/Pakkabhabad18/masonrylab" },
    ],
  },

  /* ---------- The last stop ---------- */
  {
    id: "next", title: "Your team", kind: "next", status: "future",
    lines: ["P", "H", "A", "B"], x: 1600, y: 200, y2: 630, label: "below",
    when: "2027", sort: "2027-07",
    tag: "Next station", role: "",
    short: "Every line ends here. I graduate in 2027 and I'm looking for product (APM, AI PM) and AI/data roles.",
    problem: "", did: [], stats: [], stack: [], img: null,
    links: [{ label: "Get in touch", url: "#contact" }],
  },
];
