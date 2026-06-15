# Garbage Collector Simulator

A multi-language garbage collector simulator implementing three core
GC algorithms. Demonstrates the **Find → Mark → Sweep → Repeat** cycle
that keeps your RAM clean.

## Core Concept

When you browse Instagram and view a profile, data loads into RAM.
When you close the tab, that data becomes **unreachable**. The garbage
collector finds these unreachable objects and frees the memory.

```
allocate → use → drop reference → GC finds unreachable → sweep → repeat
```

## Project Structure

```
garbage-collector/
├── java/           ← Mark & Sweep in Java
│   └── HeapSimulator.java
├── python/         ← Reference Counting + Cycle Detection
│   └── ref_counter.py
├── js/             ← Tri-Colour GC + Orchestrator
│   └── tricolour.js
├── reports/        ← JSON output per GC run
├── .github/
│   └── workflows/
│       └── gc-runner.yml
└── README.md
```

## Quick Start

### Java
```bash
cd java
javac HeapSimulator.java
java HeapSimulator
```

### Python
```bash
cd python
python ref_counter.py
```

### JavaScript
```bash
cd js
node tricolor.js
```

## Algorithms

| Algorithm | Language | Approach |
|-----------|----------|----------|
| Mark & Sweep | Java | BFS from roots, sweep unmarked |
| Reference Counting | Python | Track ref counts, detect cycles |
| Tri-Color | JavaScript | White/Gray/Black incremental marking |

## The GC Loop

1. **Find Roots** — Identify stack frames, globals, active references
2. **Mark Reachable** — Walk the object graph from roots
3. **Sweep Garbage** — Free anything not marked as reachable
4. **Repeat** — Allocate new objects and run again
