"use client";

import { useCallback, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import {
  ArrowLeft,
  ArrowsClockwise,
  Briefcase,
  ChatText,
  CheckCircle,
  ClipboardText,
  Code,
  Copy,
  Download,
  Envelope,
  Eye,
  FilePdf,
  Globe,
  GithubLogo,
  GraduationCap,
  LinkSimple,
  LinkedinLogo,
  MagicWand,
  MapPin,
  PencilLine,
  Rocket,
  SpinnerGap,
  Sparkle,
  Star,
  Translate,
  User,
  Warning,
} from "@phosphor-icons/react";

interface CVProfile {
  name: string;
  title: string;
  email: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  photoUrl?: string;
  languages?: { language: string; level: string }[];
}

interface CVExperience {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
}

interface CVProject {
  name: string;
  description: string;
  tech: string;
}

interface CVEducation {
  institution: string;
  degree: string;
  period: string;
}

interface CVData {
  headline: string;
  professionalSummary: string;
  experience: CVExperience[];
  skills: Record<string, string[]>;
  education: CVEducation[];
  projects: CVProject[];
  languages?: { language: string; level: string }[];
}

interface ReviewData {
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
}

interface CoverLetterReviewData {
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
}

interface CoverLetterData {
  greeting: string;
  opening: string;
  body: string[];
  closing: string;
  signOff: string;
  signature: string;
  fullText: string;
}

type ActiveDocument = "cv" | "cover-letter";

const colors = {
  ink: "#0f172a",
  slate: "#475569",
  mist: "#94a3b8",
  line: "#dbe4ea",
  accent: "#0f766e",
  accentSoft: "#dff6f2",
  accentDeep: "#115e59",
  canvas: "#fcfcfb",
  warm: "#f4efe7",
};

async function loadImageDataUrl(src?: string): Promise<string | null> {
  if (!src) return null;
  const response = await fetch(src);
  if (!response.ok) return null;
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function buildCvHtml(cv: CVData, profile: CVProfile, photoDataUrl: string | null): string {
  const contactItems = [
    { icon: "✉", text: profile.email },
    { icon: "📍", text: profile.location },
    { icon: "🌐", text: profile.website },
    { icon: "in", text: profile.linkedin },
    { icon: "⌘", text: profile.github },
  ].filter(i => i.text);

  const contactHtml = contactItems.map(c =>
    `<span style="display:inline-flex;align-items:center;gap:4px;"><span style="color:#5eead4;font-size:9px;">${c.icon}</span>${c.text}</span>`
  ).join('<span style="color:#475569;margin:0 6px;">|</span>');

  const experienceHtml = cv.experience.map(exp => `
    <div style="border-top:1px solid #e2e8f0;padding-top:8px;margin-top:8px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;">
        <span style="font-weight:700;font-size:11.5px;color:#0f172a;">${exp.role}</span>
        <span style="font-size:9px;color:#94a3b8;white-space:nowrap;">${exp.period}</span>
      </div>
      <p style="font-size:9.5px;color:#64748b;margin:2px 0 5px;">${exp.company} | ${exp.location}</p>
      <ul style="list-style:none;padding:0;margin:0;">
        ${exp.bullets.map(b => `<li style="display:flex;gap:5px;font-size:10px;color:#334155;line-height:1.45;margin-bottom:2px;">
          <span style="flex-shrink:0;margin-top:5px;width:4px;height:4px;border-radius:50%;background:#0f766e;"></span>
          <span>${b}</span>
        </li>`).join("")}
      </ul>
    </div>
  `).join("");

  const skillsHtml = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
    ${Object.entries(cv.skills).map(([category, items]) => `
      <div style="border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:5px 10px;">
        <div style="font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#115e59;margin-bottom:2px;">${category}</div>
        <p style="font-size:9px;color:#475569;line-height:1.45;margin:0;">${items.join(" | ")}</p>
      </div>
    `).join("")}
  </div>`;

  const projectsHtml = cv.projects.length ? `
    ${sectionHeaderHtml("Projects")}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:5px;">
      ${cv.projects.map(p => `
        <div style="border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:6px 10px;">
          <p style="font-weight:700;font-size:10px;color:#0f172a;margin:0;">${p.name}</p>
          <p style="font-size:8.5px;color:#475569;margin:2px 0 0;line-height:1.4;">${p.description}</p>
          <p style="font-size:7.5px;color:#94a3b8;font-style:italic;margin:2px 0 0;">${p.tech}</p>
        </div>
      `).join("")}
    </div>
  ` : "";

  const langs = cv.languages ?? profile.languages ?? [];
  const educationAndLangsHtml = `<div style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:start;">
    <div>
      ${sectionHeaderHtml("Education")}
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:5px;">
        ${cv.education.map(edu => `
          <div>
            <div style="font-weight:700;font-size:10px;color:#0f172a;">${edu.degree}</div>
            <div style="font-size:8.5px;color:#64748b;margin:1px 0 0;">${edu.institution}</div>
            <div style="font-size:8px;color:#94a3b8;margin-top:1px;">${edu.period}</div>
          </div>
        `).join("")}
      </div>
    </div>
    ${langs.length > 0 ? `
      <div style="min-width:130px;">
        ${sectionHeaderHtml("Languages")}
        <div style="display:flex;gap:8px;margin-top:5px;">
          ${langs.map(l => `
            <div style="border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:4px 10px;text-align:center;">
              <div style="font-weight:700;font-size:9px;color:#0f172a;">${l.language}</div>
              <div style="font-size:7.5px;color:#64748b;margin-top:1px;">${l.level}</div>
            </div>
          `).join("")}
        </div>
      </div>
    ` : ""}
  </div>`;

  const photoHtml = photoDataUrl
    ? `<div style="justify-self:end;border-radius:14px;background:rgba(255,255,255,0.1);padding:5px;border:1px solid rgba(255,255,255,0.1);">
        <img src="${photoDataUrl}" style="width:72px;height:72px;object-fit:cover;border-radius:10px;display:block;" />
      </div>`
    : "";

  return `
    <div style="width:794px;min-height:1123px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#fcfcfb;color:#0f172a;overflow:hidden;">
      <!-- HEADER -->
      <div style="position:relative;background:#0f172a;padding:20px 28px 18px;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(to right,#14b8a6,#34d399,#fbbf24);"></div>
        <div style="display:grid;grid-template-columns:1fr 84px;gap:16px;align-items:start;">
          <div>
            <p style="font-size:8px;text-transform:uppercase;letter-spacing:0.2em;color:rgba(94,234,212,0.7);margin:0 0 4px;">&nbsp;Tailored CV</p>
            <h2 style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.02em;margin:0;">${profile.name.toUpperCase()}</h2>
            <p style="color:rgba(94,234,212,0.8);margin:3px 0 0;font-size:11px;font-weight:500;">${cv.headline || profile.title}</p>
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:2px 0;margin-top:8px;font-size:8.5px;color:#94a3b8;">
              ${contactHtml}
            </div>
          </div>
          ${photoHtml}
        </div>
      </div>

      <!-- BODY -->
      <div style="padding:16px 28px 20px;">
        <!-- Professional Summary -->
        <div style="border-radius:12px;background:#e8f7f4;border:1px solid #ccfbf1;padding:10px 14px;margin-bottom:12px;">
          ${sectionHeaderHtml("Professional Summary")}
          <p style="font-size:10.5px;color:#334155;line-height:1.55;margin:6px 0 0;">${cv.professionalSummary}</p>
        </div>

        <!-- Experience -->
        ${sectionHeaderHtml("Experience")}
        <div style="margin-top:2px;">${experienceHtml}</div>

        <!-- Skills -->
        <div style="margin-top:12px;">
          ${sectionHeaderHtml("Skills")}
          <div style="margin-top:5px;">${skillsHtml}</div>
        </div>

        <!-- Projects -->
        <div style="margin-top:12px;">${projectsHtml}</div>

        <!-- Education & Languages -->
        <div style="margin-top:12px;">${educationAndLangsHtml}</div>
      </div>
    </div>
  `;
}

function sectionHeaderHtml(title: string): string {
  return `<div style="display:flex;align-items:center;gap:8px;">
    <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:#115e59;">${title}</span>
    <span style="flex:1;height:1px;background:linear-gradient(to right,#99f6e4,transparent);"></span>
  </div>`;
}

async function generateCvPdf(cv: CVData, profile: CVProfile) {
  const photo = await loadImageDataUrl(profile.photoUrl);
  const html = buildCvHtml(cv, profile, photo);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.zIndex = "-1";
  container.innerHTML = html;
  document.body.appendChild(container);

  // Wait for images to load
  const images = container.querySelectorAll("img");
  await Promise.all(Array.from(images).map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })));

  const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fcfcfb",
    width: 794,
    windowWidth: 794,
  });

  document.body.removeChild(container);

  const imgWidthPx = canvas.width;
  const imgHeightPx = canvas.height;

  const pdfWidthMm = 210;
  const pdfPageHeightMm = 297;
  const pageHeightPx = Math.floor((pdfPageHeightMm / pdfWidthMm) * imgWidthPx);
  const pdfImgHeightMm = (imgHeightPx * pdfWidthMm) / imgWidthPx;

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // If content fits on one page (with small tolerance for rounding), single image
  if (imgHeightPx <= pageHeightPx + 10) {
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    doc.addImage(imgData, "JPEG", 0, 0, pdfWidthMm, Math.min(pdfImgHeightMm, pdfPageHeightMm));
  } else {
    // Multi-page: slice the canvas into A4-sized pages
    let remainingPx = imgHeightPx;
    let srcY = 0;
    let page = 0;

    while (remainingPx > 10) {
      const sliceH = Math.min(pageHeightPx, remainingPx);
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = imgWidthPx;
      pageCanvas.height = sliceH;
      const ctx = pageCanvas.getContext("2d")!;
      ctx.drawImage(canvas, 0, srcY, imgWidthPx, sliceH, 0, 0, imgWidthPx, sliceH);
      const pageImg = pageCanvas.toDataURL("image/jpeg", 0.95);
      const sliceMm = (sliceH * pdfWidthMm) / imgWidthPx;

      if (page > 0) doc.addPage();
      doc.addImage(pageImg, "JPEG", 0, 0, pdfWidthMm, sliceMm);

      srcY += sliceH;
      remainingPx -= sliceH;
      page++;
    }
  }

  return doc;
}

async function generateCoverLetterPdf(letter: CoverLetterData, profile: CVProfile, companyName?: string, jobTitle?: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const left = 18;
  const right = 18;
  const width = pageWidth - left - right;
  let y = 18;

  doc.setFillColor(colors.canvas);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(colors.ink);
  doc.roundedRect(left, y, width, 30, 5, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor("#ffffff");
  doc.text(profile.name.toUpperCase(), left + 6, y + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor("#cddae7");
  doc.text(profile.title, left + 6, y + 16.5);
  doc.setFontSize(8.2);
  doc.text([profile.email, profile.website, profile.location].join("  |  "), left + 6, y + 23);

  y += 40;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(colors.slate);
  doc.text(new Date().toLocaleDateString(), left, y);
  y += 7;

  const roleLine = [jobTitle, companyName].filter(Boolean).join(", ");
  if (roleLine) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.ink);
    doc.text(roleLine, left, y);
    y += 7;
  }

  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.ink);
  doc.text(letter.greeting, left, y);
  y += 8;

  const paragraphs = [letter.opening, ...letter.body, letter.closing, letter.signOff, letter.signature];
  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(paragraph, width);
    doc.text(lines, left, y);
    y += lines.length * 4.6 + 4.2;
  }

  return doc;
}

export default function CVPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobSourceUrl, setJobSourceUrl] = useState("");
  const [fetchedSource, setFetchedSource] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [error, setError] = useState("");
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [profileData, setProfileData] = useState<CVProfile | null>(null);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetterData | null>(null);
  const [coverLetterReview, setCoverLetterReview] = useState<CoverLetterReviewData | null>(null);
  const [step, setStep] = useState<"input" | "preview">("input");
  const [activeDocument, setActiveDocument] = useState<ActiveDocument>("cv");
  const [redraftComments, setRedraftComments] = useState("");
  const [redraftLoading, setRedraftLoading] = useState(false);

  const handleFetchSource = useCallback(async () => {
    if (!jobSourceUrl.trim()) {
      setError("Paste a LinkedIn job URL or another public job description URL first.");
      return;
    }

    setSourceLoading(true);
    setError("");
    setFetchedSource(false);
    try {
      const res = await fetch("/api/job-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobSourceUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch job source");
      setJobDescription(data.description);
      if (data.jobTitle) setJobTitle(data.jobTitle);
      if (data.companyName) setCompanyName(data.companyName);
      setFetchedSource(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch source URL");
    } finally {
      setSourceLoading(false);
    }
  }, [jobSourceUrl]);

  const handleGenerate = useCallback(async () => {
    if (jobDescription.trim().length < 20) {
      setError("Paste a fuller job description or fetch one from a URL first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          jobTitle: jobTitle.trim() || undefined,
          companyName: companyName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate the application pack");
      setCvData(data.cv);
      setProfileData(data.profile);
      setReviewData(data.review);
      setCoverLetter(data.coverLetter);
      setCoverLetterReview(data.coverLetterReview ?? null);
      setActiveDocument("cv");
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [jobDescription, jobTitle, companyName]);

  const handlePreviewCv = useCallback(async () => {
    if (!cvData || !profileData) return;
    const doc = await generateCvPdf(cvData, profileData);
    window.open(URL.createObjectURL(doc.output("blob")), "_blank");
  }, [cvData, profileData]);

  const handleDownloadCv = useCallback(async () => {
    if (!cvData || !profileData) return;
    const doc = await generateCvPdf(cvData, profileData);
    const fileName = companyName ? `CV_Andres_Naves_${companyName.replace(/\s+/g, "_")}.pdf` : "CV_Andres_Naves.pdf";
    doc.save(fileName);
  }, [cvData, profileData, companyName]);

  const handlePreviewCoverLetter = useCallback(async () => {
    if (!coverLetter || !profileData) return;
    const doc = await generateCoverLetterPdf(coverLetter, profileData, companyName, jobTitle);
    window.open(URL.createObjectURL(doc.output("blob")), "_blank");
  }, [coverLetter, profileData, companyName, jobTitle]);

  const handleDownloadCoverLetter = useCallback(async () => {
    if (!coverLetter || !profileData) return;
    const doc = await generateCoverLetterPdf(coverLetter, profileData, companyName, jobTitle);
    const fileName = companyName
      ? `Cover_Letter_Andres_Naves_${companyName.replace(/\s+/g, "_")}.pdf`
      : "Cover_Letter_Andres_Naves.pdf";
    doc.save(fileName);
  }, [coverLetter, profileData, companyName, jobTitle]);

  const handleCopyCoverLetter = useCallback(async () => {
    if (!coverLetter) return;
    await navigator.clipboard.writeText(coverLetter.fullText);
  }, [coverLetter]);

  const handleRedraftCv = useCallback(async () => {
    if (!cvData || !redraftComments.trim()) return;
    setRedraftLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "redraft-cv",
          jobDescription: jobDescription.trim(),
          jobTitle: jobTitle.trim() || undefined,
          companyName: companyName.trim() || undefined,
          comments: redraftComments.trim(),
          currentCv: cvData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to re-draft CV");
      setCvData(data.cv);
      setReviewData(data.review);
      setRedraftComments("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRedraftLoading(false);
    }
  }, [cvData, redraftComments, jobDescription, jobTitle, companyName]);

  const handleRedraftCoverLetter = useCallback(async () => {
    if (!coverLetter || !cvData || !redraftComments.trim()) return;
    setRedraftLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "redraft-cover-letter",
          jobDescription: jobDescription.trim(),
          jobTitle: jobTitle.trim() || undefined,
          companyName: companyName.trim() || undefined,
          comments: redraftComments.trim(),
          currentCv: cvData,
          currentCoverLetter: coverLetter,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to re-draft cover letter");
      setCoverLetter(data.coverLetter);
      setCoverLetterReview(data.coverLetterReview ?? null);
      setRedraftComments("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRedraftLoading(false);
    }
  }, [coverLetter, cvData, redraftComments, jobDescription, jobTitle, companyName]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 pointer-events-none opacity-[0.018]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(245,158,11,0.18), transparent 28%), radial-gradient(circle at 85% 10%, rgba(20,184,166,0.14), transparent 24%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.05), transparent 18%)" }} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 sm:py-16">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <a href="/" className="inline-flex items-center gap-2 text-xs text-muted/70 hover:text-accent transition-colors mb-8 uppercase tracking-widest">
            <ArrowLeft size={14} weight="bold" />
            Portfolio
          </a>
          <div className="flex items-end gap-5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-accent/20 to-teal-400/10 border border-accent/20 backdrop-blur-sm">
              <FilePdf size={30} className="text-accent" weight="duotone" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] tracking-tight">Application Pack Generator</h1>
              <p className="text-sm text-muted/60 mt-1 font-light">Tailored CV, review score, and cover letter in one flow</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "input" ? (
            <motion.div key="input" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8">
              <div className="space-y-6">
                <div className="rounded-3xl border border-accent/15 bg-gradient-to-br from-accent/[0.09] via-transparent to-teal-400/[0.04] p-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-0.5 p-2.5 rounded-xl bg-accent/12">
                      <Sparkle size={18} className="text-accent" weight="fill" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Profile synced and ready</p>
                      <p className="text-xs text-muted/70 leading-relaxed">Your CV is built from your portfolio data, updated email, updated website, and profile image. Fetch a job post URL to auto-fill the fields, then generate a tailored CV and a matching cover letter.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-surface-light/35 p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5 p-2 rounded-lg bg-accent/10">
                      <LinkSimple size={18} className="text-accent" weight="bold" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Fetch job description from URL</p>
                      <p className="text-xs text-muted/60 mt-1 leading-relaxed">LinkedIn works, and so do other public job-description pages. Fields below auto-fill once fetched.</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="url" value={jobSourceUrl} onChange={(e) => setJobSourceUrl(e.target.value)} placeholder="https://www.linkedin.com/jobs/view/..." className="flex-1 px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted/30 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all text-sm" />
                    <button onClick={handleFetchSource} disabled={sourceLoading || !jobSourceUrl.trim()} className="px-5 py-3 rounded-xl border border-accent/30 text-accent hover:bg-accent/8 transition-all text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {sourceLoading ? <><SpinnerGap size={16} className="animate-spin" />Extracting with AI</> : <><LinkSimple size={16} weight="bold" />Fetch URL</>}
                    </button>
                  </div>
                  {fetchedSource && <div className="flex items-center gap-2 text-xs text-teal-300/80"><CheckCircle size={14} weight="fill" />Job details extracted and filled below</div>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Job Title"><input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Software Engineer, Generative AI Developer Tools" className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted/30 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all text-sm" /></Field>
                  <Field label="Company"><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Electronic Arts" className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted/30 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all text-sm" /></Field>
                </div>

                <Field label="Job Description">
                  <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here, or fetch it from a URL above." rows={14} maxLength={15000} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted/30 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all resize-y font-mono text-xs leading-relaxed" />
                  <p className="text-right text-[10px] text-muted/30 tabular-nums mt-1">{jobDescription.length.toLocaleString()} / 15,000</p>
                </Field>

                <AnimatePresence>{error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/15 text-red-400 text-sm"><Warning size={18} weight="fill" />{error}</motion.div>}</AnimatePresence>

                <button onClick={handleGenerate} disabled={loading || jobDescription.trim().length < 20} className="group w-full py-4 rounded-2xl bg-accent text-background font-bold text-base hover:brightness-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-accent/20">
                  {loading ? <><SpinnerGap size={20} className="animate-spin" />Generating tailored CV and cover letter</> : <><MagicWand size={20} className="group-hover:rotate-12 transition-transform" weight="duotone" />Generate Application Pack</>}
                </button>
              </div>

              <div className="rounded-3xl border border-white/8 bg-black/20 backdrop-blur-sm p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-accent/80 mb-3">What changed</p>
                  <h2 className="text-2xl font-semibold text-foreground leading-tight mb-4">Cleaner PDF, stronger first impression, and a matching cover letter.</h2>
                  <div className="space-y-3 text-sm text-muted/70 leading-relaxed">
                    <p>The generated CV now aims for a more editorial, polished layout while keeping the wording ATS-friendly and role-specific.</p>
                    <p>The generator also reviews its own output, scores it, and revises weak spots before showing you the final result.</p>
                    <p>Your updated email, personal site, and headshot are included in the generated materials.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-8">
                  <MetricCard label="Output" value="CV + Letter" />
                  <MetricCard label="Tone" value="Approachable" />
                  <MetricCard label="Review" value="Scored" />
                  <MetricCard label="Source" value="URL Aware" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => setStep("input")} className="px-4 py-2.5 rounded-xl border border-border text-muted hover:text-foreground hover:border-accent/30 transition-all text-xs flex items-center gap-2 uppercase tracking-wider font-medium"><ArrowsClockwise size={14} />Back to Inputs</button>
                <button onClick={activeDocument === "cv" ? handlePreviewCv : handlePreviewCoverLetter} className="px-4 py-2.5 rounded-xl border border-border text-muted hover:text-foreground hover:border-accent/30 transition-all text-xs flex items-center gap-2 uppercase tracking-wider font-medium"><Eye size={14} />Preview PDF</button>
                <button onClick={activeDocument === "cv" ? handleDownloadCv : handleDownloadCoverLetter} className="px-5 py-2.5 rounded-xl bg-accent text-background font-bold hover:brightness-110 transition-all text-xs flex items-center gap-2 uppercase tracking-wider shadow-md shadow-accent/20"><Download size={14} weight="bold" />Download {activeDocument === "cv" ? "CV" : "Cover Letter"}</button>
                {activeDocument === "cover-letter" && <button onClick={handleCopyCoverLetter} className="px-4 py-2.5 rounded-xl border border-border text-muted hover:text-foreground hover:border-accent/30 transition-all text-xs flex items-center gap-2 uppercase tracking-wider font-medium"><Copy size={14} />Copy Letter</button>}
              </div>

              <div className="grid xl:grid-cols-[320px_1fr] gap-6 items-start">
                <div className="space-y-4 xl:sticky xl:top-6">
                  {activeDocument === "cv" && reviewData && <ReviewPanel review={reviewData} />}
                  {activeDocument === "cover-letter" && coverLetterReview && <CoverLetterReviewPanel review={coverLetterReview} />}
                  <div className="rounded-3xl border border-white/8 bg-black/20 backdrop-blur-sm p-4 space-y-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-accent/80">Documents</p>
                    <button onClick={() => setActiveDocument("cv")} className={`w-full px-4 py-3 rounded-2xl text-left transition-all ${activeDocument === "cv" ? "bg-accent text-background font-semibold" : "bg-white/4 text-foreground hover:bg-white/7"}`}><div className="flex items-center gap-3"><FilePdf size={18} /><div><div className="text-sm">Tailored CV</div><div className="text-[11px] opacity-75">Designed PDF plus ATS-focused content</div></div></div></button>
                    <button onClick={() => setActiveDocument("cover-letter")} className={`w-full px-4 py-3 rounded-2xl text-left transition-all ${activeDocument === "cover-letter" ? "bg-accent text-background font-semibold" : "bg-white/4 text-foreground hover:bg-white/7"}`}><div className="flex items-center gap-3"><ClipboardText size={18} /><div><div className="text-sm">Cover Letter</div><div className="text-[11px] opacity-75">Approachable and job-specific</div></div></div></button>
                  </div>
                  <div className="rounded-3xl border border-white/8 bg-black/20 backdrop-blur-sm p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <PencilLine size={14} className="text-accent" weight="bold" />
                      <p className="text-xs uppercase tracking-[0.2em] text-accent/80">Re-draft</p>
                    </div>
                    <textarea value={redraftComments} onChange={(e) => setRedraftComments(e.target.value)} placeholder="Describe what you'd like changed..." rows={3} className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted/30 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all text-xs resize-y" />
                    <button onClick={activeDocument === "cv" ? handleRedraftCv : handleRedraftCoverLetter} disabled={redraftLoading || !redraftComments.trim()} className="w-full py-2.5 rounded-xl border border-accent/30 text-accent hover:bg-accent/8 transition-all text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {redraftLoading ? <><SpinnerGap size={14} className="animate-spin" />Re-drafting...</> : <><ChatText size={14} weight="bold" />Re-draft {activeDocument === "cv" ? "CV" : "Cover Letter"}</>}
                    </button>
                    <AnimatePresence>{error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-400">{error}</motion.div>}</AnimatePresence>
                  </div>
                </div>

                <div>{activeDocument === "cv" && cvData && profileData ? <CvPreviewCard cv={cvData} profile={profileData} companyName={companyName} jobTitle={jobTitle} /> : coverLetter && profileData ? <CoverLetterPreviewCard letter={coverLetter} profile={profileData} companyName={companyName} jobTitle={jobTitle} /> : null}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-2"><label className="block text-xs font-semibold uppercase tracking-wider text-muted/60">{label}</label>{children}</div>;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/8 bg-white/4 p-3"><div className="text-[10px] uppercase tracking-[0.18em] text-muted/40 mb-1">{label}</div><div className="text-sm font-semibold text-foreground">{value}</div></div>;
}

function ReviewPanel({ review }: { review: ReviewData }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-accent/[0.12] via-white/[0.03] to-transparent p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent/80 mb-2">CV Review</p>
          <p className="text-sm text-muted/70 leading-relaxed">{review.summary}</p>
        </div>
        <div className="shrink-0 w-18 h-18 rounded-3xl bg-black/20 border border-white/10 flex flex-col items-center justify-center"><div className="text-2xl font-bold text-foreground">{review.overallScore}</div><div className="text-[10px] uppercase tracking-[0.18em] text-muted/50">/ 100</div></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4"><MetricCard label="ATS" value={String(review.atsScore)} /><MetricCard label="Relevance" value={String(review.relevanceScore)} /><MetricCard label="Clarity" value={String(review.clarityScore)} /><MetricCard label="Tone" value={String(review.toneScore)} /></div>
      <div className="rounded-2xl bg-black/15 border border-white/8 p-4 mb-4"><div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2"><Star size={16} weight="fill" className="text-accent" />Interview Readiness</div><p className="text-sm text-muted/70 leading-relaxed">{review.interviewReadiness}</p></div>
      <div className="space-y-3 text-sm">
        <div><div className="font-semibold text-foreground mb-2">Strengths</div><ul className="space-y-1.5 text-muted/70">{review.strengths.slice(0, 3).map((item, index) => <li key={index} className="flex gap-2"><CheckCircle size={14} weight="fill" className="text-teal-400 mt-0.5 shrink-0" /><span>{item}</span></li>)}</ul></div>
        {review.improvements.length > 0 && <div><div className="font-semibold text-foreground mb-2">Watchouts</div><ul className="space-y-1.5 text-muted/70">{review.improvements.slice(0, 3).map((item, index) => <li key={index} className="flex gap-2"><Warning size={14} weight="fill" className="text-amber-400 mt-0.5 shrink-0" /><span>{item}</span></li>)}</ul></div>}
      </div>
    </div>
  );
}

function CoverLetterReviewPanel({ review }: { review: CoverLetterReviewData }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-amber-500/[0.08] via-white/[0.03] to-transparent p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80 mb-2">Cover Letter Review</p>
          <p className="text-sm text-muted/70 leading-relaxed">{review.summary}</p>
        </div>
        <div className="shrink-0 w-18 h-18 rounded-3xl bg-black/20 border border-white/10 flex flex-col items-center justify-center"><div className="text-2xl font-bold text-foreground">{review.overallScore}</div><div className="text-[10px] uppercase tracking-[0.18em] text-muted/50">/ 100</div></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4"><MetricCard label="Relevance" value={String(review.relevanceScore)} /><MetricCard label="Storytelling" value={String(review.storytellingScore)} /><MetricCard label="Evidence" value={String(review.evidenceScore)} /><MetricCard label="Tone" value={String(review.toneScore)} /></div>
      <div className="space-y-3 text-sm">
        <div><div className="font-semibold text-foreground mb-2">Strengths</div><ul className="space-y-1.5 text-muted/70">{review.strengths.slice(0, 3).map((item, index) => <li key={index} className="flex gap-2"><CheckCircle size={14} weight="fill" className="text-teal-400 mt-0.5 shrink-0" /><span>{item}</span></li>)}</ul></div>
        {review.improvements.length > 0 && <div><div className="font-semibold text-foreground mb-2">Watchouts</div><ul className="space-y-1.5 text-muted/70">{review.improvements.slice(0, 3).map((item, index) => <li key={index} className="flex gap-2"><Warning size={14} weight="fill" className="text-amber-400 mt-0.5 shrink-0" /><span>{item}</span></li>)}</ul></div>}
      </div>
    </div>
  );
}

function CvPreviewCard({ cv, profile, companyName, jobTitle }: { cv: CVData; profile: CVProfile; companyName: string; jobTitle: string }) {
  return (
    <div className="rounded-[32px] overflow-hidden border border-white/10 shadow-2xl shadow-black/35 bg-white text-slate-900">
      <div className="relative bg-[#0f172a] px-8 sm:px-10 pt-8 pb-7">
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-300" />
        <div className="grid md:grid-cols-[1fr_110px] gap-6 items-start">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-teal-300/75 mb-2">Tailored CV</p>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{profile.name.toUpperCase()}</h2>
            <p className="text-teal-300/80 mt-1 text-sm font-medium">{cv.headline || profile.title}</p>
            {(jobTitle || companyName) && <p className="text-slate-400 text-xs mt-2">Built for {jobTitle || "the target role"}{companyName ? ` at ${companyName}` : ""}</p>}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-[11px] text-slate-400">
              <ContactItem icon={<Envelope size={12} weight="bold" className="text-teal-400/70" />}>{profile.email}</ContactItem>
              <ContactItem icon={<MapPin size={12} weight="bold" className="text-teal-400/70" />}>{profile.location}</ContactItem>
              <ContactItem icon={<Globe size={12} weight="bold" className="text-teal-400/70" />}>{profile.website}</ContactItem>
              <ContactItem icon={<LinkedinLogo size={12} weight="bold" className="text-teal-400/70" />}>{profile.linkedin}</ContactItem>
              <ContactItem icon={<GithubLogo size={12} weight="bold" className="text-teal-400/70" />}>{profile.github}</ContactItem>
            </div>
          </div>
          <div className="justify-self-start md:justify-self-end"><div className="rounded-[28px] bg-white/10 p-2 border border-white/10 shadow-lg shadow-black/20"><img src={profile.photoUrl || "/profile.jpg"} alt={profile.name} className="w-24 h-24 object-cover rounded-[22px]" /></div></div>
        </div>
      </div>

      <div className="bg-[#fcfcfb] px-8 sm:px-10 py-7 space-y-6 max-h-[80vh] overflow-y-auto">
        <div className="rounded-3xl bg-[#e8f7f4] border border-teal-100 p-5"><SectionHeader title="Professional Summary" icon={<User size={15} weight="fill" />} /><p className="text-[13.5px] text-slate-700 leading-relaxed mt-3">{cv.professionalSummary}</p></div>
        <CvSection title="Experience" icon={<Briefcase size={15} weight="fill" />}><div className="space-y-5">{cv.experience.map((exp, index) => <div key={index} className="border-t border-slate-200 first:border-t-0 first:pt-0 pt-5"><div className="flex justify-between items-baseline gap-4"><span className="font-bold text-[14px] text-slate-900">{exp.role}</span><span className="text-[11px] text-slate-400 shrink-0">{exp.period}</span></div><p className="text-[11.5px] text-slate-500 mt-1 mb-3">{exp.company} | {exp.location}</p><ul className="space-y-2">{exp.bullets.map((bullet, bulletIndex) => <li key={bulletIndex} className="flex gap-2.5 text-[12.8px] text-slate-700 leading-snug"><span className="shrink-0 mt-[6px] w-1.5 h-1.5 rounded-full bg-teal-600" /><span>{bullet}</span></li>)}</ul></div>)}</div></CvSection>
        <CvSection title="Skills" icon={<Code size={15} weight="fill" />}><div className="grid gap-3">{Object.entries(cv.skills).map(([category, items]) => <div key={category} className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><div className="text-[10px] uppercase tracking-[0.18em] text-teal-700/80 mb-2">{category}</div><p className="text-[12.5px] text-slate-600 leading-relaxed">{items.join("  |  ")}</p></div>)}</div></CvSection>
        {cv.projects.length > 0 && <CvSection title="Projects" icon={<Rocket size={15} weight="fill" />}><div className="grid gap-3">{cv.projects.map((project, index) => <div key={index} className="rounded-2xl border border-slate-200 bg-white px-4 py-4"><p className="font-bold text-[13px] text-slate-900">{project.name}</p><p className="text-[12.5px] text-slate-600 mt-1 leading-relaxed">{project.description}</p><p className="text-[11px] text-slate-400 italic mt-2">{project.tech}</p></div>)}</div></CvSection>}
        <CvSection title="Education" icon={<GraduationCap size={15} weight="fill" />}><div className="space-y-3">{cv.education.map((edu, index) => <div key={index} className="border-t border-slate-200 first:border-t-0 first:pt-0 pt-3"><div className="flex justify-between items-baseline gap-4"><span className="font-bold text-[13px] text-slate-900">{edu.degree}</span><span className="text-[11px] text-slate-400 shrink-0">{edu.period}</span></div><p className="text-[11.5px] text-slate-500 mt-1">{edu.institution}</p></div>)}</div></CvSection>
        {(cv.languages ?? profile.languages ?? []).length > 0 && <CvSection title="Languages" icon={<Translate size={15} weight="fill" />}><div className="flex flex-wrap gap-3">{(cv.languages ?? profile.languages ?? []).map((lang, index) => <div key={index} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-center"><div className="font-bold text-[13px] text-slate-900">{lang.language}</div><div className="text-[11px] text-slate-500 mt-0.5">{lang.level}</div></div>)}</div></CvSection>}
      </div>
    </div>
  );
}

function CoverLetterPreviewCard({ letter, profile, companyName, jobTitle }: { letter: CoverLetterData; profile: CVProfile; companyName: string; jobTitle: string }) {
  return <div className="rounded-[32px] overflow-hidden border border-white/10 shadow-2xl shadow-black/35 bg-white text-slate-900"><div className="relative bg-[#0f172a] px-8 sm:px-10 pt-8 pb-7"><div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-amber-300 via-teal-400 to-teal-500" /><p className="text-[11px] uppercase tracking-[0.22em] text-teal-300/75 mb-2">Cover Letter</p><h2 className="text-3xl font-extrabold text-white tracking-tight">{profile.name.toUpperCase()}</h2><p className="text-slate-300 text-sm mt-2">{jobTitle || profile.title}{companyName ? ` | ${companyName}` : ""}</p></div><div className="bg-[#fcfcfb] px-8 sm:px-10 py-8 max-h-[80vh] overflow-y-auto"><div className="max-w-3xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><div className="text-sm text-slate-500 space-y-1 mb-8"><p>{profile.name}</p><p>{profile.email}</p><p>{profile.website}</p><p>{profile.location}</p></div><div className="space-y-5 text-[14px] leading-7 text-slate-700"><p>{letter.greeting}</p><p>{letter.opening}</p>{letter.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<p>{letter.closing}</p><p>{letter.signOff}</p><p>{letter.signature}</p></div></div></div></div>;
}

function CvSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <div><SectionHeader title={title} icon={icon} /><div className="mt-3">{children}</div></div>;
}

function SectionHeader({ title, icon }: { title: string; icon: ReactNode }) {
  return <div className="flex items-center gap-2.5"><span className="text-teal-700">{icon}</span><h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-800">{title}</h3><div className="flex-1 h-px bg-gradient-to-r from-teal-200 to-transparent" /></div>;
}

function ContactItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <span className="flex items-center gap-1.5">{icon}{children}</span>;
}
