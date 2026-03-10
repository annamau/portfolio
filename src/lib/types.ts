export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  techStack: string[];
  urlEnvKey: string;
  liveUrl?: string;
  image: string;
  tier: "heavy-ai" | "medium-ai" | "web" | "devops";
  gradient: string;
  icon: string;
  year: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  highlights: string[];
  techUsed: string[];
}

export interface SkillGroup {
  category: string;
  icon: string;
  skills: string[];
}
