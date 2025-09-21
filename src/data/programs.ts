import { Program, Course } from './types';

// Course definitions
const ndCourses: { [level: string]: { [semester: string]: Course[] } } = {
  "ND1": {
    "First": [
      {
        id: "cs101",
        code: "CS 101",
        title: "Introduction to Computer Science",
        creditUnits: 3,
        level: "ND1",
        semester: "First",
        description: "Introduction to fundamental concepts of computer science, including computer systems, algorithms, and programming basics.",
        learningOutcomes: [
          "Understand basic computer science concepts",
          "Identify different computer systems and their components",
          "Develop logical thinking and problem-solving skills"
        ]
      },
      {
        id: "cs102",
        code: "CS 102",
        title: "Computer Programming I (Python)",
        creditUnits: 4,
        level: "ND1",
        semester: "First",
        description: "Introduction to programming using Python language, covering variables, control structures, functions, and basic data structures.",
        learningOutcomes: [
          "Write basic Python programs",
          "Use control structures and functions",
          "Handle basic data types and structures"
        ]
      },
      {
        id: "cs103",
        code: "CS 103",
        title: "Computer Systems and Organization",
        creditUnits: 3,
        level: "ND1",
        semester: "First",
        description: "Study of computer hardware components, system organization, and basic computer architecture.",
        learningOutcomes: [
          "Understand computer hardware components",
          "Explain computer system organization",
          "Identify different types of computer systems"
        ]
      },
      {
        id: "mth101",
        code: "MTH 101",
        title: "Mathematics for Computer Science I",
        creditUnits: 3,
        level: "ND1",
        semester: "First",
        description: "Mathematical foundations including algebra, logic, and discrete mathematics essential for computer science.",
        learningOutcomes: [
          "Apply mathematical concepts in computing",
          "Use logical reasoning in problem solving",
          "Understand discrete mathematical structures"
        ]
      },
      {
        id: "phy101",
        code: "PHY 101",
        title: "Physics for Computer Science",
        creditUnits: 2,
        level: "ND1",
        semester: "First",
        description: "Basic physics concepts relevant to computing, including electricity, magnetism, and digital electronics.",
        learningOutcomes: [
          "Understand basic electrical concepts",
          "Apply physics principles in computing",
          "Analyze digital electronic circuits"
        ]
      }
    ],
    "Second": [
      {
        id: "cs201",
        code: "CS 201",
        title: "Computer Programming II (Java)",
        creditUnits: 4,
        level: "ND1",
        semester: "Second",
        description: "Object-oriented programming using Java, covering classes, objects, inheritance, and polymorphism.",
        prerequisites: ["CS 102"],
        learningOutcomes: [
          "Implement object-oriented programming concepts",
          "Design and create Java applications",
          "Use inheritance and polymorphism effectively"
        ]
      },
      {
        id: "cs202",
        code: "CS 202",
        title: "Data Structures and Algorithms",
        creditUnits: 4,
        level: "ND1",
        semester: "Second",
        description: "Introduction to fundamental data structures (arrays, linked lists, stacks, queues) and basic algorithms.",
        prerequisites: ["CS 102"],
        learningOutcomes: [
          "Implement basic data structures",
          "Analyze algorithm efficiency",
          "Choose appropriate data structures for problems"
        ]
      },
      {
        id: "cs203",
        code: "CS 203",
        title: "Database Fundamentals",
        creditUnits: 3,
        level: "ND1",
        semester: "Second",
        description: "Introduction to database concepts, relational model, SQL, and database design principles.",
        learningOutcomes: [
          "Design relational databases",
          "Write SQL queries",
          "Understand database management systems"
        ]
      },
      {
        id: "cs204",
        code: "CS 204",
        title: "Web Development I (HTML/CSS)",
        creditUnits: 3,
        level: "ND1",
        semester: "Second",
        description: "Introduction to web development using HTML and CSS, covering responsive design and basic web standards.",
        learningOutcomes: [
          "Create structured web pages with HTML",
          "Style web pages using CSS",
          "Implement responsive web design"
        ]
      },
      {
        id: "mth201",
        code: "MTH 201",
        title: "Mathematics for Computer Science II",
        creditUnits: 3,
        level: "ND1",
        semester: "Second",
        description: "Advanced mathematical concepts including statistics, probability, and calculus for computer science.",
        prerequisites: ["MTH 101"],
        learningOutcomes: [
          "Apply statistical methods in computing",
          "Use probability in algorithm analysis",
          "Understand calculus applications in CS"
        ]
      }
    ]
  },
  "ND2": {
    "First": [
      {
        id: "cs301",
        code: "CS 301",
        title: "Advanced Programming (C++)",
        creditUnits: 4,
        level: "ND2",
        semester: "First",
        description: "Advanced programming concepts using C++, including memory management, templates, and STL.",
        prerequisites: ["CS 201"],
        learningOutcomes: [
          "Master advanced C++ programming",
          "Implement efficient algorithms",
          "Use memory management techniques"
        ]
      },
      {
        id: "cs302",
        code: "CS 302",
        title: "Computer Networks",
        creditUnits: 3,
        level: "ND2",
        semester: "First",
        description: "Introduction to computer networking, protocols, network architecture, and network security.",
        learningOutcomes: [
          "Understand network protocols",
          "Configure basic network systems",
          "Implement network security measures"
        ]
      },
      {
        id: "cs303",
        code: "CS 303",
        title: "Operating Systems",
        creditUnits: 3,
        level: "ND2",
        semester: "First",
        description: "Study of operating system concepts, process management, memory management, and file systems.",
        learningOutcomes: [
          "Understand OS components and functions",
          "Analyze process scheduling algorithms",
          "Implement basic OS operations"
        ]
      },
      {
        id: "cs304",
        code: "CS 304",
        title: "Software Engineering I",
        creditUnits: 3,
        level: "ND2",
        semester: "First",
        description: "Introduction to software engineering principles, SDLC, requirements analysis, and system design.",
        learningOutcomes: [
          "Apply software engineering principles",
          "Analyze software requirements",
          "Design software systems"
        ]
      },
      {
        id: "cs305",
        code: "CS 305",
        title: "Web Development II (JavaScript)",
        creditUnits: 3,
        level: "ND2",
        semester: "First",
        description: "Dynamic web development using JavaScript, DOM manipulation, and introduction to frameworks.",
        prerequisites: ["CS 204"],
        learningOutcomes: [
          "Create interactive web applications",
          "Manipulate DOM elements",
          "Use JavaScript frameworks"
        ]
      }
    ],
    "Second": [
      {
        id: "cs401",
        code: "CS 401",
        title: "Database Management Systems",
        creditUnits: 4,
        level: "ND2",
        semester: "Second",
        description: "Advanced database concepts, normalization, transactions, and database administration.",
        prerequisites: ["CS 203"],
        learningOutcomes: [
          "Design normalized databases",
          "Manage database transactions",
          "Administer database systems"
        ]
      },
      {
        id: "cs402",
        code: "CS 402",
        title: "System Analysis and Design",
        creditUnits: 3,
        level: "ND2",
        semester: "Second",
        description: "Methods for analyzing and designing information systems, including UML and system modeling.",
        learningOutcomes: [
          "Analyze system requirements",
          "Design information systems",
          "Create system documentation"
        ]
      },
      {
        id: "cs403",
        code: "CS 403",
        title: "Mobile Application Development",
        creditUnits: 3,
        level: "ND2",
        semester: "Second",
        description: "Introduction to mobile app development for Android platform using Java/Kotlin.",
        prerequisites: ["CS 201"],
        learningOutcomes: [
          "Develop Android applications",
          "Implement mobile UI/UX",
          "Deploy apps to app stores"
        ]
      },
      {
        id: "cs404",
        code: "CS 404",
        title: "Computer Graphics",
        creditUnits: 3,
        level: "ND2",
        semester: "Second",
        description: "Basic computer graphics concepts, 2D/3D graphics, and graphics programming.",
        learningOutcomes: [
          "Create 2D and 3D graphics",
          "Implement graphics algorithms",
          "Use graphics libraries"
        ]
      },
      {
        id: "cs405",
        code: "CS 405",
        title: "Project I",
        creditUnits: 6,
        level: "ND2",
        semester: "Second",
        description: "Individual project work to apply learned concepts in developing a complete software system.",
        learningOutcomes: [
          "Apply software development skills",
          "Complete a software project",
          "Document and present project work"
        ]
      }
    ]
  }
};

const hndCourses: { [level: string]: { [semester: string]: Course[] } } = {
  "HND1": {
    "First": [
      {
        id: "cs501",
        code: "CS 501",
        title: "Advanced Data Structures and Algorithms",
        creditUnits: 4,
        level: "HND1",
        semester: "First",
        description: "Advanced data structures (trees, graphs, hash tables) and complex algorithms analysis.",
        learningOutcomes: [
          "Implement complex data structures",
          "Analyze algorithm complexity",
          "Optimize algorithm performance"
        ]
      },
      {
        id: "cs502",
        code: "CS 502",
        title: "Software Engineering II",
        creditUnits: 4,
        level: "HND1",
        semester: "First",
        description: "Advanced software engineering concepts, design patterns, and software architecture.",
        learningOutcomes: [
          "Apply design patterns",
          "Architect software systems",
          "Implement software testing strategies"
        ]
      },
      {
        id: "cs503",
        code: "CS 503",
        title: "Network Programming",
        creditUnits: 3,
        level: "HND1",
        semester: "First",
        description: "Programming network applications, socket programming, and distributed systems concepts.",
        learningOutcomes: [
          "Develop network applications",
          "Implement client-server systems",
          "Use network programming APIs"
        ]
      },
      {
        id: "cs504",
        code: "CS 504",
        title: "Information Security",
        creditUnits: 3,
        level: "HND1",
        semester: "First",
        description: "Cybersecurity fundamentals, cryptography, network security, and security protocols.",
        learningOutcomes: [
          "Implement security measures",
          "Use cryptographic techniques",
          "Analyze security vulnerabilities"
        ]
      },
      {
        id: "cs505",
        code: "CS 505",
        title: "Human-Computer Interaction",
        creditUnits: 3,
        level: "HND1",
        semester: "First",
        description: "User interface design principles, usability testing, and user experience design.",
        learningOutcomes: [
          "Design user-friendly interfaces",
          "Conduct usability testing",
          "Apply UX design principles"
        ]
      }
    ],
    "Second": [
      {
        id: "cs601",
        code: "CS 601",
        title: "Enterprise Application Development",
        creditUnits: 4,
        level: "HND1",
        semester: "Second",
        description: "Development of large-scale enterprise applications using frameworks and design patterns.",
        learningOutcomes: [
          "Develop enterprise applications",
          "Use application frameworks",
          "Implement scalable solutions"
        ]
      },
      {
        id: "cs602",
        code: "CS 602",
        title: "Data Analytics and Visualization",
        creditUnits: 3,
        level: "HND1",
        semester: "Second",
        description: "Data analysis techniques, statistical computing, and data visualization tools.",
        learningOutcomes: [
          "Analyze large datasets",
          "Create data visualizations",
          "Apply statistical methods"
        ]
      },
      {
        id: "cs603",
        code: "CS 603",
        title: "Cloud Computing",
        creditUnits: 3,
        level: "HND1",
        semester: "Second",
        description: "Cloud computing concepts, cloud platforms, and cloud-based application development.",
        learningOutcomes: [
          "Deploy applications to cloud",
          "Use cloud services effectively",
          "Understand cloud architecture"
        ]
      },
      {
        id: "cs604",
        code: "CS 604",
        title: "Artificial Intelligence",
        creditUnits: 3,
        level: "HND1",
        semester: "Second",
        description: "Introduction to AI concepts, machine learning basics, and AI applications.",
        learningOutcomes: [
          "Understand AI fundamentals",
          "Implement basic ML algorithms",
          "Develop AI applications"
        ]
      },
      {
        id: "cs605",
        code: "CS 605",
        title: "Research Methodology",
        creditUnits: 2,
        level: "HND1",
        semester: "Second",
        description: "Research methods in computer science, literature review, and research proposal writing.",
        learningOutcomes: [
          "Conduct literature reviews",
          "Write research proposals",
          "Apply research methodologies"
        ]
      }
    ]
  },
  "HND2": {
    "First": [
      {
        id: "cs701",
        code: "CS 701",
        title: "Advanced Database Systems",
        creditUnits: 3,
        level: "HND2",
        semester: "First",
        description: "Advanced database concepts including distributed databases, data warehousing, and NoSQL databases.",
        learningOutcomes: [
          "Design distributed databases",
          "Implement data warehouses",
          "Work with NoSQL databases"
        ]
      },
      {
        id: "cs702",
        code: "CS 702",
        title: "Advanced Web Technologies",
        creditUnits: 3,
        level: "HND2",
        semester: "First",
        description: "Modern web development using frameworks like React, Angular, and Node.js.",
        learningOutcomes: [
          "Develop modern web applications",
          "Use web development frameworks",
          "Implement responsive designs"
        ]
      },
      {
        id: "cs703",
        code: "CS 703",
        title: "Computer Systems Security",
        creditUnits: 3,
        level: "HND2",
        semester: "First",
        description: "Advanced security concepts, penetration testing, and security auditing.",
        learningOutcomes: [
          "Conduct security assessments",
          "Implement security policies",
          "Perform penetration testing"
        ]
      },
      {
        id: "cs704",
        code: "CS 704",
        title: "Project Management",
        creditUnits: 3,
        level: "HND2",
        semester: "First",
        description: "Project management principles, methodologies, and tools for IT projects.",
        learningOutcomes: [
          "Manage IT projects effectively",
          "Use project management tools",
          "Apply PM methodologies"
        ]
      },
      {
        id: "cs705",
        code: "CS 705",
        title: "Machine Learning",
        creditUnits: 3,
        level: "HND2",
        semester: "First",
        description: "Advanced machine learning algorithms, deep learning, and practical ML applications.",
        learningOutcomes: [
          "Implement ML algorithms",
          "Train deep learning models",
          "Deploy ML solutions"
        ]
      }
    ],
    "Second": [
      {
        id: "cs801",
        code: "CS 801",
        title: "Capstone Project",
        creditUnits: 6,
        level: "HND2",
        semester: "Second",
        description: "Major project work demonstrating mastery of computer science concepts and skills.",
        learningOutcomes: [
          "Complete major software project",
          "Demonstrate technical expertise",
          "Present project professionally"
        ]
      },
      {
        id: "cs802",
        code: "CS 802",
        title: "Industry Internship",
        creditUnits: 6,
        level: "HND2",
        semester: "Second",
        description: "Supervised work experience in technology companies or organizations.",
        learningOutcomes: [
          "Gain industry experience",
          "Apply academic knowledge",
          "Develop professional skills"
        ]
      },
      {
        id: "cs803",
        code: "CS 803",
        title: "Emerging Technologies",
        creditUnits: 3,
        level: "HND2",
        semester: "Second",
        description: "Study of current and emerging technologies in computer science and their applications.",
        learningOutcomes: [
          "Understand emerging technologies",
          "Evaluate technology trends",
          "Adapt to technological changes"
        ]
      },
      {
        id: "cs804",
        code: "CS 804",
        title: "Professional Ethics and Practice",
        creditUnits: 2,
        level: "HND2",
        semester: "Second",
        description: "Professional ethics in computing, legal issues, and professional practice guidelines.",
        learningOutcomes: [
          "Apply professional ethics",
          "Understand legal issues in IT",
          "Follow professional standards"
        ]
      }
    ]
  }
};

export const programs: Program[] = [
  {
    id: "nd-cs",
    name: "National Diploma in Computer Science",
    type: "ND",
    duration: "2 Years",
    description: "The National Diploma (ND) in Computer Science is a comprehensive 2-year program designed to provide students with fundamental knowledge and practical skills in computer science and information technology. The program combines theoretical understanding with hands-on experience to prepare graduates for entry-level positions in the technology industry or further studies.",
    admissionRequirements: [
      "Five (5) O'Level credit passes including Mathematics, English Language, and Physics",
      "At least two (2) science subjects (Physics, Chemistry, Biology, or Further Mathematics)",
      "Minimum of C6 in all required subjects",
      "JAMB UTME score of at least 120",
      "Successful completion of Post-UTME screening exercise"
    ],
    careerProspects: [
      "Junior Software Developer",
      "Web Developer",
      "Database Administrator",
      "Network Administrator",
      "Technical Support Specialist",
      "Computer Operator",
      "System Analyst (Entry Level)",
      "IT Support Technician",
      "Graphics Designer",
      "Computer Instructor"
    ],
    courses: ndCourses
  },
  {
    id: "hnd-cs",
    name: "Higher National Diploma in Computer Science",
    type: "HND",
    duration: "2 Years",
    description: "The Higher National Diploma (HND) in Computer Science is an advanced 2-year program that builds upon the foundation laid in the ND program. It focuses on advanced computing concepts, software engineering practices, and emerging technologies. The program is designed to produce skilled professionals capable of handling complex technological challenges and leadership roles in the IT industry.",
    admissionRequirements: [
      "National Diploma (ND) in Computer Science or related field with minimum of Lower Credit",
      "One (1) year relevant industrial experience for ND holders",
      "Bachelor's degree in Computer Science or related field (Direct Entry)",
      "Five (5) O'Level credit passes including Mathematics, English Language, and Physics",
      "Successful completion of departmental screening exercise"
    ],
    careerProspects: [
      "Senior Software Developer",
      "Software Engineer",
      "Systems Analyst",
      "Database Administrator",
      "Network Engineer",
      "Information Security Specialist",
      "Project Manager",
      "IT Consultant",
      "Research and Development Specialist",
      "University Lecturer (with additional qualifications)",
      "Entrepreneur/Startup Founder",
      "Machine Learning Engineer",
      "Cloud Solutions Architect"
    ],
    courses: hndCourses
  }
];