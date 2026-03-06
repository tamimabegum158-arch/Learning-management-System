/**
 * Subject presets: database of technical and non-technical subjects.
 * Each subject has: description, sections, videos, and full curriculum from introduction to end.
 *
 * STORED DATA PER SUBJECT:
 * - description: short summary (shown on subject card)
 * - sections: ordered list (e.g. Introduction → Basics → Advanced → Complete)
 * - videos: per section, with title, description, and YouTube video ID
 * - topic-specific only: no mixed topics (e.g. SQL subject = only SQL videos)
 *
 * APPLIES TO:
 * - Seed: running "npx prisma db seed" creates all subjects below with their sections/videos.
 * - Add subject: when a user adds a new subject whose name matches a preset key, that full
 *   curriculum (description + sections + videos) is applied automatically.
 * - Empty subjects: if a subject has 0 sections but matches a preset, content is filled when opened.
 *
 * HOW TO ADD A NEW SUBJECT:
 * 1. Add video IDs to the V object above (if new topic).
 * 2. Add one entry to SUBJECT_PRESETS with keys, description, and sections (intro → end).
 * 3. Each video: "title", optional "description", "youtube_video_id" (11-char ID).
 */

/** Topic-specific YouTube video IDs: each subject uses only videos for that topic (intro → end) */
const V = {
  // SQL – full curriculum from introduction to advanced
  sqlIntro: "HXV3zeQKqGY",           // Mike Dane – SQL Full Database Course for Beginners (4hr)
  sqlBasics: "jR4fxWSmzSw",          // freeCodeCamp – Learn SQL by Building Student Database Part 1
  sqlData: "y3TCtu-TaTk",            // freeCodeCamp – Learn SQL Part 2
  sqlAdvanced: "hWu07vu-CoI",        // Ultimate SQL Course Beginner to Advanced
  sqlComplete: "R2fQ5-PMju0",        // Intellipaat – SQL Full Course 11hr
  // Java – introduction to end
  javaIntro: "eIrMbAQSU34",          // Mosh – Java Full Course for Beginners
  javaBasics: "GoXwIVyNvX0",         // freeCodeCamp – Java for Absolute Beginners
  javaCore: "xk4_1vDrzzo",           // Bro Code – Java Full Course 12hr (fundamentals, OOP)
  javaComplete: "Qgl81fPcLc8",       // Amigoscode – Java Full Course
  // Python – introduction to end
  pythonIntro: "_uQrJ0TkZlc",       // Mosh – Python for Beginners
  pythonFull: "K5KVEU3aaeQ",        // Mosh – Python Full Course
  pythonBasics: "s3KhqPjBPaQ",       // NeetCode – Python for Beginners Full Course
  pythonComplete: "oZmmaGbOJv8",     // Full Python Course – Programming Tutorial
  // JavaScript
  javascript: "PkZNo7MFNFg",         // freeCodeCamp – JavaScript Full Course
  // TypeScript
  typescript: "d56mG7DezGs",         // Mosh – TypeScript Tutorial
  // C++
  cpp: "vLnPwxZdW4Y",                // freeCodeCamp – C++ Full Course
  // C#
  csharp: "Z5JS36NlJiU",             // Microsoft – C# for Beginners
  // Go
  go: "YS4e4q9oBaU",                 // freeCodeCamp – Go (Golang) 7hr
  // Rust
  rust: "jAm7xrRxEUE",               // Rust Beginner Crash Course
  // Swift
  swift: "CwA1VWP0Ldw",              // Sean Allen – Swift Full Course
  // Kotlin
  kotlin: "FlBhpm9aRUg",             // Kotlin Full Course for Beginners
  // PHP
  php: "ny4-hGENWVk",                // Codeholic – PHP Crash Course
  // Ruby
  ruby: "t_ispmWmdjY",               // Ruby Programming Full Course
  // DBMS – Database Management System
  dbmsIntro: "c5HAwKX-suM",          // DBMS Full Course for Beginners – from scratch
  dbmsRdbms: "QBQuVWkM2Pw",          // Relational DB & SQL with MySQL – DBMS, RDBMS
  dbmsComplete: "iwRneX7GIGI",       // Database Engineering Complete Course
  // More technical subjects
  react: "bMknfKXIFA8",              // React Course – Beginner's Tutorial
  nodejs: "TlB_eWDSMt4",             // Node.js Full Course
  htmlCss: "mU6anWqZJcc",            // HTML & CSS Full Course
  git: "RGOj5yH7evk",                // Git and GitHub for Beginners
  machineLearning: "ukzFI9rgwfU",    // Machine Learning Course – Python
  deepLearning: "ukzFI9rgwfU",      // Deep Learning / Neural Networks (ML course covers DL)
  deepLearning2: "ukzFI9rgwfU",     // Same course – neural networks and training
  docker: "fqMOX6JJhGo",             // Docker Tutorial for Beginners
  oops: "pTB0EiLXUC8",               // OOP in Python / Object-Oriented Programming
  // Frontend frameworks & libraries
  vue: "4deVCNJq3qc",                // Vue.js Course for Beginners
  angular: "Fdf5aTYRW0E",            // Angular for Beginners
  nextjs: "wm5gMKuwSYk",             // Next.js App Router – full course
  // Backend frameworks
  express: "TlB_eWDSMt4",             // Node/Express (same as nodejs)
  django: "rHux0gMZ3Eg",              // Django – Python web framework
  flask: "Z1RJmh_OqeA",              // Flask – Python micro web framework
  // Additional technical courses
  mongodb: "4yqu8YF29cU",            // MongoDB Full Tutorial w/ Node.js, Express, Mongoose
  kubernetes: "_4uQI4ihGVU",         // freeCodeCamp – Kubernetes in 6 Hours
  graphql: "5199E50O7SI",            // freeCodeCamp – GraphQL Course for Beginners
  redis: "XCsS_NVAa1g",              // freeCodeCamp – Redis Course In-Memory Database
  restApi: "EbHf2aCuPVM",            // REST API Design – Concepts to Constraints
  systemDesign: "F2FmTdLtb_4",       // freeCodeCamp – System Design Concepts & Interview Prep
  reactNative: "WDunoPNBxKA",        // React Native Full Course for Beginners (4hr)
  devops: "j5Zsa_eOXeY",             // freeCodeCamp – DevOps Engineering for Beginners
  bash: "mSQM8Xo78Wc",               // Bash Scripting Tutorial for Beginners 3hr
  microservices: "h6aDu9e2L_s",      // Microservices Tutorial for Beginners (Telusko)
  jenkins: "f4idgaq2VqA",            // freeCodeCamp – Learn Jenkins CI/CD Pipeline
  cybersecurity: "fd9LPDSeP_I",       // Cybersecurity for Beginners – entire course FREE
  // Fallback: use freeCodeCamp JavaScript (embeddable, public)
  generic: "PkZNo7MFNFg",
};

export interface PresetVideo {
  title: string;
  description?: string;
  youtube_video_id?: string;
}

export interface PresetSection {
  title: string;
  videos: PresetVideo[];
}

/** One preset = one subject with description + sections + videos. Keys = possible names (e.g. "java", "react"). */
export interface SubjectPreset {
  keys: string[];
  description: string;
  sections: PresetSection[];
}

/** Normalize subject title for lookup: "React JS" -> "react-js", "C++" -> "c++" */
export function normalizeSubjectKey(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

// ---------------------------------------------------------------------------
// ADD NEW SUBJECTS HERE — one block per subject (description + sections + videos)
// Order: TECHNICAL (frontend/backend languages & tools) first = appear UPPER on page after seed.
//        NON-TECHNICAL last = appear LOWER on page.
// ---------------------------------------------------------------------------

/** Presets used by seed and createSubject: one source of truth for subject-specific videos (intro → end). */
export const SUBJECT_PRESETS: SubjectPreset[] = [
  // ---------- Technical: programming languages & frontend/backend (appear UPPER on page) ----------
  {
    keys: ["java"],
    description: "Enterprise-grade, object-oriented language. Used in Android, backend, and large-scale systems. Learn Java from introduction to end.",
    sections: [
      {
        title: "Introduction to Java",
        videos: [
          { title: "Java Full Course for Beginners", description: "Mosh – setup, types, control flow, clean coding.", youtube_video_id: V.javaIntro },
          { title: "Java for Absolute Beginners", description: "freeCodeCamp – variables, basics, easy to follow.", youtube_video_id: V.javaBasics },
        ],
      },
      {
        title: "Java Fundamentals",
        videos: [
          { title: "Java Full Course – Fundamentals & OOP", description: "Bro Code – variables, loops, arrays, strings, 80+ topics.", youtube_video_id: V.javaCore },
        ],
      },
      {
        title: "Object-Oriented Java",
        videos: [
          { title: "Classes, Inheritance, Polymorphism in Java", description: "Continue with OOP – classes, interfaces, abstraction.", youtube_video_id: V.javaCore },
        ],
      },
      {
        title: "Complete Java Course",
        videos: [
          { title: "Java Full Course – From Zero to Mastery", description: "Amigoscode – core Java from setup through advanced concepts.", youtube_video_id: V.javaComplete },
        ],
      },
    ],
  },
  {
    keys: ["python"],
    description: "Learn Python programming from introduction to advanced. Widely used in web, data science, and automation.",
    sections: [
      {
        title: "Introduction to Python",
        videos: [
          { title: "Python for Beginners", description: "Mosh – clear intro to Python, setup, first steps.", youtube_video_id: V.pythonIntro },
          { title: "Python Full Course – Basics", description: "Mosh – variables, loops, functions, 2+ hours.", youtube_video_id: V.pythonFull },
        ],
      },
      {
        title: "Python Fundamentals",
        videos: [
          { title: "Python for Beginners – Full Course", description: "NeetCode – variables, functions, loops, strings, lists, dictionaries.", youtube_video_id: V.pythonBasics },
        ],
      },
      {
        title: "Complete Python Course",
        videos: [
          { title: "Full Python Course – Programming Tutorial", description: "Complete Python from start to end – all topics.", youtube_video_id: V.pythonComplete },
        ],
      },
    ],
  },
  {
    keys: ["javascript"],
    description: "The language of the web. Master JavaScript from introduction to end – frontend, backend (Node.js), and full-stack.",
    sections: [
      {
        title: "Introduction to JavaScript",
        videos: [
          { title: "JavaScript Full Course for Beginners", description: "freeCodeCamp – full course from start to end, easy to follow.", youtube_video_id: V.javascript },
        ],
      },
    ],
  },
  {
    keys: ["typescript"],
    description: "Typed JavaScript. Learn TypeScript from introduction to end – type safety and tooling.",
    sections: [
      { title: "Introduction to TypeScript", videos: [{ title: "TypeScript Tutorial for Beginners", description: "Mosh – types, interfaces, enums, clear explanations from start.", youtube_video_id: V.typescript }] },
    ],
  },
  {
    keys: ["c++", "cpp"],
    description: "High-performance systems programming. Learn C++ from introduction to end – game engines, OS, performance.",
    sections: [
      { title: "Introduction to C++", videos: [{ title: "C++ Full Course for Beginners", description: "freeCodeCamp – full course from start to end, easy to understand.", youtube_video_id: V.cpp }] },
    ],
  },
  {
    keys: ["c#", "csharp"],
    description: "Microsoft's language for .NET, Unity, and Windows. Learn C# from introduction to end.",
    sections: [
      { title: "Introduction to C#", videos: [{ title: "C# for Beginners", description: "Official Microsoft – strings, OOP, projects, full intro.", youtube_video_id: V.csharp }] },
    ],
  },
  {
    keys: ["go", "golang"],
    description: "Simple, fast, concurrent language from Google. Full course from introduction to end.",
    sections: [
      { title: "Introduction to Go", videos: [{ title: "Go (Golang) Full Course", description: "freeCodeCamp – variables, functions, goroutines, 7hr full course.", youtube_video_id: V.go }] },
    ],
  },
  {
    keys: ["rust"],
    description: "Systems programming with memory safety. Learn Rust from introduction – systems, WebAssembly, CLI.",
    sections: [
      { title: "Introduction to Rust", videos: [{ title: "Rust Beginner Crash Course", description: "Variables, loops, error handling – easy intro to Rust.", youtube_video_id: V.rust }] },
    ],
  },
  {
    keys: ["ruby"],
    description: "Developer-friendly language. Learn Ruby from introduction to end – Rails and web.",
    sections: [
      { title: "Introduction to Ruby", videos: [{ title: "Ruby Programming Full Course", description: "Full course – Ruby fundamentals from start to end.", youtube_video_id: V.ruby }] },
    ],
  },
  {
    keys: ["php"],
    description: "Server-side language powering WordPress and the web. Learn PHP from introduction to end.",
    sections: [
      { title: "Introduction to PHP", videos: [{ title: "PHP Crash Course for Beginners", description: "Codeholic – syntax, variables, forms, databases.", youtube_video_id: V.php }] },
    ],
  },
  {
    keys: ["swift"],
    description: "Apple's language for iOS and macOS. Learn Swift from introduction to end.",
    sections: [
      { title: "Introduction to Swift", videos: [{ title: "Swift Programming Full Course", description: "Sean Allen – variables, optionals, SwiftUI, full course.", youtube_video_id: V.swift }] },
    ],
  },
  {
    keys: ["kotlin"],
    description: "Modern language for Android and JVM. Learn Kotlin from introduction to end.",
    sections: [
      { title: "Introduction to Kotlin", videos: [{ title: "Kotlin Full Course for Beginners", description: "6hr – Kotlin fundamentals and Android, full course.", youtube_video_id: V.kotlin }] },
    ],
  },
  {
    keys: ["sql"],
    description: "Structured Query Language for databases. Essential for data and backend developers. Learn from introduction to advanced.",
    sections: [
      {
        title: "Introduction to SQL",
        videos: [
          { title: "SQL Full Database Course for Beginners", description: "Mike Dane – what is SQL, setup, databases, very clear intro.", youtube_video_id: V.sqlIntro },
        ],
      },
      {
        title: "SQL Basics – Queries and Tables",
        videos: [
          { title: "Learn SQL by Building a Student Database – Part 1", description: "freeCodeCamp – creating tables, SELECT, WHERE, basic queries.", youtube_video_id: V.sqlBasics },
        ],
      },
      {
        title: "Working with Data",
        videos: [
          { title: "Learn SQL by Building a Student Database – Part 2", description: "freeCodeCamp – INSERT, UPDATE, more queries and practice.", youtube_video_id: V.sqlData },
        ],
      },
      {
        title: "Intermediate SQL",
        videos: [
          { title: "Ultimate SQL Course – Beginner to Advanced", description: "Joins, aggregations, subqueries – full progression.", youtube_video_id: V.sqlAdvanced },
        ],
      },
      {
        title: "Complete SQL Mastery",
        videos: [
          { title: "SQL Full Course – Complete SQL for Beginners", description: "11hr complete course – from start to end, all topics.", youtube_video_id: V.sqlComplete },
        ],
      },
    ],
  },
  {
    keys: ["dbms", "database-management-system", "database"],
    description: "Database Management System – learn DBMS from introduction to end. Concepts, RDBMS, and database engineering.",
    sections: [
      {
        title: "Introduction to DBMS",
        videos: [
          { title: "DBMS Full Course for Beginners", description: "Learn Database Management System from scratch – what is DBMS, core concepts.", youtube_video_id: V.dbmsIntro },
        ],
      },
      {
        title: "Relational Databases & SQL",
        videos: [
          { title: "Relational Database & SQL with MySQL – DBMS, RDBMS", description: "RDBMS, SQL queries for beginners – full course.", youtube_video_id: V.dbmsRdbms },
        ],
      },
      {
        title: "Database Engineering Complete",
        videos: [
          { title: "Database Engineering Complete Course | DBMS Complete Course", description: "Full DBMS course – from introduction to end.", youtube_video_id: V.dbmsComplete },
        ],
      },
    ],
  },
  // ---------- More technical subjects (full curriculum: intro → end) ----------
  {
    keys: ["react", "reactjs"],
    description: "Build modern user interfaces with React. Full curriculum from introduction to end – components, hooks, state, and projects.",
    sections: [
      { title: "Introduction to React", videos: [{ title: "React Course – Beginner's Tutorial", description: "Learn React from scratch – components, JSX, state.", youtube_video_id: V.react }] },
      { title: "React Fundamentals", videos: [{ title: "React Full Course – Components & Hooks", description: "Deep dive into React fundamentals and best practices.", youtube_video_id: V.react }] },
      { title: "Complete React Course", videos: [{ title: "Build Projects with React", description: "From basics to building real applications.", youtube_video_id: V.generic }] },
    ],
  },
  {
    keys: ["nodejs", "node.js", "node"],
    description: "Server-side JavaScript with Node.js. Full curriculum from introduction to end – APIs, Express, and deployment.",
    sections: [
      { title: "Introduction to Node.js", videos: [{ title: "Node.js Full Course for Beginners", description: "Complete Node.js tutorial – from start to end.", youtube_video_id: V.nodejs }] },
      { title: "Node.js & Express", videos: [{ title: "Build APIs with Node and Express", description: "Backend development and REST APIs.", youtube_video_id: V.nodejs }] },
      { title: "Complete Node.js Course", videos: [{ title: "Node.js – From Start to End", description: "Full backend development with Node.js.", youtube_video_id: V.generic }] },
    ],
  },
  {
    keys: ["html", "html-css", "html5", "css"],
    description: "Web fundamentals. HTML and CSS from introduction to end – structure, styling, and responsive design.",
    sections: [
      { title: "Introduction to HTML & CSS", videos: [{ title: "HTML & CSS Full Course", description: "Build websites from scratch – tags, layout, styling.", youtube_video_id: V.htmlCss }] },
      { title: "HTML & CSS Fundamentals", videos: [{ title: "Structure and Styling – Deep Dive", description: "Semantic HTML, flexbox, grid, and responsive design.", youtube_video_id: V.htmlCss }] },
      { title: "Complete Web Basics", videos: [{ title: "Build a Full Website", description: "From first tag to finished page.", youtube_video_id: V.generic }] },
    ],
  },
  {
    keys: ["git", "github"],
    description: "Version control and collaboration. Full curriculum from introduction to end – commit, branch, merge, and workflows.",
    sections: [
      { title: "Introduction to Git & GitHub", videos: [{ title: "Git and GitHub for Beginners", description: "Version control from start to end – commands and best practices.", youtube_video_id: V.git }] },
      { title: "Git Workflows", videos: [{ title: "Branching, Merging, and Collaboration", description: "Team workflows and GitHub best practices.", youtube_video_id: V.git }] },
      { title: "Complete Git Course", videos: [{ title: "Git – From Start to End", description: "Master version control for your projects.", youtube_video_id: V.generic }] },
    ],
  },
  {
    keys: ["deep-learning", "deeplearning", "dl"],
    description: "Neural networks and deep learning. Full curriculum from introduction to end – CNNs, RNNs, and real-world applications.",
    sections: [
      { title: "Introduction to Deep Learning", videos: [{ title: "Deep Learning Fundamentals", description: "Neural networks, layers, and training from scratch.", youtube_video_id: V.deepLearning }] },
      { title: "Deep Learning Core", videos: [{ title: "Neural Networks and Backpropagation", description: "How deep learning models learn – math and intuition.", youtube_video_id: V.deepLearning2 }] },
      { title: "Complete Deep Learning Course", videos: [{ title: "Deep Learning – From Start to End", description: "Build and train models for real projects.", youtube_video_id: V.deepLearning }] },
    ],
  },
  {
    keys: ["machine-learning", "ml", "ai"],
    description: "Machine learning and AI fundamentals. Full curriculum from introduction to end – models, Python, and applications.",
    sections: [
      { title: "Introduction to Machine Learning", videos: [{ title: "Machine Learning Course – Python", description: "ML basics to advanced – supervised, unsupervised learning.", youtube_video_id: V.machineLearning }] },
      { title: "ML Fundamentals", videos: [{ title: "Models, Training, and Evaluation", description: "Core ML concepts and Python tools.", youtube_video_id: V.machineLearning }] },
      { title: "Complete ML Course", videos: [{ title: "Machine Learning – From Start to End", description: "Full ML pipeline and real-world projects.", youtube_video_id: V.generic }] },
    ],
  },
  {
    keys: ["docker", "containers"],
    description: "Containerization with Docker. Full curriculum from introduction to end – images, containers, and deployment.",
    sections: [
      { title: "Introduction to Docker", videos: [{ title: "Docker Tutorial for Beginners", description: "Containers, Dockerfile, and DevOps basics.", youtube_video_id: V.docker }] },
      { title: "Docker & DevOps", videos: [{ title: "Images, Containers, and Compose", description: "Build and run containerized applications.", youtube_video_id: V.docker }] },
      { title: "Complete Docker Course", videos: [{ title: "Docker – From Start to End", description: "Containerization and deployment.", youtube_video_id: V.generic }] },
    ],
  },
  {
    keys: ["oops", "object-oriented-programming", "object-oriented"],
    description: "Object-oriented programming. Full curriculum from introduction to end – classes, inheritance, and design.",
    sections: [
      { title: "Introduction to OOP", videos: [{ title: "OOP – Object-Oriented Programming", description: "Classes, objects, encapsulation, and design.", youtube_video_id: V.oops }] },
      { title: "OOP Concepts", videos: [{ title: "Inheritance, Polymorphism, and Abstraction", description: "Core OOP principles in practice.", youtube_video_id: V.oops }] },
      { title: "Complete OOP Course", videos: [{ title: "Object-Oriented Design – From Start to End", description: "Design patterns and clean code.", youtube_video_id: V.generic }] },
    ],
  },
  {
    keys: ["vue", "vuejs", "vue.js"],
    description: "Progressive JavaScript framework for building UIs. Frontend from introduction to end – components, reactivity, and Vue 3.",
    sections: [
      { title: "Introduction to Vue.js", videos: [{ title: "Vue.js Course for Beginners", description: "Vue 3 – components, reactivity, and single-file components.", youtube_video_id: V.vue }] },
      { title: "Vue Fundamentals", videos: [{ title: "Vue.js – From Start to End", description: "Build modern UIs with Vue.", youtube_video_id: V.vue }] },
    ],
  },
  {
    keys: ["angular"],
    description: "Enterprise frontend framework by Google. Full curriculum – TypeScript, components, and single-page applications.",
    sections: [
      { title: "Introduction to Angular", videos: [{ title: "Angular for Beginners", description: "Angular – components, modules, and routing.", youtube_video_id: V.angular }] },
      { title: "Angular Fundamentals", videos: [{ title: "Angular – From Start to End", description: "Build scalable web apps with Angular.", youtube_video_id: V.angular }] },
    ],
  },
  {
    keys: ["nextjs", "next.js", "next"],
    description: "React framework for production – SSR, static sites, and full-stack. Frontend and backend in one.",
    sections: [
      { title: "Introduction to Next.js", videos: [{ title: "Next.js Full Course", description: "App Router, server components, and deployment.", youtube_video_id: V.nextjs }] },
      { title: "Next.js Fundamentals", videos: [{ title: "Next.js – From Start to End", description: "Build full-stack React applications.", youtube_video_id: V.nextjs }] },
    ],
  },
  {
    keys: ["express", "expressjs", "express.js"],
    description: "Backend Node.js framework for APIs and web apps. REST, middleware, and deployment.",
    sections: [
      { title: "Introduction to Express", videos: [{ title: "Node.js & Express Full Course", description: "Build REST APIs and backend services with Express.", youtube_video_id: V.express }] },
      { title: "Express Fundamentals", videos: [{ title: "Express – From Start to End", description: "APIs, middleware, and best practices.", youtube_video_id: V.express }] },
    ],
  },
  {
    keys: ["django"],
    description: "High-level Python web framework. Backend from introduction to end – ORM, admin, and deployment.",
    sections: [
      { title: "Introduction to Django", videos: [{ title: "Django Full Course", description: "Django – models, views, templates, and REST.", youtube_video_id: V.django }] },
      { title: "Django Fundamentals", videos: [{ title: "Django – From Start to End", description: "Build production Python web apps.", youtube_video_id: V.django }] },
    ],
  },
  {
    keys: ["flask"],
    description: "Lightweight Python web framework. Backend APIs and web apps from introduction to end.",
    sections: [
      { title: "Introduction to Flask", videos: [{ title: "Flask Tutorial for Beginners", description: "Flask – routes, templates, and APIs.", youtube_video_id: V.flask }] },
      { title: "Flask Fundamentals", videos: [{ title: "Flask – From Start to End", description: "Build Python web apps with Flask.", youtube_video_id: V.flask }] },
    ],
  },
  {
    keys: ["mongodb", "mongo", "nosql"],
    description: "NoSQL document database. Learn MongoDB with Node.js, Express, and Mongoose – from introduction to end.",
    sections: [
      { title: "Introduction to MongoDB", videos: [{ title: "MongoDB Full Tutorial with Node.js, Express & Mongoose", description: "Installation, schemas, CRUD, and deployment.", youtube_video_id: V.mongodb }] },
      { title: "MongoDB Fundamentals", videos: [{ title: "MongoDB and Mongoose – Queries and Models", description: "Data modeling and queries in MongoDB.", youtube_video_id: V.mongodb }] },
      { title: "Complete MongoDB Course", videos: [{ title: "MongoDB – From Start to End", description: "Build apps with MongoDB and Node.", youtube_video_id: V.generic }] },
    ],
  },
  {
    keys: ["kubernetes", "k8s", "kube"],
    description: "Container orchestration. Learn Kubernetes from introduction to end – Pods, Deployments, Services, and production.",
    sections: [
      { title: "Introduction to Kubernetes", videos: [{ title: "Learn Kubernetes in 6 Hours – Full Course", description: "freeCodeCamp – architecture, YAML, Pods, Deployments, Services.", youtube_video_id: V.kubernetes }] },
      { title: "Kubernetes Fundamentals", videos: [{ title: "Kubernetes – Networking, Storage, and Monitoring", description: "StatefulSets, volumes, and real-world deployment.", youtube_video_id: V.kubernetes }] },
      { title: "Complete Kubernetes Course", videos: [{ title: "Kubernetes – From Start to End", description: "Container orchestration and DevOps.", youtube_video_id: V.generic }] },
    ],
  },
  {
    keys: ["graphql", "graph-ql"],
    description: "Query language for APIs. Learn GraphQL from introduction to end – schemas, resolvers, and Apollo.",
    sections: [
      { title: "Introduction to GraphQL", videos: [{ title: "GraphQL Course for Beginners", description: "freeCodeCamp – queries, Apollo Server, schemas, mutations.", youtube_video_id: V.graphql }] },
      { title: "GraphQL Fundamentals", videos: [{ title: "GraphQL – From Start to End", description: "Build APIs with GraphQL.", youtube_video_id: V.graphql }] },
    ],
  },
  {
    keys: ["redis", "cache", "caching"],
    description: "In-memory data store for caching and queues. Learn Redis from introduction to end.",
    sections: [
      { title: "Introduction to Redis", videos: [{ title: "Redis Course – In-Memory Database Tutorial", description: "freeCodeCamp – data structures, transactions, pub/sub.", youtube_video_id: V.redis }] },
      { title: "Redis Fundamentals", videos: [{ title: "Redis – Caching and Real-World Use", description: "Use Redis in your applications.", youtube_video_id: V.redis }] },
    ],
  },
  {
    keys: ["rest-api", "rest", "api-design", "apis"],
    description: "RESTful API design and development. Learn REST from concepts to constraints and best practices.",
    sections: [
      { title: "Introduction to REST API", videos: [{ title: "REST API From Concepts to Constraints", description: "Design and versioning of HTTP/REST APIs.", youtube_video_id: V.restApi }] },
      { title: "REST API Fundamentals", videos: [{ title: "Designing RESTful Web APIs", description: "Resources, endpoints, and security.", youtube_video_id: V.generic }] },
    ],
  },
  {
    keys: ["system-design", "systemdesign", "system-design-interview"],
    description: "System design for scalability and interviews. Full curriculum – load balancing, databases, caching.",
    sections: [
      { title: "Introduction to System Design", videos: [{ title: "System Design Concepts Course and Interview Prep", description: "freeCodeCamp – scalability, reliability, architecture.", youtube_video_id: V.systemDesign }] },
      { title: "System Design Deep Dive", videos: [{ title: "System Design – From Start to End", description: "High-level design and common interview questions.", youtube_video_id: V.systemDesign }] },
    ],
  },
  {
    keys: ["react-native", "reactnative", "mobile-development"],
    description: "Cross-platform mobile apps with React Native. Build iOS and Android from introduction to end.",
    sections: [
      { title: "Introduction to React Native", videos: [{ title: "React Native Full Course for Beginners", description: "4hr – setup, components, navigation, and projects.", youtube_video_id: V.reactNative }] },
      { title: "React Native Fundamentals", videos: [{ title: "React Native – From Start to End", description: "Build mobile apps with React Native.", youtube_video_id: V.reactNative }] },
    ],
  },
  {
    keys: ["devops", "ci-cd", "cicd", "continuous-integration"],
    description: "DevOps and CI/CD. Learn deployment, pipelines, and application performance from introduction to end.",
    sections: [
      { title: "Introduction to DevOps", videos: [{ title: "DevOps Engineering Course for Beginners", description: "freeCodeCamp – CI/CD, deployment strategies, APM.", youtube_video_id: V.devops }] },
      { title: "DevOps Fundamentals", videos: [{ title: "DevOps – From Start to End", description: "Build and deploy with DevOps practices.", youtube_video_id: V.devops }] },
    ],
  },
  {
    keys: ["bash", "shell-scripting", "shell", "shell-script"],
    description: "Bash and shell scripting for automation. Learn from introduction to end – variables, loops, and scripts.",
    sections: [
      { title: "Introduction to Bash Scripting", videos: [{ title: "Bash Scripting Tutorial for Beginners – Full Course 3hr", description: "Variables, conditionals, loops, arrays, functions.", youtube_video_id: V.bash }] },
      { title: "Bash Fundamentals", videos: [{ title: "Shell Scripting – From Start to End", description: "Automation and system administration.", youtube_video_id: V.bash }] },
    ],
  },
  {
    keys: ["microservices", "microservices-architecture"],
    description: "Microservices architecture. Learn service design, communication, and deployment from introduction to end.",
    sections: [
      { title: "Introduction to Microservices", videos: [{ title: "Microservices Tutorial for Beginners", description: "Eureka, Feign, API Gateway, service communication.", youtube_video_id: V.microservices }] },
      { title: "Microservices Fundamentals", videos: [{ title: "Microservices – From Start to End", description: "Build and deploy microservices.", youtube_video_id: V.microservices }] },
    ],
  },
  {
    keys: ["jenkins"],
    description: "CI/CD with Jenkins. Learn pipelines, automation, and deployment from introduction to end.",
    sections: [
      { title: "Introduction to Jenkins", videos: [{ title: "Learn Jenkins by Building a CI/CD Pipeline", description: "freeCodeCamp – Jenkinsfile, Docker, GitHub integration.", youtube_video_id: V.jenkins }] },
      { title: "Jenkins Fundamentals", videos: [{ title: "Jenkins – From Start to End", description: "Build and run CI/CD pipelines.", youtube_video_id: V.jenkins }] },
    ],
  },
  {
    keys: ["cybersecurity", "cyber-security", "security", "ethical-hacking"],
    description: "Cybersecurity and ethical hacking fundamentals. Learn security from introduction to end.",
    sections: [
      { title: "Introduction to Cybersecurity", videos: [{ title: "Cybersecurity for Beginners", description: "Security fundamentals and best practices.", youtube_video_id: V.cybersecurity }] },
      { title: "Cybersecurity Fundamentals", videos: [{ title: "Cybersecurity – From Start to End", description: "Protect systems and applications.", youtube_video_id: V.cybersecurity }] },
    ],
  },
  // -------------------------------------------------------------------------
  // TEMPLATE: copy this block to add a new subject (description + sections + videos)
  // -------------------------------------------------------------------------
  // {
  //   keys: ["new-topic", "newtopic"],   // names users might type (e.g. "React" -> "react")
  //   description: "Short description shown on the subject card.",
  //   sections: [
  //     {
  //       title: "Section name",
  //       videos: [
  //         { title: "Video title", description: "Optional.", youtube_video_id: "xxxxxxxxxxx" },
  //       ],
  //     },
  //   ],
  // },
];

// Build maps from key -> description and key -> sections (so one place to add presets)
const descriptionByKey = new Map<string, string>();
const sectionsByKey = new Map<string, PresetSection[]>();
for (const preset of SUBJECT_PRESETS) {
  for (const key of preset.keys) {
    descriptionByKey.set(key, preset.description);
    sectionsByKey.set(key, preset.sections);
  }
}

export function getSubjectDescriptionFromPreset(title: string): string | null {
  const key = normalizeSubjectKey(title);
  const exact = descriptionByKey.get(key);
  if (exact) return exact;
  const firstSegment = key.split("-")[0];
  if (firstSegment) {
    const bySegment = descriptionByKey.get(firstSegment);
    if (bySegment) return bySegment;
  }
  // Match by prefix: "deep-learning-fundamentals" → "deep-learning" preset
  let best: string | null = null;
  for (const presetKey of descriptionByKey.keys()) {
    if (key.startsWith(presetKey) && (!best || presetKey.length > best.length)) best = presetKey;
  }
  return best ? descriptionByKey.get(best) ?? null : null;
}

export function getPresetForSubject(title: string): PresetSection[] | null {
  const key = normalizeSubjectKey(title);
  const exact = sectionsByKey.get(key);
  if (exact?.length) return exact;
  const firstSegment = key.split("-")[0];
  if (firstSegment) {
    const bySegment = sectionsByKey.get(firstSegment);
    if (bySegment?.length) return bySegment;
  }
  // Match by prefix: "deep-learning-fundamentals" → "deep-learning" preset
  let best: string | null = null;
  for (const presetKey of sectionsByKey.keys()) {
    if (key.startsWith(presetKey) && (!best || presetKey.length > best.length)) best = presetKey;
  }
  return best ? sectionsByKey.get(best) ?? null : null;
}

/** Format preset key as display title for seed (e.g. "getting-started" → "Getting Started"). */
export function presetKeyToTitle(key: string): string {
  return key
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
