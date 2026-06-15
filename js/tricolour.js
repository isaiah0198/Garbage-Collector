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
    console.log(`  ➕ Allocated: ${label} (${size} bytes)`);
    return obj;
  }

  addRef(fromId, toId) {
    this.heap.get(fromId).references.push(toId);
  }

  // ═══════════════════════════════════════════
  // Phase 1: FIND ROOTS — Initialize white set
  // ═══════════════════════════════════════════
  findRoots() {
    console.log(' Phase 1 — Find roots, reset colours');
    for (const obj of this.heap.values()) {
      obj.colour = 'white'; // Everything starts white
    }
    // Roots go to gray (discovered but not processed)
    for (const rootId of this.roots) {
      const obj = this.heap.get(rootId);
      if (obj) {
        obj.colour = 'gray';
        console.log(`  Root → GRAY: ${obj.label}`);
      }
    }
  }

  // ═══════════════════════════════════════════
  // Phase 2: MARK — Process gray objects
  // Tri-colour invariant: no black→white edges
  // ═══════════════════════════════════════════
  mark() {
    console.log(' Phase 2 — Tri-colour marking');
    let grayExists = true;

    while (grayExists) {
      grayExists = false;
      for (const obj of this.heap.values()) {
        if (obj.colour !== 'gray') continue;
        grayExists = true;

        // Process: mark children gray, self goes black
        for (const refId of obj.references) {
          const child = this.heap.get(refId);
          if (child && child.colour === 'white') {
            child.colour = 'gray';
            console.log(` ${child.label} → GRAY`);
          }
        }
        obj.colour = 'black';
        console.log(` ${obj.label} → BLACK (fully scanned)`);
      }
    }
  }

  // ═══════════════════════════════════════════
  // Phase 3: SWEEP — Free all white objects
  // ═══════════════════════════════════════════
  sweep() {
    console.log(' Phase 3 — Sweep white objects');
    const garbage = [];

    for (const [id, obj] of this.heap) {
      if (obj.colour === 'white') {
        garbage.push(id);
        this.stats.freedBytes += obj.size;
        this.stats.freed++;
        console.log(` Freed: ${obj.label} (${obj.size} bytes)`);
      }
    }

    for (const id of garbage) this.heap.delete(id);
    this.stats.cycles++;
    return garbage.length;
  }

  // Full cycle: Find → Mark → Sweep
  collect() {
    console.log(`\n━━━ GC Cycle ${this.stats.cycles + 1} ━━━`);
    this.findRoots();
    this.mark();
    const freed = this.sweep();
    console.log(`Freed ${freed} objects`);
    console.log(`Heap: ${this.heap.size} objects remaining\n`);
    return this.getReport();
  }

  getReport() {
    return {
      timestamp: new Date().toISOString(),
      heapSize: this.heap.size,
      ...this.stats,
    };
  }
}

// ═══════════════════════════════════════════════
// ORCHESTRATOR — Runs the GC loop automatically
// ═══════════════════════════════════════════════
async function orchestrate() {
  const gc = new TriColourGC();

  // Simulate: user opens Instagram
  const tab = gc.allocate('BrowserTab', 128);
  const app = gc.allocate('InstaApp', 256);
  const profile = gc.allocate('ProfileView', 512);
  const photo = gc.allocate('PhotoData', 1024);
  const comments = gc.allocate('Comments', 320);
  const oldAd = gc.allocate('ExpiredAd', 200);
  const leaked = gc.allocate('LeakedWidget', 150);

  gc.roots.add(tab.id);
  gc.addRef(tab.id, app.id);
  gc.addRef(app.id, profile.id);
  gc.addRef(profile.id, photo.id);
  gc.addRef(profile.id, comments.id);
  // oldAd and leaked have NO path from root

  // Cycle 1: Clean up unreachable objects
  const report1 = gc.collect();

  // Simulate: user closes the tab
  console.log(' User closes the Instagram tab...');
  gc.roots.delete(tab.id);

  // Cycle 2: Everything becomes garbage
  const report2 = gc.collect();

  // Write reports
  const reports = [report1, report2];
  console.log(' Reports:', JSON.stringify(reports, null, 2));
}

orchestrate();