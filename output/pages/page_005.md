<!-- Page 5 | Source: 20260522_231902_page_004_right.jpg -->
<!-- SMART_SCAN_METADATA
{
  "page_number": 5,
  "source_file": "20260522_231902_page_004_right.jpg",
  "boxes": [
    {
      "x1": 2140,
      "y1": 365,
      "x2": 2283,
      "y2": 466,
      "confidence": 0.757
    }
  ],
  "trocr_results": [
    {
      "latex": "\\begin{array} { l } { \\sum _ { \\scriptstyle \\scriptstyle \\scriptstyle \\scriptstyle - } } \\\\ { \\end{array} { c c c } { { - } } & { - } \\\\ { \\end{array}",
      "latency_ms": 1453,
      "model_used": "E:\\PROJECT\\SmartScan\\models\\trocr",
      "success": true,
      "error": null,
      "filename": "expr_1.jpg"
    }
  ]
}
-->

## 1.1 Algorithms

9

the time domain to the frequency domain. That is, it approximates the signal as a
weighted sum of sinusoids, producing the strength of various frequencies which,
when summed, approximate the sampled signal. In addition to lying at the heart of
signal processing, discrete Fourier transforms have applications in data compres-
sion and multiplying large polynomials and integers. Chapter 30 gives an efficient
algorithm, the fast Fourier transform (commonly called the FFT), for this problem.
The chapter also sketches out the design of a hardware FFT circuit.

### Data structures

This book also presents several data structures. A **data structure** is a way to store
and organize data in order to facilitate access and modifications. Using the appro-
priate data structure or structures is an important part of algorithm design. No sin-
gle data structure works well for all purposes, and so you should know the strengths
and limitations of several of them.

### Technique

Although you can use this book as a "cookbook" for algorithms, you might some-
day encounter a problem for which you cannot readily find a published algorithm
(many of the exercises and problems in this book, for example). This book will
teach you techniques of algorithm design and analysis so that you can develop al-
gorithms on your own, show that they give the correct answer, and analyze their ef-
ficiency. Different chapters address different aspects of algorithmic problem solv-
ing. Some chapters address specific problems, such as finding medians and order
statistics in Chapter 9, computing minimum spanning trees in Chapter 21, and de-
termining a maximum flow in a network in Chapter 24. Other chapters introduce
techniques, such as divide-and-conquer in Chapters 2 and 4, dynamic programming
in Chapter 14, and amortized analysis in Chapter 16.

### Hard problems

Most of this book is about efficient algorithms. Our usual measure of efficiency
is speed: how long does an algorithm take to produce its result? There are some
problems, however, for which we know of no algorithm that runs in a rea-
sonable amount of time. Chapter 34 studies an interesting subset of these problems,
which are known as NP-complete.

Why are NP-complete problems interesting? First, although no effi-
cient algorithm for an NP-complete problem has ever been found, nobody has ever proven
that an efficient algorithm for one cannot exist. In other words, no one knows
whether efficient algorithms exist for NP-complete problems. Second, the set of
