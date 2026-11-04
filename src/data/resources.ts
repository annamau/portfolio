/** Public resources curated from Chrome bookmarks on 2026-11-04.
 * Account links were replaced with public product pages; private bookmarks are excluded.
 * Add a resource here to include it in the library and its category page.
 */
export type ResourceCategory = "development" | "ai" | "design" | "marketing" | "ideas" | "infrastructure";
export type ResourceKind = "tool" | "library" | "inspiration" | "learning" | "post" | "article" | "video" | "audio" | "image" | "file";
export type ResourceLocale = "en" | "es";
export interface Resource {
  id: string;
  name: string;
  url: string;
  category: ResourceCategory;
  kind: ResourceKind;
  tags: string[];
  description: Record<ResourceLocale, string>;
  featured: boolean;
  preview?: string;
  source?: { platform: "x"; postId: string; author?: string };
  file?: { name: string; contentType: string; size: number };
  createdAt?: string;
}
export interface ResourceCollection {
  id: ResourceCategory;
  name: Record<ResourceLocale, string>;
  description: Record<ResourceLocale, string>;
  color: string;
  glyph: string;
}

export const resourceCollections: ResourceCollection[] = [
  {
    "id": "development",
    "name": {
      "en": "Development",
      "es": "Desarrollo"
    },
    "description": {
      "en": "Build the interface. Make it feel right.",
      "es": "Construye la interfaz. Haz que se sienta bien."
    },
    "color": "#a6412b",
    "glyph": "</>"
  },
  {
    "id": "ai",
    "name": {
      "en": "AI & agents",
      "es": "IA y agentes"
    },
    "description": {
      "en": "Models, context and the systems between them.",
      "es": "Modelos, contexto y los sistemas que los conectan."
    },
    "color": "#8b5a30",
    "glyph": "✳"
  },
  {
    "id": "design",
    "name": {
      "en": "Design",
      "es": "Diseño"
    },
    "description": {
      "en": "Tools for finding a visual language of your own.",
      "es": "Herramientas para encontrar tu propio lenguaje visual."
    },
    "color": "#726245",
    "glyph": "◒"
  },
  {
    "id": "marketing",
    "name": {
      "en": "Marketing",
      "es": "Marketing"
    },
    "description": {
      "en": "Get discovered. Tell a clearer story.",
      "es": "Que te encuentren. Cuenta una historia más clara."
    },
    "color": "#486455",
    "glyph": "↗"
  },
  {
    "id": "ideas",
    "name": {
      "en": "Ideas & inspiration",
      "es": "Ideas e inspiración"
    },
    "description": {
      "en": "Good references make better starting points.",
      "es": "Las buenas referencias son un buen comienzo."
    },
    "color": "#6f5167",
    "glyph": "✴"
  },
  {
    "id": "infrastructure",
    "name": {
      "en": "Infrastructure",
      "es": "Infraestructura"
    },
    "description": {
      "en": "The quiet systems that keep things running.",
      "es": "Los sistemas discretos que mantienen todo en marcha."
    },
    "color": "#4a6070",
    "glyph": "⌘"
  }
];

export const resources: Resource[] = [
  {"id":"aceternity","name":"Aceternity UI","url":"https://ui.aceternity.com/","category":"development","kind":"library","tags":["React","UI","Animation","Frontend","Design","Components"],"description":{"en":"React components for interfaces with a little more atmosphere.","es":"Componentes React para interfaces con un poco más de carácter."},"featured":true},
  {"id":"uiverse","name":"Uiverse","url":"https://uiverse.io/","category":"development","kind":"library","tags":["CSS","UI","Frontend","Design","Components"],"description":{"en":"Community-made buttons, loaders and other small interface details.","es":"Botones, indicadores y pequeños detalles de interfaz creados por la comunidad."},"featured":false},
  {"id":"21st","name":"21st.dev","url":"https://21st.dev/community/components","category":"development","kind":"library","tags":["React","UI","Frontend","Design","Components"],"description":{"en":"A shelf of community components to start from and make your own.","es":"Una colección de componentes de la comunidad que puedes adaptar a tu proyecto."},"featured":false},
  {"id":"magicui","name":"Magic UI","url":"https://magicui.design/docs/mcp","category":"development","kind":"library","tags":["React","UI","MCP","Frontend","Design","Components","Agents"],"description":{"en":"Motion-led React components, with an MCP entry point for coding agents.","es":"Componentes React con movimiento y una entrada MCP para agentes de código."},"featured":false},
  {"id":"heroui","name":"HeroUI","url":"https://www.heroui.com/","category":"development","kind":"library","tags":["React","UI","Frontend","Design","Components"],"description":{"en":"A component library for putting the everyday parts of a product together.","es":"Una biblioteca de componentes para construir las piezas del día a día de un producto."},"featured":false},
  {"id":"tremor","name":"Tremor","url":"https://www.tremor.so/","category":"development","kind":"library","tags":["React","Data","Frontend","Charts","Analytics","Dashboards"],"description":{"en":"Charts and dashboard components for making data easier to read.","es":"Gráficos y componentes de dashboards para que los datos se entiendan mejor."},"featured":false},
  {"id":"phosphor","name":"Phosphor Icons","url":"https://phosphoricons.com/","category":"development","kind":"library","tags":["Icons","UI","Images","SVG","Design","Assets"],"description":{"en":"A coherent icon family with enough personality for an entire product.","es":"Una familia de iconos coherente y con personalidad para todo un producto."},"featured":true},
  {"id":"gsap","name":"GSAP","url":"https://gsap.com/","category":"development","kind":"tool","tags":["JavaScript","Animation","Frontend","Motion"],"description":{"en":"A toolkit for carefully timed animation and scroll-driven experiences.","es":"Herramientas para animaciones precisas y experiencias que acompañan al scroll."},"featured":false},
  {"id":"remotion","name":"Remotion","url":"https://www.remotion.dev/","category":"development","kind":"tool","tags":["React","Video","Audio","Motion","Creative coding"],"description":{"en":"Build video compositions with React when a timeline becomes a system.","es":"Crea composiciones de vídeo con React cuando una línea de tiempo se convierte en sistema."},"featured":false},
  {"id":"feralui","name":"FeralUI","url":"https://feralui.dev/","category":"development","kind":"library","tags":["React","Animation","Frontend","Motion","Components"],"description":{"en":"Playful, physics-driven elements for interfaces that invite interaction.","es":"Elementos con físicas y un punto de juego para interfaces que invitan a tocar."},"featured":false},
  {"id":"mastra","name":"Mastra","url":"https://mastra.ai/","category":"ai","kind":"tool","tags":["TypeScript","Agents","AI","Backend","Automation"],"description":{"en":"A TypeScript framework for turning agent experiments into applications.","es":"Un framework de TypeScript para convertir experimentos con agentes en aplicaciones."},"featured":true},
  {"id":"llamaindex","name":"LlamaIndex","url":"https://www.llamaindex.ai/","category":"ai","kind":"tool","tags":["Agents","Data","AI","RAG","Documents","OCR"],"description":{"en":"Connect document workflows and agents to the information they need.","es":"Conecta documentos, flujos de trabajo y agentes con la información que necesitan."},"featured":false},
  {"id":"crawl4ai","name":"Crawl4AI","url":"https://docs.crawl4ai.com/","category":"ai","kind":"learning","tags":["Python","Web data","AI","Scraping","Automation"],"description":{"en":"Documentation for getting web content into AI-friendly workflows.","es":"Documentación para llevar contenido web a flujos de trabajo con IA."},"featured":false},
  {"id":"pinecone","name":"Pinecone Docs","url":"https://docs.pinecone.io/guides/get-started/overview","category":"ai","kind":"learning","tags":["Search","Data","AI","Database","Vectors","RAG"],"description":{"en":"A starting point for learning how vector search fits into a product.","es":"Un punto de partida para entender cómo encaja la búsqueda vectorial en un producto."},"featured":false},
  {"id":"searxng","name":"SearXNG","url":"https://docs.searxng.org/","category":"ai","kind":"learning","tags":["Search","Self-hosting","Privacy","Research","Open source"],"description":{"en":"Documentation for running a metasearch engine on your own terms.","es":"Documentación para ejecutar un metabuscador en tu propia infraestructura."},"featured":false},
  {"id":"smithery","name":"Smithery","url":"https://smithery.ai/","category":"ai","kind":"tool","tags":["MCP","Agents","AI","Automation"],"description":{"en":"Discover MCP servers and connections for agent workflows.","es":"Descubre servidores MCP y conexiones para tus flujos de trabajo con agentes."},"featured":false},
  {"id":"exa","name":"Exa","url":"https://exa.ai/","category":"ai","kind":"tool","tags":["Search","Web data","AI","Research","API"],"description":{"en":"Web search infrastructure for applications that need outside context.","es":"Infraestructura de búsqueda web para aplicaciones que necesitan contexto externo."},"featured":false},
  {"id":"ollama","name":"Ollama","url":"https://ollama.com/","category":"ai","kind":"tool","tags":["Local AI","Self-hosting","AI","Models","Privacy"],"description":{"en":"Run models locally and experiment before committing to a hosted stack.","es":"Ejecuta modelos en local y experimenta antes de elegir una infraestructura alojada."},"featured":false},
  {"id":"ai-studio","name":"Google AI Studio","url":"https://aistudio.google.com/","category":"ai","kind":"tool","tags":["Models","Prototyping","AI","Images","Video","Multimodal"],"description":{"en":"A place to try Gemini models and prototype prompts and interactions.","es":"Un espacio para probar modelos Gemini y prototipar prompts e interacciones."},"featured":false},
  {"id":"notebooklm","name":"NotebookLM","url":"https://notebooklm.google.com/","category":"ai","kind":"tool","tags":["Research","Writing","AI","Documents"],"description":{"en":"Explore a set of sources and use them as the context for your questions.","es":"Explora un conjunto de fuentes y úsalas como contexto para tus preguntas."},"featured":false},
  {"id":"rive","name":"Rive","url":"https://rive.app/","category":"design","kind":"tool","tags":["Animation","Interactive","Design","Motion","Frontend"],"description":{"en":"Design interactive motion that can become part of the real interface.","es":"Diseña movimiento interactivo que pueda formar parte de la interfaz real."},"featured":false},
  {"id":"spline","name":"Spline","url":"https://spline.design/","category":"design","kind":"tool","tags":["3D","Interactive","Design","Web design"],"description":{"en":"A browser-based canvas for exploring 3D scenes and interactions.","es":"Un lienzo en el navegador para explorar escenas 3D e interacciones."},"featured":false},
  {"id":"unsplash","name":"Unsplash","url":"https://unsplash.com/","category":"design","kind":"tool","tags":["Photography","Assets","Images","Design"],"description":{"en":"A starting point for photography when a design needs a human setting.","es":"Un punto de partida fotográfico cuando el diseño necesita un contexto humano."},"featured":false},
  {"id":"freepik","name":"Freepik","url":"https://www.freepik.com/","category":"design","kind":"tool","tags":["Assets","Creative AI","Images","SVG","Design"],"description":{"en":"Visual assets and creative tools for building out a visual direction.","es":"Recursos visuales y herramientas creativas para desarrollar una dirección artística."},"featured":false},
  {"id":"meshy","name":"Meshy","url":"https://www.meshy.ai/","category":"design","kind":"tool","tags":["3D","Creative AI","AI","Images","Assets"],"description":{"en":"Explore AI-assisted 3D asset generation for visual and game prototypes.","es":"Explora la generación 3D con IA para prototipos visuales y de juegos."},"featured":false},
  {"id":"midjourney","name":"Midjourney","url":"https://www.midjourney.com/explore","category":"design","kind":"tool","tags":["Creative AI","Art direction","AI","Images","Video"],"description":{"en":"Explore visual directions and references for image-led projects.","es":"Explora direcciones visuales y referencias para proyectos centrados en la imagen."},"featured":false},
  {"id":"picoberry","name":"PicoBerry","url":"https://picoberry.ai/","category":"design","kind":"tool","tags":["3D","Game design","AI","Assets"],"description":{"en":"A resource for exploring generated 3D assets for game projects.","es":"Un recurso para explorar assets 3D generados para proyectos de juegos."},"featured":false},
  {"id":"quiver","name":"QuiverAI","url":"https://app.quiver.ai/","category":"design","kind":"tool","tags":["SVG","Creative AI","AI","Images","Design"],"description":{"en":"An AI-assisted workspace for exploring vector artwork.","es":"Un espacio con IA para explorar ilustración vectorial."},"featured":false},
  {"id":"opengraph","name":"OpenGraph","url":"https://www.opengraph.xyz/","category":"marketing","kind":"tool","tags":["SEO","Social","Metadata","Web design"],"description":{"en":"Check how a page introduces itself when somebody shares the link.","es":"Comprueba cómo se presenta una página cuando alguien comparte su enlace."},"featured":false},
  {"id":"mail-tester","name":"Mail-tester","url":"https://www.mail-tester.com/","category":"marketing","kind":"tool","tags":["Email","Deliverability","Marketing"],"description":{"en":"Test an email before sending it to the people you want to reach.","es":"Comprueba un email antes de enviarlo a las personas a las que quieres llegar."},"featured":false},
  {"id":"apollo","name":"Apollo","url":"https://www.apollo.io/","category":"marketing","kind":"tool","tags":["Sales","Outreach","Marketing","CRM"],"description":{"en":"A prospecting and outreach platform for finding a route to customers.","es":"Una plataforma de prospección y contacto para encontrar el camino hacia tus clientes."},"featured":false},
  {"id":"semrush","name":"Semrush","url":"https://www.semrush.com/","category":"marketing","kind":"tool","tags":["SEO","Research","Marketing","Keywords","Analytics"],"description":{"en":"Research search visibility, keywords and the surrounding competition.","es":"Investiga visibilidad en buscadores, palabras clave y competencia."},"featured":false},
  {"id":"emailoctopus","name":"EmailOctopus","url":"https://emailoctopus.com/","category":"marketing","kind":"tool","tags":["Email","Newsletters","Marketing","Automation"],"description":{"en":"Build a newsletter and keep a direct line to your audience.","es":"Crea una newsletter y mantén una conexión directa con tu audiencia."},"featured":false},
  {"id":"postiz","name":"Postiz","url":"https://github.com/gitroomhq/postiz-app","category":"marketing","kind":"tool","tags":["Social","Self-hosting","Marketing","Automation","Open source"],"description":{"en":"Explore the source of a social publishing and scheduling platform.","es":"Explora el código de una plataforma para publicar y programar contenido social."},"featured":false},
  {"id":"search-console","name":"Google Search Console","url":"https://search.google.com/search-console/about","category":"marketing","kind":"tool","tags":["SEO","Analytics","Marketing","Keywords"],"description":{"en":"Understand how your own site is being discovered in Google Search.","es":"Entiende cómo se descubre tu propia web en la búsqueda de Google."},"featured":false},
  {"id":"bing-webmaster","name":"Bing Webmaster Tools","url":"https://www.bing.com/webmasters/about","category":"marketing","kind":"tool","tags":["SEO","Analytics","Marketing","Keywords"],"description":{"en":"A second search-engine perspective on site indexing and discovery.","es":"Otra perspectiva sobre la indexación y el descubrimiento de tu web."},"featured":false},
  {"id":"pomelli","name":"Pomelli","url":"https://labs.google.com/pomelli/about/","category":"marketing","kind":"tool","tags":["Branding","Creative AI","AI","Marketing","Images"],"description":{"en":"Explore Google Labs’ approach to brand-led marketing creation.","es":"Explora la propuesta de Google Labs para crear marketing a partir de una marca."},"featured":false},
  {"id":"capcut","name":"CapCut","url":"https://www.capcut.com/","category":"marketing","kind":"tool","tags":["Video","Social","Audio","Images","Editing","Marketing"],"description":{"en":"A video editing workspace for packaging ideas for social channels.","es":"Un espacio de edición de vídeo para dar forma a ideas para redes sociales."},"featured":false},
  {"id":"napkin","name":"Napkin AI","url":"https://www.napkin.ai/","category":"marketing","kind":"tool","tags":["Writing","Visuals","AI","Images","Diagrams","Presentations"],"description":{"en":"Turn a written explanation into a visual you can build a story around.","es":"Transforma una explicación escrita en un visual alrededor del que contar una historia."},"featured":false},
  {"id":"whatships","name":"What Ships","url":"https://whatships.com/","category":"ideas","kind":"inspiration","tags":["Launches","Video","Marketing","Product","Inspiration"],"description":{"en":"A curated look at how products introduce themselves to the world.","es":"Una selección de cómo se presentan los productos al mundo."},"featured":true},
  {"id":"motioninspo","name":"MotionInspo","url":"https://motioninspo.com/","category":"ideas","kind":"inspiration","tags":["Animation","Video","Motion","Design","Inspiration"],"description":{"en":"Motion references for finding the rhythm and feel of a piece.","es":"Referencias de movimiento para encontrar el ritmo y el carácter de una pieza."},"featured":false},
  {"id":"recent","name":"Recent","url":"https://recent.design/launch-videos","category":"ideas","kind":"inspiration","tags":["Launches","Video","Marketing","Product","Inspiration"],"description":{"en":"Launch video references for studying pacing, clarity and presentation.","es":"Vídeos de lanzamiento para estudiar ritmo, claridad y presentación."},"featured":false},
  {"id":"landinglove","name":"Landing Love","url":"https://www.landing.love/","category":"ideas","kind":"inspiration","tags":["Web design","Animation","Design","Inspiration"],"description":{"en":"Landing pages worth studying for their composition and movement.","es":"Landing pages para estudiar su composición y movimiento."},"featured":false},
  {"id":"awwwards","name":"Awwwards","url":"https://www.awwwards.com/","category":"ideas","kind":"inspiration","tags":["Web design","Interactive","Design","Inspiration"],"description":{"en":"A wide-angle view of ambitious web design and interaction.","es":"Una mirada amplia al diseño web y la interacción más ambiciosos."},"featured":false},
  {"id":"dribbble","name":"Dribbble","url":"https://dribbble.com/","category":"ideas","kind":"inspiration","tags":["UI","Branding","Design","Images","Inspiration"],"description":{"en":"Visual references for exploring interface and brand directions.","es":"Referencias visuales para explorar interfaces y direcciones de marca."},"featured":false},
  {"id":"behance","name":"Behance","url":"https://www.behance.net/","category":"ideas","kind":"inspiration","tags":["Art direction","Branding","Design","Images","Inspiration"],"description":{"en":"Longer creative projects for seeing a visual idea through a whole system.","es":"Proyectos creativos completos para ver una idea visual convertida en sistema."},"featured":false},
  {"id":"collectui","name":"Collect UI","url":"https://collectui.com/","category":"ideas","kind":"inspiration","tags":["UI","Patterns","Design","Frontend","Inspiration"],"description":{"en":"Browse interface patterns when you need a different way into a screen.","es":"Explora patrones de interfaz cuando necesitas otra manera de abordar una pantalla."},"featured":false},
  {"id":"supahero","name":"Supahero","url":"https://www.supahero.io/","category":"ideas","kind":"inspiration","tags":["Web design","UI","Design","Frontend","Inspiration"],"description":{"en":"Hero-section references for making the first screen do its job.","es":"Referencias de secciones hero para que la primera pantalla cumpla su función."},"featured":false},
  {"id":"codepen","name":"CodePen","url":"https://codepen.io/trending","category":"ideas","kind":"inspiration","tags":["CSS","Creative coding","Frontend","JavaScript","Inspiration"],"description":{"en":"Working front-end experiments you can inspect, learn from and remix.","es":"Experimentos de front-end que puedes inspeccionar, estudiar y reinterpretar."},"featured":false},
  {"id":"trends","name":"Google Trends","url":"https://trends.google.com/home","category":"ideas","kind":"tool","tags":["Research","Trends","Marketing","Ideas","Validation"],"description":{"en":"Explore what people are searching for before falling in love with an idea.","es":"Explora qué busca la gente antes de enamorarte de una idea."},"featured":false},
  {"id":"devpost","name":"Devpost","url":"https://devpost.com/hackathons","category":"ideas","kind":"inspiration","tags":["Hackathons","Prototyping","Learning","Ideas","Community"],"description":{"en":"Find a prompt, a deadline and a reason to build something new.","es":"Encuentra un reto, una fecha límite y un motivo para construir algo nuevo."},"featured":false},
  {"id":"railway","name":"Railway","url":"https://railway.com/","category":"infrastructure","kind":"tool","tags":["Deployment","Backend","Hosting","Database","DevOps"],"description":{"en":"A platform for putting application services and databases online.","es":"Una plataforma para poner servicios y bases de datos en producción."},"featured":false},
  {"id":"caddy","name":"Caddy","url":"https://caddyserver.com/","category":"infrastructure","kind":"tool","tags":["Servers","Self-hosting","Hosting","HTTPS","DevOps"],"description":{"en":"A web server with automatic HTTPS for running your own services.","es":"Un servidor web con HTTPS automático para alojar tus propios servicios."},"featured":false},
  {"id":"improvmx","name":"ImprovMX","url":"https://improvmx.com/","category":"infrastructure","kind":"tool","tags":["Email","Domains","Infrastructure"],"description":{"en":"Email forwarding for giving a project its own domain identity.","es":"Reenvío de correo para dar a un proyecto su identidad de dominio."},"featured":false},
  {"id":"sanity","name":"Sanity","url":"https://www.sanity.io/","category":"infrastructure","kind":"tool","tags":["CMS","Content","Backend","Publishing","API"],"description":{"en":"Structured content for websites where publishing becomes part of the product.","es":"Contenido estructurado para webs donde publicar forma parte del producto."},"featured":false},
  {"id":"supabase","name":"Supabase","url":"https://supabase.com/","category":"infrastructure","kind":"tool","tags":["Database","Backend","Auth","Storage","Postgres","API"],"description":{"en":"A Postgres-based backend platform for the data behind an application.","es":"Una plataforma de backend basada en Postgres para los datos de una aplicación."},"featured":false},
  {"id":"netlify","name":"Netlify","url":"https://www.netlify.com/","category":"infrastructure","kind":"tool","tags":["Deployment","Web","Hosting","Frontend","Serverless"],"description":{"en":"A deployment platform for taking a website from a repository to a URL.","es":"Una plataforma de despliegue para llevar una web del repositorio a una URL."},"featured":false},
  {"id":"upstash","name":"Upstash","url":"https://upstash.com/","category":"infrastructure","kind":"tool","tags":["Database","Backend","Cache","Redis","Serverless","API"],"description":{"en":"Serverless data services for application infrastructure and background work.","es":"Servicios de datos serverless para infraestructura y trabajo en segundo plano."},"featured":false},
  {"id":"neo4j","name":"Neo4j","url":"https://neo4j.com/","category":"infrastructure","kind":"tool","tags":["Database","Graphs","Backend","Search"],"description":{"en":"A graph database platform for data whose relationships matter.","es":"Una plataforma de bases de datos de grafos para datos donde importan las relaciones."},"featured":false},
  {"id":"coolify","name":"Coolify","url":"https://coolify.io/","category":"infrastructure","kind":"tool","tags":["Deployment","Self-hosting","Hosting","DevOps","Open source"],"description":{"en":"A self-hostable route to managing deployments on your own servers.","es":"Una opción autoalojable para gestionar despliegues en tus propios servidores."},"featured":false},
  {"id":"ntfy","name":"ntfy","url":"https://ntfy.sh/","category":"infrastructure","kind":"tool","tags":["Notifications","Automation","API","Self-hosting"],"description":{"en":"Send notifications from scripts and services with simple HTTP requests.","es":"Envía notificaciones desde scripts y servicios con peticiones HTTP sencillas."},"featured":false},
  {"id":"evolution","name":"Evolution API","url":"https://docs.evolutionfoundation.com.br/","category":"infrastructure","kind":"learning","tags":["Messaging","Automation","API","Backend"],"description":{"en":"Documentation for exploring messaging integrations and automation.","es":"Documentación para explorar integraciones de mensajería y automatización."},"featured":false},
  {"id":"n8n","name":"n8n","url":"https://n8n.io/","category":"infrastructure","kind":"tool","tags":["Automation","Self-hosting","Integrations","Backend"],"description":{"en":"Connect services and turn repeatable work into visible workflows.","es":"Conecta servicios y convierte tareas repetitivas en flujos de trabajo visibles."},"featured":false},
];
