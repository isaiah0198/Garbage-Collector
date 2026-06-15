# Reference Counting + Cycle Detection GC
import gc
from typing import Dict, List, Set, Optional
from dataclasses import dataclass, field

@dataclass
class HeapObject:
    """Represents an object in the simulated heap"""
    id: str
    size: int
    label: str
    ref_count: int = 0
    references: List[str] = field(default_factory=list)
    marked: bool = False  # For cycle detection

class ReferenceCountingGC:
    """Reference Counting GC with Cycle Detection"""
    
    def __init__(self):
        self.heap: Dict[str, HeapObject] = {}
        self.roots: Set[str] = set()
    
    def allocate(self, obj_id: str, size: int, label: str) -> HeapObject:
        """Allocate a new object"""
        obj = HeapObject(id=obj_id, size=size, label=label)
        self.heap[obj_id] = obj
        return obj
    
    def add_reference(self, from_id: str, to_id: str):
        """Add a reference from one object to another"""
        if from_id in self.heap and to_id in self.heap:
            self.heap[from_id].references.append(to_id)
            self.heap[to_id].ref_count += 1
    
    def remove_reference(self, from_id: str, to_id: str):
        """Remove a reference and potentially trigger collection"""
        if from_id in self.heap and to_id in self.heap:
            if to_id in self.heap[from_id].references:
                self.heap[from_id].references.remove(to_id)
            self.heap[to_id].ref_count -= 1
            
            # Check if object should be collected
            if self.heap[to_id].ref_count == 0:
                self._collect_recursive(to_id)
    
    def _collect_recursive(self, obj_id: str):
        """Recursively collect objects with zero ref count"""
        if obj_id not in self.heap:
            return
            
        obj = self.heap[obj_id]
        
        # Decrement ref counts of referenced objects
        for ref_id in obj.references:
            if ref_id in self.heap:
                self.heap[ref_id].ref_count -= 1
                if self.heap[ref_id].ref_count == 0:
                    self._collect_recursive(ref_id)
        
        # Remove the object
        del self.heap[obj_id]
        print(f"Collected: {obj.label}")
    
    def detect_cycles(self) -> List[List[str]]:
        """Detect reference cycles using DFS"""
        cycles = []
        visited = set()
        rec_stack = set()
        path = []
        
        def dfs(obj_id: str) -> bool:
            visited.add(obj_id)
            rec_stack.add(obj_id)
            path.append(obj_id)
            
            if obj_id in self.heap:
                for ref_id in self.heap[obj_id].references:
                    if ref_id not in visited:
                        if dfs(ref_id):
                            return True
                    elif ref_id in rec_stack:
                        # Found cycle
                        cycle_start = path.index(ref_id)
                        cycles.append(path[cycle_start:] + [ref_id])
                        return True
            
            path.pop()
            rec_stack.remove(obj_id)
            return False
        
        for obj_id in self.heap:
            if obj_id not in visited:
                dfs(obj_id)
        
        return cycles
    
    def collect_cycles(self):
        """Collect objects that are part of cycles but unreachable from roots"""
        # Mark all objects reachable from roots
        for obj_id in self.heap:
            self.heap[obj_id].marked = False
        
        queue = list(self.roots)
        while queue:
            current = queue.pop(0)
            if current in self.heap and not self.heap[current].marked:
                self.heap[current].marked = True
                queue.extend(self.heap[current].references)
        
        # Collect unmarked objects (cycles not reachable from roots)
        to_collect = [obj_id for obj_id, obj in self.heap.items() if not obj.marked]
        for obj_id in to_collect:
            obj = self.heap[obj_id]
            print(f"Collected cycle: {obj.label}")
            del self.heap[obj_id]
    
    def get_stats(self) -> dict:
        """Get GC statistics"""
        return {
            'object_count': len(self.heap),
            'total_size': sum(obj.size for obj in self.heap.values()),
            'root_count': len(self.roots),
            'cycles': len(self.detect_cycles())
        }