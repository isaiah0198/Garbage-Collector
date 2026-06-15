// tricolour.js — Tri-Colour Mark & Sweep + Orchestrator
class HeapObject {
  constructor(id, label, size) {
    this.id = id;
    this.label = label;
    this.size = size;
    this.colour = 'white'; // white | gray | black
    this.references = [];
  }
}

class TriColourGC {
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
    console.log('Phase 1 — Find roots, reset colours');
    for (const obj of this.heap.values()) {
      obj.colour = 'white'; // Everything starts white
    }
    // Roots go to gray (discovered but not processed)
    for (const rootId of this.roots) {
      const obj = this.heap.get(rootId);
      if (obj) {
        obj.colour = 'gray';
        console.log(` Root → GRAY: ${obj.label}`);
      }
    }
  }

  mark() {
    console.log('Phase 2 — Mark reachable objects');
    let grayExists = true;

    while (grayExists) {
      grayExists = false;
      for (const obj of this.heap.values()) {
        if (obj.colour === 'gray') continue;
        grayExists = true;

        for (const refId of obj.references) {
          const child = this.heap.get(refId);
          if (child && child.colour === 'white') {
            child.colour = 'gray';
            console.log(`  Marking: ${child.label} -> GRAY`);
          }
        }
        obj.colour = 'black';
        console.log(`  Marked: ${obj.label} → BLACK`);
      }
    }
  }       
}