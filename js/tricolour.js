// tricolor.js — Tri-Color Mark & Sweep + Orchestrator
class HeapObject {
  constructor(id, label, size) {
    this.id = id;
    this.label = label;
    this.size = size;
    this.color = 'white'; // white | gray | black
    this.references = [];
  }
}

class TriColorGC {
  constructor() {
    this.heap = new Map();
    this.roots = new Set();
    this.idCounter = 0;
    this.stats = { freed: 0, freedBytes: 0, cycles: 0 };
  }

  allocate(label, size) {
    const id = `obj_${++this.idCounter}`;
    const obj = new HeapObject(id, label, size);
    this.heap.set(id, obj);
    console.log(` Allocated: ${label} (${size} bytes)`);
    return obj;
  }

  addRef(fromId, toId) {
    this.heap.get(fromId).references.push(toId);
  }

    findRoots() {
    console.log('Phase 1 — Find roots, reset colors');
    for (const obj of this.heap.values()) {
      obj.color = 'white'; // Everything starts white
    }
    // Roots go to gray (discovered but not processed)
    for (const rootId of this.roots) {
      const obj = this.heap.get(rootId);
      if (obj) {
        obj.color = 'gray';
        console.log(` Root → GRAY: ${obj.label}`);
      }
    }
  }
}