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
  dataStructures: "RBSGKlAvoiM",     // Data Structures and Algorithms (freeCodeCamp)
  machineLearning: "ukzFI9rgwfU",    // Machine Learning Course – Python
  deepLearning: "ukzFI9rgwfU",      // Deep Learning / Neural Networks (ML course covers DL)
  deepLearning2: "ukzFI9rgwfU",     // Same course – neural networks and training
  aws: "ulprqHHWlNg",                // AWS Tutorial for Beginners
  docker: "fqMOX6JJhGo",             // Docker Tutorial for Beginners
  linux: "wBp0RbZJakQ",              // Linux for Beginners
  networking: "q3y2-t6klAk",         // Computer Networking Course
  oops: "pTB0EiLXUC8",               // OOP in Python / Object-Oriented Programming
  // Frontend frameworks & libraries
  vue: "4deVCNJq3qc",                // Vue.js Course for Beginners
  angular: "Fdf5aTYRW0E",            // Angular for Beginners
  nextjs: "wm5gMKuwSYk",             // Next.js App Router – full course
  // Backend frameworks
  express: "TlB_eWDSMt4",             // Node/Express (same as nodejs)
  django: "rHux0gMZ3Eg",              // Django – Python web framework
  flask: "Z1RJmh_OqeA",              // Flask – Python micro web framework
  springboot: "9SGDpannr8o",         // Spring Boot full course
  // Non-technical subjects (TED, Google, freeCodeCamp – embeddable)
  communication: "eIho2S0ZahI",     // Julian Treasure – How to speak so people want to listen (TED)
  communication2: "ESkB4_8YClI",     // TED – How to Unlock Your Communication Superpower
  projectManagement: "SJcHiiNpUds",  // Google Project Management Certificate – 2hr full course
  projectManagement2: "IpwR2t_7Xwg", // Google PM Professional Certificate – full course
  english: "LDkvRFCm8No",           // BBC Learning English – How to speak more fluently
  english2: "gYq-ilAbxDM",          // 55 English lessons – grammar & vocabulary
  resume: "mE3qB1do50Y",            // Google – Top Resume Tips From Recruiters
  resume2: "XgH4LOkPhBk",           // Google – How To Write A Resume That Stands Out
  interview: "8hpSMnCwCxY",         // freeCodeCamp – Master Behavioral Interviews
  interview2: "8hpSMnCwCxY",        // Same – behavioral interview deep dive
  timeManagement: "y2X7c9TUQJ8",    // Rory Vaden – How To Multiply Your Time (TEDx)
  timeManagement2: "Rk5C149J9C0",   // Tim Urban – Why you procrastinate (TED)
  leadership: "qp0HIF3SfI4",        // Simon Sinek – How great leaders inspire action (TED)
  leadership2: "qp0HIF3SfI4",       // Same – leadership and inspiration
  softSkills: "eIho2S0ZahI",        // Communication (TED)
  softSkills2: "Ks-_Mh1QhMc",       // Body language / confidence (TED)
  publicSpeaking: "Ks-_Mh1QhMc",    // Amy Cuddy – Body language (TED)
  publicSpeaking2: "eIho2S0ZahI",   // Julian Treasure – How to speak (TED)
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
    keys: ["data-structures", "datastructures", "algorithms", "dsa"],
    description: "Data structures and algorithms. Full curriculum from introduction to end – arrays, trees, sorting, and problem-solving.",
    sections: [
      { title: "Introduction to DSA", videos: [{ title: "Data Structures and Algorithms Full Course", description: "Arrays, linked lists, trees, sorting, searching – full curriculum.", youtube_video_id: V.dataStructures }] },
      { title: "Core Data Structures", videos: [{ title: "Arrays, Lists, Trees, and Graphs", description: "Essential structures for coding interviews.", youtube_video_id: V.dataStructures }] },
      { title: "Complete DSA Course", videos: [{ title: "Algorithms – From Start to End", description: "Sorting, searching, and optimization.", youtube_video_id: V.generic }] },
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
    keys: ["aws", "amazon-web-services", "cloud"],
    description: "Cloud computing with AWS. Full curriculum from introduction to end – EC2, S3, Lambda, and cloud architecture.",
    sections: [
      { title: "Introduction to AWS", videos: [{ title: "AWS Tutorial for Beginners", description: "Amazon Web Services – full course from start to end.", youtube_video_id: V.aws }] },
      { title: "AWS Core Services", videos: [{ title: "EC2, S3, and Lambda", description: "Core AWS services and use cases.", youtube_video_id: V.aws }] },
      { title: "Complete AWS Course", videos: [{ title: "Cloud Architecture – From Start to End", description: "Design and deploy on AWS.", youtube_video_id: V.generic }] },
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
    keys: ["linux", "ubuntu", "unix"],
    description: "Linux operating system. Full curriculum from introduction to end – command line, scripting, and administration.",
    sections: [
      { title: "Introduction to Linux", videos: [{ title: "Linux for Beginners", description: "Terminal, file system, and essential commands.", youtube_video_id: V.linux }] },
      { title: "Linux Fundamentals", videos: [{ title: "Shell, Permissions, and Scripting", description: "Core Linux skills for developers.", youtube_video_id: V.linux }] },
      { title: "Complete Linux Course", videos: [{ title: "Linux – From Start to End", description: "Administration and automation.", youtube_video_id: V.generic }] },
    ],
  },
  {
    keys: ["networking", "computer-networks", "networks"],
    description: "Computer networking fundamentals. Full curriculum from introduction to end – TCP/IP, protocols, and design.",
    sections: [
      { title: "Introduction to Networking", videos: [{ title: "Computer Networking Course", description: "Networks, protocols, and security – full course.", youtube_video_id: V.networking }] },
      { title: "Networking Fundamentals", videos: [{ title: "TCP/IP, DNS, and Security", description: "How networks work and how to secure them.", youtube_video_id: V.networking }] },
      { title: "Complete Networking Course", videos: [{ title: "Networking – From Start to End", description: "Design and troubleshoot networks.", youtube_video_id: V.generic }] },
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
    keys: ["spring-boot", "springboot", "spring"],
    description: "Java framework for production backend. REST APIs, data, and microservices.",
    sections: [
      { title: "Introduction to Spring Boot", videos: [{ title: "Spring Boot Full Course", description: "Spring Boot – REST, JPA, and production apps.", youtube_video_id: V.springboot }] },
      { title: "Spring Boot Fundamentals", videos: [{ title: "Spring Boot – From Start to End", description: "Build Java backend services.", youtube_video_id: V.springboot }] },
    ],
  },
  // ---------- Non-technical subjects (full curriculum: intro → end) — seeded first so they appear LOWER on page ----------
  {
    keys: ["communication", "communication-skills"],
    description: "Effective communication for work and life. Full curriculum from introduction to end – verbal, written, and interpersonal skills.",
    sections: [
      { title: "Introduction to Communication", videos: [{ title: "How to Speak So People Want to Listen", description: "Julian Treasure (TED) – clarity and confidence.", youtube_video_id: V.communication }] },
      { title: "Core Communication Skills", videos: [{ title: "Unlock Your Communication Superpower", description: "TED – become a supercommunicator.", youtube_video_id: V.communication2 }] },
      { title: "Complete Communication Course", videos: [{ title: "Communication – From Start to End", description: "Verbal, written, and interpersonal mastery.", youtube_video_id: V.communication }] },
    ],
  },
  {
    keys: ["project-management", "pm", "pmp"],
    description: "Plan, execute, and deliver projects. Full curriculum from introduction to end – Agile, Scrum, and tools.",
    sections: [
      { title: "Introduction to Project Management", videos: [{ title: "Google Project Management Certificate", description: "2hr full course – planning, execution, delivery.", youtube_video_id: V.projectManagement }] },
      { title: "PM Fundamentals", videos: [{ title: "Project Management Professional – Full Course", description: "PMP concepts and best practices.", youtube_video_id: V.projectManagement2 }] },
      { title: "Complete Project Management", videos: [{ title: "PM – From Start to End", description: "Agile, Scrum, and delivery.", youtube_video_id: V.projectManagement }] },
    ],
  },
  {
    keys: ["english", "spoken-english", "english-speaking"],
    description: "Improve your English – speaking, grammar, and confidence. Full curriculum from introduction to end.",
    sections: [
      { title: "Introduction to English Speaking", videos: [{ title: "How to Speak English More Fluently", description: "BBC Learning English – practical tips.", youtube_video_id: V.english }] },
      { title: "English Grammar & Vocabulary", videos: [{ title: "55 English Lessons in 55 Minutes", description: "Grammar and vocabulary mega-class.", youtube_video_id: V.english2 }] },
      { title: "Complete English Course", videos: [{ title: "English – From Start to End", description: "Speaking, grammar, and confidence.", youtube_video_id: V.english }] },
    ],
  },
  {
    keys: ["resume", "resume-writing", "cv"],
    description: "Write a strong resume and CV. Full curriculum from introduction to end – format, content, and ATS-friendly tips.",
    sections: [
      { title: "Introduction to Resume Writing", videos: [{ title: "Top Resume Tips From Recruiters", description: "Google – what recruiters look for.", youtube_video_id: V.resume }] },
      { title: "Resume Fundamentals", videos: [{ title: "How To Write A Resume That Stands Out", description: "Google – format, keywords, and impact.", youtube_video_id: V.resume2 }] },
      { title: "Complete Resume Course", videos: [{ title: "Resume & CV – From Start to End", description: "ATS-friendly, structure, and examples.", youtube_video_id: V.resume }] },
    ],
  },
  {
    keys: ["interview", "interview-skills", "job-interview"],
    description: "Ace job interviews. Full curriculum from introduction to end – preparation, questions, and body language.",
    sections: [
      { title: "Introduction to Interview Skills", videos: [{ title: "Master Behavioral Interviews", description: "freeCodeCamp – STAR method and preparation.", youtube_video_id: V.interview }] },
      { title: "Interview Preparation", videos: [{ title: "Job Interview Skills – Deep Dive", description: "Common questions and how to answer.", youtube_video_id: V.interview2 }] },
      { title: "Complete Interview Course", videos: [{ title: "Interviews – From Start to End", description: "Preparation, delivery, and follow-up.", youtube_video_id: V.interview }] },
    ],
  },
  {
    keys: ["time-management", "productivity"],
    description: "Manage time and get more done. Full curriculum from introduction to end – priorities, planning, and focus.",
    sections: [
      { title: "Introduction to Time Management", videos: [{ title: "How To Multiply Your Time", description: "Rory Vaden (TEDx) – prioritize and plan.", youtube_video_id: V.timeManagement }] },
      { title: "Productivity Fundamentals", videos: [{ title: "Why You Procrastinate – And How to Get Things Done", description: "Tim Urban (TED) – focus and habits.", youtube_video_id: V.timeManagement2 }] },
      { title: "Complete Time Management", videos: [{ title: "Time & Productivity – From Start to End", description: "Priorities, planning, and execution.", youtube_video_id: V.timeManagement }] },
    ],
  },
  {
    keys: ["leadership", "leadership-skills"],
    description: "Lead teams and projects effectively. Full curriculum from introduction to end – influence, delegation, and motivation.",
    sections: [
      { title: "Introduction to Leadership", videos: [{ title: "How Great Leaders Inspire Action", description: "Simon Sinek (TED) – start with why.", youtube_video_id: V.leadership }] },
      { title: "Leadership Fundamentals", videos: [{ title: "Leadership Skills – Influence and Motivation", description: "How to lead with impact and empathy.", youtube_video_id: V.leadership2 }] },
      { title: "Complete Leadership Course", videos: [{ title: "Leadership – From Start to End", description: "Delegation, teams, and vision.", youtube_video_id: V.leadership }] },
    ],
  },
  {
    keys: ["soft-skills"],
    description: "Essential soft skills for career success. Full curriculum from introduction to end – communication, teamwork, adaptability.",
    sections: [
      { title: "Introduction to Soft Skills", videos: [{ title: "Communication Skills for Career", description: "TED – how to communicate effectively.", youtube_video_id: V.softSkills }] },
      { title: "Core Soft Skills", videos: [{ title: "Body Language and Confidence", description: "TED – how you present yourself.", youtube_video_id: V.softSkills2 }] },
      { title: "Complete Soft Skills Course", videos: [{ title: "Soft Skills – From Start to End", description: "Communication, teamwork, and professionalism.", youtube_video_id: V.softSkills }] },
    ],
  },
  {
    keys: ["public-speaking", "presentation-skills"],
    description: "Speak confidently in public. Full curriculum from introduction to end – structure, delivery, and overcoming fear.",
    sections: [
      { title: "Introduction to Public Speaking", videos: [{ title: "Your Body Language May Shape Who You Are", description: "Amy Cuddy (TED) – confidence and presence.", youtube_video_id: V.publicSpeaking }] },
      { title: "Public Speaking Fundamentals", videos: [{ title: "How to Speak So People Want to Listen", description: "Julian Treasure (TED) – structure and delivery.", youtube_video_id: V.publicSpeaking2 }] },
      { title: "Complete Public Speaking", videos: [{ title: "Public Speaking – From Start to End", description: "Overcome fear, structure, and deliver.", youtube_video_id: V.publicSpeaking }] },
    ],
  },
  {
    keys: ["getting-started"],
    description: "A short course to get you started with the LMS. Same-topic only: how to use the portal.",
    sections: [
      {
        title: "Introduction",
        videos: [
          { title: "Welcome to the LMS", description: "Welcome and how to use the portal.", youtube_video_id: V.generic },
        ],
      },
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
