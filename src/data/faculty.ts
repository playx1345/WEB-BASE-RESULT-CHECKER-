import { FacultyMember } from './types';

export const facultyMembers: FacultyMember[] = [
  {
    id: "1",
    name: "Dr. John Adeyemi",
    title: "Professor",
    position: "Head of Department",
    department: "Computer Science",
    email: "j.adeyemi@plasupolytechnic.edu.ng",
    phone: "+234 803 456 7890",
    office: "CS Block, Room 101",
    profileImage: "/assets/faculty/dr-adeyemi.jpg",
    qualifications: [
      "Ph.D. Computer Science, University of Lagos",
      "M.Sc. Computer Science, Obafemi Awolowo University",
      "B.Sc. Computer Science, University of Ibadan"
    ],
    specializations: [
      "Artificial Intelligence",
      "Machine Learning",
      "Data Mining",
      "Computer Vision"
    ],
    researchInterests: [
      "Deep Learning Applications in Healthcare",
      "Computer Vision for Agricultural Monitoring",
      "Natural Language Processing for African Languages"
    ],
    publications: [
      "Machine Learning Approaches for Crop Disease Detection (2023)",
      "AI-Powered Educational Systems for Rural Communities (2022)",
      "Deep Learning in Medical Image Analysis (2021)"
    ],
    yearsOfExperience: 15,
    bio: "Dr. John Adeyemi is a distinguished Professor and Head of the Computer Science Department with over 15 years of experience in academia and research. He specializes in artificial intelligence and machine learning applications, with particular focus on developing solutions for African contexts."
  },
  {
    id: "2",
    name: "Dr. Sarah Okafor",
    title: "Associate Professor",
    position: "Deputy Head of Department",
    department: "Computer Science",
    email: "s.okafor@plasupolytechnic.edu.ng",
    phone: "+234 805 123 4567",
    office: "CS Block, Room 102",
    profileImage: "/assets/faculty/dr-okafor.jpg",
    qualifications: [
      "Ph.D. Software Engineering, University of Nigeria, Nsukka",
      "M.Sc. Computer Science, University of Jos",
      "B.Sc. Mathematics/Computer Science, University of Benin"
    ],
    specializations: [
      "Software Engineering",
      "Web Development",
      "Database Systems",
      "Mobile Application Development"
    ],
    researchInterests: [
      "Software Quality Assurance",
      "Agile Development Methodologies",
      "Mobile Computing",
      "E-Learning Platforms"
    ],
    publications: [
      "Agile Software Development in African SMEs (2023)",
      "Mobile Learning Applications for Technical Education (2022)"
    ],
    yearsOfExperience: 12,
    bio: "Dr. Sarah Okafor is an Associate Professor specializing in software engineering and web technologies. She has extensive experience in developing educational software and has led numerous projects in mobile application development for educational institutions."
  },
  {
    id: "3",
    name: "Mr. David Yusuf",
    title: "Senior Lecturer",
    position: "Coordinator, ND Programme",
    department: "Computer Science",
    email: "d.yusuf@plasupolytechnic.edu.ng",
    phone: "+234 807 890 1234",
    office: "CS Block, Room 201",
    profileImage: "/assets/faculty/mr-yusuf.jpg",
    qualifications: [
      "M.Sc. Computer Science, Ahmadu Bello University",
      "PGD Education, University of Jos",
      "B.Sc. Computer Science, Plateau State University"
    ],
    specializations: [
      "Computer Networks",
      "Cybersecurity",
      "Systems Administration",
      "Network Programming"
    ],
    researchInterests: [
      "Network Security",
      "IoT Security",
      "Wireless Sensor Networks",
      "Cloud Computing Security"
    ],
    publications: [
      "Security Challenges in IoT Implementations (2023)",
      "Network Security Best Practices for SMEs (2022)"
    ],
    yearsOfExperience: 10,
    bio: "Mr. David Yusuf is a Senior Lecturer with expertise in computer networks and cybersecurity. He coordinates the National Diploma programme and has extensive industry experience in network administration and security implementations."
  },
  {
    id: "4",
    name: "Mrs. Grace Musa",
    title: "Lecturer I",
    position: "Coordinator, HND Programme",
    department: "Computer Science",
    email: "g.musa@plasupolytechnic.edu.ng",
    phone: "+234 809 234 5678",
    office: "CS Block, Room 202",
    profileImage: "/assets/faculty/mrs-musa.jpg",
    qualifications: [
      "M.Sc. Information Technology, University of Jos",
      "B.Sc. Computer Science, University of Abuja",
      "Cisco Certified Network Associate (CCNA)"
    ],
    specializations: [
      "Database Management",
      "Information Systems",
      "Data Analytics",
      "Business Intelligence"
    ],
    researchInterests: [
      "Big Data Analytics",
      "Business Intelligence Systems",
      "Database Optimization",
      "Data Visualization"
    ],
    yearsOfExperience: 8,
    bio: "Mrs. Grace Musa is a Lecturer I who coordinates the Higher National Diploma programme. She specializes in database management and information systems, with particular interest in data analytics and business intelligence applications."
  },
  {
    id: "5",
    name: "Mr. Ahmed Kalu",
    title: "Lecturer II",
    position: "Laboratory Coordinator",
    department: "Computer Science",
    email: "a.kalu@plasupolytechnic.edu.ng",
    phone: "+234 811 345 6789",
    office: "CS Block, Room 301",
    profileImage: "/assets/faculty/mr-kalu.jpg",
    qualifications: [
      "M.Sc. Computer Engineering, University of Jos",
      "B.Eng. Computer Engineering, Federal University of Technology, Minna",
      "CompTIA A+ Certification"
    ],
    specializations: [
      "Computer Hardware",
      "System Maintenance",
      "Programming Languages",
      "Computer Graphics"
    ],
    researchInterests: [
      "Computer Architecture",
      "Embedded Systems",
      "Graphics Programming",
      "Virtual Reality"
    ],
    yearsOfExperience: 6,
    bio: "Mr. Ahmed Kalu serves as the Laboratory Coordinator, ensuring all computer labs are well-maintained and equipped. He has extensive experience in computer hardware and system administration, and teaches various programming courses."
  },
  {
    id: "6",
    name: "Dr. Blessing Okwu",
    title: "Lecturer I",
    position: "Research Coordinator",
    department: "Computer Science",
    email: "b.okwu@plasupolytechnic.edu.ng",
    phone: "+234 813 456 7890",
    office: "CS Block, Room 203",
    profileImage: "/assets/faculty/dr-okwu.jpg",
    qualifications: [
      "Ph.D. Information Technology, University of Jos",
      "M.Sc. Computer Science, University of Nigeria, Nsukka",
      "B.Sc. Computer Science, Nnamdi Azikiwe University"
    ],
    specializations: [
      "Human-Computer Interaction",
      "User Experience Design",
      "Information Technology Management",
      "Digital Innovation"
    ],
    researchInterests: [
      "User Interface Design",
      "Accessibility in Computing",
      "Digital Transformation",
      "Technology Adoption in Education"
    ],
    publications: [
      "Accessibility Considerations in Educational Software (2023)",
      "Digital Transformation in Nigerian Higher Education (2022)"
    ],
    yearsOfExperience: 7,
    bio: "Dr. Blessing Okwu coordinates research activities in the department and specializes in human-computer interaction and user experience design. She focuses on making technology more accessible and user-friendly for diverse populations."
  },
  {
    id: "7",
    name: "Mr. Joseph Bulus",
    title: "Lecturer II",
    position: "Industry Liaison Officer",
    department: "Computer Science",
    email: "j.bulus@plasupolytechnic.edu.ng",
    phone: "+234 815 567 8901",
    office: "CS Block, Room 302",
    profileImage: "/assets/faculty/mr-bulus.jpg",
    qualifications: [
      "M.Sc. Software Engineering, University of Jos",
      "B.Sc. Computer Science, University of Maiduguri",
      "Project Management Professional (PMP)"
    ],
    specializations: [
      "Software Project Management",
      "Agile Methodologies",
      "Quality Assurance",
      "Enterprise Software"
    ],
    researchInterests: [
      "Software Process Improvement",
      "Project Management in Software Development",
      "Agile Transformation",
      "Software Metrics"
    ],
    yearsOfExperience: 9,
    bio: "Mr. Joseph Bulus serves as the Industry Liaison Officer, facilitating partnerships between the department and technology companies. He has extensive experience in software project management and helps students with internship and job placements."
  },
  {
    id: "8",
    name: "Mrs. Fatima Hassan",
    title: "Assistant Lecturer",
    position: "Student Affairs Coordinator",
    department: "Computer Science",
    email: "f.hassan@plasupolytechnic.edu.ng",
    phone: "+234 817 678 9012",
    office: "CS Block, Room 303",
    profileImage: "/assets/faculty/mrs-hassan.jpg",
    qualifications: [
      "M.Sc. Information Systems, Bayero University Kano",
      "B.Sc. Computer Science, Usmanu Danfodiyo University",
      "Certificate in Counseling Psychology"
    ],
    specializations: [
      "Information Systems",
      "Student Counseling",
      "Academic Support",
      "E-Learning"
    ],
    researchInterests: [
      "Educational Technology",
      "Student Success Strategies",
      "Academic Performance Analytics",
      "Digital Literacy"
    ],
    yearsOfExperience: 4,
    bio: "Mrs. Fatima Hassan coordinates student affairs and provides academic support to students. She specializes in information systems and has a passion for helping students succeed in their academic journey through technology-enhanced learning."
  }
];