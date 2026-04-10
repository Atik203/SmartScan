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
  Sparkles,
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
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          {[
            "SmartScan is a low-cost mechatronic and AI system for digitizing academic books.",
            "The proposed pipeline is fully integrated: page handling, synchronized capture, image correction, and math-aware recognition.",
            "The core innovation is converting printed mathematical regions into reusable LaTeX, not just plain OCR text.",
          ].map((line) => (
            <div
              key={line}
              className="rounded-2xl border border-amber-300 bg-white/95 p-4 text-[clamp(1.03rem,1.45vw,1.4rem)] font-semibold text-amber-950"
            >
              {line}
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-amber-300 bg-white/95 p-5 lg:col-span-2">
          <p className="text-[clamp(1rem,1.45vw,1.25rem)] font-extrabold text-amber-950">
            Visual Placeholder
          </p>
          <div className="mt-3 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-[clamp(0.95rem,1.2vw,1.05rem)] font-semibold text-amber-900">
            Add a high-quality system image here (hardware + software dashboard)
            for strong first impression.
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Expected Prototype",
    subtitle: "Reference design view from paper",
    theme: themes[5],
    body: (
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border border-indigo-300 bg-white/95 p-5 lg:col-span-3">
          <p className="text-[clamp(1rem,1.4vw,1.22rem)] font-extrabold text-indigo-950">
            Prototype expectation
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[clamp(0.95rem,1.16vw,1.05rem)] font-semibold text-indigo-900">
            <li>
              This figure summarizes the expected physical and pipeline setup.
            </li>
            <li>
              It includes four visual views from the reference paper in one
              frame.
            </li>
            <li>
              This helps faculty quickly understand mechanical and system scope.
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-indigo-300 bg-white/95 p-3 lg:col-span-2">
          <Image
            src="/image.png"
            alt="Expected prototype collage from research paper"
            width={1400}
            height={1000}
            className="h-full w-full rounded-xl object-contain"
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
            b: "Traditional scanning is slow and impractical for full semester books.",
          },
          {
            h: "Book safety is poor",
            b: "Flatbed pressure can damage binding and spine, especially for thicker books.",
          },
          {
            h: "Commercial systems are costly",
            b: "Professional scanners are expensive for student lab environments.",
          },
          {
            h: "Math OCR quality is weak",
            b: "Generic OCR tools lose equation structure and cannot produce quality LaTeX.",
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
            ],
          },
          {
            h: "Practical value",
            points: [
              "Supports low-cost digitization for engineering and mathematics content.",
              "Preserves books while making knowledge reusable.",
            ],
          },
          {
            h: "Research value",
            points: [
              "Extends IEEE paper idea with modern web-based monitoring and presentation.",
              "Builds foundation for future handwriting and multilingual support.",
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
          "Design a safe V-cradle with page-flip mechanism.",
          "Control multi-servo motion with Arduino Mega.",
          "Trigger dual smartphone capture via Raspberry Pi bridge.",
          "Implement crop and dewarp pipeline for page correction.",
          "Train Faster R-CNN for equation region detection.",
          "Fine-tune TrOCR for math image to LaTeX conversion.",
          "Build a modern web UI for status and output review.",
          "Establish measurable performance targets and feasibility.",
        ].map((item, index) => (
          <div
            key={item}
            className="rounded-2xl border border-rose-300 bg-white/95 p-4"
          >
            <p className="text-[clamp(0.98rem,1.28vw,1.12rem)] font-extrabold text-rose-950">
              Objective {index + 1}
            </p>
            <p className="mt-1 text-[clamp(0.95rem,1.17vw,1.06rem)] font-semibold text-rose-900">
              {item}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "System Architecture",
    subtitle: "Three-layer coordinated pipeline",
    theme: themes[5],
    body: (
      <div className="space-y-4">
        {[
          {
            layer: "Layer 1 - Muscle",
            name: "Arduino Mega 2560",
            desc: "Controls gripper and flipper servos, handles relay logic, emits CAPTURE signal.",
          },
          {
            layer: "Layer 2 - Bridge",
            name: "Raspberry Pi 5",
            desc: "Receives CAPTURE event, runs ADB camera trigger, pulls and forwards images.",
          },
          {
            layer: "Layer 3 - Brain",
            name: "Laptop Processing + Web",
            desc: "Executes dewarp, OCR, Faster R-CNN, TrOCR, and dashboard presentation workflow.",
          },
        ].map((item) => (
          <div
            key={item.layer}
            className="rounded-2xl border border-indigo-300 bg-white/95 p-5"
          >
            <p className="text-[clamp(1.02rem,1.4vw,1.22rem)] font-extrabold text-indigo-950">
              {item.layer}
            </p>
            <p className="text-[clamp(0.95rem,1.2vw,1.08rem)] font-bold text-indigo-900">
              {item.name}
            </p>
            <p className="mt-1 text-[clamp(0.95rem,1.17vw,1.05rem)] font-semibold text-indigo-900">
              {item.desc}
            </p>
          </div>
        ))}

        <div className="rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/70 p-4 text-[clamp(0.95rem,1.12vw,1.02rem)] font-semibold text-indigo-900">
          Add architecture block image here for visual flow: Arduino to
          Raspberry Pi to Processing Engine to Dashboard.
        </div>
      </div>
    ),
  },
  {
    title: "Feature Set",
    subtitle: "What makes SmartScan presentation-ready",
    theme: themes[0],
    body: (
      <div className="grid gap-5 md:grid-cols-2">
        {[
          [
            "Autonomous page turning",
            "Repeatable grip-hold-flip-reset cycle designed for stable operation.",
          ],
          [
            "Synchronized dual camera capture",
            "Both pages are captured with low-cost smartphone setup using ADB.",
          ],
          [
            "Image quality correction",
            "Crop and dewarp steps convert curved pages to clean model input.",
          ],
          [
            "Math-aware extraction",
            "Equation detection and LaTeX conversion preserve structure and usability.",
          ],
        ].map(([title, desc]) => (
          <div
            key={title}
            className="rounded-2xl border border-cyan-300 bg-white/95 p-5"
          >
            <p className="text-[clamp(1rem,1.38vw,1.2rem)] font-extrabold text-slate-900">
              {title}
            </p>
            <p className="mt-2 text-[clamp(0.95rem,1.18vw,1.05rem)] font-semibold text-slate-800">
              {desc}
            </p>
          </div>
        ))}
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
            <li>Fine-tuned using IBEM subset for proposal feasibility.</li>
            <li>Outputs bounding boxes for targeted recognition.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-300 bg-white/95 p-5">
          <p className="text-[clamp(1.05rem,1.45vw,1.25rem)] font-extrabold text-amber-950">
            Stage B: TrOCR Recognition
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[clamp(0.95rem,1.16vw,1.05rem)] font-semibold text-amber-900">
            <li>Converts detected formula image into LaTeX tokens.</li>
            <li>Fine-tuned using Im2LaTeX subset to manage training cost.</li>
            <li>Produces editable output for reports and lecture notes.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 p-4 text-[clamp(0.95rem,1.12vw,1.02rem)] font-semibold text-amber-900 lg:col-span-2">
          Add visual pipeline strip here: Raw page to Dewarped page to Detection
          boxes to Formula crops to LaTeX output.
        </div>
      </div>
    ),
  },
  {
    title: "Dataset and Training Strategy",
    subtitle: "Balanced for limited compute and strong output",
    theme: themes[2],
    body: (
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border border-violet-300 bg-white/95 p-5 lg:col-span-3">
          <p className="text-[clamp(1.02rem,1.4vw,1.22rem)] font-extrabold text-violet-950">
            Practical data plan
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[clamp(0.95rem,1.16vw,1.05rem)] font-semibold text-violet-900">
            <li>IBEM subset for detection model training and validation.</li>
            <li>Im2LaTeX subset for recognition model fine-tuning.</li>
            <li>Data augmentation for better robustness and generalization.</li>
            <li>Compute-aware schedule to complete within student timeline.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-violet-300 bg-white/95 p-5 lg:col-span-2">
          <p className="text-[clamp(1.02rem,1.35vw,1.16rem)] font-extrabold text-violet-950">
            Estimation snapshot
          </p>
          <p className="mt-2 text-[clamp(0.95rem,1.15vw,1.04rem)] font-semibold text-violet-900">
            Detection data: about 10 percent IBEM.
          </p>
          <p className="mt-1 text-[clamp(0.95rem,1.15vw,1.04rem)] font-semibold text-violet-900">
            Recognition data: about 10 percent Im2LaTeX-100K.
          </p>
          <p className="mt-3 text-[clamp(0.95rem,1.15vw,1.04rem)] font-semibold text-violet-900">
            This preserves proposal feasibility while keeping architecture
            identical to full-scale training.
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
          ["Detection precision", "Target: high 80s to low 90s"],
          ["Detection recall", "Target: mid 80s to around 90"],
          ["Recognition quality", "Target: usable LaTeX with solid BLEU trend"],
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
            Total plan
          </p>
          <p className="mt-2 text-[clamp(1rem,1.45vw,1.3rem)] font-extrabold text-rose-950">
            Approximately 13,250 BDT
          </p>
          <p className="mt-3 text-[clamp(0.95rem,1.15vw,1.02rem)] font-semibold text-rose-900">
            Strong value compared with commercial alternatives.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Implementation Roadmap",
    subtitle: "Structured week-by-week execution",
    theme: themes[5],
    body: (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Week 1-2", "Mechanical build, wiring, and Arduino calibration"],
          [
            "Week 3",
            "Pi bridge, synchronized camera trigger, transfer scripts",
          ],
          ["Week 4", "Image crop and dewarp processing pipeline"],
          ["Week 5", "Faster R-CNN training and detection validation"],
          ["Week 6", "TrOCR fine-tuning and LaTeX output checks"],
          ["Week 7", "Web dashboard integration and end-to-end test"],
          ["Week 8", "Final verification, report, and presentation prep"],
          ["Buffer", "Risk handling for hardware and timing uncertainty"],
        ].map(([week, task]) => (
          <div
            key={week}
            className="rounded-2xl border border-indigo-300 bg-white/95 p-4"
          >
            <p className="text-[clamp(1rem,1.3vw,1.12rem)] font-extrabold text-indigo-950">
              {week}
            </p>
            <p className="mt-1 text-[clamp(0.95rem,1.15vw,1.04rem)] font-semibold text-indigo-900">
              {task}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Risk Management",
    subtitle: "Prepared for proposal and demo uncertainty",
    theme: themes[0],
    body: (
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          {
            h: "Hardware jam risk",
            p: "Pause and reset control path, timing tuning, and staged movement diagnostics.",
          },
          {
            h: "Capture sync risk",
            p: "Serial event logging and fallback recapture procedure for page-level consistency.",
          },
          {
            h: "Model accuracy risk",
            p: "Incremental retraining and focused augmentation on difficult formula patterns.",
          },
          {
            h: "Demo readiness risk",
            p: "Backup assets: recorded hardware run and offline inference demonstration set.",
          },
          {
            h: "Time risk",
            p: "Parallel team ownership by subsystem and weekly milestone checkpoints.",
          },
          {
            h: "Integration risk",
            p: "Defined data handoff format and directory structure across all modules.",
          },
        ].map((item) => (
          <div
            key={item.h}
            className="rounded-2xl border border-cyan-300 bg-white/95 p-5"
          >
            <p className="text-[clamp(1rem,1.35vw,1.17rem)] font-extrabold text-slate-900">
              {item.h}
            </p>
            <p className="mt-2 text-[clamp(0.95rem,1.14vw,1.02rem)] font-semibold text-slate-800">
              {item.p}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Conclusion",
    subtitle: "Proposal summary",
    theme: themes[1],
    body: (
      <div className="space-y-5">
        <div className="rounded-2xl border border-amber-300 bg-white/95 p-5 text-[clamp(1rem,1.3vw,1.12rem)] font-semibold text-amber-900">
          SmartScan is a feasible, low-cost, and academically strong proposal
          that integrates embedded control, image processing, and deep learning
          for real textbook digitization with math-aware LaTeX output.
        </div>
        <div className="rounded-2xl border border-amber-300 bg-white/95 p-5 text-[clamp(1rem,1.3vw,1.12rem)] font-semibold text-amber-900">
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
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-violet-300 bg-white/95 p-6 lg:col-span-3">
          <p className="text-[clamp(1.1rem,1.6vw,1.45rem)] font-extrabold text-violet-950">
            Team Extra Current
          </p>
          <p className="mt-2 text-[clamp(0.95rem,1.2vw,1.08rem)] font-semibold text-violet-900">
            Group 6 | CSE 4326 | SmartScan Proposal
          </p>
          <p className="mt-5 text-[clamp(0.95rem,1.15vw,1.02rem)] font-semibold text-violet-900">
            Please provide your images later and they can be inserted in the
            placeholder sections for a polished final delivery.
          </p>
        </div>
        <div className="rounded-2xl border border-violet-300 bg-violet-50/75 p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-700" />
            <p className="text-[clamp(1rem,1.35vw,1.2rem)] font-extrabold text-violet-950">
              Ready for presentation
            </p>
          </div>
          <p className="mt-4 text-[clamp(0.95rem,1.15vw,1.02rem)] font-semibold text-violet-900">
            Use arrow keys, page input, or fullscreen controls during live
            projection.
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
              className={`rounded-xl px-3 py-1 text-sm font-bold ${activeSlide.theme.badge}`}
            >
              SmartScan Proposal Deck
            </div>
            <p className="text-[clamp(0.92rem,1.2vw,1rem)] font-semibold text-slate-700">
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
                className="h-9 w-20 border-slate-300 bg-white/95 text-center text-base font-bold text-slate-900"
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
                  className={`text-[clamp(2rem,4.2vw,4rem)] font-black leading-[1.08] ${activeSlide.theme.heading}`}
                >
                  {activeSlide.title}
                </h1>
                {activeSlide.subtitle && (
                  <p
                    className={`text-[clamp(1rem,1.8vw,1.6rem)] font-bold ${activeSlide.theme.text}`}
                  >
                    {activeSlide.subtitle}
                  </p>
                )}
              </div>

              <div className="pb-2">{activeSlide.body}</div>
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
                className={`rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
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

        <p className="mt-3 text-sm font-semibold text-slate-700">
          Keyboard: Left and Right arrows, Up and Down arrows, PageUp, PageDown,
          Home, End, F for full screen
        </p>
      </main>
    </div>
  );
}
