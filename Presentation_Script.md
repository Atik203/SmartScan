# SmartScan — Final Project Presentation Script

### Course: Microprocessors and Microcontrollers Laboratory (CSE 4326)

### Team: Phantom Devs | Group 06

### Max Duration: 10 Minutes | Language: English

---

> **Script Notation Guide:**
>
> - `[PAUSE]` — Stop for 1–2 seconds. Take a breath.
> - `[SHORT PAUSE]` — Stop for half a second.
> - `[SLOW]` — Read this part slowly and clearly.
> - `[EMPHASIS]` — Say this word or phrase with more stress.
> - `[BREATHE]` — Natural breathing point. Pause and continue.
> - `[NEXT SLIDE]` — Move to the next slide now.
> - `[CAMERA]` — Point camera or direct attention here.
> - `**bold**` — Slightly stress this word when speaking.

---

## PART 1 — Introduction & Architecture

### 🎯 Target Time: 3 minutes 30 seconds

### 📺 Format: Screen recording of slides with narration

---

### [Slide 1 — Title & Team]

> 🎙️ **Speaker:**

Hello everyone. [SHORT PAUSE]

We are **Team Phantom Devs**. [PAUSE]

Today, we are presenting our project
for the **Microprocessors and Microcontrollers Laboratory**. [PAUSE]

Our project is called [SLOW] **SmartScan** — [SHORT PAUSE]
an **Automated Book Digitizer** and **LaTeX Extractor**.

[PAUSE]

---

### [Slide 2 & 4 — Introduction & Problem Statement]

[NEXT SLIDE]

> 🎙️ **Speaker:**

Let us begin with the problem. [PAUSE]

Digitizing academic books today is a **very slow** and **manual** process. [SHORT PAUSE]
It requires a person to turn every page by hand. [PAUSE]

[BREATHE]

Flatbed scanners can also **damage** the bindings of old or thick books, [SHORT PAUSE]
which is a serious problem for university libraries. [PAUSE]

[BREATHE]

There is another major issue. [SHORT PAUSE]
Standard OCR tools — [SHORT PAUSE] that is, text recognition software — [SHORT PAUSE]
completely **fail** to read mathematical equations. [PAUSE]

This forces students and researchers to **re-type** every formula manually. [PAUSE]

[BREATHE]

Commercial automated book scanners do exist. [SHORT PAUSE]
But they are **extremely expensive** — [SHORT PAUSE]
far beyond the budget of a standard university. [PAUSE]

---

### [Slide 5 — Motivation & Real-Life Application]

[NEXT SLIDE]

> 🎙️ **Speaker:**

**SmartScan** was built to solve exactly these problems. [PAUSE]

[SLOW] Our target users are — [SHORT PAUSE]
university libraries, [SHORT PAUSE]
research labs, [SHORT PAUSE]
and students [SHORT PAUSE]
who need to digitize academic materials quickly — [SHORT PAUSE]
without damaging physical books. [PAUSE]

[BREATHE]

By automating the page-flipping process, [SHORT PAUSE]
and by converting mathematical expressions into reusable **LaTeX code**, [SHORT PAUSE]
we dramatically improve both **efficiency** and **accessibility** [PAUSE]
for technical education. [PAUSE]

---

### [Slide 6 & 7 — Objectives & Features]

[NEXT SLIDE]

> 🎙️ **Speaker:**

Our system has several core features. [PAUSE]

[SLOW] First — [SHORT PAUSE] a fully autonomous **page-flipping mechanism**.

[SLOW] Second — [SHORT PAUSE] a **synchronized camera capture** system.

[SLOW] Third — [SHORT PAUSE] **image dewarping** to correct page curvature.

[SLOW] And fourth — [SHORT PAUSE] an **AI pipeline** that detects math regions [SHORT PAUSE]
and converts them into editable LaTeX code. [PAUSE]

[BREATHE]

All of this is monitored through a **real-time web dashboard**. [PAUSE]

---

### [Slide 8 & 9 — System Architecture]

[NEXT SLIDE]

> 🎙️ **Speaker:**

Our system architecture is divided into **three layers**. [PAUSE]

[BREATHE]

The first layer is the [EMPHASIS] **"Muscle"**. [SHORT PAUSE]
This is the **Arduino Mega 2560**, [SHORT PAUSE]
which executes precise servo motor control [SHORT PAUSE]
and manages the fan relay switches. [PAUSE]

The second layer is the [EMPHASIS] **"Bridge"**. [SHORT PAUSE]
This is the **Raspberry Pi 5**, [SHORT PAUSE]
which listens for signals from the Arduino [SHORT PAUSE]
and commands the smartphone camera using **ADB** — [SHORT PAUSE]
Android Debug Bridge. [PAUSE]

[BREATHE]

The third layer is the [EMPHASIS] **"Brain"**. [SHORT PAUSE]
This is the **laptop**, [SHORT PAUSE]
which runs our deep learning models [SHORT PAUSE]
for image correction and LaTeX generation. [PAUSE]

---

### [Slide 10 & 11 — Automation Flow & AI Pipeline]

[NEXT SLIDE]

> 🎙️ **Speaker:**

The physical automation flow begins with a **calibration phase**. [PAUSE]

After that, the system enters an automated loop. [SHORT PAUSE]
It **grips** a page, [SHORT PAUSE] **flips** it, [SHORT PAUSE] and **captures** an image — [SHORT PAUSE]
then repeats. [PAUSE]

[BREATHE]

Once the image reaches the laptop, [SHORT PAUSE]
our **AI pipeline** takes over. [PAUSE]

We use a **YOLOv8-small** model [SHORT PAUSE]
to locate mathematical expressions within dense page text. [PAUSE]

Then, we use a fine-tuned **TrOCR** model [SHORT PAUSE]
to translate those image regions into accurate **LaTeX tokens**. [PAUSE]

---

## PART 2 — Hardware Demonstration

### 🎯 Target Time: 2 minutes 30 seconds

### 📹 Format: Live video of the hardware prototype

### ⚠️ Rule: No slides allowed here — show actual hardware

---

### [Video 0:00 – 0:15 — Wide Shot of Setup]

[CAMERA — wide view of the full setup showing the book and mechanisms]

> 🎙️ **Speaker:**

Here is the live demonstration of the **SmartScan hardware**. [PAUSE]

As you can see, the book rests securely on a flat surface. [SHORT PAUSE]

You can observe the Arduino setup controlling our servo motors and actuators. [SHORT PAUSE]
On the right, we have the motorized **friction wheel** mechanism, [SHORT PAUSE]
on the left is the **flipping arm**, [SHORT PAUSE]
and above the book is the smartphone camera securely mounted to the frame. [PAUSE]

---

### [Video 0:16 – 0:40 — Friction Wheel and Flipper Moving]

[CAMERA — close shot focusing on the yellow wheel and the flipping arm in action]

> 🎙️ **Speaker:**

The automation cycle begins with the page separation phase. [PAUSE]

First, the motorized **friction wheel** lowers and spins directly against the top page. [SHORT PAUSE]
This friction pushes the paper inwards, [SHORT PAUSE]
creating a buckle or loop that perfectly separates a **single page** from the rest of the stack. [PAUSE]

[BREATHE]

Next, the **flipping arm** swings over. [SHORT PAUSE]
It slides under the buckled page [SHORT PAUSE]
and smoothly sweeps it across to the left side of the book. [PAUSE]

---

### [Video 0:41 – 1:20 — Page Settles, Camera Captures]

[CAMERA — show the page settling, followed by the smartphone capture setup]

> 🎙️ **Speaker:**

Once the page is fully turned and held flat, [SHORT PAUSE]
the system enters the **Hold** stage. [PAUSE]

At this exact moment, the capture sequence is triggered. [PAUSE]

The system executes an automated **ADB command**, [SHORT PAUSE]
which triggers the mounted smartphone to capture [SHORT PAUSE]
a high-resolution, synchronized image of the newly opened page spread. [PAUSE]

---

### [Video 1:21 – 2:17 — Terminal Logs and Next Cycle]

[CAMERA — show the laptop screen displaying the terminal logs running auto_capture.py]

> 🎙️ **Speaker:**

The hardware mechanisms then reset to their **home positions**, [SHORT PAUSE]
ready to begin the **next cycle** automatically. [PAUSE]

[BREATHE]

Here on the screen, you can see our **terminal logs** actively running the capture script. [SHORT PAUSE]
It confirms the successful trigger of the shutter, [SHORT PAUSE]
the processing of the image, [SHORT PAUSE]
and the transfer of the raw image files directly to the local directory — [SHORT PAUSE]
where they are now ready to be processed by our **AI pipeline**. [PAUSE]

---


## PART 3 — Software & AI Model Demonstration

### 🎯 Target Time: 2 minutes

### 📺 Format: Screen recording of web dashboard and Colab notebooks

---

### [Visual — SmartScan Web Dashboard / Terminal]

> 🎙️ **Speaker:**

Now let us move to the **software side** of SmartScan. [PAUSE]

This is the **SmartScan Dashboard**. [SHORT PAUSE]
The raw images captured by the hardware are loaded in automatically. [PAUSE]

[BREATHE]

Our **preprocessing script** takes the curved page images [SHORT PAUSE]
and corrects them into clean, flat document images — [SHORT PAUSE]
a process called **dewarping**. [PAUSE]

---

### [Visual — Bounding Boxes on Dashboard]

> 🎙️ **Speaker:**

Next, our **YOLOv8-small** model scans each page. [PAUSE]

You can see the **bounding boxes** on screen — [SHORT PAUSE]
these are the areas where the model has successfully detected [SHORT PAUSE]
mathematical equations within the surrounding text. [PAUSE]

[BREATHE]

These specific regions are then cropped [SHORT PAUSE]
and fed into our **TrOCR** model. [SHORT PAUSE]
The TrOCR model then outputs the exact **LaTeX string** [SHORT PAUSE]
required to recreate that formula. [PAUSE]

---

### [Visual — Switch to Google Colab Notebooks]

> 🎙️ **Speaker:**

To achieve these results, [SHORT PAUSE]
we built a full **training pipeline** in Google Colab. [PAUSE]

[BREATHE]

We trained our **YOLOv8 model** [SHORT PAUSE]
on the **IBEM dataset** [SHORT PAUSE]
for approximately **one and a half hours** [SHORT PAUSE]
using an **A100 GPU**. [PAUSE]

For the recognition phase, [SHORT PAUSE]
we fine-tuned the [SLOW] **microsoft / trocr-small-printed** model [SHORT PAUSE]
on the **Im2LaTeX-100k dataset** [SHORT PAUSE]
over **8 hours** of training. [PAUSE]

[BREATHE]

As shown in the notebooks, [SHORT PAUSE]
the training loss steadily decreased — [SHORT PAUSE]
confirming that both models are well-optimized. [PAUSE]

---

## PART 4 — Results, Budget & Conclusion

### 🎯 Target Time: 2 minutes

### 📺 Format: Screen recording of remaining slides

---

### [Slide 12 — Dataset & Training]

[NEXT SLIDE]

> 🎙️ **Speaker:**

By using these comprehensive datasets [SHORT PAUSE]
and applying careful training strategies, [SHORT PAUSE]
we ensured that our models perform well [SHORT PAUSE]
on different fonts and various academic layouts. [PAUSE]

---

### [Slide 13 — Actual Performance vs. Baseline]

[NEXT SLIDE]

> 🎙️ **Speaker:**

Now, we are very proud to share our **actual performance results**. [PAUSE]

[BREATHE]

For **math detection**, [SHORT PAUSE]
our YOLOv8-small model achieved: [PAUSE]

[SLOW] **93.89% Precision** — [SHORT PAUSE]
[SLOW] **91.42% Recall** — [SHORT PAUSE]
[SLOW] **mAP50 of 95.16%** — [SHORT PAUSE]
and an **mAP50-95 of 76.75%**. [PAUSE]

[BREATHE]

This gives us near-identical precision [SHORT PAUSE]
compared to the research baseline's **Faster R-CNN** model — [SHORT PAUSE]
but with **much faster inference speed**, [SHORT PAUSE]
making it ideal for edge deployment. [PAUSE]

[BREATHE]

Even better — [SHORT PAUSE]
our **recognition pipeline** outperformed the baseline paper's Pix2Tex model. [PAUSE]

We achieved a [SLOW] **Character Error Rate of 9.67%** [SHORT PAUSE]
and a [SLOW] **BLEU Score of 88.42%**. [PAUSE]

[BREATHE]

These are **state-of-the-art results** for this type of system. [PAUSE]

---

### [Slide 14 — Budget & Cost Effectiveness]

[NEXT SLIDE]

> 🎙️ **Speaker:**

A major achievement of this project is **cost-effectiveness**. [PAUSE]

By using components such as the **Arduino Mega 2560**, [SHORT PAUSE]
**Raspberry Pi 5**, [SHORT PAUSE]
standard **PC fans**, [SHORT PAUSE]
and **PLA 3D-printed parts**, [SHORT PAUSE]
our entire hardware build costs approximately **40,000 BDT** — [SHORT PAUSE]
about **360 US dollars**. [PAUSE]

[BREATHE]

Commercial automated book scanners cost between [SHORT PAUSE]
**five thousand to fifty thousand dollars**. [SHORT PAUSE]
SmartScan delivers comparable capability [SHORT PAUSE]
for **under four hundred dollars**. [PAUSE]

---

### [Slide 15 — Future Plans & Conclusion]

[NEXT SLIDE]

> 🎙️ **Speaker:**

Looking ahead, [SHORT PAUSE]
we plan to scale our dataset [SHORT PAUSE]
to improve **handwriting recognition**. [PAUSE]

We also plan to integrate **multilingual OCR support** [SHORT PAUSE]
for broader accessibility. [PAUSE]

And we plan to add a **second camera** [SHORT PAUSE]
for true dual-page simultaneous capture. [PAUSE]

[BREATHE]

In conclusion, [SHORT PAUSE]
[SLOW] **SmartScan** successfully combined **embedded mechatronics** [SHORT PAUSE]
with **deep learning** — [PAUSE]

delivering a feasible, [SHORT PAUSE] low-cost, [SHORT PAUSE] and highly accurate solution [SHORT PAUSE]
for digitizing complex academic resources. [PAUSE]

---

### [Slide 16 — Thank You]

[NEXT SLIDE]

> 🎙️ **Speaker:**

Thank you very much for your attention. [PAUSE]

We welcome any **questions**. [PAUSE]

---

## ⏱️ Time Summary

| Part      | Section                      | Target Time     |
| --------- | ---------------------------- | --------------- |
| 1         | Introduction & Architecture  | 3 min 30 sec    |
| 2         | Hardware Demonstration       | 2 min 30 sec    |
| 3         | Software & AI Demonstration  | 2 min 00 sec    |
| 4         | Results, Budget & Conclusion | 2 min 00 sec    |
| **Total** |                              | **~10 minutes** |

---

## ✅ Guideline Compliance Check

| Rule                              | Status                                    |
| --------------------------------- | ----------------------------------------- |
| Max 10 minutes                    | ✅ Planned for exactly ~10 min            |
| English language mandatory        | ✅ Full English script                    |
| Slides for intro/features/results | ✅ Parts 1, 3, 4 use slides               |
| Actual hardware shown live        | ✅ Part 2 is live hardware demo           |
| No slides during hardware demo    | ✅ Part 2 is video only                   |
| Project title mentioned           | ✅ Slide 1                                |
| Team information mentioned        | ✅ Slide 1                                |
| Problem statement covered         | ✅ Slide 2 & 4                            |
| Real-life application covered     | ✅ Slide 5                                |
| Features listed (min 3)           | ✅ 4 features listed in Slide 6 & 7       |
| Block diagram / architecture      | ✅ Slide 8 & 9                            |
| Hardware components named         | ✅ Arduino Mega, Raspberry Pi, Servo, Fan |
| Feature demonstration with I/O    | ✅ Part 2 explains input/sensor/output    |
| Cost breakdown shown              | ✅ Slide 14                               |
| Future plans covered              | ✅ Slide 15                               |
| Conclusion with summary           | ✅ Slide 15                               |

---

_Script prepared for Team Phantom Devs — CSE 4326 Final Project Show_
