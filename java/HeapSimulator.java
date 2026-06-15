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

    public HeapObject allocate(String label, int size) {
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

    private void mark() {
        System.out.println("Marking reachable objects...");
        for (HeapObject obj : heap.values()) obj.marked = false;

        Queue<String> queue = new LinkedList<>(roots());
        Set<String> visited = new HashSet<>();

        while (!queue.isEmpty()) {
            String id = queue.poll();
            if (visited.contains(id)) continue;
            visited.add(id);

            HeapObject obj = heap.get(id);
            if (obj == null) continue;
            obj.marked = true;
            System.out.println("Marked: " + obj.label);
            
            for (String ref : obj.references) {
                if (!visited.contains(ref)) queue.add(ref);
            }
        }
    }
    public void collectGarbage() {
        System.out.println("\n━━━ GC Cycle ━━━");
        findRoots();
        mark();
        int freed = sweep();
        System.out.println("Reclaimed " + freed + " bytes");
        System.out.println("Heap size: " + heap.size() + " objects\n");
    }

    public static void main(String[] args) {
        HeapSimulator gc = new HeapSimulator();

        // Simulate Instagram browsing
        HeapObject tab = gc.allocate("BrowserTab", 128);
        HeapObject profile = gc.allocate("ProfileView", 256);
        HeapObject photo = gc.allocate("PhotoData", 512);
        HeapObject bio = gc.allocate("UserBio", 64);
        HeapObject comments = gc.allocate("CommentList", 320);
        HeapObject oldCache = gc.allocate("OldCache", 1024);

        gc.addRoot(tab.id);
        gc.addReference(tab.id, profile.id);
        gc.addReference(profile.id, photo.id);
        gc.addReference(profile.id, bio.id);
        gc.addReference(profile.id, comments.id);
        // oldCache has NO root reference → it's garbage!

        gc.collectGarbage(); // Will free oldCache

        // Now "close the tab" — remove root
        gc.roots.remove(tab.id);
        gc.collectGarbage(); // Will free EVERYTHING
    }
}