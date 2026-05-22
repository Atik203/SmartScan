<!-- Page 8 | Source: 20260522_231620_page_002_right.jpg -->
<!-- SMART_SCAN_METADATA
{
  "page_number": 8,
  "source_file": "20260522_231620_page_002_right.jpg",
  "boxes": [
    {
      "x1": 1239,
      "y1": 3434,
      "x2": 1538,
      "y2": 3554,
      "confidence": 0.628
    }
  ],
  "trocr_results": [
    {
      "latex": "\\begin{array} { l l } { \\mathrm { c } } & { - } \\\\ { \\end{array} { c c c } { . } \\\\ { \\end{array} { c c } } { .",
      "latency_ms": 1282,
      "model_used": "E:\\PROJECT\\SmartScan\\models\\trocr",
      "success": true,
      "error": null,
      "filename": "expr_1.jpg"
    }
  ]
}
-->

# 1 The Role of Algorithms in Computing

What are algorithms? Why is the study of algorithms worthwhile? What is the role
of algorithms relative to other technologies used in computers? This chapter will
answer these questions.

## 1.1 Algorithms

Informally, an **algorithm** is any well-defined computational procedure that takes
some value, or set of values, as **input** and produces some value, or set of values, as
**output**. An algorithm is thus a sequence of computational
steps that transform the input into the output.

You can also view an algorithm as a tool for solving a well-specified **computa-
tional problem**. The statement of the problem specifies in general terms the desired
input/output relationship for problem instances, typically of arbitrarily large size.
The algorithm describes a specific computational procedure for achieving that in-
put/output relationship for all problem instances.

As an example, suppose that you need to sort a sequence of numbers into mono-
tonically increasing order. This problem arises frequently in practice and provides
fertile ground for introducing many standard design techniques and analysis tools.
Here is how we formally define the sorting problem:

**Input**: A sequence of $n$ numbers $\langle a_1, a_2, \dots, a_n \rangle$.

**Output**: A permutation (reordering) $\langle a'_1, a'_2, \dots, a'_n \rangle$ of the input
sequence such that $a'_1 \le a'_2 \le \dots \le a'_n$.

Thus, given the input sequence $(31, 41, 59, 26, 41, 58)$, a correct sorting algorithm
returns as output the sequence $(26, 31, 41, 41, 58, 59)$. Such an input sequence is
