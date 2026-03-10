export type Locale = "en" | "es";

export interface Translations {
  nav: {
    home: string;
    projects: string;
    about: string;
    experience: string;
    contact: string;
  };
  hero: {
    available: string;
    greeting: string;
    role: string;
    bio: string;
    cta_work: string;
    cta_contact: string;
    scroll: string;
    stats: {
      projects: string;
      savings: string;
      years: string;
      team: string;
    };
  };
  projects: {
    label: string;
    heading: string;
    instruction: string;
    visit: string;
    tiers: Record<string, string>;
  };
  growth: {
    badge: string;
    heading1: string;
    heading2: string;
    description: string;
    funnel: {
      total: string;
      ai: string;
      heavy: string;
      autonomous: string;
    };
    milestones: Array<{ year: string; label: string; detail: string }>;
    next_label: string;
    next_detail: string;
    next_cta: string;
  };
  about: {
    label: string;
    heading1: string;
    heading2: string;
    bio1: string;
    bio2: string;
    bio3: string;
  };
  experience: {
    label: string;
    heading: string;
    description: string;
    entries: Array<{ description: string; highlights: string[] }>;
  };
  contact: {
    label: string;
    heading: string;
    description: string;
    name_label: string;
    name_placeholder: string;
    email_label: string;
    email_placeholder: string;
    message_label: string;
    message_placeholder: string;
    send: string;
    sending: string;
    sent: string;
    error: string;
    sidebar_heading: string;
    sidebar_text: string;
    calendar_label: string;
    calendar_sub: string;
  };
  footer: {
    rights: string;
    built: string;
  };
}

export const translations: Record<Locale, Translations> = {
  en: {
    nav: {
      home: "Home",
      projects: "Projects",
      about: "About",
      experience: "Experience",
      contact: "Contact",
    },
    hero: {
      available: "Available for projects",
      greeting: "Hello, I'm",
      role: "AI Engineer",
      bio: "I build multi-agent AI systems, intelligent automation pipelines, and full-stack products from concept to deployment. Specializing in LangGraph, LLM orchestration, and creative web experiences.",
      cta_work: "See My Work",
      cta_contact: "Get In Touch",
      scroll: "Scroll Down",
      stats: {
        projects: "Projects Built",
        savings: "Cost Savings via AI",
        years: "Years Enterprise",
        team: "Team Members Led",
      },
    },
    projects: {
      label: "01 — Projects",
      heading: "What I've built",
      instruction: "Scroll to explore — click any card for details.",
      visit: "Visit Project",
      tiers: {
        "heavy-ai": "HEAVY AI",
        "medium-ai": "MEDIUM AI",
        web: "WEB",
        devops: "DEVOPS",
      },
    },
    growth: {
      badge: "Project Evolution",
      heading1: "From websites to",
      heading2: "autonomous AI systems",
      description:
        "Each year deeper into AI — from simple integrations to fully autonomous multi-agent pipelines running on local infrastructure.",
      funnel: {
        total: "Total Projects",
        ai: "AI-Powered",
        heavy: "Heavy AI / Multi-Agent",
        autonomous: "Autonomous Systems",
      },
      milestones: [
        {
          year: "2023",
          label: "First web products",
          detail: "Freelance sites, PWAs, 3D experiences",
        },
        {
          year: "2024",
          label: "AI integration",
          detail: "OpenAI, embeddings, multi-agent news, coaching SaaS",
        },
        {
          year: "2025",
          label: "Autonomous systems",
          detail: "LangGraph trading bots, GEO pipelines, local LLMs",
        },
      ],
      next_label: "Your project?",
      next_detail: "Let's build something extraordinary together.",
      next_cta: "Get in touch →",
    },
    about: {
      label: "02 — About",
      heading1: "Building the future",
      heading2: "with intelligent systems",
      bio1: "I'm an AI Engineer with 3 years at HP, where I led a team of 12 and built agent-driven QA solutions that cut testing costs by 60%. I architect multi-agent systems, LLM orchestration pipelines, and AI-powered automation tools — from Playwright MCP integrations to self-hosted Ollama deployments.",
      bio2: "With a Master's in Software Engineering from UPV and an MBA from ThePowerMBA, I combine deep technical expertise with business acumen. I was awarded HP's \"Transformator\" Prize in 2024 for revolutionizing development strategies with AI.",
      bio3: "Beyond enterprise, I build my own products — autonomous trading systems with 4-bot LangGraph orchestration, content pipelines running entirely on local LLMs, and cross-platform mobile apps with on-device ML. Based in Valencia, Spain.",
    },
    experience: {
      label: "03 — Background",
      heading: "Work history",
      description: "Where engineering rigor meets AI innovation.",
      entries: [
        {
          description:
            "Designed and built unified automation frameworks for integration and mobile testing, plus a VSCode extension enabling QA leads to conduct AI-powered testing and generate actionable reports. Changed the automation paradigm with agent-driven QA using Playwright MCP, GitHub Copilot agents, and Ollama.",
          highlights: [
            "Reduced 60% in YoY cost savings by automating testing cycles with AI",
            "Led a team of 12 QA professionals and a core AI development team of 4",
            "Built agent-driven QA solution using Playwright MCP, Copilot agents, and Ollama",
            "Built CI/CD pipelines in Azure DevOps with FastAPI, LangGraph, Supabase, InfluxDB, and Grafana",
            "Awarded HP's \"Transformator\" Prize for change in development strategies (2024)",
          ],
        },
        {
          description:
            "Master's in Software Engineering and Bachelor's in Computer Science from one of Spain's top technical universities. Complemented with an MBA from ThePowerMBA (2024–2025).",
          highlights: [
            "Master's in Software Engineering (2021–2022)",
            "Bachelor's in Computer Science (2017–2021)",
            "MBA — ThePowerMBA (2024–2025)",
          ],
        },
      ],
    },
    contact: {
      label: "04 — Contact",
      heading: "Let's work together",
      description:
        "Have a project in mind? Let's talk about how I can help bring it to life.",
      name_label: "Name",
      name_placeholder: "Your name",
      email_label: "Email",
      email_placeholder: "you@example.com",
      message_label: "Message",
      message_placeholder: "Tell me about your project...",
      send: "Send Message",
      sending: "Sending...",
      sent: "Message Sent!",
      error: "Something went wrong. Please try again.",
      sidebar_heading: "Get in touch",
      sidebar_text:
        "I'm open to freelance projects, consulting, and full-time opportunities. Let's build something great together.",
      calendar_label: "Schedule with me",
      calendar_sub: "Book a free consultation",
    },
    footer: {
      rights: "All rights reserved.",
      built: "Built with Next.js, Tailwind CSS & Framer Motion",
    },
  },

  es: {
    nav: {
      home: "Inicio",
      projects: "Proyectos",
      about: "Sobre mí",
      experience: "Experiencia",
      contact: "Contacto",
    },
    hero: {
      available: "Disponible para proyectos",
      greeting: "Hola, soy",
      role: "Ingeniero de IA",
      bio: "Construyo sistemas multiagente de IA, pipelines de automatización inteligente y productos full-stack desde el concepto hasta el despliegue. Especializado en LangGraph, orquestación de LLMs y experiencias web creativas.",
      cta_work: "Ver mi trabajo",
      cta_contact: "Contáctame",
      scroll: "Desplaza",
      stats: {
        projects: "Proyectos Creados",
        savings: "Ahorro de Costes con IA",
        years: "Años en Empresa",
        team: "Miembros de Equipo",
      },
    },
    projects: {
      label: "01 — Proyectos",
      heading: "Lo que he construido",
      instruction:
        "Desplázate para explorar — haz clic en una tarjeta para ver detalles.",
      visit: "Ver Proyecto",
      tiers: {
        "heavy-ai": "IA AVANZADA",
        "medium-ai": "IA MEDIA",
        web: "WEB",
        devops: "DEVOPS",
      },
    },
    growth: {
      badge: "Evolución de Proyectos",
      heading1: "De sitios web a",
      heading2: "sistemas IA autónomos",
      description:
        "Cada año más profundo en IA — desde integraciones simples hasta pipelines multiagente totalmente autónomos sobre infraestructura local.",
      funnel: {
        total: "Proyectos Totales",
        ai: "Con IA",
        heavy: "IA Avanzada / Multiagente",
        autonomous: "Sistemas Autónomos",
      },
      milestones: [
        {
          year: "2023",
          label: "Primeros productos web",
          detail: "Sitios freelance, PWAs, experiencias 3D",
        },
        {
          year: "2024",
          label: "Integración de IA",
          detail: "OpenAI, embeddings, noticias multiagente, SaaS de coaching",
        },
        {
          year: "2025",
          label: "Sistemas autónomos",
          detail: "Bots de trading con LangGraph, pipelines GEO, LLMs locales",
        },
      ],
      next_label: "¿Tu proyecto?",
      next_detail: "Construyamos algo extraordinario juntos.",
      next_cta: "Hablemos →",
    },
    about: {
      label: "02 — Sobre",
      heading1: "Construyendo el futuro",
      heading2: "con sistemas inteligentes",
      bio1: "Soy Ingeniero de IA con 3 años en HP, donde lideré un equipo de 12 personas y construí soluciones de QA basadas en agentes que redujeron los costes de pruebas un 60%. Diseño sistemas multiagente, pipelines de orquestación de LLMs y herramientas de automatización con IA — desde integraciones con Playwright MCP hasta despliegues de Ollama autoalojados.",
      bio2: "Con un Máster en Ingeniería de Software por la UPV y un MBA por ThePowerMBA, combino experiencia técnica profunda con visión empresarial. Fui galardonado con el Premio \"Transformator\" de HP en 2024 por revolucionar las estrategias de desarrollo con IA.",
      bio3: "Más allá de la empresa, construyo mis propios productos: sistemas de trading autónomos con orquestación de 4 bots en LangGraph, pipelines de contenido que funcionan íntegramente con LLMs locales y apps móviles multiplataforma con ML en dispositivo. Basado en Valencia, España.",
    },
    experience: {
      label: "03 — Trayectoria",
      heading: "Historial laboral",
      description:
        "Donde el rigor de la ingeniería se fusiona con la innovación en IA.",
      entries: [
        {
          description:
            "Diseñé y construí frameworks de automatización unificados para pruebas de integración y móvil, además de una extensión de VSCode que permite a los responsables de QA realizar pruebas con IA y generar informes. Transformé el paradigma de automatización con QA basado en agentes usando Playwright MCP, GitHub Copilot agents y Ollama.",
          highlights: [
            "Reducción del 60% en costes anuales al automatizar ciclos de pruebas con IA",
            "Lideré un equipo de 12 profesionales de QA y un equipo central de desarrollo IA de 4 personas",
            "Construí solución de QA basada en agentes usando Playwright MCP, Copilot agents y Ollama",
            "Construí pipelines CI/CD en Azure DevOps con FastAPI, LangGraph, Supabase, InfluxDB y Grafana",
            "Galardonado con el Premio \"Transformator\" de HP por el cambio en estrategias de desarrollo (2024)",
          ],
        },
        {
          description:
            "Máster en Ingeniería de Software y Grado en Informática por una de las mejores universidades técnicas de España. Complementado con un MBA por ThePowerMBA (2024–2025).",
          highlights: [
            "Máster en Ingeniería de Software (2021–2022)",
            "Grado en Informática (2017–2021)",
            "MBA — ThePowerMBA (2024–2025)",
          ],
        },
      ],
    },
    contact: {
      label: "04 — Contacto",
      heading: "Trabajemos juntos",
      description:
        "¿Tienes un proyecto en mente? Hablemos sobre cómo puedo ayudarte a hacerlo realidad.",
      name_label: "Nombre",
      name_placeholder: "Tu nombre",
      email_label: "Email",
      email_placeholder: "tu@ejemplo.com",
      message_label: "Mensaje",
      message_placeholder: "Cuéntame sobre tu proyecto...",
      send: "Enviar Mensaje",
      sending: "Enviando...",
      sent: "¡Mensaje Enviado!",
      error: "Algo salió mal. Por favor, inténtalo de nuevo.",
      sidebar_heading: "Contáctame",
      sidebar_text:
        "Estoy abierto a proyectos freelance, consultoría y oportunidades a tiempo completo. Construyamos algo genial juntos.",
      calendar_label: "Agenda conmigo",
      calendar_sub: "Reserva una consulta gratuita",
    },
    footer: {
      rights: "Todos los derechos reservados.",
      built: "Construido con Next.js, Tailwind CSS y Framer Motion",
    },
  },
};
