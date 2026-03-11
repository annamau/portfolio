"use client";

import dynamic from "next/dynamic";

export const GlobalSmoke = dynamic(
  () => import("@/components/GlobalSmoke").then((m) => m.GlobalSmoke),
  { ssr: false }
);

export const Projects = dynamic(() => import("@/components/Projects"));
export const Growth = dynamic(() => import("@/components/Growth"));
export const About = dynamic(() => import("@/components/About"));
export const Experience = dynamic(() => import("@/components/Experience"));
export const Contact = dynamic(() => import("@/components/Contact"));
export const Footer = dynamic(() => import("@/components/Footer"));
