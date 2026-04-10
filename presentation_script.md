# 🎤 SmartScan Presentation Script

**CSE 4326 — Project Proposal | Group 6 — Team: Phantom Devs**
**Total Time: 10 Minutes | 2 Minutes per Speaker**

---

> **How to use this script:**
>
> - Read the **English** version for meaning; speak from the **Bangla** version naturally
> - Bold text = emphasize these words
> - _(pause)_ = 1–2 second pause for effect
> - `[Slide X]` = advance to the next slide at this point

---

## 🎙️ Speaker 1 — Sourov

### Slides: 1 (Title) → 2 (Introduction) → 3 (Expected Prototype)

### ⏱️ Time: 0:00 – 2:00

---

### 🇧🇩 Bangla Version

আসসালামু আলাইকুম। আমি **মোঃ সারোয়ার আলম সৌরভ**।
আমরা হলাম **Group 6 — Team Phantom Devs**, এবং আমাদের প্রজেক্টের নাম **SmartScan** —
একটি Automated Book Digitizer এবং LaTeX Extractor।

_(pause)_

`[Slide 2 — Introduction]`

SmartScan হলো একটি low-cost mechatronic এবং AI-integrated system যা
**printed academic textbook** এর পেজগুলো স্বয়ংক্রিয়ভাবে digitize করতে পারে।
এটি শুধু সাধারণ text scan করে না — **mathematical equations** কে সরাসরি **LaTeX** এ রূপান্তর করে,
যা academic documents এ সরাসরি ব্যবহারযোগ্য।

আমাদের system এর তিনটি মূল অংশ আছে:
**Arduino** — physical control এর জন্য,
**Raspberry Pi** — communication bridge হিসেবে, এবং
**Laptop + AI Model** — intelligent processing এর জন্য।

_(pause)_

`[Slide 3 — Expected Prototype]`

এই slide এ আপনারা দেখতে পাচ্ছেন আমাদের **physical prototype** এর 4-stage cycle।
প্রথমে system **rest position** এ থাকে, তারপর **gripper নামে** একটি page ধরে,
**flipper সেটিকে উল্টায়**, এবং সবশেষে **camera capture** হয়।
এটিই আমাদের basic page-turning automation।

---

### 🇬🇧 English Version

Assalamu Alaikum. I am **Md. Sarowar Alam Sourov**, from Group 6 — **Team Phantom Devs**.
Our project is called **SmartScan** — an Automated Book Digitizer and LaTeX Extractor.

_(pause)_

`[Slide 2 — Introduction]`

SmartScan is a **low-cost, fully integrated mechatronic and AI system** designed to digitize academic textbooks automatically.
Unlike a regular scanner, SmartScan goes further — it identifies **printed mathematical expressions** and converts them into **usable LaTeX code** in real time.

The system follows a clear architecture:
**Arduino** handles physical muscle work, **Raspberry Pi** acts as the communication bridge,
and the **laptop with AI models** serves as the intelligent brain.

_(pause)_

`[Slide 3 — Expected Prototype]`

On this slide, you can see the **4-stage physical cycle** of our prototype.
The system starts in a resting position, the gripper arm descends to isolate one page,
the flipper arm turns it over, and finally the Raspberry Pi triggers both cameras to capture.
This is the heart of our **page-turning automation**.

---

---

## 🎙️ Speaker 2 — Abdullah Al Noor

### Slides: 4 (Problem Statement) → 5 (Motivation)

### ⏱️ Time: 2:00 – 4:00

---

### 🇧🇩 Bangla Version

`[Slide 4 — Problem Statement]`

আমি **আব্দুল্লাহ আল নূর**। আমি আলোচনা করবো আমরা **কোন সমস্যা সমাধান করতে চাইছি**।

বর্তমানে academic textbook digitize করার ক্ষেত্রে **চারটি বড় সমস্যা** আছে।

প্রথমত, **manual effort অনেক বেশি** — একটি full semester এর বই manually scan করা extremely time-consuming।
দ্বিতীয়ত, **flatbed scanner বইয়ের spine damage করে** — বিশেষত পুরনো বা মোটা বইয়ের ক্ষেত্রে।
তৃতীয়ত, **commercial scanning system অনেক দামী** — $5,000 থেকে $50,000 পর্যন্ত, যা student lab এর জন্য সম্পূর্ণ impractical।
এবং সবচেয়ে গুরুত্বপূর্ণ — **existing OCR tools mathematical equations ঠিকমতো capture করতে পারে না** —
output এ equation structure হারিয়ে যায় এবং manually সংশোধন করতে হয়।

_(pause)_

`[Slide 5 — Motivation]`

এই সমস্যাগুলোই আমাদের **SmartScan** তৈরির অনুপ্রেরণা।

Academic দিক থেকে, এই project **embedded systems, robotics, এবং AI** কে একসাথে combine করে।
Practical দিক থেকে, এটি engineering content এর জন্য **low-cost digitization সমাধান** দেয়, বই নষ্ট না করে।
এবং Research দিক থেকে, আমরা একটি **IEEE Access 2025 paper** এর concept extend করছি।

---

### 🇬🇧 English Version

`[Slide 4 — Problem Statement]`

I am **Abdullah Al Noor**, and I will explain the **problem we are solving**.

There are four critical failures in how academic books are currently digitized.

**First**, manual scanning is **extremely slow** — digitizing a full semester's worth of material requires hours of effort.
**Second**, flatbed scanners **damage book bindings** through physical pressure, especially for thick editions.
**Third**, commercial scanning systems are **prohibitively expensive** — from $5,000 to $50,000 — completely out of reach for a student lab.
And most importantly, **existing OCR tools fail at mathematical notation** — equations lose their structure and require full manual correction.

_(pause)_

`[Slide 5 — Motivation]`

These are exactly the problems that motivated us to propose **SmartScan**.

**Academically**, this project combines embedded systems, robotics, and deep learning — a true full-stack capstone experience.
**Practically**, it enables low-cost, non-destructive digitization of engineering and math content that libraries and students actually need.
**From a research perspective**, we are extending an **IEEE Access 2025 paper** and building a reproducible, validatable system baseline.

---

---

## 🎙️ Speaker 3 — Md. Atikur Rahaman (Team Leader)

### Slides: 6 (Objectives) → 7 (Feature Set) → 8 (System Architecture)

### ⏱️ Time: 4:00 – 6:00

---

### 🇧🇩 Bangla Version

`[Slide 6 — Objectives]`

আমি **মোঃ আতিকুর রাহামান**, আমাদের দলের Team Leader। এখন আমি আমাদের **project এর objectives** এবং **core features** নিয়ে কথা বলবো।

আমাদের পাঁচটি মূল objective আছে।
প্রথমত, একটি **stable V-cradle platform** তৈরি করা gripper এবং flipper mechanism সহ।
দ্বিতীয়ত, **Arduino-based servo control** এবং synchronized dual-camera capture implement করা।
তৃতীয়ত, একটি **integrated AI pipeline** চালানো — preprocessing থেকে শুরু করে LaTeX generation পর্যন্ত।
চতুর্থত, একটি **web-based monitoring dashboard** তৈরি করা।
এবং পঞ্চমত, **performance এবং budget feasibility** সম্পূর্ণরূপে validate করা।

_(pause)_

`[Slide 7 — Feature Set]`

আমাদের system এ **৬টি key feature** আছে:
Autonomous page flipping, synchronized dual-camera capture, image dewarp এবং enhancement,
Faster R-CNN দিয়ে math region detection, TrOCR দিয়ে LaTeX generation,
এবং একটি real-time **Next.js dashboard**।

`[Slide 8 — System Architecture]`

Architecture টি তিনটি layer এ বিভক্ত।
**Layer 1 — Muscle**: Arduino Mega 2560 — servo control এবং capture signal emission।
**Layer 2 — Bridge**: Raspberry Pi 5 — ADB camera trigger এবং image transfer।
**Layer 3 — Brain**: Laptop + AI models + web dashboard — সব intelligent processing এখানে।

---

### 🇬🇧 English Version

`[Slide 6 — Objectives]`

I am **Md. Atikur Rahaman**, Team Leader of Group 6. I will now cover our **project objectives** and the key features that support them.

We have five concrete objectives.
First — build a **stable V-cradle platform** with coordinated gripper and flipper arms.
Second — implement **Arduino servo control** with synchronized dual-camera capture via Raspberry Pi.
Third — run a **complete AI processing pipeline** from raw image to LaTeX output.
Fourth — deliver a **web-based dashboard** for monitoring and validating results.
Fifth — **validate our targets** for accuracy, throughput, and budget feasibility with data-driven evaluation.

_(pause)_

`[Slide 7 — Feature Set]`

These objectives are backed by **six core features**:
Autonomous page flipping using a 4-stage mechatronic cycle,
synchronized dual capture via ADB,
page dewarping and enhancement for clean model inputs,
math region detection using **Faster R-CNN with ResNet-50 and FPN**,
**LaTeX generation using TrOCR**, and a real-time **Next.js dashboard**.

`[Slide 8 — System Architecture]`

The system is organized in **three layers**:
**Layer 1 — Muscle**: the Arduino Mega, handling all servo trajectories and CAPTURE signal emission.
**Layer 2 — Bridge**: Raspberry Pi 5, which synchronously triggers both cameras via ADB.
**Layer 3 — Brain**: the Laptop runs all AI inference and hosts the web dashboard.

---

---

## 🎙️ Speaker 4 — Md. Salman Rohoman Nayeem

### Slides: 9 (Architecture Diagram) → 10 (Flowchart) → 11 (AI Pipeline)

### ⏱️ Time: 6:00 – 8:00

---

### 🇧🇩 Bangla Version

`[Slide 9 — Architecture Diagram]`

আমি **মোঃ সালমান রোহোমান নাইম**। এখন আমি আমাদের **AI model architecture** এবং **system flowchart** explain করবো।

এই diagram এর **বাম দিকে** আছে **Expression Detection Framework** —
Input image → **Faster R-CNN** (ResNet-50 + FPN + RPN + RoI Pooling) → bounding boxes।
Text region গুলো mask করে deep **bidirectional LSTM** layer দিয়ে OCR করা হয়।

**ডান দিকে** আছে **Recognition এবং Extraction Framework** —
Detected crop → **Vision Transformer Encoder** → **Transformer Decoder** → LaTeX tokens।
Output এ embedded এবং isolated formula দুটো category দেখানো হচ্ছে।

_(pause)_

`[Slide 10 — Automation Flowchart]`

এই flowchart টি Arduino র **control loop** দেখাচ্ছে।
প্রথমে **Calibration Phase** — gripper এবং flipper position save করতে হয়।
তারপর **Automation Loop** — page grip, camera capture, image transfer।
**Flipper step** এ fan activate হয় page separate করার জন্য।
**Reset button** চাপলে সব motion বন্ধ, position erase।

`[Slide 11 — AI Pipeline]`

AI pipeline এ দুটো stage আছে।
**Stage A** — Faster R-CNN textbook page থেকে math expression locate করে।
**Stage B** — TrOCR সেই formula crop কে LaTeX tokens এ convert করে।
নিচে দেখুন — **৫টি ধাপ**: Original → Cropped → Dewarped → Detected → Math Extracted।

---

### 🇬🇧 English Version

`[Slide 9 — Architecture Diagram]`

I am **Md. Salman Rohoman Nayeem**. I will explain the **AI model architecture** and **automation control flow**.

On the **left side** is the **Expression Detection Framework**.
A raw image enters **Faster R-CNN** — ResNet-50 + FPN + RPN + RoI Pooling — producing bounding boxes around math expressions.
Text regions are masked and processed through a deep **bidirectional LSTM** transcription layer for parallel OCR.

On the **right side** is the **Recognition and Extraction Framework**.
Each detected crop passes through a **Vision Transformer Encoder** and **Transformer Decoder** to produce the final **LaTeX token sequence**.

_(pause)_

`[Slide 10 — Automation Flowchart]`

This flowchart is the **Arduino control loop**.
First — the **Calibration Phase**, where the operator saves gripper and flipper positions once.
Then the **Automation Loop** runs: grip a page, trigger cameras via Pi and ADB, transfer images.
The **PC fan activates** near the end of each flip to separate pages cleanly.
When the **reset button** is pressed, all motion stops and positions are cleared.

`[Slide 11 — AI Pipeline]`

The AI pipeline has two stages.
**Stage A: Faster R-CNN** localizes math expressions across dense textbook layouts.
**Stage B: TrOCR** converts each cropped formula image into editable LaTeX.
The bottom image shows the **full 5-stage flow on a real textbook page**:
Original → Cropped → Dewarped → Text+Math Detected → Math Extracted.

---

---

## 🎙️ Speaker 5 — Pratay Paul

### Slides: 12 (Dataset) → 13 (Performance) → 14 (Budget) → 15 (Conclusion) → 16 (Thank You)

### ⏱️ Time: 8:00 – 10:00

---

### 🇧🇩 Bangla Version

`[Slide 12 — Dataset and Training Strategy]`

আমি **প্রতয় পল**। আমি আলোচনা করবো আমাদের **dataset strategy, performance targets, এবং budget**।

Detection model এর জন্য আমরা **full IBEM dataset** ব্যবহার করবো।
Recognition model এর জন্য **Im2LaTeX-100K dataset** ব্যবহার করবো।
Data augmentation এবং compute-aware schedule দিয়ে training student timeline এর মধ্যে শেষ করবো।

_(pause)_

`[Slide 13 — Expected Performance]`

আমাদের target গুলো IEEE paper baseline এর বিপরীতে:
Detection precision: paper 95.71% → আমাদের target **88–92%**।
Detection recall: paper 91.77% → আমাদের target **85–90%**।
BLEU score: paper 86.44 → আমাদের target **78–83**।
Page cycle time: **12–15 sec/page** — classroom use এর জন্য practical।

`[Slide 14 — Budget and Feasibility]`

আমাদের মোট estimated budget **~20,000 BDT** — roughly $180 USD।
Commercial alternative এর তুলনায় এটি 99% কম।
আমাদের tech stack:
Deep Learning: **PyTorch, Faster R-CNN, TrOCR, Hugging Face Transformers, OpenCV**।
Web: **Next.js 15, TypeScript, FastAPI, Tailwind CSS**।

`[Slide 15 — Conclusion]`

SmartScan হলো একটি **feasible, low-cost, এবং academically strong** proposal যা
embedded control, image processing, এবং deep learning একসাথে integrate করে।

`[Slide 16 — Thank You]`

আমাদের পুরো presentation শোনার জন্য আপনাদের অনেক ধন্যবাদ।
আমরা যেকোনো প্রশ্নের উত্তর দিতে প্রস্তুত।

---

### 🇬🇧 English Version

`[Slide 12 — Dataset and Training Strategy]`

I am **Pratay Paul** and I will cover our **dataset plan, performance targets, and project budget**.

For the detection model, we train on the **full IBEM dataset**.
For recognition, we fine-tune using **Im2LaTeX-100K**.
Data augmentation and a compute-aware schedule will keep training within our student timeline.

_(pause)_

`[Slide 13 — Expected Performance]`

Our targets against the IEEE paper baseline:
Detection precision: paper 95.71% — our target **88–92%**.
Detection recall: paper 91.77% — our target **85–90%**.
BLEU score: paper 86.44 — our target **78–83**.
Page cycle time target: **12–15 seconds per page** — practical for classroom use.

`[Slide 14 — Budget and Feasibility]`

Our total estimated budget is **~20,000 BDT** — approximately $180 USD.
This is dramatically lower than any commercial alternative starting at $5,000.

Our **tech stack**:
Deep Learning — **PyTorch, Faster R-CNN, TrOCR, Hugging Face Transformers, OpenCV, Albumentations**.
Web & Backend — **Next.js 15, TypeScript, Tailwind CSS, FastAPI**.
Embedded — **Arduino IDE (C++), Raspberry Pi OS, ADB, SSH**.

`[Slide 15 — Conclusion]`

SmartScan is a **feasible, academically rigorous, and low-cost** proposal that brings together
embedded control, image processing, and deep learning into one practical workflow for
real textbook digitization with **math-aware LaTeX output**.

`[Slide 16 — Thank You]`

On behalf of **Team Phantom Devs**, thank you very much for your time.
We are fully prepared to answer any questions you may have.

---

## 📌 Quick Speaker Reference Card

| #   | Speaker                          | Student ID   | Slides                  | Key Topics                                    |
| --- | -------------------------------- | ------------ | ----------------------- | --------------------------------------------- |
| 1   | Md. Sarowar Alam Sourov          | 011-231-0302 | 1 → 2 → 3               | Project intro, what SmartScan is, prototype   |
| 2   | Abdullah Al Noor                 | 011-231-0479 | 4 → 5                   | Problems with current solutions, motivation   |
| 3   | Md. Atikur Rahaman _(Leader)_    | 011-231-0298 | 6 → 7 → 8               | Objectives, 6 features, 3-layer architecture |
| 4   | Md. Salman Rohoman Nayeem        | 011-231-0484 | 9 → 10 → 11             | AI diagram, flowchart, AI pipeline details    |
| 5   | Pratay Paul                      | 011-231-0163 | 12 → 13 → 14 → 15 → 16  | Dataset, performance, budget, conclusion      |

## ⏱️ Timing Bar

```
0:00 ────── 2:00 ────── 4:00 ────── 6:00 ────── 8:00 ────── 10:00
[Speaker 1]  [Speaker 2]  [Speaker 3]  [Speaker 4]  [Speaker 5]
  Sourov      Abdullah     Atikur       Salman        Pratay
Title+Intro  Problem+Mot  Obj+Feat+Arch  Diag+Flow   Dataset+Budget
+Prototype                               +Pipeline    +Conclusion
```
