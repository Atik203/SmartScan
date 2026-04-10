"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Expand,
  Minimize,
} from "lucide-react";
import Image from "next/image";
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type TeamMember = {
  name: string;
  id: string;
};

type SlideTheme = {
  shell: string;
  panel: string;
  heading: string;
  text: string;
  badge: string;
  border: string;
};

type Slide = {
  title: string;
  subtitle?: string;
  theme: SlideTheme;
  body: ReactNode;
};

const teamMembers: TeamMember[] = [
  { name: "Member 1 Name", id: "ID 01" },
  { name: "Member 2 Name", id: "ID 02" },
  { name: "Member 3 Name", id: "ID 03" },
  { name: "Member 4 Name", id: "ID 04" },
  { name: "Member 5 Name", id: "ID 05" },
];

const themes: SlideTheme[] = [
  {
    shell:
      "bg-[radial-gradient(circle_at_20%_20%,#e0f2fe_0%,#f8fafc_40%,#f1f5f9_100%)]",
    panel: "bg-white/85",
    heading: "text-slate-900",
    text: "text-slate-800",
    badge: "bg-cyan-100 text-cyan-900",
    border: "border-cyan-300/80",
  },
  {
    shell:
      "bg-[radial-gradient(circle_at_80%_10%,#fde68a_0%,#fff7ed_35%,#fefce8_100%)]",
    panel: "bg-white/85",
    heading: "text-amber-950",
    text: "text-amber-900",
    badge: "bg-amber-100 text-amber-950",
    border: "border-amber-300/80",
  },
  {
    shell:
      "bg-[radial-gradient(circle_at_15%_20%,#ddd6fe_0%,#fdf4ff_45%,#f8fafc_100%)]",
    panel: "bg-white/85",
    heading: "text-violet-950",
    text: "text-violet-900",
    badge: "bg-violet-100 text-violet-950",
    border: "border-violet-300/80",
  },
  {
    shell:
      "bg-[radial-gradient(circle_at_80%_10%,#bbf7d0_0%,#ecfeff_35%,#f8fafc_100%)]",
    panel: "bg-white/85",
    heading: "text-emerald-950",
    text: "text-emerald-900",
    badge: "bg-emerald-100 text-emerald-950",
    border: "border-emerald-300/80",
  },
  {
    shell:
      "bg-[radial-gradient(circle_at_20%_20%,#fed7aa_0%,#fff1f2_42%,#f8fafc_100%)]",
    panel: "bg-white/85",
    heading: "text-rose-950",
    text: "text-rose-900",
    badge: "bg-rose-100 text-rose-950",
    border: "border-rose-300/80",
  },
  {
    shell:
      "bg-[radial-gradient(circle_at_80%_20%,#bfdbfe_0%,#eef2ff_45%,#f8fafc_100%)]",
    panel: "bg-white/85",
    heading: "text-indigo-950",
    text: "text-indigo-900",
    badge: "bg-indigo-100 text-indigo-950",
    border: "border-indigo-300/80",
  },
];

const slides: Slide[] = [
  {
    title: "SmartScan",
    subtitle: "Automated Book Digitizer and LaTeX Extractor",
    theme: themes[0],
    body: (
      <div className="space-y-8">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-cyan-300 bg-cyan-50/80 p-5 lg:col-span-2">
            <p className="text-[clamp(1.2rem,1.9vw,1.8rem)] font-bold text-slate-900">
              Project Proposal Presentation
            </p>
            <p className="mt-2 text-[clamp(1rem,1.6vw,1.35rem)] font-semibold text-slate-800">
              CSE 4326 - Microprocessors and Microcontrollers Laboratory
            </p>
            <p className="text-[clamp(1rem,1.6vw,1.35rem)] font-semibold text-slate-800">
              United International University (UIU)
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-300 bg-white/90 p-5">
            <p className="text-[clamp(1rem,1.5vw,1.25rem)] font-bold text-slate-900">
              Group No: 6
            </p>
            <p className="mt-2 text-[clamp(1rem,1.5vw,1.25rem)] font-bold text-slate-900">
              Team: Team Extra Current
            </p>
            <p className="mt-4 text-[clamp(0.95rem,1.3vw,1.1rem)] font-semibold text-slate-700">
              Based on IEEE Access, 2025
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-cyan-300 bg-white/95 p-4">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="border border-cyan-300 bg-cyan-50 p-3 text-[clamp(0.95rem,1.3vw,1.1rem)] font-extrabold text-slate-900">
                  No.
                </th>
                <th className="border border-cyan-300 bg-cyan-50 p-3 text-[clamp(0.95rem,1.3vw,1.1rem)] font-extrabold text-slate-900">
                  Name
                </th>
                <th className="border border-cyan-300 bg-cyan-50 p-3 text-[clamp(0.95rem,1.3vw,1.1rem)] font-extrabold text-slate-900">
                  Student ID
                </th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member, index) => (
                <tr key={member.id}>
                  <td className="border border-cyan-200 p-3 text-[clamp(0.95rem,1.3vw,1.1rem)] font-semibold text-slate-800">
                    {index + 1}
                  </td>
                  <td className="border border-cyan-200 p-3 text-[clamp(0.95rem,1.3vw,1.1rem)] font-semibold text-slate-800">
                    {member.name}
                  </td>
                  <td className="border border-cyan-200 p-3 text-[clamp(0.95rem,1.3vw,1.1rem)] font-semibold text-slate-800">
                    {member.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    title: "Introduction",
    subtitle: "Why this project matters now",
    theme: themes[1],
    body: (
      <div className="space-y-4">
        {[
          "SmartScan is a low-cost mechatronic and AI system for digitizing academic books.",
          "The proposed pipeline is fully integrated: page handling, synchronized capture, image correction, and math-aware recognition.",
          "The core innovation is converting printed mathematical regions into reusable LaTeX, not just plain OCR text.",
          "The architecture follows the paper direction: Arduino as control muscle, Raspberry Pi as bridge, and laptop as AI brain.",
          "Target operation is practical for academic workflows where page throughput and equation quality both matter.",
        ].map((line) => (
          <div
            key={line}
            className="rounded-2xl border border-amber-300 bg-white/95 p-4 text-[clamp(1.03rem,1.45vw,1.4rem)] font-semibold text-amber-950"
          >
            {line}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Expected Prototype",
    subtitle: "Reference design view from paper",
    theme: themes[5],
    body: (
      <div className="space-y-5">
        <div className="rounded-2xl border border-indigo-300 bg-white/95 p-5">
          <p className="text-lg font-extrabold text-indigo-950">
            Expected prototype overview
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[clamp(1rem,1.3vw,1.2rem)] font-semibold text-indigo-900">
            <li>
              The figure consolidates four key visual sections of the proposed
              system in one panel.
            </li>
            <li>
              It presents the expected mechanical quality and integration level
              before final live operation.
            </li>
            <li>
              It helps evaluators quickly understand mechanical design, capture
              setup, and end-to-end workflow.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-indigo-300 bg-white/95 p-3">
          <Image
            src="/image.png"
            alt="Expected prototype collage from research paper"
            width={1400}
            height={1000}
            className="h-[52vh] w-full rounded-xl object-contain md:h-[58vh]"
            priority
          />
        </div>
      </div>
    ),
  },
  {
    title: "Problem Statement",
    subtitle: "Current solutions fail in four critical ways",
    theme: themes[2],
    body: (
      <div className="grid gap-5 md:grid-cols-2">
        {[
          {
            h: "Manual effort is high",
            b: "Traditional scanning is slow and impractical for full semester books. Large-volume course materials require extensive human effort and time.",
            c: "Impact: low throughput and high operator fatigue.",
          },
          {
            h: "Book safety is poor",
            b: "Flatbed pressure can damage binding and spine, especially for thicker books and older editions.",
            c: "Impact: risk of permanent physical damage to academic resources.",
          },
          {
            h: "Commercial systems are costly",
            b: "Professional scanning systems are often outside student-lab budgets and hard to scale.",
            c: "Impact: low accessibility for departmental or classroom deployment.",
          },
          {
            h: "Math OCR quality is weak",
            b: "Generic OCR tools lose equation structure and produce text that is not directly usable in technical documents.",
            c: "Impact: equations require manual correction and re-typing.",
          },
        ].map((item) => (
          <div
            key={item.h}
            className="rounded-2xl border border-violet-300 bg-white/95 p-5"
          >
            <p className="text-[clamp(1.05rem,1.5vw,1.35rem)] font-extrabold text-violet-950">
              {item.h}
            </p>
            <p className="mt-2 text-[clamp(0.95rem,1.25vw,1.12rem)] font-semibold text-violet-900">
              {item.b}
            </p>
            <p className="mt-2 text-[clamp(0.95rem,1.2vw,1.08rem)] font-bold text-violet-950">
              {item.c}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Motivation",
    subtitle: "Academic, social, and technical impact",
    theme: themes[3],
    body: (
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          {
            h: "Academic value",
            points: [
              "Combines embedded systems, robotics, and AI in one capstone-level workflow.",
              "Demonstrates practical use of microcontroller timing and control theory.",
              "Connects classroom theory with measurable system-level performance metrics.",
            ],
          },
          {
            h: "Practical value",
            points: [
              "Supports low-cost digitization for engineering and mathematics content.",
              "Preserves books while making knowledge reusable.",
              "Reduces manual scanning burden for libraries and student resource preparation.",
            ],
          },
          {
            h: "Research value",
            points: [
              "Extends IEEE paper idea with modern web-based monitoring and presentation.",
              "Builds foundation for future handwriting and multilingual support.",
              "Provides a reproducible baseline for future dataset scaling and model comparison.",
            ],
          },
        ].map((item) => (
          <div
            key={item.h}
            className="rounded-2xl border border-emerald-300 bg-white/95 p-5"
          >
            <p className="text-[clamp(1.05rem,1.45vw,1.3rem)] font-extrabold text-emerald-950">
              {item.h}
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[clamp(0.95rem,1.2vw,1.08rem)] font-semibold text-emerald-900">
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Objectives",
    subtitle: "What this proposal aims to deliver",
    theme: themes[4],
    body: (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            title: "Objective 1 - Mechanical Automation Core",
            detail:
              "Build a stable V-cradle platform with coordinated gripper and flipper mechanisms for repeatable page handling.",
            accent: "border-rose-300 bg-rose-50/60 text-rose-950",
          },
          {
            title: "Objective 2 - Embedded Control and Capture Sync",
            detail:
              "Implement Arduino-based servo control and synchronized dual-camera capture using Raspberry Pi bridge communication.",
            accent: "border-orange-300 bg-orange-50/60 text-orange-950",
          },
          {
            title: "Objective 3 - Image and AI Processing Pipeline",
            detail:
              "Run preprocessing, math region detection, and LaTeX recognition in an integrated pipeline suitable for academic documents.",
            accent: "border-amber-300 bg-amber-50/60 text-amber-950",
          },
          {
            title: "Objective 4 - Web-based Monitoring and Results",
            detail:
              "Provide clear dashboard views for processing status, detection outputs, and formula rendering for presentation and validation.",
            accent: "border-fuchsia-300 bg-fuchsia-50/60 text-fuchsia-950",
          },
          {
            title: "Objective 5 - Feasibility and Performance Validation",
            detail:
              "Demonstrate practical accuracy, throughput, and budget feasibility with complete data-driven evaluation.",
            accent: "border-violet-300 bg-violet-50/60 text-violet-950",
          },
        ].map((item) => (
          <div
            key={item.title}
            className={`rounded-2xl border p-5 ${item.accent}`}
          >
            <p className="text-[clamp(1rem,1.35vw,1.18rem)] font-extrabold">
              {item.title}
            </p>
            <p className="mt-2 text-[clamp(0.96rem,1.2vw,1.08rem)] font-semibold">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Feature Set",
    subtitle: "Most important features with numbered focus",
    theme: themes[5],
    body: (
      <div className="grid gap-5 md:grid-cols-2">
        {[
          {
            layer: "Feature 1 - Autonomous Page Flipping",
            name: "4-stage mechatronic cycle",
            desc: "Grip, hold, flip, and reset sequence is designed for repeatable page handling with minimal human intervention.",
            accent: "border-fuchsia-300 bg-fuchsia-50/60 text-fuchsia-950",
          },
          {
            layer: "Feature 2 - Synchronized Dual Capture",
            name: "Raspberry Pi + ADB trigger",
            desc: "Pi listens for CAPTURE command and triggers both phones to capture left and right pages in sync.",
            accent: "border-sky-300 bg-sky-50/60 text-sky-950",
          },
          {
            layer: "Feature 3 - Page Dewarp and Enhancement",
            name: "Curved to flat page transformation",
            desc: "Image preprocessing removes margins and curvature so models receive clean, readable page content.",
            accent: "border-emerald-300 bg-emerald-50/60 text-emerald-950",
          },
          {
            layer: "Feature 4 - Math Region Detection",
            name: "Faster R-CNN (ResNet50 + FPN)",
            desc: "Detector localizes equations from dense textbook layouts with strong precision and recall targets.",
            accent: "border-amber-300 bg-amber-50/60 text-amber-950",
          },
          {
            layer: "Feature 5 - LaTeX Generation",
            name: "TrOCR-based recognition",
            desc: "Detected formula crops are converted into editable LaTeX sequences for academic reuse.",
            accent: "border-violet-300 bg-violet-50/60 text-violet-950",
          },
          {
            layer: "Feature 6 - Real-time Dashboard",
            name: "Next.js presentation interface",
            desc: "Tracks pipeline status, shows outputs, and supports structured proposal-to-demo communication.",
            accent: "border-rose-300 bg-rose-50/60 text-rose-950",
          },
        ].map((item) => (
          <div
            key={item.layer}
            className={`rounded-2xl border p-5 ${item.accent}`}
          >
            <p className="text-[clamp(1.02rem,1.4vw,1.22rem)] font-extrabold">
              {item.layer}
            </p>
            <p className="text-[clamp(0.95rem,1.2vw,1.08rem)] font-bold">
              {item.name}
            </p>
            <p className="mt-1 text-[clamp(0.95rem,1.17vw,1.05rem)] font-semibold">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "System Architecture",
    subtitle: "Three-layer coordinated pipeline",
    theme: themes[0],
    body: (
      <div className="space-y-5">
        <div className="rounded-2xl border border-cyan-300 bg-cyan-50/65 p-4 text-[clamp(1rem,1.25vw,1.12rem)] font-semibold text-cyan-950">
          The architecture is organized as Muscle, Bridge, and Brain to separate
          physical actuation, communication, and intelligent processing
          responsibilities.
        </div>
        {[
          {
            layer: "Layer 1 - Muscle",
            name: "Arduino Mega 2560",
            desc: "Executes calibrated servo trajectories for gripper/flipper, controls fan relay events, and emits CAPTURE signal at the stable hold stage.",
          },
          {
            layer: "Layer 2 - Bridge",
            name: "Raspberry Pi 5",
            desc: "Receives serial trigger, issues synchronized ADB camera commands, manages orientation and naming, then transfers images to processing node.",
          },
          {
            layer: "Layer 3 - Brain",
            name: "Laptop Processing + Web",
            desc: "Runs crop/dewarp preprocessing, OCR extraction, Faster R-CNN detection, TrOCR LaTeX decoding, and dashboard-level output visualization.",
          },
        ].map((item) => (
          <div
            key={item.layer}
            className="rounded-2xl border border-cyan-300 bg-white/95 p-5"
          >
            <p className="text-[clamp(1.08rem,1.52vw,1.34rem)] font-extrabold text-slate-900">
              {item.layer}
            </p>
            <p className="text-[clamp(1rem,1.32vw,1.14rem)] font-bold text-slate-900">
              {item.name}
            </p>
            <p className="mt-2 text-[clamp(0.98rem,1.24vw,1.1rem)] font-semibold text-slate-800">
              {item.desc}
            </p>
          </div>
        ))}

        <div className="rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/70 p-4 text-[clamp(0.98rem,1.2vw,1.08rem)] font-semibold text-slate-800">
          Architecture flow: Arduino layer to Raspberry Pi bridge to Processing
          engine to Dashboard output.
        </div>
      </div>
    ),
  },
  {
    title: "Architecture Diagram",
    subtitle: "Full view from reference paper",
    theme: themes[5],
    body: (
      <div className="space-y-4">
        <div className="rounded-2xl border border-indigo-300 bg-indigo-50/60 p-4 text-[clamp(1rem,1.25vw,1.12rem)] font-semibold text-indigo-950">
          This figure presents the complete multi-layer architecture and
          communication path of the SmartScan system.
        </div>
        <div className="rounded-2xl border border-indigo-300 bg-white/95 p-3">
          <div className="grid items-center gap-3 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Image
                src="/architecture1.jpeg"
                alt="Architecture diagram part 1"
                width={900}
                height={1300}
                className="h-[64vh] w-full rounded-xl object-contain"
              />
            </div>
            <div className="flex items-center justify-center lg:col-span-2">
              <span className="text-4xl font-black text-indigo-700">-&gt;</span>
            </div>
            <div className="lg:col-span-5">
              <Image
                src="/architecture2.jpeg"
                alt="Architecture diagram part 2"
                width={900}
                height={1300}
                className="h-[64vh] w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Automation Flowchart",
    subtitle: "Control logic and process states",
    theme: themes[0],
    body: (
      <div className="space-y-4">
        <div className="rounded-2xl border border-cyan-300 bg-cyan-50/60 p-4 text-[clamp(1rem,1.25vw,1.12rem)] font-semibold text-cyan-950">
          This flowchart shows the operational sequence, state checks, and reset
          logic for the automated page-turning and capture process.
        </div>
        <div className="rounded-2xl border border-cyan-300 bg-white/95 p-3">
          <Image
            src="/system_flowchart.jpeg"
            alt="System flowchart with process decisions"
            width={900}
            height={1300}
            className="h-[72vh] w-full rounded-xl object-contain"
          />
        </div>
      </div>
    ),
  },
  {
    title: "AI Pipeline",
    subtitle: "Detection first, recognition next",
    theme: themes[1],
    body: (
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-300 bg-white/95 p-5">
          <p className="text-[clamp(1.05rem,1.45vw,1.25rem)] font-extrabold text-amber-950">
            Stage A: Faster R-CNN Detection
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[clamp(0.95rem,1.16vw,1.05rem)] font-semibold text-amber-900">
            <li>Locates mathematical expressions in dense textbook pages.</li>
            <li>Trained with full IBEM detection annotations.</li>
            <li>Outputs bounding boxes for targeted recognition.</li>
            <li>
              Backbone and FPN help robust detection at multiple formula scales.
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-300 bg-white/95 p-5">
          <p className="text-[clamp(1.05rem,1.45vw,1.25rem)] font-extrabold text-amber-950">
            Stage B: TrOCR Recognition
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[clamp(0.95rem,1.16vw,1.05rem)] font-semibold text-amber-900">
            <li>Converts detected formula image into LaTeX tokens.</li>
            <li>
              Fine-tuned with full Im2LaTeX dataset for stronger coverage.
            </li>
            <li>Produces editable output for reports and lecture notes.</li>
            <li>
              Supports rendered preview so faculty can verify semantic
              correctness quickly.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-white/95 p-3 lg:col-span-2">
          <p className="mb-2 text-[clamp(0.98rem,1.2vw,1.08rem)] font-bold text-amber-900">
            Detection output sample for presentation
          </p>
          <Image
            src="/detection.jpeg"
            alt="Detection result showing math regions"
            width={1400}
            height={850}
            className="h-[38vh] w-full rounded-xl object-contain md:h-[42vh]"
          />
          <p className="mt-2 text-[clamp(0.95rem,1.12vw,1.02rem)] font-semibold text-amber-900">
            Explain this as localization first, then crop each region and send
            to TrOCR for final LaTeX generation.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Dataset and Training Strategy",
    subtitle: "Full-data training for maximum model quality",
    theme: themes[2],
    body: (
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border border-violet-300 bg-white/95 p-5 lg:col-span-3">
          <p className="text-[clamp(1.02rem,1.4vw,1.22rem)] font-extrabold text-violet-950">
            Practical data plan
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[clamp(0.95rem,1.16vw,1.05rem)] font-semibold text-violet-900">
            <li>
              Full IBEM dataset for detection model training and validation.
            </li>
            <li>Full Im2LaTeX-100K for recognition model fine-tuning.</li>
            <li>Data augmentation for better robustness and generalization.</li>
            <li>Compute-aware schedule to complete within student timeline.</li>
            <li>
              Evaluation includes precision, recall, F1, and LaTeX output
              quality checks.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-violet-300 bg-white/95 p-5 lg:col-span-2">
          <p className="text-[clamp(1.02rem,1.35vw,1.16rem)] font-extrabold text-violet-950">
            Estimation snapshot
          </p>
          <p className="mt-2 text-[clamp(0.95rem,1.15vw,1.04rem)] font-semibold text-violet-900">
            Detection model uses complete available detection annotations.
          </p>
          <p className="mt-1 text-[clamp(0.95rem,1.15vw,1.04rem)] font-semibold text-violet-900">
            Recognition model uses complete paired formula and LaTeX data.
          </p>
          <p className="mt-3 text-[clamp(0.95rem,1.15vw,1.04rem)] font-semibold text-violet-900">
            This maximizes formula diversity and improves real-world
            generalization.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Expected Performance",
    subtitle: "Proposal target range",
    theme: themes[3],
    body: (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          [
            "Detection precision",
            "Paper 95.71 percent | Proposal target high 80s to low 90s",
          ],
          [
            "Detection recall",
            "Paper 91.77 percent | Proposal target mid 80s to around 90",
          ],
          [
            "Recognition quality",
            "Paper BLEU 86.44 | Proposal target usable LaTeX with strong BLEU trend",
          ],
          ["Cycle time", "Target: practical classroom throughput"],
          ["Inference speed", "Target: near real-time per page"],
          ["Budget", "Target: around 13K to 15K BDT total"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="rounded-2xl border border-emerald-300 bg-white/95 p-4"
          >
            <p className="text-[clamp(1rem,1.32vw,1.12rem)] font-extrabold text-emerald-950">
              {k}
            </p>
            <p className="mt-1 text-[clamp(0.95rem,1.16vw,1.04rem)] font-semibold text-emerald-900">
              {v}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Budget and Feasibility",
    subtitle: "Low cost by design",
    theme: themes[4],
    body: (
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-rose-300 bg-white/95 p-5 lg:col-span-2">
          <p className="text-[clamp(1.02rem,1.4vw,1.22rem)] font-extrabold text-rose-950">
            Cost optimization decisions
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[clamp(0.95rem,1.16vw,1.05rem)] font-semibold text-rose-900">
            <li>Use existing smartphones for camera system.</li>
            <li>Use local components and student-manufactured parts.</li>
            <li>Use modular architecture to reduce replacement cost risk.</li>
            <li>Focus on reproducibility in university lab environment.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-rose-300 bg-white/95 p-5">
          <p className="text-[clamp(1.02rem,1.35vw,1.16rem)] font-extrabold text-rose-950">
            Expected budget
          </p>
          <p className="mt-2 text-[clamp(1rem,1.45vw,1.3rem)] font-extrabold text-rose-950">
            Approximately 20,000 BDT (excluding Raspberry Pi 5)
          </p>
          <p className="mt-3 text-[clamp(0.95rem,1.15vw,1.02rem)] font-semibold text-rose-900">
            Cost remains significantly lower than commercial academic scanning
            systems.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Conclusion",
    subtitle: "Proposal summary",
    theme: themes[1],
    body: (
      <div className="space-y-5">
        <div className="rounded-2xl border border-amber-300 bg-white/95 p-6 text-[clamp(1.2rem,1.6vw,1.45rem)] font-semibold text-amber-900">
          SmartScan is a feasible, low-cost, and academically strong proposal
          that integrates embedded control, image processing, and deep learning
          for real textbook digitization with math-aware LaTeX output.
        </div>
        <div className="rounded-2xl border border-amber-300 bg-white/95 p-6 text-[clamp(1.2rem,1.6vw,1.45rem)] font-semibold text-amber-900">
          The architecture, roadmap, and risk strategy make it suitable for a
          structured university implementation timeline.
        </div>
      </div>
    ),
  },
  {
    title: "Thank You",
    subtitle: "Questions and feedback are welcome",
    theme: themes[2],
    body: (
      <div className="flex min-h-[56vh] items-center justify-center">
        <div className="w-full max-w-4xl rounded-2xl border border-violet-300 bg-white/95 p-8 text-center">
          <p className="text-[clamp(1.35rem,2vw,1.9rem)] font-extrabold text-violet-950">
            Team Extra Current
          </p>
          <p className="mt-3 text-[clamp(1.05rem,1.45vw,1.28rem)] font-semibold text-violet-900">
            Group 6 | CSE 4326 | SmartScan Proposal
          </p>
          <p className="mt-6 text-[clamp(1.05rem,1.45vw,1.28rem)] font-semibold text-violet-900">
            Thank you for your attention.
          </p>
        </div>
      </div>
    ),
  },
];

export default function SlidePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [pageInput, setPageInput] = useState("1");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideViewportRef = useRef<HTMLDivElement | null>(null);

  const totalSlides = slides.length;

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const goFirst = useCallback(() => {
    setCurrentSlide(0);
  }, []);

  const goLast = useCallback(() => {
    setCurrentSlide(totalSlides - 1);
  }, [totalSlides]);

  const goToPage = useCallback(
    (pageNumber: number) => {
      if (!Number.isInteger(pageNumber)) {
        return;
      }
      const zeroBased = pageNumber - 1;
      if (zeroBased < 0 || zeroBased >= totalSlides) {
        return;
      }
      setCurrentSlide(zeroBased);
    },
    [totalSlides],
  );

  const toggleFullscreen = useCallback(async () => {
    const target = slideViewportRef.current;
    if (!target) {
      return;
    }

    try {
      if (!document.fullscreenElement) {
        await target.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Browsers may block fullscreen if not user-triggered.
    }
  }, []);

  useEffect(() => {
    setPageInput(String(currentSlide + 1));
  }, [currentSlide]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(document.fullscreenElement === slideViewportRef.current);
    };

    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isTyping = tagName === "INPUT" || tagName === "TEXTAREA";
      if (isTyping) {
        return;
      }

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown": {
          event.preventDefault();
          goNext();
          break;
        }
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp": {
          event.preventDefault();
          goPrev();
          break;
        }
        case "Home": {
          event.preventDefault();
          goFirst();
          break;
        }
        case "End": {
          event.preventDefault();
          goLast();
          break;
        }
        case "f":
        case "F": {
          event.preventDefault();
          void toggleFullscreen();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goFirst, goLast, goNext, goPrev, toggleFullscreen]);

  const activeSlide = useMemo(() => slides[currentSlide], [currentSlide]);

  const onSubmitPageJump = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(pageInput);
    goToPage(parsed);
  };

  return (
    <div className={`min-h-screen ${activeSlide.theme.shell} text-slate-900`}>
      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1700px] flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl px-3 py-1 text-base font-bold ${activeSlide.theme.badge}`}
            >
              SmartScan Proposal Deck
            </div>
            <p className="text-[clamp(1rem,1.35vw,1.15rem)] font-semibold text-slate-700">
              Slide {currentSlide + 1} of {totalSlides}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={goFirst}
              disabled={currentSlide === 0}
              className="border-slate-300 bg-white/90 text-slate-900 hover:bg-slate-100"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={goPrev}
              disabled={currentSlide === 0}
              className="border-slate-300 bg-white/90 text-slate-900 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <form
              onSubmit={onSubmitPageJump}
              className="flex items-center gap-2"
            >
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value)}
                aria-label="Go to slide number"
                className="h-9 w-20 caret-transparent border-slate-300 bg-white/95 text-center text-base font-bold text-slate-900"
              />
              <Button
                type="submit"
                variant="outline"
                className="border-slate-300 bg-white/90 text-slate-900 hover:bg-slate-100"
              >
                Go
              </Button>
            </form>

            <Button
              type="button"
              variant="outline"
              onClick={goNext}
              disabled={currentSlide === totalSlides - 1}
              className="border-slate-300 bg-white/90 text-slate-900 hover:bg-slate-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={goLast}
              disabled={currentSlide === totalSlides - 1}
              className="border-slate-300 bg-white/90 text-slate-900 hover:bg-slate-100"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="mr-2 h-4 w-4" /> Exit Full Screen
                </>
              ) : (
                <>
                  <Expand className="mr-2 h-4 w-4" /> Full Screen
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1700px] px-5 pb-5 pt-4">
        <div
          ref={slideViewportRef}
          className={`relative ${isFullscreen ? `${activeSlide.theme.shell} h-screen w-screen p-4 md:p-6` : ""}`}
        >
          <AnimatePresence mode="wait">
            <motion.section
              key={currentSlide}
              initial={{ opacity: 0, y: 18, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.995 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className={`${isFullscreen ? "min-h-[calc(100vh-2rem)] rounded-2xl" : "min-h-[calc(100vh-155px)] rounded-3xl"} border ${activeSlide.theme.border} ${activeSlide.theme.panel} p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] md:p-10`}
            >
              <div className="mb-6 space-y-2">
                <h1
                  className={`text-[clamp(2.35rem,4.9vw,4.6rem)] font-black leading-[1.08] ${activeSlide.theme.heading}`}
                >
                  {activeSlide.title}
                </h1>
                {activeSlide.subtitle && (
                  <p
                    className={`text-[clamp(1.25rem,2.2vw,2rem)] font-bold ${activeSlide.theme.text}`}
                  >
                    {activeSlide.subtitle}
                  </p>
                )}
              </div>

              <div className="pb-2 [&_li]:text-[clamp(1.05rem,1.45vw,1.35rem)] [&_p]:text-[clamp(1.05rem,1.45vw,1.35rem)] [&_td]:text-[clamp(1rem,1.38vw,1.25rem)] [&_th]:text-[clamp(1rem,1.38vw,1.25rem)]">
                {activeSlide.body}
              </div>
            </motion.section>
          </AnimatePresence>

          {isFullscreen && (
            <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg bg-slate-900/80 px-3 py-2 text-sm font-bold text-white">
              Slide {currentSlide + 1} / {totalSlides}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <button
                key={slide.title}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`rounded-lg border px-3 py-2 text-base font-bold transition-colors ${
                  isActive
                    ? "border-slate-800 bg-slate-800 text-white"
                    : "border-slate-300 bg-white/90 text-slate-700 hover:bg-slate-100"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
