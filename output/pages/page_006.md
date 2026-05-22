<!-- Page 6 | Source: 20260522_231941_page_005_left.jpg -->
<!-- SMART_SCAN_METADATA
{
  "page_number": 6,
  "source_file": "20260522_231941_page_005_left.jpg",
  "boxes": [
    {
      "x1": 2174,
      "y1": 3246,
      "x2": 2371,
      "y2": 3298,
      "confidence": 0.745
    }
  ],
  "trocr_results": [
    {
      "latex": "\\begin{array} { c c } { { \\bf k ^ { - } } } \\\\ { \\end{array} { c c } { - } \\\\ { \\end{array}}}} \\\\ { \\end{array}}",
      "latency_ms": 1500,
      "model_used": "E:\\PROJECT\\SmartScan\\models\\trocr",
      "success": true,
      "error": null,
      "filename": "expr_1.jpg"
    }
  ]
}
-->

10 Chapter 1 The Role of Algorithms in Computing

NP-complete problems has the remarkable property that if an efficient algorithm
exists for any one of them, then efficient algorithms exist for all of them. This re-
lationship among the NP-complete problems makes the lack of efficient solutions
all the more tantalizing. Third, several NP-complete problems are similar, but not
identical, to problems for which we do know of efficient algorithms. Computer
scientists are intrigued by how a small change to the problem statement can cause
a big change to the efficiency of the best known algorithm.

You should know about NP-complete problems because some of them arise sur-
prisingly often in real applications. If you are called upon to produce an efficient
algorithm for an NP-complete problem, you are likely to spend a lot of time in a
fruitless search. If, instead, you can show that the problem is NP-complete, you
can spend your time developing an efficient approximation algorithm; that is, an
algorithm that gives a good, but not necessarily the best possible, solution.

As a concrete example, consider a delivery company with a central depot. Each
day it loads up delivery trucks at the depot and sends them around to deliver goods
to several addresses. At the end of the day, each truck must end up back at the depot
so that it is ready to be loaded for the next day. To reduce costs, the company wants
to select an order of delivery stops that yields the lowest overall distance traveled by
each truck. This problem is the well-known "traveling-salesperson problem," and it
is NP-complete. It has no known efficient algorithm. Under certain assumptions,
however, we know of efficient algorithms that compute overall distances close to
the smallest possible. Chapter 35 discusses such "approximation algorithms."

## Alternative computing models

For many years, we could count on processor clock speeds increas-
ing at a steady
rate. Physical limitations present a fundamental roadblock to ever-increasing clock
speeds; however, because power density increases superlinearly with clock speed,
chips run the risk of melting once their clock speeds become high enough. In or-
der to perform more computations per second, therefore, chips are being designed
to contain not just one but several processing "cores." We can liken these mul-
ticore computers to several sequential computers on a single chip. In other words,
they are a type of "parallel computer." In order to elicit the best performance
from multicore computers, we need to design algorithms with parallelism in mind.
Chapter 26 presents a model for "task-parallel" algorithms, which take advantage
of multiple processing cores. This model has advantages from both theoretical and

\vspace{0.5cm}
\noindent
$^{2}$To be precise, only decision problems—those with a "yes/no" answer—can be NP-complete. The
decision version of the traveling salesperson problem asks whether there exists an order of steps
whose distance totals at most a given amount.
