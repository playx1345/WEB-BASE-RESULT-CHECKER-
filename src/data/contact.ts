import { ContactInfo, DepartmentInfo } from './types';

export const departmentInfo: DepartmentInfo = {
  name: "Department of Computer Science",
  establishedYear: 1995,
  mission: "To revolutionize academic transparency and efficiency through a secure, accessible, and intelligent result management system—empowering students and administrators of the Department of Computer Science with real-time academic insights and digital autonomy.",
  vision: "To be the leading Computer Science department in West Africa, renowned for excellence in education, research, and innovation that drives technological advancement and societal development.",
  values: [
    "Excellence in education and research",
    "Innovation and creativity",
    "Integrity and ethical conduct",
    "Collaboration and teamwork",
    "Continuous learning and adaptation",
    "Service to community and society"
  ],
  history: "The Department of Computer Science was established in 1995 as part of Plateau State Polytechnic Barkin Ladi's commitment to technological education and development. Starting with just 20 students and 3 faculty members, the department has grown to become one of the most respected computer science programs in Nigeria. Over the years, we have graduated over 2,500 students who now work in leading technology companies, government agencies, and as successful entrepreneurs across Nigeria and beyond. The department has consistently upgraded its curriculum to align with global standards and emerging technologies, ensuring our graduates remain competitive in the rapidly evolving technology landscape.",
  accreditation: [
    "National Board for Technical Education (NBTE) - Full Accreditation",
    "West African Examinations Council (WAEC) Recognition",
    "Nigerian Universities Commission (NUC) Recognition",
    "ISO 9001:2015 Quality Management System Certification"
  ],
  facilities: [
    "6 Modern Computer Laboratories with 180+ workstations",
    "High-speed Internet connectivity (1Gbps fiber optic)",
    "Artificial Intelligence Research Laboratory",
    "Cybersecurity and Networking Laboratory",
    "Mobile Application Development Studio",
    "Graphics and Game Development Lab",
    "24/7 Access Study Centers",
    "Multimedia Conference Center (100-seat capacity)",
    "Faculty Research Offices",
    "Student Collaboration Spaces",
    "Server Room with Redundant Systems",
    "Library with 2,000+ Computing Books and Digital Resources"
  ],
  achievements: [
    "Over 2,500 graduates since establishment",
    "95% graduate employment rate within 6 months",
    "50+ research publications in international journals (2019-2024)",
    "Winner - Best Computer Science Department (Middle Belt Region, 2023)",
    "₦15M+ in research grants secured (2020-2024)",
    "Strategic partnerships with Microsoft, Google, IBM, and Cisco",
    "Alumni working in top tech companies globally",
    "5 faculty members with international PhD degrees",
    "Host of Annual Tech Innovation Summit",
    "Active participation in National IT competitions with multiple wins"
  ],
  partnerships: [
    "Microsoft Nigeria - Azure Cloud Services and Certifications",
    "Google for Education - Workspace and Developer Tools",
    "Cisco Networking Academy - CCNA Training Programs",
    "IBM Skills Network - AI and Data Science Courses",
    "Oracle Academy - Database Management Training",
    "Amazon Web Services - Cloud Computing Education",
    "Local Tech Companies - Internship and Job Placements",
    "International Development Research Centre - Research Collaboration",
    "Nigerian Communications Commission - Cybersecurity Initiatives",
    "Plateau State ICT Agency - Technology Policy Development"
  ]
};

export const contactInfo: ContactInfo = {
  department: "Department of Computer Science",
  address: {
    street: "Plateau State Polytechnic Barkin Ladi Campus",
    city: "Barkin Ladi",
    state: "Plateau State",
    postalCode: "930001",
    country: "Nigeria"
  },
  phone: "+234 73 461 0123",
  email: "computerscience@plasupolytechnic.edu.ng",
  website: "https://plasupolytechnic.edu.ng/computer-science",
  officeHours: {
    "Monday": "8:00 AM - 5:00 PM",
    "Tuesday": "8:00 AM - 5:00 PM",
    "Wednesday": "8:00 AM - 5:00 PM",
    "Thursday": "8:00 AM - 5:00 PM",
    "Friday": "8:00 AM - 5:00 PM",
    "Saturday": "9:00 AM - 2:00 PM",
    "Sunday": "Closed"
  },
  emergencyContact: "+234 803 456 7890",
  mapCoordinates: {
    latitude: 9.5324,
    longitude: 8.8964
  }
};