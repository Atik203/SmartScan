---
title: 'SmartScan Digitized Book'
geometry: 'margin=2.5cm'
fontsize: '11pt'
mainfont: 'DejaVu Serif'
parskip: true
linestretch: 1.2
---

6 Chapter 1 The Role of Algorithms in Computing

called an instance of the sorting problem. In general, an instance of a problem consists of the input (satisfying whatever constraints are imposed in the problem statement) needed to compute a solution to the problem.

Because many programs use it as an intermediate step, sorting is a fundamental operation in computer science. As a result, you have a large number of good sorting algorithms at your disposal. Which algorithm is best for a given application depends on—among other factors—the number of items to be sorted, the extent to which the items are already somewhat sorted, possible restrictions on the item values, the architecture of the computer, and the kind of storage devices to be used: main memory, disks, or even—archaically—tapes.

An algorithm for a computational problem is correct if, for every problem instance provided as input, it halts—finishes its computing in finite time—and outputs the correct solution to the problem instance. A correct algorithm solves the given computational problem. An incorrect algorithm might not halt at all on some input instances, or it might halt with an incorrect answer. Contrary to what you might expect, incorrect algorithms can sometimes be useful, if you can control their error rate. We’ll see an example of an algorithm with a controllable error rate in Chapter 31 when we study algorithms for finding large prime numbers. Ordinarily, however, we’ll concern ourselves only with correct algorithms.

An algorithm can be specified in English, as a computer program, or even as a hardware design. The only requirement is that the specification must provide a precise description of the computational procedure to be followed.

## What kinds of problems are solved by algorithms?

Sorting is by no means the only computational problem for which algorithms have been developed. (You probably suspected as much when you saw the size of this book.) Practical applications of algorithms are ubiquitous and include the following examples:

* The Human Genome Project has made great progress toward the goals of identifying all the roughly 30,000 genes in human DNA, determining the sequences of the roughly 3 billion chemical base pairs that make up human DNA, storing this information in databases, and developing tools for data analysis. Each of these steps requires highly sophisticated algorithms. Although the solutions to the various problems involved are beyond the scope of this book, many methods to solve these biological problems use ideas presented here, enabling scientists to accomplish tasks while using resources efficiently. Dynamic programming, as

1 Sometimes, when the problem context is known, problem instances are themselves simply called “problems.”


\newpage

## 1.1 Algorithms

in Chapter 14, is an important technique for solving several of these biological
problems, particularly ones that involve determining similarity between DNA
sequences. The savings realized are in time, both human and machine, and in
money, as more information can be extracted by laboratory techniques.

* The internet enables people all around the world to quickly access and retrieve
large amounts of information. With the aid of clever algorithms, sites on the
internet are able to manage and manipulate this large volume of data. Exam-
ples of problems that make essential use of algorithms include finding good
routes on which the data travels (techniques for solving such problems appear
in Chapter 22), and using a search engine to quickly find pages on which par-
ticular information resides (related techniques are in Chapters 11 and 32).

* Electronic commerce enables goods and services to be negotiated and ex-
changed electronically, and it depends on the privacy of personal informa-
tion such as credit card numbers, passwords, and bank statements. The core
technologies used in electronic commerce include public-key cryptography and
digital signatures (covered in Chapter 31), which are based on numerical algo-
rithms and number theory.

* Manufacturing and other commercial enterprises often need to allocate scarce
resources in the most beneficial way. An oil company might wish to know
where to place its wells in order to maximize its expected profit. A political
candidate might ask where to spend money buying campaign ad-
vertising in order to maximize the chances of winning an election. An airline
might wish to assign crews to flights in the least expensive way possible, mak-
ing sure that each flight is covered and that government regulations regarding
crew scheduling are met. An internet service provider might wish to determine
where to place additional resources in order to serve its customers more effec-
tively. All of these are examples of problems that can be solved by modeling
them as linear programs, which Chapter 29 explores.

Although some of the details of these examples are beyond the scope of
book, we do give underlying techniques that apply to these problems and
areas. We also show how to solve many specific problems, including the fol-
lowing:

* You have a road map on which the distance between each pair of adja-
cent in-
tersections is marked, and you wish to determine the shortest route from one
intersection to another. The number of possible routes can be huge, even if you
disallow routes that cross over themselves. How can you choose which of all
possible routes is the shortest? You can start by modeling the road map (which
is itself a model of the actual roads) as a graph (which we will meet in Part VI
and Appendix B). In this graph, you wish to find the shortest path from one
vertex to another. Chapter 22 shows how to solve this problem efficiently.


\newpage

|

; Chapter 1 The Role of Algorithms in Computing

| + Given a mechanical design in terms of a library of parts, where each part may
include instances of other parts, list the paris in order so that each part appears

before any part that uses it, If the design comprises 7 parts, then there are i!

possible orders, where ! denotes the factorial function, Because the factorial

function grows faster than even an exponential function, you cannot feasibly

generate each possible order and then verify that, within that order, each part

appears before the parts using it (unicss you have only a few parts). This prob-
lem is an instance of topological sorting, and Chapter 20 shows how to solve

this problem efficiently.

* A doctor needs to determine whether an image represents a cancerous tumor or
a benign one. The doctor has available images of many other tumors, some of
which are known to be cancerous and some of which are known to be benign.
A cancerous tumor is likely to be more similar to other cancerous tumors than
to benign tumors, and a benign tumor is more likely to be similar to other be-
nign tumors. By using a clustering algorithm, as in Chapter 33, the doctor can ;

identify which outcome is more likely.

* You need to compress a large file containing text so that it occupies less space.
Many ways to do so are known, including “LZW compression,” which looks for
tepeating character sequences. Chapter 15 studies a different approach, “Huff-
man coding,” which encodes characters by bit sequences of various lengths,
with characters occurring more frequently encoded by shorter bit sequences.

These lists are far from exhaustive (as you again have probably surmised from
this book’s heft), but they exhibit two characteristics common to many interesting
algorithmic problems:

1. They have many candidate solutions, the overwhelming majority of which do
not solve the problem at hand. Finding one that does, or one that is “best,” with-
out explicitly examining each possible solution, can present quite a challenge.

2. They have practical applications. Of the problems in the above list, finding the
shortest path provides the easiest examples. A transportation firm, such as a
trucking or railroad company, has a financial interest in finding shortest paths
through a road or rail network because taking shorter paths results in lower

labor and fuel costs. Or a routing node on the internet might need to find the

shoriest path through the network in order to route a message quickly. Ora

person wishing to drive from New York to Boston might want to find driving .

directions using a navigation app.

Not every problem solved by algorithms has an easily identified set of candi-
date solutions. For example, given a set of numerical values representing samples
of a signal taken at regular time intervals, the discrete Fourier transform converts

ee . .


\newpage

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


\newpage

## 1.1 Algorithms

In Chapter 14, is an important technique for solving several of these biological
problems, particularly ones that involve determining similarity between DNA
sequences. The savings realized are in time, both human and machine, and in
money, as more information can be extracted by laboratory techniques.

* The internet enables people all around the world to quickly access and retrieve
large amounts of information. With the aid of clever algorithms, sites on the
internet are able to manage and manipulate this large volume of data. Exam-
ples of problems that make essential use of algorithms include finding good
routes on which the data travels (techniques for solving such problems appear
in Chapter 22), and using a search engine to quickly find pages on which par-
ticular information resides (related techniques are in Chapters 11 and 32).

* Electronic commerce enables goods and services to be negotiated and ex-
changed electronically, and it depends on the privacy of personal informa-
tion such as credit card numbers, passwords, and bank statements. The core
technologies used in electronic commerce include public-key cryptography and
digital signatures (covered in Chapter 31), which are based on numerical algo-
rithms and number theory.

* Manufacturing and other commercial enterprises often need to allocate scarce
resources in the most beneficial way. An oil company might wish to know
where to place its wells in order to maximize its expected profit. A political
candidate might ask where to spend money buying campaign ad-
vertising in order to maximize the chances of winning an election. An airline
might wish to assign crews to flights in the least expensive way possible, mak-
ing sure that each flight is covered and that government regulations regarding
crew scheduling are met. An internet service provider might wish to determine
where to place additional resources in order to serve its customers more effec-
tively. All of these are examples of problems that can be solved by modeling
them as linear programs, which Chapter 29 explores.

Although some of the details of these examples are beyond the scope of
book, we do give underlying techniques that apply to these problems and
areas. We also show how to solve many specific problems, including the fol-
lowing:

* You have a road map on which the distance between each pair of adj-
tersections is marked, and you wish to determine the shortest route from one
intersection to another. The number of possible routes can be huge, even if you
disallow routes that cross over themselves. How can you choose which of all
possible routes is the shortest? You can start by modeling the road map (which
is itself a model of the actual roads) as a graph (which we will meet in Part VI
and Appendix B). In this graph, you wish to find the shortest path from one
vertex to another. Chapter 22 shows how to solve this problem efficiently.


\newpage

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
