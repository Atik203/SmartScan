---
title: 'SmartScan Digitized Book'
geometry: 'margin=2.5cm'
fontsize: '11pt'
mainfont: 'DejaVu Serif'
---

Part I Foundations

Introduction

Whan
op
tha
si

pr
It
n
a

=


\newpage

Introduction

When you design and analyze algorithms, you need to be able to describe how they operate and how to design them. You also need some mathematical tools to show that your algorithms do the right thing and do it efficiently. This part will get you started. Later parts of this book will build upon this base.

Chapter 1 provides an overview of algorithms and their place in modern computing systems. This chapter defines what an algorithm is and lists some examples. It also makes a case for considering algorithms as a technology, alongside technologies such as fast hardware, graphical user interfaces, object-oriented systems, and networks.

In Chapter 2, we see our first algorithms, which solve the problem of sorting a sequence of $n$ numbers. They are written in a pseudocode which, although not directly translatable to any conventional programming language, conveys the structure of the algorithm clearly enough that you should be able to implement it in the language of your choice. The sorting algorithms we examine are insertion sort, which uses an incremental approach, and merge sort, which uses a recursive technique known as “divide-and-conquer.” Although the time each requires increases with the value of $n$, the rate of increase differs between the two algorithms. We determine these running times in Chapter 2, and we develop a useful “asymptotic” notation to express them.

Chapter 3 precisely defines asymptotic notation. We'll use asymptotic notation to bound the growth of functions—most often, functions that describe the running time of algorithms—from above and below. The chapter starts by informally defining the most commonly used asymptotic notations and giving an example of how to apply them. It then formally defines five asymptotic notations and presents conventions for how to put them together. The rest of Chapter 3 is primarily a presentation of mathematical notation, more to ensure that your use of notation matches that in this book than to teach you new mathematical concepts.


\newpage

. “te * 14 ‘ 7, ‘  - . £ ¢ 4°. sree 4
ee ‘ ; : , ha . . awry a aE
f Part l Foundations
Chapter 4 delves further into the divide-and-conquer method introduced jp
Chapter 2. It provides two additional examples of divide-and-conquer algorithms
for multiplying square matrices, including Strassen’s surprising method. Chapter 4 —
contains methods for solving recurrences, which are useful for describing the Tun- 1
hing times of recursive algorithms. In the substitution method, you guess an answer
and prove it correct. Recursion trees provide one way to generate a guess. Chap-
ter 4 also presents the powerful technique of the “master method,” which you can
often use to solve recurrences that arise from divide-and-conquer algorithms, A]- ,
though the chapter provides a proof of a foundational theorem on which the master
theorem depends, you should feel free to employ the master method without delv-
ing into the proof. Chapter 4 concludes with some advanced topics.
Chapter 5 introduces probabilistic analysis and randomized algorithms. You
typically use probabilistic analysis to determine the running time of an algorithm
in cases in which, duc to the presence of an inherent probability distribution, the
running time may differ on different inputs of the same size. In some cases, you
might assume that the inputs conform to a known probability distribution, so that ™
you are averaging the running time over all possible inputs. In other cases, the _
probability distribution comes not from the inputs but from random choices made 1.1
during the course of the algorithm. An algorithm whose behavior is determined
not only by its input but by the values produced by a random-number generator is a
randomized algorithm. You can use randomized algorithms to enforce a probability
distribution on the inputs—thereby ensuring that no particular input always causes
poor performance —or even to bound the error rate of algorithms that are allowed
to produce incorrect results on a limited basis.
Appendices A—D contain other mathematical material that you will find helpful
as you read this book. You might have seen much of the material in the appendix
chapters before having read this book (although the specific definitions and nota-
tional conventions we use may differ in some cases from what you have seen in
the past), and so you should think of the appendices as reference material. On the
other hand, you probably have not already seen most of the material in Part I, All
the chapters in Part | and the appendices are written with a tutorial flavor.
»
— ————— ee NF


\newpage

1 The Role of Algorithms in Computing

What are algorithms? Why is the study of algorithms worthwhile? What is the role of algorithms relative to other technologies used in computers? This chapter will answer these questions.

1.1 Algorithms

Informally, an algorithm is any well-defined computational procedure that takes some value, or set of values, as input and produces some value, or set of values, as output in a finite amount of time. An algorithm is thus a sequence of computational steps that transform the input into the output.

You can also view an algorithm as a tool for solving a well-specified computational problem. The statement of the problem specifies in general terms the desired input/output relationship for problem instances, typically of arbitrary large size. The algorithm describes a specific computational procedure for achieving that input/output relationship for all problem instances.

As an example, suppose that you need to sort a sequence of numbers into monotonically increasing order. This problem arises frequently in practice and provides fertile ground for introducing many standard design techniques and analysis tools. Here is how we formally define the sorting problem:

Input: A sequence of $n$ numbers $\langle a_1, a_2, \dots, a_n \rangle$.

Output: A permutation (reordering) $\langle a'_1, a'_2, \dots, a'_n \rangle$ of the input sequence such that $a'_1 \le a'_2 \le \dots \le a'_n$.

Thus, given the input sequence $\{31, 41, 59, 26, 41, 58\}$, a correct sorting algorithm returns as output the sequence $\{26, 31, 41, 41, 58, 59\}$. Such an input sequence is
