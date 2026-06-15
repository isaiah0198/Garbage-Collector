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