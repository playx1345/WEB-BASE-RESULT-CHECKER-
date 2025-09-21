// TypeScript interfaces for all data structures used in the website

export interface FacultyMember {
  id: string;
  name: string;
  title: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  office?: string;
  profileImage?: string;
  qualifications: string[];
  specializations: string[];
  researchInterests: string[];
  publications?: string[];
  yearsOfExperience: number;
  bio: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  creditUnits: number;
  level: string; // "ND1", "ND2", "HND1", "HND2"
  semester: "First" | "Second";
  description: string;
  prerequisites?: string[];
  learningOutcomes: string[];
}

export interface Program {
  id: string;
  name: string;
  type: "ND" | "HND";
  duration: string;
  description: string;
  admissionRequirements: string[];
  careerProspects: string[];
  courses: {
    [level: string]: {
      [semester: string]: Course[];
    };
  };
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: "announcement" | "event" | "achievement" | "research";
  date: string;
  author?: string;
  imageUrl?: string;
  tags: string[];
  featured: boolean;
}

export interface ContactInfo {
  department: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  website: string;
  officeHours: {
    [day: string]: string;
  };
  emergencyContact?: string;
  mapCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface DepartmentInfo {
  name: string;
  establishedYear: number;
  mission: string;
  vision: string;
  values: string[];
  history: string;
  accreditation: string[];
  facilities: string[];
  achievements: string[];
  partnerships: string[];
}