import { Experience } from "@/lib/types";

export const experiences: Experience[] = [
  {
    id: "hp",
    company: "HP Inc.",
    role: "Lead AI and Automation Engineer",
    period: "2022 — 2025",
    description:
      "Designed and built unified automation frameworks for integration and mobile testing, plus a VSCode extension enabling QA leads to conduct AI-powered testing and generate actionable reports. Changed the automation paradigm with agent-driven QA using Playwright MCP, GitHub Copilot agents, and Ollama.",
    highlights: [
      "Reduced 60% in YoY cost savings by automating testing cycles with AI",
      "Led a team of 12 QA professionals and a core AI development team of 4",
      "Built agent-driven QA solution using Playwright MCP, Copilot agents, and Ollama",
      "Built CI/CD pipelines in Azure DevOps with FastAPI, LangGraph, Supabase, InfluxDB, and Grafana",
      "Awarded HP's \"Transformator\" Prize for change in development strategies (2024)",
    ],
    techUsed: [
      "Python",
      "TypeScript",
      "Playwright",
      "MCP",
      "Ollama",
      "FastAPI",
      "LangGraph",
      "Azure DevOps",
      "Supabase",
      "Grafana",
    ],
  },
  {
    id: "education",
    company: "Polytechnic University of Valencia (UPV)",
    role: "Master's in Software Engineering + BS in Computer Science",
    period: "2017 — 2022",
    description:
      "Master's in Software Engineering and Bachelor's in Computer Science from one of Spain's top technical universities. Complemented with an MBA from ThePowerMBA (2024–2025).",
    highlights: [
      "Master's in Software Engineering (2021–2022)",
      "Bachelor's in Computer Science (2017–2021)",
      "MBA — ThePowerMBA (2024–2025)",
    ],
    techUsed: ["Software Engineering", "Computer Science", "MBA"],
  },
];
