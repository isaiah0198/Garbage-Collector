//HeapSimulator.java - Mark & Sweep Garbage Collector
import java.util.*;

public class HeapSimulator {
    private Map<String, HeapObject> heap = new HashMap<>();
    private Set<String> roots = new HashSet<>();

    static class HeapObject {
        String id;
        String label;
        int size;
        List<String> references = new ArrayList<>();

        HeapObject(String id, String label, int size) {
            this.id = id;
            this.label = label;
            this.size = size;
            this.marked = false;
        }
    }

    public HeapObject allocate(string label, int size) {
        String id = "obj_" + UUID.randomUUID().toString().substring(0, 8);
        HeapObject obj = new HeapObject(id, label, size);
        heap.put(id, obj);
        System.out.println("Allocated: " + label + " (" + size + " bytes)");
        return obj;
    }

    public void addRoot(String id) { roots.add(id); }
    public void addReference(String from, String to) {
        heap.get(from).references.add(to);
    }

    private Set<String> findRoots() {
        System.out.println("Finding roots...");
        for (String root : roots) {
            System.out.println("Root: " + obj.label);
        }
        return roots;
    }
}