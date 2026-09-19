// All editable portfolio content lives here, separate from markup/behavior.
// Replace placeholder strings with real content whenever you're ready —
// nothing else in the codebase needs to change.

const PORTFOLIO_DATA = {
  education: [
    {
      institution: "Jaypee Institute of Information Technology, Noida",
      degree: "B.Tech — Mathematics & Computing",
      score: "CGPA: 9.11",
      period: "2025 — 2029",
    },
    {
      institution: "Rahul International School, Mira Road",
      degree: "Senior Secondary (Class XII)",
      score: "84.2%",
      period: "2024 — 2025",
    },
    {
      institution: "Delhi Public School, Indirapuram",
      degree: "Secondary (Class X)",
      score: "96.2%",
      period: "2022 — 2023",
    },
  ],

  techStack: [
    {
      category: "Programming Languages",
      items: [
        { name: "C", note: "" },
        { name: "C++", note: "" },
        { name: "Python", note: "" },
        { name: "Java", note: "" },
      ],
    },
    {
      category: "Frontend",
      items: [
        { name: "HTML", note: "" },
        { name: "CSS", note: "" },
        { name: "JavaScript", note: "" },
      ],
    },
    {
      category: "Data & Machine Learning",
      items: [
        { name: "NumPy", note: "" },
        { name: "Pandas", note: "" },
        { name: "Matplotlib", note: "" },
      ],
    },
    {
      category: "Database",
      items: [{ name: "MySQL", note: "" }],
    },
    {
      category: "Development Tools",
      items: [
        { name: "Git", note: "" },
        { name: "GitHub", note: "" },
        { name: "VS Code", note: "" },
        { name: "Vercel", note: "" },
      ],
    },
    {
      category: "Design",
      items: [
        { name: "Canva", note: "" },
        { name: "Framer", note: "" },
        { name: "Photoshop", note: "" },
      ],
    },
  ],

  projects: [
    {
      name: "ARGUS",
      description:
        "An OOP-driven crime analysis system in C++ that manages and analyzes crime records, calculates risk scores, and surfaces trends across a dataset of 500 records spanning 20 Indian cities and three crime categories (violent, property, cyber). Built using STL containers, templates, inheritance, polymorphism, and exception handling.",
      tech: ["C++", "OOP", "STL", "File I/O"],
      github: "https://github.com/nishik2811-cell/ARGUS",
      demo: null,
      image: "assets/argus-screenshot.png",
    },
    {
      name: "AQI Prediction",
      description:
        "A Python-based model that forecasts Delhi's Air Quality Index using two years of hourly pollutant data (CO, NO, NO2, SO2, O3, PM2.5, PM10, NH3) from monitoring stations, paired with an HTML interface for visualizing predictions and trends.",
      tech: ["Python", "Data Analysis", "HTML"],
      github: "https://github.com/nishik2811-cell/AQI_Prediction",
      demo: null,
      image: "assets/aqi-screenshot.png",
    },
    {
      name: "Frieren Portfolio",
      description:
        "An earlier personal portfolio design with a Frieren-inspired anime aesthetic — a dark, atmospheric hero built with plain HTML, CSS, and JavaScript.",
      tech: ["HTML", "CSS", "JavaScript"],
      github: null,
      demo: "https://portfolio-ten-theta-92.vercel.app/",
      image: "assets/portfolio-screenshot.png",
    },
  ],

  currentlyWorking: [
    {
      number: "01",
      title: "SkillSwap",
      category: "Peer-to-Peer Skill Exchange Platform",
      description:
        "A prototype platform where users trade skills instead of money — pick to teach for pay, pay to learn, or swap skills with no money involved. Includes a matching algorithm that scores compatibility (0–100%) using skill alignment, availability, budget fit, and shared interests, plus a dashboard, searchable directory, and match rankings. Currently a client-side prototype (HTML/CSS/JS) running on mock data — auth, persistence, and real messaging are next.",
      status: "Building",
      tech: ["HTML", "CSS", "JavaScript"],
      github: "https://github.com/nishik2811-cell/SkillSwap",
      image: "assets/skillswap-screenshot.png",
    },
    {
      number: "02",
      title: "Book Chapter — Reinforcement Learning for Traffic Control and Decision-Making",
      category: "Research × Academic Writing",
      description:
        "Co-authoring a chapter (with Aarti Goel and Yashieta Chauhan, JIIT) for the edited volume Artificial Intelligence and Machine Learning for Intelligent Transportation Systems, to be published by Scrivener Publishing / Wiley (Scopus-indexed). The chapter covers how reinforcement learning is applied to traffic flow prediction, adaptive signal control, and pattern recognition in intelligent transportation systems.",
      status: "Writing",
      tech: ["Research", "Reinforcement Learning", "Academic Writing"],
      github: null,
      image: null,
    },
    {
      number: "03",
      title: "DSA / C++",
      category: "Algorithms × Problem Solving",
      description:
        "Sharpening data structures & algorithms in C++ — daily problem-solving to stay competition- and interview-ready.",
      status: "Learning",
      tech: [],
      github: null,
      image: null,
    },
  ],

  experience: [
    {
      role: "Active Technical and Management Volunteer",
      org: "AIML Hub of JIIT",
      period: "2026 — Present",
      description: "",
    },
    {
      role: "Active Technical and Management Volunteer",
      org: "DICE Hub of JIIT",
      period: "2026 — Present",
      description: "",
    },
  ],

  contact: {
    email: "nishik2811@gmail.com",
    github: "https://github.com/nishik2811-cell",
    linkedin: "https://linkedin.com/in/nishita-kumari-841227240",
  },

  // Drop your real PDF in the project root at this path — nothing else
  // needs to change. Every "Resume" link/button on the site points here.
  resumeUrl: "resume.pdf",
};
