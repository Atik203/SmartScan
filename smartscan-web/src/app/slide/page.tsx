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
  { name: "Md. Atikur Rahaman (Team Leader)", id: "011-231-0298" },
  { name: "Md. Sarowar Alam Sourov", id: "011-231-0302" },
  { name: "Abdullah Al Noor", id: "011-231-0479" },
  { name: "Md. Salman Rohoman Nayeem", id: "011-231-0484" },
  { name: "Pratay Paul", id: "011-231-0163" },
];

const themes: SlideTheme[] = [
  {
    // Deep Ocean Blue — Title, Architecture, Flowchart
    shell:
      "bg-[radial-gradient(ellipse_at_top_left,#0369a1_0%,#075985_40%,#0c4a6e_100%)]",
    panel: "bg-white/98",
    heading: "text-sky-900",
    text: "text-sky-800",
    badge: "bg-sky-600 text-white",
    border: "border-sky-500",
  },
  {
    // Deep Ember Gold — Introduction, AI Pipeline, Conclusion
    shell:
      "bg-[radial-gradient(ellipse_at_top_right,#b45309_0%,#92400e_40%,#78350f_100%)]",
    panel: "bg-white/98",
    heading: "text-amber-900",
    text: "text-amber-800",
    badge: "bg-amber-600 text-white",
    border: "border-amber-500",
  },
  {
    // Deep Royal Violet — Problem Statement, Dataset
    shell:
      "bg-[radial-gradient(ellipse_at_top_left,#7c3aed_0%,#6d28d9_40%,#4c1d95_100%)]",
    panel: "bg-white/98",
    heading: "text-violet-900",
    text: "text-violet-800",
    badge: "bg-violet-600 text-white",
    border: "border-violet-500",
  },
  {
    // Deep Forest Emerald — Motivation, Performance
    shell:
      "bg-[radial-gradient(ellipse_at_top_right,#059669_0%,#047857_40%,#065f46_100%)]",
    panel: "bg-white/98",
    heading: "text-emerald-900",
    text: "text-emerald-800",
    badge: "bg-emerald-600 text-white",
    border: "border-emerald-500",
  },
  {
    // Deep Crimson Rose — Objectives, Budget
    shell:
      "bg-[radial-gradient(ellipse_at_top_left,#e11d48_0%,#be123c_40%,#9f1239_100%)]",
    panel: "bg-white/98",
    heading: "text-rose-900",
    text: "text-rose-800",
    badge: "bg-rose-600 text-white",
    border: "border-rose-500",
  },
  {
    // Deep Midnight Indigo — Features, Architecture Diagram, Prototype
    shell:
      "bg-[radial-gradient(ellipse_at_top_right,#4f46e5_0%,#4338ca_40%,#3730a3_100%)]",
    panel: "bg-white/98",
    heading: "text-indigo-900",
    text: "text-indigo-800",
    badge: "bg-indigo-600 text-white",
    border: "border-indigo-500",
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
          <div className="rounded-2xl border border-sky-500 bg-sky-100/90 p-5 lg:col-span-2">
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
          <div className="rounded-2xl border border-sky-500 bg-white/90 p-5">
            <p className="text-[clamp(1rem,1.5vw,1.25rem)] font-bold text-slate-900">
              Team: Phantom Devs
            </p>
            <p className="mt-2 text-[clamp(1rem,1.5vw,1.25rem)] font-bold text-slate-900">
              Group No: 06
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-sky-500 bg-white/98 p-4">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="border border-sky-500 bg-sky-100 p-3 text-[clamp(1.1rem,1.45vw,1.3rem)] font-extrabold text-slate-900">
                  No.
                </th>
                <th className="border border-sky-500 bg-sky-100 p-3 text-[clamp(1.1rem,1.45vw,1.3rem)] font-extrabold text-slate-900">
                  Name
                </th>
                <th className="border border-sky-500 bg-sky-100 p-3 text-[clamp(1.1rem,1.45vw,1.3rem)] font-extrabold text-slate-900">
                  Student ID
                </th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member, index) => (
                <tr key={member.id}>
                  <td className="border border-sky-400 p-3 text-[clamp(1.1rem,1.45vw,1.3rem)] font-semibold text-slate-800">
                    {index + 1}
                  </td>
                  <td className="border border-sky-400 p-3 text-[clamp(1.1rem,1.45vw,1.3rem)] font-semibold text-slate-800">
                    {member.name}
                  </td>
                  <td className="border border-sky-400 p-3 text-[clamp(1.1rem,1.45vw,1.3rem)] font-semibold text-slate-800">
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
            className="rounded-2xl border border-amber-500 bg-white/98 p-4 text-[clamp(1.18rem,1.52vw,1.48rem)] font-semibold text-amber-950"
          >
            {line}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Expected Prototype",
    subtitle: "4-stage page-flip cycle from the reference system",
    theme: themes[5],
    body: (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            {
              n: "Stage 1",
              label: "Resting / Ready",
              desc: "Gripper and flipper arms at home position. Book open on V-cradle.",
            },
            {
              n: "Stage 2",
              label: "Gripper Down",
              desc: "Gripper servo lowers to isolate and hold a single page edge.",
            },
            {
              n: "Stage 3",
              label: "Flip in Progress",
              desc: "Blower fan activates; flipper arm lifts and turns the isolated page.",
            },
            {
              n: "Stage 4",
              label: "Return & Capture",
              desc: "Arms reset. Pi triggers both cameras via ADB for synchronized capture.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-indigo-500 bg-indigo-100/80 p-3"
            >
              <p className="text-[clamp(1.1rem,1.4vw,1.28rem)] font-extrabold text-indigo-800">
                {s.n} — {s.label}
              </p>
              <p className="mt-1 text-[clamp(1.05rem,1.3vw,1.18rem)] font-semibold text-indigo-900">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-indigo-500 bg-white/98 p-2">
          <Image
            src="/image.png"
            alt="4-stage page flip physical prototype"
            width={1400}
            height={1000}
            className="h-[46vh] w-full rounded-xl object-contain"
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
            className="rounded-2xl border border-violet-500 bg-white/98 p-5"
          >
            <p className="text-[clamp(1.05rem,1.5vw,1.35rem)] font-extrabold text-violet-950">
              {item.h}
            </p>
            <p className="mt-2 text-[clamp(1.18rem,1.42vw,1.35rem)] font-semibold text-violet-900">
              {item.b}
            </p>
            <p className="mt-2 text-[clamp(1.18rem,1.42vw,1.35rem)] font-bold text-violet-950">
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
            className="rounded-2xl border border-emerald-500 bg-white/98 p-5"
          >
            <p className="text-[clamp(1.05rem,1.45vw,1.3rem)] font-extrabold text-emerald-950">
              {item.h}
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[clamp(1.18rem,1.42vw,1.35rem)] font-semibold text-emerald-900">
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
            accent: "border-rose-500 bg-rose-100 text-rose-950",
          },
          {
            title: "Objective 2 - Embedded Control and Capture Sync",
            detail:
              "Implement Arduino-based servo control and synchronized dual-camera capture using Raspberry Pi bridge communication.",
            accent: "border-orange-500 bg-orange-100 text-orange-950",
          },
          {
            title: "Objective 3 - Image and AI Processing Pipeline",
            detail:
              "Run preprocessing, math region detection, and LaTeX recognition in an integrated pipeline suitable for academic documents.",
            accent: "border-amber-500 bg-amber-100 text-amber-950",
          },
          {
            title: "Objective 4 - Web-based Monitoring and Results",
            detail:
              "Provide clear dashboard views for processing status, detection outputs, and formula rendering for presentation and validation.",
            accent: "border-fuchsia-500 bg-fuchsia-100 text-fuchsia-950",
          },
          {
            title: "Objective 5 - Feasibility and Performance Validation",
            detail:
              "Demonstrate practical accuracy, throughput, and budget feasibility with complete data-driven evaluation.",
            accent: "border-violet-500 bg-violet-100 text-violet-950",
          },
        ].map((item) => (
          <div
            key={item.title}
            className={`rounded-2xl border p-5 ${item.accent}`}
          >
            <p className="text-[clamp(1rem,1.35vw,1.18rem)] font-extrabold">
              {item.title}
            </p>
            <p className="mt-2 text-[clamp(1.18rem,1.42vw,1.35rem)] font-semibold">
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
            accent: "border-fuchsia-500 bg-fuchsia-100 text-fuchsia-950",
          },
          {
            layer: "Feature 2 - Synchronized Dual Capture",
            name: "Raspberry Pi + ADB trigger",
            desc: "Pi listens for CAPTURE command and triggers both phones to capture left and right pages in sync.",
            accent: "border-sky-500 bg-sky-100 text-sky-950",
          },
          {
            layer: "Feature 3 - Page Dewarp and Enhancement",
            name: "Curved to flat page transformation",
            desc: "Image preprocessing removes margins and curvature so models receive clean, readable page content.",
            accent: "border-emerald-500 bg-emerald-100 text-emerald-950",
          },
          {
            layer: "Feature 4 - Math Region Detection",
            name: "Faster R-CNN (ResNet50 + FPN)",
            desc: "Detector localizes equations from dense textbook layouts with strong precision and recall targets.",
            accent: "border-amber-500 bg-amber-100 text-amber-950",
          },
          {
            layer: "Feature 5 - LaTeX Generation",
            name: "TrOCR-based recognition",
            desc: "Detected formula crops are converted into editable LaTeX sequences for academic reuse.",
            accent: "border-violet-500 bg-violet-100 text-violet-950",
          },
          {
            layer: "Feature 6 - Real-time Dashboard",
            name: "Next.js presentation interface",
            desc: "Tracks pipeline status, shows outputs, and supports structured proposal-to-demo communication.",
            accent: "border-rose-500 bg-rose-100 text-rose-950",
          },
        ].map((item) => (
          <div
            key={item.layer}
            className={`rounded-2xl border p-5 ${item.accent}`}
          >
            <p className="text-[clamp(1.02rem,1.4vw,1.22rem)] font-extrabold">
              {item.layer}
            </p>
            <p className="text-[clamp(1.18rem,1.42vw,1.35rem)] font-bold">
              {item.name}
            </p>
            <p className="mt-1 text-[clamp(1.18rem,1.42vw,1.35rem)] font-semibold">
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
        <div className="rounded-2xl border border-sky-500 bg-sky-100/80 p-4 text-[clamp(1.18rem,1.42vw,1.35rem)] font-semibold text-cyan-950">
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
            className="rounded-2xl border border-sky-500 bg-white/98 p-5"
          >
            <p className="text-[clamp(1.08rem,1.52vw,1.34rem)] font-extrabold text-slate-900">
              {item.layer}
            </p>
            <p className="text-[clamp(1rem,1.32vw,1.14rem)] font-bold text-slate-900">
              {item.name}
            </p>
            <p className="mt-2 text-[clamp(1.18rem,1.42vw,1.35rem)] font-semibold text-slate-800">
              {item.desc}
            </p>
          </div>
        ))}

        <div className="rounded-2xl border border-dashed border-sky-500 bg-sky-100/80 p-4 text-[clamp(1.18rem,1.42vw,1.35rem)] font-semibold text-slate-800">
          Architecture flow: Arduino layer to Raspberry Pi bridge to Processing
          engine to Dashboard output.
        </div>
      </div>
    ),
  },
  {
    title: "Architecture Diagram",
    subtitle: "Detection framework → Recognition & extraction pipeline",
    theme: themes[5],
    body: (
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-indigo-500 bg-indigo-100/80 px-4 py-2">
            <p className="text-[clamp(1.12rem,1.42vw,1.3rem)] font-extrabold text-indigo-900">
              Left — Expression Detection
            </p>
            <p className="text-[clamp(1.05rem,1.28vw,1.18rem)] font-semibold text-indigo-800">
              Input image → Faster R-CNN (ResNet-50 + FPN + RPN + RoI Pooling) →
              bounding boxes. Text regions masked for OCR via deep LSTM
              transcription layer.
            </p>
          </div>
          <div className="rounded-xl border border-indigo-500 bg-indigo-100/80 px-4 py-2">
            <p className="text-[clamp(1.12rem,1.42vw,1.3rem)] font-extrabold text-indigo-900">
              Right — Recognition & Extraction
            </p>
            <p className="text-[clamp(1.05rem,1.28vw,1.18rem)] font-semibold text-indigo-800">
              Detected crop → Vision Transformer Encoder + Transformer Decoder →
              LaTeX tokens. Output panel shows embedded and isolated formula
              classes on web server.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-indigo-500 bg-white/98 p-2">
          <div className="grid items-center gap-2 lg:grid-cols-11">
            <div className="lg:col-span-5">
              <Image
                src="/architecture1.jpeg"
                alt="Faster R-CNN detection framework and text detection"
                width={900}
                height={1300}
                className="h-[48vh] w-full rounded-xl object-contain"
              />
            </div>
            <div className="flex flex-col items-center justify-center gap-1 lg:col-span-1">
              <span className="text-3xl font-black text-indigo-600">→</span>
              <span className="text-center text-base font-bold text-indigo-600">
                detected crops
              </span>
            </div>
            <div className="lg:col-span-5">
              <Image
                src="/architecture2.jpeg"
                alt="TrOCR recognition framework and extraction output"
                width={900}
                height={1300}
                className="h-[48vh] w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Automation Flowchart",
    subtitle: "Arduino control loop — calibrate, automate, cycle, reset",
    theme: themes[0],
    body: (
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          {[
            {
              label: "Calibration Phase",
              color: "border-sky-500 bg-sky-100",
              text: "text-sky-900",
              desc: "Set Gripper POS1 & POS2, then Flipper POS1 & POS2 using potentiometer. Both positions must be saved before automation starts.",
            },
            {
              label: "Automation Loop",
              color: "border-emerald-500 bg-emerald-100",
              text: "text-emerald-900",
              desc: "Page Gripper grips one page → Pi triggers ADB camera capture → images sent to laptop for preprocessing and AI detection.",
            },
            {
              label: "Flipper Mechanism",
              color: "border-amber-500 bg-amber-100",
              text: "text-amber-900",
              desc: "PC fan activates near end of flip to separate pages. Fan turns off on return. Loop continues until reset is pressed.",
            },
            {
              label: "Reset Condition",
              color: "border-rose-500 bg-rose-100",
              text: "text-rose-900",
              desc: "If reset button pressed → stop all motion and erase saved positions. Otherwise continue cycle automatically.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border px-4 py-3 ${item.color}`}
            >
              <p
                className={`text-[clamp(1.1rem,1.38vw,1.25rem)] font-extrabold ${item.text}`}
              >
                {item.label}
              </p>
              <p
                className={`mt-1 text-[clamp(1.05rem,1.28vw,1.18rem)] font-semibold ${item.text}`}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-sky-500 bg-white/98 p-2 lg:col-span-2">
          <Image
            src="/system_flowchart.jpeg"
            alt="Arduino control flowchart"
            width={900}
            height={1300}
            className="h-[62vh] w-full rounded-xl object-contain"
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
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-500 bg-white/98 p-3">
          <p className="text-[clamp(1.05rem,1.45vw,1.25rem)] font-extrabold text-amber-950">
            Stage A: Faster R-CNN Detection
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[clamp(1.1rem,1.32vw,1.22rem)] font-semibold text-amber-900">
            <li>Locates mathematical expressions in dense textbook pages.</li>
            <li>Trained with full IBEM detection annotations.</li>
            <li>Outputs bounding boxes for targeted recognition.</li>
            <li>ResNet-50 + FPN backbone for multi-scale formula detection.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-500 bg-white/98 p-3">
          <p className="text-[clamp(1.05rem,1.45vw,1.25rem)] font-extrabold text-amber-950">
            Stage B: TrOCR Recognition
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[clamp(1.1rem,1.32vw,1.22rem)] font-semibold text-amber-900">
            <li>Converts detected formula image into LaTeX tokens.</li>
            <li>Fine-tuned with full Im2LaTeX dataset for stronger coverage.</li>
            <li>Produces editable output for reports and lecture notes.</li>
            <li>Rendered preview lets faculty verify output quickly.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-500 bg-white/98 p-3 lg:col-span-2">
          <p className="mb-1 text-[clamp(1.1rem,1.32vw,1.22rem)] font-bold text-amber-900">
            End-to-end pipeline — 5 stages on a real textbook page
          </p>
          <Image
            src="/detection.jpeg"
            alt="5-stage pipeline: original → cropped → dewarped → detected → extracted"
            width={1400}
            height={850}
            className="h-[30vh] w-full rounded-xl object-contain"
          />
          <div className="mt-1 grid grid-cols-5 gap-1">
            {[
              "① Original",
              "② Cropped",
              "③ Dewarped",
              "④ Text + Math Detected",
              "⑤ Math Extracted",
            ].map((s) => (
              <p
                key={s}
                className="rounded-lg bg-amber-100 px-1 py-1 text-center text-[clamp(0.82rem,0.95vw,0.92rem)] font-bold text-amber-900 leading-tight"
              >
                {s}
              </p>
            ))}
          </div>
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
        <div className="rounded-2xl border border-violet-500 bg-white/98 p-5 lg:col-span-3">
          <p className="text-[clamp(1.02rem,1.4vw,1.22rem)] font-extrabold text-violet-950">
            Practical data plan
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[clamp(1.18rem,1.42vw,1.35rem)] font-semibold text-violet-900">
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

        <div className="rounded-2xl border border-violet-500 bg-white/98 p-5 lg:col-span-2">
          <p className="text-[clamp(1.02rem,1.35vw,1.16rem)] font-extrabold text-violet-950">
            Estimation snapshot
          </p>
          <p className="mt-2 text-[clamp(1.18rem,1.42vw,1.35rem)] font-semibold text-violet-900">
            Detection model uses complete available detection annotations.
          </p>
          <p className="mt-1 text-[clamp(1.18rem,1.42vw,1.35rem)] font-semibold text-violet-900">
            Recognition model uses complete paired formula and LaTeX data.
          </p>
          <p className="mt-3 text-[clamp(1.18rem,1.42vw,1.35rem)] font-semibold text-violet-900">
            This maximizes formula diversity and improves real-world
            generalization.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Expected Performance",
    subtitle: "Proposal target metrics vs. IEEE paper baseline",
    theme: themes[3],
    body: (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          [
            "Detection Precision",
            "Paper: 95.71% — Our target: 88–92% (trained on 10% IBEM subset)",
          ],
          ["Detection Recall", "Paper: 91.77% — Our target: 85–90%"],
          [
            "Recognition BLEU Score",
            "Paper: 86.44 — Our target: 78–83 (10% Im2LaTeX-100K)",
          ],
          [
            "Page Cycle Time",
            "Paper: 10–12 sec/page — Our target: 12–15 sec/page",
          ],
          [
            "Inference Latency",
            "Paper: ~0.34 sec/image — Our target: ~0.5 sec/image",
          ],
          [
            "Page Throughput",
            "Paper: 300–400 pages/hr — Our target: 200–300 pages/hr",
          ],
        ].map(([k, v]) => (
          <div
            key={k}
            className="rounded-2xl border border-emerald-500 bg-white/98 p-4"
          >
            <p className="text-[clamp(1.12rem,1.38vw,1.25rem)] font-extrabold text-emerald-950">
              {k}
            </p>
            <p className="mt-1 text-[clamp(1.12rem,1.38vw,1.25rem)] font-semibold text-emerald-900">
              {v}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Budget and Feasibility",
    subtitle: "~20,000 BDT total — far below commercial alternatives",
    theme: themes[4],
    body: (
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-rose-500 bg-white/98 p-5 lg:col-span-2">
          <p className="mb-3 text-[clamp(1.12rem,1.45vw,1.3rem)] font-extrabold text-rose-950">
            Components used
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Arduino Mega 2560",
              "Raspberry Pi 5 (8GB)",
              "MG996R Servo Motors ×4",
              "6000 RPM Blower Fan",
              "PC Fan (80mm)",
              "5V DC Relay Module",
              "LM2596 Buck Converter",
              "500W SMPS Power Supply",
              "V-Cradle Wooden Frame",
              "3D Printed PLA+ Parts",
              "Android Smartphones ×2",
              "Wires, Potentiometers, LEDs",
            ].map((c) => (
              <span
                key={c}
                className="rounded-full border border-rose-400 bg-rose-50 px-4 py-2 text-[clamp(1.05rem,1.28vw,1.18rem)] font-semibold text-rose-900"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-4 rounded-2xl border border-rose-500 bg-white/98 p-5">
          <div className="rounded-xl border border-rose-400 bg-rose-100 p-4 text-center">
            <p className="text-[clamp(1rem,1.35vw,1.18rem)] font-extrabold text-rose-950">
              Total Estimated Cost
            </p>
            <p className="mt-1 text-[clamp(1.8rem,2.5vw,2.4rem)] font-black text-rose-700">
              ~20,000 BDT
            </p>
            <p className="mt-1 text-[clamp(1rem,1.2vw,1.1rem)] font-semibold text-rose-800">
              (≈ $180 USD)
            </p>
          </div>
          <p className="text-[clamp(1.1rem,1.35vw,1.22rem)] font-semibold text-rose-900">
            Commercial academic scanners cost $5,000–$50,000+. SmartScan
            delivers the same capability for under $200.
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
        <div className="rounded-2xl border border-amber-500 bg-white/98 p-6 text-[clamp(1.2rem,1.6vw,1.45rem)] font-semibold text-amber-900">
          SmartScan is a feasible, low-cost, and academically strong proposal
          that integrates embedded control, image processing, and deep learning
          for real textbook digitization with math-aware LaTeX output.
        </div>
        <div className="rounded-2xl border border-amber-500 bg-white/98 p-6 text-[clamp(1.2rem,1.6vw,1.45rem)] font-semibold text-amber-900">
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
        <div className="w-full max-w-4xl rounded-2xl border border-violet-500 bg-white/98 p-8 text-center">
          <p className="text-[clamp(1.35rem,2vw,1.9rem)] font-extrabold text-violet-950">
            Team Extra Current
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
          className={`relative ${isFullscreen ? `${activeSlide.theme.shell} h-screen w-screen overflow-hidden p-4 md:p-5` : ""}`}
        >
          <AnimatePresence mode="wait">
            <motion.section
              key={currentSlide}
              initial={{ opacity: 0, y: 18, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.995 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className={`${isFullscreen ? "h-[calc(100vh-2.5rem)] overflow-hidden rounded-2xl" : "min-h-[calc(100vh-155px)] rounded-3xl"} border ${activeSlide.theme.border} ${activeSlide.theme.panel} ${isFullscreen ? "p-4 md:p-6" : "p-6 md:p-10"} shadow-[0_16px_64px_rgba(0,0,0,0.32)]`}
            >
              <div className={`${isFullscreen ? "mb-3" : "mb-6"} space-y-1`}>
                <h1
                  className={`${isFullscreen ? "text-[clamp(1.7rem,3.2vw,2.9rem)]" : "text-[clamp(2.35rem,4.9vw,4.6rem)]"} font-black leading-[1.08] ${activeSlide.theme.heading}`}
                >
                  {activeSlide.title}
                </h1>
                {activeSlide.subtitle && (
                  <p
                    className={`${isFullscreen ? "text-[clamp(1rem,1.4vw,1.3rem)]" : "text-[clamp(1.25rem,2.2vw,2rem)]"} font-bold ${activeSlide.theme.text}`}
                  >
                    {activeSlide.subtitle}
                  </p>
                )}
              </div>

              <div className="pb-2 [&_li]:text-[clamp(1.18rem,1.6vw,1.5rem)] [&_p]:text-[clamp(1.18rem,1.6vw,1.5rem)] [&_td]:text-[clamp(1.15rem,1.52vw,1.45rem)] [&_th]:text-[clamp(1.15rem,1.52vw,1.45rem)]">
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
