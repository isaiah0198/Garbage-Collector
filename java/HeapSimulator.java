//HeapSimulator.java - A simple Mark & Sweep GC simulator in Java
import java.util.*;

/**
 * Represents an object in the simulated heap
 */
class HeapObject {
    public String id;
    public int size;
    public boolean marked;        // FIX: Added marked field for GC
    public String label;          // FIX: Added label field for debugging
    public List<String> references;
    
    public HeapObject(String id, int size, String label) {
        this.id = id;
        this.size = size;
        this.label = label;
        this.marked = false;
        this.references = new ArrayList<>();
    }
    
    public void addReference(String refId) {
        references.add(refId);
    }
}

/**
 * Mark & Sweep Garbage Collector Simulator
 */
public class HeapSimulator {
    private Map<String, HeapObject> heap;
    private Set<String> roots;
    
    public HeapSimulator() {
        heap = new HashMap<>();
        roots = new HashSet<>();
    }
    
    /**
     * Create a new object in the heap
     */
    public HeapObject allocate(String id, int size, String label) {
        HeapObject obj = new HeapObject(id, size, label);
        heap.put(id, obj);
        return obj;
    }
    
    /**
     * Add a root reference
     */
    public void addRoot(String objId) {
        roots.add(objId);
    }
    
    /**
     * Remove a root reference
     */
    public void removeRoot(String objId) {
        roots.remove(objId);
    }
    
    /**
     * FIX: Returns the collection of root object IDs
     */
    public Collection<String> roots() {
        return new ArrayList<>(roots);
    }
    
    /**
     * FIX: Mark phase - traverse from roots and mark reachable objects
     */
    public void mark() {
        // Reset all marks
        for (HeapObject obj : heap.values()) {
            obj.marked = false;
        }
        
        // BFS from roots
        Queue<String> queue = new LinkedList<>(roots());
        Set<String> visited = new HashSet<>(roots);
        
        while (!queue.isEmpty()) {
            String currentId = queue.poll();
            HeapObject obj = heap.get(currentId);
            
            if (obj != null && !obj.marked) {
                obj.marked = true;
                
                // Add all references to queue
                for (String refId : obj.references) {
                    if (!visited.contains(refId) && heap.containsKey(refId)) {
                        visited.add(refId);
                        queue.offer(refId);
                    }
                }
            }
        }
    }
    
    /**
     * FIX: Sweep phase - remove unmarked objects
     * @return number of objects freed
     */
    public int sweep() {
        int freed = 0;
        Iterator<Map.Entry<String, HeapObject>> iterator = heap.entrySet().iterator();
        
        while (iterator.hasNext()) {
            Map.Entry<String, HeapObject> entry = iterator.next();
            HeapObject obj = entry.getValue();
            
            if (!obj.marked) {
                iterator.remove();
                freed++;
                System.out.println("Freed: " + obj.label + " (size: " + obj.size + ")");
            }
        }
        
        return freed;
    }
    
    /**
     * Run full GC cycle
     */
    public int collect() {
        System.out.println("=== Starting GC ===");
        System.out.println("Heap size before: " + heap.size());
        
        // Print roots
        for (String rootId : roots()) {
            HeapObject obj = heap.get(rootId);
            if (obj != null) {
                System.out.println("Root: " + obj.label);
            }
        }
        
        mark();
        int freed = sweep();
        
        System.out.println("Objects freed: " + freed);
        System.out.println("Heap size after: " + heap.size());
        System.out.println("=== GC Complete ===");
        
        return freed;
    }
    
    /**
     * Get current heap size
     */
    public int getHeapSize() {
        return heap.size();
    }
    
    /**
     * Get memory usage (sum of object sizes)
     */
    public int getMemoryUsage() {
        return heap.values().stream().mapToInt(obj -> obj.size).sum();
    }
    
    // Demo main method
    public static void main(String[] args) {
        HeapSimulator gc = new HeapSimulator();
        
        // Allocate objects
        HeapObject root1 = gc.allocate("obj1", 100, "Root Object 1");
        HeapObject root2 = gc.allocate("obj2", 200, "Root Object 2");
        HeapObject child1 = gc.allocate("obj3", 50, "Child of obj1");
        HeapObject child2 = gc.allocate("obj4", 75, "Child of obj2");
        HeapObject orphan = gc.allocate("obj5", 150, "Orphan (will be collected)");
        
        // Set up references
        root1.addReference("obj3");
        root2.addReference("obj4");
        
        // Set roots
        gc.addRoot("obj1");
        gc.addRoot("obj2");
        // Note: obj5 is not reachable from any root
        
        // Run GC
        gc.collect();
        
        System.out.println("\nFinal memory usage: " + gc.getMemoryUsage() + " bytes");
    }
}