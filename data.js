// All editable portfolio content lives here, separate from markup/behavior.
// Replace placeholder strings with real content whenever you're ready —
// nothing else in the codebase needs to change.

const PORTFOLIO_DATA = {
  techStack: [
    {
      category: "Languages",
      items: [
        { name: "C++", note: "Systems / DSA" },
        { name: "Python", note: "ML / Data" },
        { name: "JavaScript", note: "Web" },
      ],
    },
    {
      category: "Web",
      items: [
        { name: "HTML", note: "Markup" },
        { name: "CSS", note: "Styling" },
        { name: "React", note: "Frontend" },
      ],
    },
    {
      category: "Data / ML",
      items: [
        { name: "NumPy", note: "Numerical computing" },
        { name: "Pandas", note: "Data wrangling" },
        { name: "Scikit-learn", note: "Modeling" },
      ],
    },
    {
      category: "Tools",
      items: [
        { name: "Git", note: "Version control" },
        { name: "GitHub", note: "Collaboration" },
      ],
    },
  ],

  projects: [
    {
      name: "ARGUS",
      description: "Crime monitoring / risk analysis system.",
      tech: [],
      github: null,
      demo: null,
    },
    {
      name: "AQI Predictor",
      description: "Machine learning based air quality prediction.",
      tech: ["Python", "Machine Learning"],
      github: null,
      demo: null,
    },
    {
      name: "Sanchay",
      description: "AI-driven citizen benefit and scheme discovery platform.",
      tech: ["AI"],
      github: null,
      demo: null,
    },
  ],

  currentlyWorking: [
    {
      number: "01",
      title: "Amrosia",
      category: "AI × Nutrition",
      description:
        "An AI-powered nutrition and calorie tracking platform.",
      status: "Building",
    },
    {
      number: "02",
      title: "Sanchay",
      category: "AI × GovTech",
      description:
        "An AI-driven platform for discovering and understanding citizen benefits and government schemes.",
      status: "Building",
    },
    {
      number: "03",
      title: "DSA / C++",
      category: "Algorithms × Problem Solving",
      description:
        "Currently strengthening data structures, algorithms and problem-solving skills.",
      status: "Learning",
    },
  ],

  experience: [
    {
      role: "Software Engineering Intern",
      org: "Placeholder Company",
      period: "2025",
      description:
        "Contributed to a production web application, working across the stack on features used by thousands of people.",
    },
    {
      role: "Hackathon Finalist",
      org: "Placeholder Hackathon",
      period: "2024",
      description:
        "Built an AI-powered prototype in 36 hours with a small team, placing among the top finalists.",
    },
    {
      role: "Core Member",
      org: "University Tech Club",
      period: "2023 — Present",
      description:
        "Organize workshops and mentor peers on web development and applied machine learning.",
    },
    {
      role: "Volunteer",
      org: "Placeholder Organization",
      period: "2023",
      description:
        "Supported community outreach programs focused on technology education access.",
    },
  ],

  contact: {
    email: "hello@example.com",
    github: "https://github.com/",
    linkedin: "https://linkedin.com/in/",
  },
};
