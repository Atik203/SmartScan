<!-- Page 2 | Source: 20260522_231641_page_003_left.jpg -->
<!-- SMART_SCAN_METADATA
{
  "page_number": 2,
  "source_file": "20260522_231641_page_003_left.jpg",
  "boxes": [
    {
      "x1": 2089,
      "y1": 3239,
      "x2": 2289,
      "y2": 3273,
      "confidence": 0.761
    },
    {
      "x1": 1525,
      "y1": 3410,
      "x2": 1563,
      "y2": 3442,
      "confidence": 0.722
    },
    {
      "x1": 1437,
      "y1": 3337,
      "x2": 1522,
      "y2": 3366,
      "confidence": 0.575
    },
    {
      "x1": 1810,
      "y1": 3453,
      "x2": 1841,
      "y2": 3552,
      "confidence": 0.558
    },
    {
      "x1": 1807,
      "y1": 3457,
      "x2": 1873,
      "y2": 3558,
      "confidence": 0.51
    }
  ],
  "trocr_results": [
    {
      "latex": "\\begin{array} { l l } { \\underline { { { { \\bf { \\bf \\bf \\bf \\bf } } } } } { \\underline { { { { { \\bf { \\bf \\bf } } } } } } } { \\",
      "latency_ms": 1641,
      "model_used": "E:\\PROJECT\\SmartScan\\models\\trocr",
      "success": true,
      "error": null,
      "filename": "expr_1.jpg"
    },
    {
      "latex": "\\begin{array} { l l } { { \\bf c } } _ { \\bf { \\bf 0 } } \\\\ { \\end{array} { { c } } { \\bf { \\bf x } } } \\\\ { \\",
      "latency_ms": 1453,
      "model_used": "E:\\PROJECT\\SmartScan\\models\\trocr",
      "success": true,
      "error": null,
      "filename": "expr_2.jpg"
    },
    {
      "latex": "\\begin{array} { c c } { \\rightarrow \\frac { \\mathrm { c m } { - } } { - { \\bf x } } } \\\\ { \\end{array} { \\rightarrow } { { \\scriptscriptscriptscriptstyle } } { \\",
      "latency_ms": 1405,
      "model_used": "E:\\PROJECT\\SmartScan\\models\\trocr",
      "success": true,
      "error": null,
      "filename": "expr_3.jpg"
    },
    {
      "latex": "\\begin{array} { c c c } { \\quad \\frac { \\sum _ { \\scriptscriptscriptscriptstyle \\scriptscriptscriptscriptstyle } } { { \\textscriptscriptscriptscriptscriptstyle } } { \\frac { { { \\textscriptscript",
      "latency_ms": 1266,
      "model_used": "E:\\PROJECT\\SmartScan\\models\\trocr",
      "success": true,
      "error": null,
      "filename": "expr_4.jpg"
    },
    {
      "latex": "\\begin{array} { l l } { { - \\frac { \\mathrm { \\mathrm { \\mathrm { c c } } } } } { \\frac { { \\mathrm { \\mathrm { \\prime } } } } { \\",
      "latency_ms": 1234,
      "model_used": "E:\\PROJECT\\SmartScan\\models\\trocr",
      "success": true,
      "error": null,
      "filename": "expr_5.jpg"
    }
  ]
}
-->

6 Chapter 1 The Role of Algorithms in Computing

called an instance of the sorting problem. In general, an instance of a problem consists of the input (satisfying whatever constraints are imposed in the problem statement) needed to compute a solution to the problem.

Because many programs use it as an intermediate step, sorting is a fundamental operation in computer science. As a result, you have a large number of good sorting algorithms at your disposal. Which algorithm is best for a given application depends on—among other factors—the number of items to be sorted, the extent to which the items are already somewhat sorted, possible restrictions on the item values, the architecture of the computer, and the kind of storage devices to be used: main memory, disks, or even—archaically—tapes.

An algorithm for a computational problem is correct if, for every problem instance provided as input, it halts—finishes its computing in finite time—and outputs the correct solution to the problem instance. A correct algorithm solves the given computational problem. An incorrect algorithm might not halt at all on some input instances, or it might halt with an incorrect answer. Contrary to what you might expect, incorrect algorithms can sometimes be useful, if you can control their error rate. We’ll see an example of an algorithm with a controllable error rate in Chapter 31 when we study algorithms for finding large prime numbers. Ordinarily, however, we’ll concern ourselves only with correct algorithms.

An algorithm can be specified in English, as a computer program, or even as a hardware design. The only requirement is that the specification must provide a precise description of the computational procedure to be followed.

## What kinds of problems are solved by algorithms?

Sorting is by no means the only computational problem for which algorithms have been developed. (You probably suspected as much when you saw the size of this book.) Practical applications of algorithms are ubiquitous and include the following examples:

* The Human Genome Project has made great progress toward the goals of identifying all the roughly 30,000 genes in human DNA, determining the sequences of the roughly 3 billion chemical base pairs that make up human DNA, storing this information in databases, and developing tools for data analysis. Each of these steps requires highly sophisticated algorithms. Although the solutions to the various problems involved are beyond the scope of this book, many methods to solve these biological problems use ideas presented here, enabling scientists to accomplish tasks while using resources efficiently. Dynamic programming, as

1 Sometimes, when the problem context is known, problem instances are themselves simply called “problems.”
