# ref_counter.py - Reference counting GC with cycle detection
import gc as builtin_gc
from collections import defaultdict
from dataclasses import dataclass, field

@dataclass
class HeapObject:
    id: str
    label: str
    size: int
    ref_count: int = 0
    references: list = field(default_factory=list)

class RefCountGC:
    def __init__(self):
        self.heap = dict[str, HeapObject] = {}
        self.roots = set[str] = set()
        self._id_counter = 0
        self.total_freed = 0

    def allocate(self, label: str, size: int) -> HeapObject:
        obj_id = f"obj_{self._id_counter}"
        self._id_counter += 1
        obj = HeapObject(id=obj_id, label=label, size=size)
        self.heap[obj_id] = obj
        print(f"Allocated: {label} ({size} bytes)")
        return obj
    
    def add_reference(self, from_id: str, to_id: str):
        """When A references B, B's ref_count goes up."""
        self.heap[from_id].references.append(to_id)
        self.heap[to_id].ref_count += 1

    def remove_reference(self, from_id: str, to_id: str):
        """When A stops referencing B, B's ref_count goes down."""
        if to_id in self.heap[from_id].references:
            self.heap[from_id].references.remove(to_id)
            self.heap[to_id].ref_count -= 1
            if self.heap[to_id].ref_count == 0:
                self.free(to_id)

    def find_zero_refs(self) -> list[str]:
        """Find all objects with zero references."""
        zeroes = [
            obj_id for obj_id, obj in self.heap.items()
            if obj.ref_count <= 0 and obj_id not in self.roots
        ]
        for z in zeroes:
            print(f"Zero ref: {self.heap[z].label} (id={z})")
        return zeroes
    
    def detect_cycles(self) -> list[str]:
        print("Detecting unreachable cycles...")
        reachable = set()
        queue = list(self.roots)

        while queue:
            current = queue.pop(0)
            if current in reachable:
                continue
            reachable.add(current)
            obj = self.heap.get(current)
            if obj:
                queue.extend(obj.references)
        
        cyclic_garbage = [
            obj_id for obj_id in self.heap
            if obj_id not in reachable
        ]
        for c in cyclic_garbage:
            print(f"Cycle detected: {self.heap[c].label} (id={c})")
        return cyclic_garbage
    
    def free(self, obj_id: str):
        obj = self.heap.pop(obj_id, None)
        if obj:
            self.total_freed += obj.size
            print(f"Freed: {obj.label} ({obj.size} bytes)")
            for ref in obj.references:
                if ref in self.heap:
                    self.heap[ref].ref_count -= 1
                    if self.heap[ref].ref_count == 0:
                        self.free(ref)

    # ═══════════════════════════════════════════
    # FULL CYCLE: Find → Detect Cycles → Free → Repeat
    # ═══════════════════════════════════════════
    def collect(self):
        print("\n━━━ GC Cycle ━━━")
        # Step 1: Free zero-ref objects
        zeros = self.find_zero_refs()
        for z in zeros:
            if z in self.heap:
                self._free(z)

        # Step 2: Find cyclic garbage
        cycles = self.detect_cycles()
        for c in cycles:
            if c in self.heap:
                self._free(c)

        print(f"Heap: {len(self.heap)} objects remaining")
        print(f"Total freed: {self.total_freed} bytes\n")

    # Compare with Python's built-in GC
    def compare_with_builtin(self):
        print("🐍 Python built-in gc.collect():")
        collected = builtin_gc.collect()
        print(f"   Built-in freed {collected} objects")


if __name__ == "__main__":
    gc = RefCountGC()

    # Instagram scenario
    tab = gc.allocate("BrowserTab", 128)
    profile = gc.allocate("ProfileView", 256)
    photo = gc.allocate("PhotoData", 512)
    orphan = gc.allocate("OrphanWidget", 200)

    gc.roots.add(tab.id)
    gc.add_reference(tab.id, profile.id)
    gc.add_reference(profile.id, photo.id)
    # orphan has refs but no root path

    # Create a cycle: A → B → A
    cycle_a = gc.allocate("CycleA", 100)
    cycle_b = gc.allocate("CycleB", 100)
    gc.add_reference(cycle_a.id, cycle_b.id)
    gc.add_reference(cycle_b.id, cycle_a.id)

    gc.collect()  # Frees orphan + cycle

    # Close the tab
    gc.roots.discard(tab.id)
    gc.collect()  # Frees everything