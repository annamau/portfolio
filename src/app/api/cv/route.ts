import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { experiences } from "@/data/experience";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";

const CONTACT = {
  name: "Andres Naves Mauri",
  title: "AI Engineer and Automation Specialist",
  location: "Valencia, Spain",
  email: "a.naves.mauri@gmail.com",
  website: "https://andresnavesmauri.netlify.app/",
  linkedin: "https://www.linkedin.com/in/andres-naves/",
  github: "github.com/annamau",
  photoUrl: "/profile.jpg",
  languages: [
    { language: "Spanish", level: "Native" },
    { language: "English", level: "C2" },
    { language: "German", level: "A2" },
  ],
};

type CVExperience = {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
};

type CVEducation = {
  institution: string;
  degree: string;
  period: string;
};

type CVProject = {
  name: string;
  description: string;
  tech: string;
};

type CVData = {
  headline: string;
  professionalSummary: string;
  experience: CVExperience[];
  skills: Record<string, string[]>;
  education: CVEducation[];
  projects: CVProject[];
  languages: { language: string; level: string }[];
};

type CoverLetterData = {
  greeting: string;
  opening: string;
  body: string[];
  closing: string;
  signOff: string;
  signature: string;
  fullText: string;
};

type ReviewData = {
  overallScore: number;
  atsScore: number;
  relevanceScore: number;
  clarityScore: number;
  toneScore: number;
  presentationScore: number;
  summary: string;
  interviewReadiness: string;
  strengths: string[];
  improvements: string[];
  mustFixes: string[];
};

type CoverLetterReviewData = {
  overallScore: number;
  relevanceScore: number;
  storytellingScore: number;
  evidenceScore: number;
  toneScore: number;
  ctaScore: number;
  alignmentScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
};

function buildProfile() {
  const workExperience = experiences
    .filter((exp) => exp.id !== "education")
    .map((exp) => ({
      company: exp.company,
      role: exp.role,
      period: exp.period,
      location: "Valencia, Spain",
      description: exp.description,
      bullets: exp.highlights,
      techUsed: exp.techUsed,
    }));

  const educationEntry = experiences.find((exp) => exp.id === "education");
  const education = educationEntry
    ? educationEntry.highlights.map((highlight) => {
        const match = highlight.match(/^(.+?)\s*[—–-]\s*(.+?)\s*\((.+?)\)$/);
        if (match) {
          return {
            degree: match[1].trim(),
            institution: match[2].trim(),
            period: match[3].trim(),
          };
        }

        const simpleMatch = highlight.match(/^(.+?)\s*\((.+?)\)$/);
        if (simpleMatch) {
          return {
            degree: simpleMatch[1].trim(),
            institution: educationEntry.company,
            period: simpleMatch[2].trim(),
          };
        }

        return {
          degree: highlight,
          institution: educationEntry.company,
          period: educationEntry.period,
        };
      })
    : [];

  const skills: Record<string, string[]> = {};
  for (const group of skillGroups) {
    skills[group.category] = [...group.skills];
  }

  const projectList = projects.map((project) => ({
    name: project.title,
    tagline: project.tagline,
    description: project.description,
    techStack: project.techStack,
    tier: project.tier,
    year: project.year,
  }));

  return {
    contact: CONTACT,
    workExperience,
    education,
    skills,
    projects: projectList,
  };
}

function extractJson(text: string) {
  let jsonText = text.trim();
  const fenced = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    jsonText = fenced[1].trim();
  }
  return JSON.parse(jsonText);
}

const MODELS = ["gemini-3.1-flash-lite-preview", "gemini-2.5-flash"] as const;

function isRateLimitError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message;
  return msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota");
}

async function generateStructuredJson<T>(
  ai: GoogleGenAI,
  systemInstruction: string,
  userPrompt: string,
  temperature = 0.5
) {
  let lastError: unknown;
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response from AI model");
      }

      return extractJson(text) as T;
    } catch (err) {
      lastError = err;
      if (isRateLimitError(err)) {
        console.warn(`Model ${model} rate-limited, trying fallback...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

const CV_SYSTEM_PROMPT = `You are an elite resume writer for modern technical roles.

Your job is to produce a sharp, highly tailored, one-page CV that feels professional, approachable, and specific to the target role.

Rules:
- Use standard section headers: Professional Summary, Experience, Skills, Education, Projects, Languages.
- Keep it ATS friendly. No tables. No multi-column text structures in the wording. No decorative characters that could confuse parsers.
- Use reverse chronological order.
- Use concise, high-impact bullets with strong action verbs.
- Quantify impact whenever possible.
- Mirror the language of the job description naturally.
- Keep the tone human, warm, and confident. Do not sound robotic.
- Never use em dashes. Never use double hyphens as punctuation. Use commas, colons, or simple sentence breaks instead.
- Avoid buzzword stuffing.
- Prefer short, scannable sentences.
- Keep the content credible. Do not invent experience.
- Always include "Entrena con Inteligencia" in the projects list. It is the candidate's flagship SaaS product (AI personal trainer platform for 8+ sports, with real users, Stripe billing, multi-language support). It demonstrates end-to-end product ownership and is relevant to nearly any technical role.
- Projects are tagged with importance tiers. Prioritize selection in this order:
  1. "heavy-ai" (highest priority): Multi-agent AI systems, SaaS with real users, production ML pipelines. Always select from these first.
  2. "medium-ai": AI-assisted tools with practical applications.
  3. "devops": Infrastructure and deployment projects.
  4. "web" (lowest priority): Simple websites and landing pages with no advanced engineering.
  Select 2 to 4 projects from the highest tiers that best demonstrate skills relevant to the target role. Exclude simple websites, basic landing pages, or trivial web projects (e.g. "Bichis") that do not showcase advanced engineering skills.
- Include the Languages section with the candidate's language proficiencies.

Return only valid JSON with this exact shape:
{
  "headline": "short role-aligned headline",
  "professionalSummary": "2 to 3 sentence summary",
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "period": "Start - End",
      "location": "City, Country",
      "bullets": ["bullet", "bullet"]
    }
  ],
  "skills": {
    "Category": ["Skill 1", "Skill 2"]
  },
  "education": [
    {
      "institution": "Institution",
      "degree": "Degree",
      "period": "Start - End"
    }
  ],
  "projects": [
    {
      "name": "Project",
      "description": "One-line impact-focused description",
      "tech": "Relevant stack"
    }
  ],
  "languages": [
    { "language": "Spanish", "level": "Native" }
  ]
}`;

const REVIEW_SYSTEM_PROMPT = `You are a strict but fair recruiter, ATS specialist, and resume reviewer.

Score the CV against the target job.

Scoring rubric:
- ATS compatibility: 0 to 20
- Relevance to target role: 0 to 25
- Clarity and scanability: 0 to 15
- Impact and proof of results: 0 to 20
- Tone and credibility: 0 to 10
- Presentation quality for a modern professional PDF: 0 to 10

Use the total for overallScore out of 100.

Important:
- A score of 95 or above should only be given to an excellent, highly tailored result.
- Do not guarantee interviews or job offers.
- If something is weak, say it clearly.
- Never use em dashes. Never use double hyphens as punctuation.

Return only valid JSON with this exact shape:
{
  "overallScore": 0,
  "atsScore": 0,
  "relevanceScore": 0,
  "clarityScore": 0,
  "toneScore": 0,
  "presentationScore": 0,
  "summary": "short review summary",
  "interviewReadiness": "short statement",
  "strengths": ["..."],
  "improvements": ["..."],
  "mustFixes": ["..."]
}`;

const COVER_LETTER_SYSTEM_PROMPT = `You are an expert cover letter writer for modern technical roles.

Write a cover letter that feels confident, approachable, and professional.

Rules:
- Keep it to about 300 to 420 words.
- Use a strong opening tied to the role.
- Make the body evidence-based, with concrete achievements and direct relevance to the job.
- Show genuine interest in the company and role.
- Close with a polite, confident call to action.
- Do not repeat the CV line by line.
- Never use em dashes. Never use double hyphens as punctuation.
- Keep the tone human and natural.

Return only valid JSON with this exact shape:
{
  "greeting": "Dear Hiring Manager,",
  "opening": "paragraph",
  "body": ["paragraph", "paragraph"],
  "closing": "paragraph",
  "signOff": "Best regards,",
  "signature": "Andres Naves Mauri",
  "fullText": "complete letter with paragraph breaks"
}`;

const COVER_LETTER_REVIEW_SYSTEM_PROMPT = `You are a strict but fair recruiter and cover letter reviewer.

Score the cover letter against the target job and companion CV.

Scoring rubric:
- Relevance to target role and company: 0 to 25
- Storytelling and engagement: 0 to 20
- Evidence of impact and achievements: 0 to 20
- Tone, warmth, and professionalism: 0 to 15
- Call to action and closing strength: 0 to 10
- Alignment with the companion CV: 0 to 10

Use the total for overallScore out of 100.

Important:
- A score of 95 or above should only be given to an outstanding, differentiated letter.
- If something is generic or weak, say it clearly.
- Never use em dashes. Never use double hyphens as punctuation.

Return only valid JSON with this exact shape:
{
  "overallScore": 0,
  "relevanceScore": 0,
  "storytellingScore": 0,
  "evidenceScore": 0,
  "toneScore": 0,
  "ctaScore": 0,
  "alignmentScore": 0,
  "summary": "short review summary",
  "strengths": ["..."],
  "improvements": ["..."]
}`;

async function generateCvDraft(
  ai: GoogleGenAI,
  profile: ReturnType<typeof buildProfile>,
  jobDescription: string,
  jobTitle?: string,
  companyName?: string
) {
  const prompt = `Here is my complete profile, automatically pulled from my portfolio website.

CONTACT:
${JSON.stringify(profile.contact, null, 2)}

WORK EXPERIENCE:
${JSON.stringify(profile.workExperience, null, 2)}

EDUCATION:
${JSON.stringify(profile.education, null, 2)}

ALL SKILLS:
${JSON.stringify(profile.skills, null, 2)}

ALL PROJECTS:
${JSON.stringify(profile.projects, null, 2)}

TARGET ROLE:
${jobTitle ? `Job Title: ${jobTitle}` : ""}
${companyName ? `Company: ${companyName}` : ""}

JOB DESCRIPTION:
${jobDescription}

Create the best possible tailored CV for this application.`;

  return generateStructuredJson<CVData>(ai, CV_SYSTEM_PROMPT, prompt, 0.7);
}

async function reviewCvDraft(
  ai: GoogleGenAI,
  cv: CVData,
  jobDescription: string,
  jobTitle?: string,
  companyName?: string
) {
  const prompt = `Review this tailored CV against the job.

ROLE:
${jobTitle ? `Job Title: ${jobTitle}` : ""}
${companyName ? `Company: ${companyName}` : ""}

JOB DESCRIPTION:
${jobDescription}

CV JSON:
${JSON.stringify(cv, null, 2)}`;

  return generateStructuredJson<ReviewData>(ai, REVIEW_SYSTEM_PROMPT, prompt, 0.2);
}

async function reviseCvDraft(
  ai: GoogleGenAI,
  cv: CVData,
  review: ReviewData,
  profile: ReturnType<typeof buildProfile>,
  jobDescription: string,
  jobTitle?: string,
  companyName?: string
) {
  const prompt = `Revise this CV to improve its score.

TARGET ROLE:
${jobTitle ? `Job Title: ${jobTitle}` : ""}
${companyName ? `Company: ${companyName}` : ""}

JOB DESCRIPTION:
${jobDescription}

SOURCE PROFILE:
${JSON.stringify(profile, null, 2)}

CURRENT CV:
${JSON.stringify(cv, null, 2)}

REVIEW:
${JSON.stringify(review, null, 2)}

Priorities:
- Fix mustFixes first.
- Improve keyword coverage naturally.
- Keep it one-page friendly.
- Keep the tone approachable and professional.
- Never use em dashes.`;

  return generateStructuredJson<CVData>(ai, CV_SYSTEM_PROMPT, prompt, 0.45);
}

async function generateCoverLetter(
  ai: GoogleGenAI,
  profile: ReturnType<typeof buildProfile>,
  cv: CVData,
  review: ReviewData,
  jobDescription: string,
  jobTitle?: string,
  companyName?: string
) {
  const prompt = `Write a tailored cover letter.

CONTACT:
${JSON.stringify(profile.contact, null, 2)}

TARGET ROLE:
${jobTitle ? `Job Title: ${jobTitle}` : ""}
${companyName ? `Company: ${companyName}` : ""}

JOB DESCRIPTION:
${jobDescription}

FINAL CV:
${JSON.stringify(cv, null, 2)}

REVIEW SUMMARY:
${JSON.stringify(review, null, 2)}

The letter should align with the same positioning as the CV.`;

  return generateStructuredJson<CoverLetterData>(ai, COVER_LETTER_SYSTEM_PROMPT, prompt, 0.6);
}

async function reviewCoverLetter(
  ai: GoogleGenAI,
  coverLetter: CoverLetterData,
  cv: CVData,
  jobDescription: string,
  jobTitle?: string,
  companyName?: string
) {
  const prompt = `Review this cover letter against the job and companion CV.

ROLE:
${jobTitle ? `Job Title: ${jobTitle}` : ""}
${companyName ? `Company: ${companyName}` : ""}

JOB DESCRIPTION:
${jobDescription}

COVER LETTER:
${JSON.stringify(coverLetter, null, 2)}

COMPANION CV:
${JSON.stringify(cv, null, 2)}`;

  return generateStructuredJson<CoverLetterReviewData>(ai, COVER_LETTER_REVIEW_SYSTEM_PROMPT, prompt, 0.2);
}

async function redraftCv(
  ai: GoogleGenAI,
  currentCv: CVData,
  profile: ReturnType<typeof buildProfile>,
  jobDescription: string,
  comments: string,
  jobTitle?: string,
  companyName?: string
) {
  const prompt = `Re-draft this CV based on the user's feedback comments.

TARGET ROLE:
${jobTitle ? `Job Title: ${jobTitle}` : ""}
${companyName ? `Company: ${companyName}` : ""}

JOB DESCRIPTION:
${jobDescription}

SOURCE PROFILE:
${JSON.stringify(profile, null, 2)}

CURRENT CV:
${JSON.stringify(currentCv, null, 2)}

USER FEEDBACK:
${comments}

Apply the user's feedback while keeping the CV strong, ATS-friendly, and one-page friendly.`;

  return generateStructuredJson<CVData>(ai, CV_SYSTEM_PROMPT, prompt, 0.5);
}

async function redraftCoverLetter(
  ai: GoogleGenAI,
  currentLetter: CoverLetterData,
  cv: CVData,
  profile: ReturnType<typeof buildProfile>,
  jobDescription: string,
  comments: string,
  jobTitle?: string,
  companyName?: string
) {
  const prompt = `Re-draft this cover letter based on the user's feedback comments.

CONTACT:
${JSON.stringify(profile.contact, null, 2)}

TARGET ROLE:
${jobTitle ? `Job Title: ${jobTitle}` : ""}
${companyName ? `Company: ${companyName}` : ""}

JOB DESCRIPTION:
${jobDescription}

CURRENT COVER LETTER:
${JSON.stringify(currentLetter, null, 2)}

COMPANION CV:
${JSON.stringify(cv, null, 2)}

USER FEEDBACK:
${comments}

Apply the user's feedback while keeping the letter compelling and aligned with the CV.`;

  return generateStructuredJson<CoverLetterData>(ai, COVER_LETTER_SYSTEM_PROMPT, prompt, 0.55);
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { jobDescription, jobTitle, companyName, mode, comments, currentCv, currentCoverLetter } = body as {
      jobDescription?: string;
      jobTitle?: string;
      companyName?: string;
      mode?: "generate" | "redraft-cv" | "redraft-cover-letter";
      comments?: string;
      currentCv?: CVData;
      currentCoverLetter?: CoverLetterData;
    };

    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.length < 20) {
      return NextResponse.json(
        { error: "Please provide a meaningful job description, at least 20 characters." },
        { status: 400 }
      );
    }

    if (jobDescription.length > 15000) {
      return NextResponse.json(
        { error: "Job description is too long, max 15000 characters." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const profile = buildProfile();

    // Re-draft CV mode
    if (mode === "redraft-cv" && currentCv && comments) {
      const cv = await redraftCv(ai, currentCv, profile, jobDescription, comments, jobTitle, companyName);
      const review = await reviewCvDraft(ai, cv, jobDescription, jobTitle, companyName);
      return NextResponse.json({ cv, review });
    }

    // Re-draft cover letter mode
    if (mode === "redraft-cover-letter" && currentCoverLetter && currentCv && comments) {
      const letter = await redraftCoverLetter(ai, currentCoverLetter, currentCv, profile, jobDescription, comments, jobTitle, companyName);
      const letterReview = await reviewCoverLetter(ai, letter, currentCv, jobDescription, jobTitle, companyName);
      return NextResponse.json({ coverLetter: letter, coverLetterReview: letterReview });
    }

    // Full generation mode
    let cv = await generateCvDraft(ai, profile, jobDescription, jobTitle, companyName);
    let review = await reviewCvDraft(ai, cv, jobDescription, jobTitle, companyName);
    let bestCv = cv;
    let bestReview = review;

    for (let attempt = 0; attempt < 2 && bestReview.overallScore < 95; attempt += 1) {
      cv = await reviseCvDraft(ai, bestCv, bestReview, profile, jobDescription, jobTitle, companyName);
      review = await reviewCvDraft(ai, cv, jobDescription, jobTitle, companyName);
      if (review.overallScore >= bestReview.overallScore) {
        bestCv = cv;
        bestReview = review;
      }
    }

    const coverLetter = await generateCoverLetter(
      ai,
      profile,
      bestCv,
      bestReview,
      jobDescription,
      jobTitle,
      companyName
    );

    const coverLetterReview = await reviewCoverLetter(
      ai,
      coverLetter,
      bestCv,
      jobDescription,
      jobTitle,
      companyName
    );

    return NextResponse.json({
      cv: bestCv,
      review: bestReview,
      coverLetter,
      coverLetterReview,
      profile: {
        name: profile.contact.name,
        title: profile.contact.title,
        email: profile.contact.email,
        location: profile.contact.location,
        website: profile.contact.website,
        linkedin: profile.contact.linkedin,
        github: profile.contact.github,
        photoUrl: profile.contact.photoUrl,
        languages: profile.contact.languages,
      },
    });
  } catch (error) {
    console.error("CV generation error:", error);
    // Detect Gemini rate-limit errors and surface a clearer message
    const isRateLimit = isRateLimitError(error);
    return NextResponse.json(
      {
        error: isRateLimit
          ? "AI model rate limit reached. Please wait a minute and try again."
          : "Failed to generate the application pack. Please try again.",
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
