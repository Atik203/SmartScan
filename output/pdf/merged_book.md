---
title: 'SmartScan Digitized Book'
geometry: 'margin=2.5cm'
fontsize: '11pt'
mainfont: 'DejaVu Serif'
parskip: true
linestretch: 1.2
---

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


\newpage

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
can spend your time developing an efficient approximation algorithm, that is, an
algorithm that gives a good, but not necessarily the best possible, solution.

As a concrete example, consider a delivery company with a central depot. Each
day it loads up delivery trucks at the depot and sends them around to deliver goods
to several addresses. At the end of the day, each truck must end up back at the depot
so that it is ready to be loaded for the next day. To reduce costs, the company wants
to select an order of delivery stops that yields the lowest overall distance traveled by
each truck. This problem is the well-known "traveling-salesperson problem," and it
is NP-complete.2 It has no known efficient algorithm. Under certain assumptions,
however, we know of efficient algorithms that compute overall distances close to
the smallest possible. Chapter 35 discusses such "approximation algorithms."

Alternative computing models

For many years, we could count on processor clock speeds increasing at a steady
rate. Physical limitations present a fundamental roadblock to ever-increasing clock
speeds, however, because power density increases superlinearly with clock speed,
chips run the risk of melting once their clock speeds become high enough. In or-
der to perform more computations per second, therefore, chips are being designed
to contain not just one but several processing "cores." We can liken these mul-
ticore computers to several sequential computers on a single chip. In other words,
they are a type of "parallel computer." In order to elicit the best performance
from multicore computers, we need to design algorithms with parallelism in mind.
Chapter 26 presents a model for "task-parallel" algorithms, which take advantage
of multiple processing cores. This model has advantages from both theoretical and

2 To be precise, only decision problems—those with a "yes/no" answer—can be NP-complete. The
decision version of the traveling salesperson problem asks whether there exists an order of steps
whose distance totals at most a given amount.
