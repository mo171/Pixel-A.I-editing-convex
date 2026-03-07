# **Complete Frontend Tooling Map - Image Editing SaaS**

## **1. Core Frontend Framework & Architecture**

| Tool/Library | Purpose | Version | Notes |
|--------------|---------|---------|--------|
| **Next.js** | Full-stack React framework | Latest | App Router, SSR/SSG capabilities |
| **React** | UI library | ^18.0.0 | Core frontend framework |
| **TypeScript** | Type safety | Latest | Via Babel preset, not native TS |
| **JavaScript** | Primary language | ES2023+ | Using jsconfig.json for path aliases |

## **2. Major Functional Libraries**

### **Canvas & Image Manipulation**
| Library | Purpose | Usage Context |
|---------|---------|---------------|
| **Fabric.js** | Canvas creation and manipulation | Core image editing functionality |
| **ImageKit** | Image hosting, optimization, and delivery | CDN and image transformations |

### **Authentication & Backend**
| Library | Purpose | Usage Context |
|---------|---------|---------------|
| **Clerk** | Authentication system | Complete auth solution |
| **Convex** | Real-time backend | Database, real-time sync, API |

### **Color Management**
| Library | Purpose | Usage Context |
|---------|---------|---------------|
| **React Colorful** | Color picker components | Image editing tools |


## **3. UI Libraries & Styling**

### **Component Libraries**
| Library | Purpose | Usage Context |
|---------|---------|---------------|
| **Shadcn/ui** | Pre-styled Radix components | Custom design system |
| **Lucide React** | Icon library | Comprehensive icon set |



### **Animations**
| Library | Purpose | Usage Context |
|---------|---------|---------------|
| **React Spinners** | Loading spinners | UI feedback |
| **TW Animate CSS** | Tailwind animations | Enhanced animations |

## **4. Supporting Libraries**

### **State Management & Data Fetching**
| Library | Purpose | Usage Context |
|---------|---------|---------------|
| **SWR** | Data fetching | Used by Clerk |
| **Convex Hooks** | Real-time data | Custom hooks for Convex integration |

### **File Handling**
| Library | Purpose | Usage Context |
|---------|---------|---------------|
| **React Dropzone** | Drag & drop file uploads | Project creation modal |
| **File Selector** | File selection utilities | Upload functionality |

### **Form & Input Handling (Not used but can be used)**
| Library | Purpose | Usage Context |
|---------|---------|---------------|
| **@floating-ui/react-dom** | Tooltip/popover positioning | UI overlays |
| **React Remove Scroll** | Scroll management | Modal interactions |

### **Notifications & Feedback**
| Library | Purpose | Usage Context |
|---------|---------|---------------|
| **Sonner** | Toast notifications | User feedback system |



## **5. Utility / Small Packages**

### **Date & Time**
| Package | Purpose |
|---------|---------|
| **date-fns** | Date manipulation utilities |

### **Navigation & Routing**
| Package | Purpose |
|---------|---------|
| **next/navigation** | Next.js App Router navigation |




## **7. Architecture Patterns**

### **Project Structure**
- **App Router** (Next.js 13+)
- **Component-based architecture**
- **Custom hooks pattern**
- **Headless UI + styled components**

### **Key Architectural Decisions**
1. **Shadcn/ui + Radix UI** → Accessible, customizable components
2. **Convex** → Real-time backend with optimistic updates
3. **Clerk** → Complete authentication solution
4. **Fabric.js** → Canvas-based image editing
5. **ImageKit** → Image delivery and optimization
6. **Tailwind CSS** → Utility-first styling approach


## **8. Custom Hook**
### 1. UseParralex-scrolling
```jsx
"use client";

import { useState, useEffect } from "react";

export const useParallax = () => {
  /* 
   -User scrolls page
      ↓
   Browser scroll event fires (REAL DOM)
      ↓
   handleScroll runs
      ↓
   setScrollY updates React state
      ↓
   React re-renders component
      ↓
   Virtual DOM diff
      ↓
   Real DOM updates
  */
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    /* 
      Component mounted
      ↓
      addEventListener("scroll")
    */
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
};
```

## Conditnonal State render
``` jsx

        {/* Projects Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        ) : projects && projects.length > 0 ? (
          <ProjectGrid projects={projects} />
        ) : (
          <EmptyState onCreateProject={() => setShowNewProjectModal(true)} />
        )}
 
```

## Params and path-name:

params for dynamic slug:
```jsx
  const params = useParams();
  const projectId = params.projectId;
```

## pathname for full url:
```jsx
  import { usePathname } from "next/navigation"; // for getting the url 
  const path = usePathname(); // Get current path so that I can use it 

  if (path.includes("/editor")) {
    return null; // Hide header on editor page
  }
```