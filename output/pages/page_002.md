<!-- Page 2 | Source: 20260522_232255_page_007_left.jpg -->
<!-- SMART_SCAN_METADATA
{
  "page_number": 2,
  "source_file": "20260522_232255_page_007_left.jpg",
  "boxes": [
    {
      "x1": 1191,
      "y1": 166,
      "x2": 1240,
      "y2": 195,
      "confidence": 0.573
    },
    {
      "x1": 2286,
      "y1": 3678,
      "x2": 2336,
      "y2": 3739,
      "confidence": 0.502
    }
  ],
  "trocr_results": [
    {
      "latex": "\\begin{array} { c c } { \\mathrm { \\frac { 1 } { 1 } { \\bf 1 } } { \\frac { 1 } { \\bf 1 } { \\bf 1 } } { \\bf \\bf \\",
      "latency_ms": 1515,
      "model_used": "E:\\PROJECT\\SmartScan\\models\\trocr",
      "success": true,
      "error": null,
      "filename": "expr_1.jpg"
    },
    {
      "latex": "\\begin{array} { l l } { { \\end{array} { c c c } } { { \\end{array} { c c c c } { \\rightarrow } } { \\end{array} {",
      "latency_ms": 1171,
      "model_used": "E:\\PROJECT\\SmartScan\\models\\trocr",
      "success": true,
      "error": null,
      "filename": "expr_2.jpg"
    }
  ]
}
-->

# Chapter 1 The Role of Algorithms in Computing

*   advanced computer architectures and fabrication technologies,
*   easy-to-use, intuitive, graphical user interfaces (GUIs),
*   object-oriented systems,
*   integrated web technologies,
*   fast networking, both wired and wireless,
*   machine learning,
*   and mobile devices.

The answer is yes. Although some applications do not explicitly require algorithmic content at the application level (such as some simple, web-based applications), many do. For example, consider a web-based service that determines how to travel from one location to another. Its implementation would rely on fast hardware, a graphical user interface, wide-area networking, and also possibly on object orientation. It would also require algorithms for operations such as finding routes (probably using a shortest-path algorithm), rendering maps, and interpolating addresses.

Moreover, even an application that does not require algorithmic content at the application level relies heavily upon algorithms. Does the application rely on fast hardware? The hardware design used algorithms. Does the application rely on graphical user interfaces? The design of any GUI relies on algorithms. Does the application rely on networking? Routing in networks relies heavily on algorithms. Was the application written in a language other than machine code? Then it was processed by a compiler, interpreter, or assembler, all of which make extensive use of algorithms. Algorithms are at the core of most technologies used in contemporary computers.

Machine learning can be thought of as a method for performing algorithmic tasks without explicitly designing an algorithm, but instead inferring patterns from data and thereby automatically learning a solution. At first glance, machine learning, which automates the process of algorithmic design, may seem to make algorithms obsolete. The opposite is true, however. Machine learning is itself a collection of algorithms, just under a different name. Furthermore, it currently seems that the success of machine learning is mainly for problems for which we, as humans, do not really understand what the right algorithm is. Prominent examples include computer vision and automatic language translation. For algorithmic problems that humans understand well, such as most of the problems in this book, efficient algorithms designed to solve a specific problem are typically more successful than machine learning approaches.

Data science is an interdisciplinary field with the goal of extracting knowledge and insights from structured and unstructured data. Data science uses methods
