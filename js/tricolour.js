// Tri-Colour Marking GC Implementation

class HeapObject {
    constructor(id, size, label) {
        this.id = id;
        this.size = size;
        this.label = label;
        this.references = [];
        this.color = 'white'; // white, gray, black
    }
    
    addReference(refId) {
        this.references.push(refId);
    }
}

class TriColourGC {
    constructor() {
        this.heap = new Map();
        this.roots = new Set();
    }
    
    allocate(id, size, label) {
        const obj = new HeapObject(id, size, label);
        this.heap.set(id, obj);
        return obj;
    }
    
    addRoot(objId) {
        this.roots.add(objId);
    }
    
    /**
     * Tri-colour marking algorithm:
     * - White: Not yet visited (candidates for collection)
     * - Gray: Visited but references not yet processed
     * - Black: Fully processed (definitely reachable)
     */
    mark() {
        // Step 1: Color all objects white
        for (const obj of this.heap.values()) {
            obj.color = 'white';
        }
        
        // Step 2: Color roots gray
        const graySet = [];
        for (const rootId of this.roots) {
            const obj = this.heap.get(rootId);
            if (obj) {
                obj.color = 'gray';
                graySet.push(obj);
            }
        }
        
        // Step 3: Process gray objects until none remain
        while (graySet.length > 0) {
            const current = graySet.pop();
            current.color = 'black';
            
            for (const refId of current.references) {
                const ref = this.heap.get(refId);
                if (ref && ref.color === 'white') {
                    ref.color = 'gray';
                    graySet.push(ref);
                }
            }
        }
    }
    
    sweep() {
        let freed = 0;
        for (const [id, obj] of this.heap.entries()) {
            if (obj.color === 'white') {
                this.heap.delete(id);
                freed++;
                console.log(`Freed: ${obj.label} (size: ${obj.size})`);
            }
        }
        return freed;
    }
    
    collect() {
        console.log('=== Starting Tri-Colour GC ===');
        console.log(`Heap size before: ${this.heap.size}`);
        
        this.mark();
        const freed = this.sweep();
        
        console.log(`Objects freed: ${freed}`);
        console.log(`Heap size after: ${this.heap.size}`);
        console.log('=== GC Complete ===');
        
        return freed;
    }
    
    getStats() {
        const colorCounts = { white: 0, gray: 0, black: 0 };
        for (const obj of this.heap.values()) {
            colorCounts[obj.color]++;
        }
        
        return {
            objectCount: this.heap.size,
            totalSize: Array.from(this.heap.values()).reduce((sum, obj) => sum + obj.size, 0),
            colorDistribution: colorCounts,
            rootCount: this.roots.size
        };
    }
}

// Export for orchestrator
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HeapObject, TriColourGC };
}