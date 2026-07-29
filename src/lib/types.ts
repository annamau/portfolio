export interface Project {
  id: string;
  title: string;
  tagline: string;
  taglineEs?: string;
  description: string;
  tags: string[];
  techStack: string[];
  uses: string[];
  status: string;
  statusEs: string;
  role: string;
  roleEs: string;
  urlEnvKey: string;
  liveUrl?: string;
  image: string;
  logo?: string;
  logoStyle?: "mark" | "wordmark";
  tier: "heavy-ai" | "medium-ai" | "web" | "devops";
  gradient: string;
  icon: string;
  year: string;
  accent: string;
  accentSecondary: string;
  monogram: string;
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
