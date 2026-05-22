<!-- Page 4 | Source: 20260522_231808_page_004_left.jpg -->
<!-- SMART_SCAN_METADATA
{
  "page_number": 4,
  "source_file": "20260522_231808_page_004_left.jpg",
  "boxes": [],
  "trocr_results": []
}
-->

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
