// Mock data for testing analytics when no real database data is available
export const mockAnalyticsData = {
  levelDistribution: {
    'ND1': 150,
    'ND2': 120
  },
  gradeDistribution: {
    'A': 45,
    'B': 68,
    'C': 89,
    'D': 42,
    'E': 15,
    'F': 8
  },
  feeStatusStats: {
    paid: 220,
    unpaid: 50
  },
  performanceStats: {
    excellentPerformers: 45,
    averagePerformers: 180,
    struggling: 45
  },
  carryoverStats: {
    'None': 200,
    '1-2': 45,
    '3-5': 18,
    '6+': 7
  },
  topPerformers: [
    {
      id: '1',
      matricNumber: 'ND/CS/23/001',
      fullName: 'Adebayo John Oluwaseun',
      level: 'ND2',
      cgp: 4.85,
      rank: 1
    },
    {
      id: '2',
      matricNumber: 'ND/CS/23/045',
      fullName: 'Fatima Mohammed Abubakar',
      level: 'ND2',
      cgp: 4.72,
      rank: 2
    },
    {
      id: '3',
      matricNumber: 'ND/CS/24/012',
      fullName: 'Emmanuel Peter Yakubu',
      level: 'ND1',
      cgp: 4.65,
      rank: 3
    },
    {
      id: '4',
      matricNumber: 'ND/CS/23/089',
      fullName: 'Grace Chinyere Okafor',
      level: 'ND2',
      cgp: 4.58,
      rank: 4
    },
    {
      id: '5',
      matricNumber: 'ND/CS/24/034',
      fullName: 'Ibrahim Sani Musa',
      level: 'ND1',
      cgp: 4.45,
      rank: 5
    },
    {
      id: '6',
      matricNumber: 'ND/CS/23/067',
      fullName: 'Blessing Chioma Nwosu',
      level: 'ND2',
      cgp: 4.38,
      rank: 6
    },
    {
      id: '7',
      matricNumber: 'ND/CS/24/078',
      fullName: 'Musa Abdullahi Hassan',
      level: 'ND1',
      cgp: 4.32,
      rank: 7
    },
    {
      id: '8',
      matricNumber: 'ND/CS/23/123',
      fullName: 'Esther Ngozi Okwu',
      level: 'ND2',
      cgp: 4.28,
      rank: 8
    },
    {
      id: '9',
      matricNumber: 'ND/CS/24/056',
      fullName: 'Daniel Sunday Ogbonna',
      level: 'ND1',
      cgp: 4.15,
      rank: 9
    },
    {
      id: '10',
      matricNumber: 'ND/CS/23/098',
      fullName: 'Hauwa Bashir Usman',
      level: 'ND2',
      cgp: 4.08,
      rank: 10
    }
  ],
  subjectAnalysis: [
    {
      courseCode: 'CSC101',
      courseTitle: 'Introduction to Computer Science',
      averagePoint: 3.8,
      studentCount: 145,
      passRate: 92.4,
      needsImprovement: false
    },
    {
      courseCode: 'MTH101',
      courseTitle: 'General Mathematics I',
      averagePoint: 2.9,
      studentCount: 150,
      passRate: 78.6,
      needsImprovement: false
    },
    {
      courseCode: 'PHY101',
      courseTitle: 'General Physics I',
      averagePoint: 2.4,
      studentCount: 145,
      passRate: 65.2,
      needsImprovement: false
    },
    {
      courseCode: 'CSC201',
      courseTitle: 'Data Structures and Algorithms',
      averagePoint: 3.2,
      studentCount: 98,
      passRate: 83.7,
      needsImprovement: false
    },
    {
      courseCode: 'CSC102',
      courseTitle: 'Programming Fundamentals',
      averagePoint: 3.5,
      studentCount: 142,
      passRate: 88.7,
      needsImprovement: false
    },
    {
      courseCode: 'MTH201',
      courseTitle: 'Statistics and Probability',
      averagePoint: 1.8,
      studentCount: 89,
      passRate: 56.2,
      needsImprovement: true
    },
    {
      courseCode: 'CSC203',
      courseTitle: 'Database Management Systems',
      averagePoint: 2.7,
      studentCount: 95,
      passRate: 74.7,
      needsImprovement: false
    },
    {
      courseCode: 'ENG101',
      courseTitle: 'Technical English',
      averagePoint: 3.1,
      studentCount: 148,
      passRate: 85.1,
      needsImprovement: false
    },
    {
      courseCode: 'CSC204',
      courseTitle: 'System Analysis and Design',
      averagePoint: 1.9,
      studentCount: 87,
      passRate: 58.6,
      needsImprovement: true
    },
    {
      courseCode: 'CSC301',
      courseTitle: 'Software Engineering',
      averagePoint: 3.4,
      studentCount: 76,
      passRate: 86.8,
      needsImprovement: false
    }
  ],
  performanceTrends: [
    {
      semester: '2022/2023 First Sem',
      averageGP: 2.8,
      excellentPerformers: 28,
      strugglingStudents: 62
    },
    {
      semester: '2022/2023 Second Sem',
      averageGP: 3.0,
      excellentPerformers: 35,
      strugglingStudents: 58
    },
    {
      semester: '2023/2024 First Sem',
      averageGP: 3.2,
      excellentPerformers: 41,
      strugglingStudents: 52
    },
    {
      semester: '2023/2024 Second Sem',
      averageGP: 3.3,
      excellentPerformers: 43,
      strugglingStudents: 48
    },
    {
      semester: '2024/2025 First Sem',
      averageGP: 3.4,
      excellentPerformers: 45,
      strugglingStudents: 45
    }
  ]
};