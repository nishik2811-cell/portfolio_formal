// All editable portfolio content lives here, separate from markup/behavior.
// Replace placeholder strings with real content whenever you're ready —
// nothing else in the codebase needs to change.

const PORTFOLIO_DATA = {
  techStack: [
    {
      category: "Languages",
      items: ["Python", "JavaScript", "TypeScript", "C++", "Java"],
    },
    {
      category: "Web Development",
      items: ["React", "Next.js", "Node.js", "Express", "Tailwind CSS"],
    },
    {
      category: "AI / Machine Learning",
      items: ["PyTorch", "scikit-learn", "Pandas", "OpenAI API", "LangChain"],
    },
    {
      category: "Databases",
      items: ["PostgreSQL", "MongoDB", "Redis", "Firebase"],
    },
    {
      category: "Tools",
      items: ["Git", "Docker", "Figma", "Vercel", "Linux"],
    },
  ],

  projects: [
    {
      name: "Project Aperture",
      description:
        "A full-stack platform that reimagines how small teams track and ship their work, with a focus on speed and clarity over feature bloat.",
      tech: ["React", "Node.js", "PostgreSQL"],
      github: "https://github.com/",
      demo: "https://example.com/",
    },
    {
      name: "Meridian",
      description:
        "A data visualization tool that turns dense spreadsheets into interactive, explorable stories for non-technical audiences.",
      tech: ["TypeScript", "D3.js", "Next.js"],
      github: "https://github.com/",
      demo: "https://example.com/",
    },
    {
      name: "Lumen CLI",
      description:
        "A developer command-line tool for scaffolding and deploying side projects in seconds, built to remove the friction of starting new work.",
      tech: ["Python", "Docker"],
      github: "https://github.com/",
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
