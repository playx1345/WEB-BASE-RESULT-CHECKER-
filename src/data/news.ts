import { NewsItem } from './types';

export const newsItems: NewsItem[] = [
  {
    id: "news-1",
    title: "Department Launches New AI Research Lab",
    summary: "State-of-the-art Artificial Intelligence Research Laboratory officially opened with modern equipment and software for advanced research projects.",
    content: "The Computer Science Department is proud to announce the official opening of our new Artificial Intelligence Research Laboratory. This cutting-edge facility is equipped with high-performance computing resources, advanced GPU clusters, and the latest AI/ML software tools. The lab will serve as a hub for faculty and student research in machine learning, deep learning, computer vision, and natural language processing. The facility includes 20 workstations with RTX 4090 GPUs, a dedicated server room with distributed computing capabilities, and access to cloud computing resources. Students and faculty can now conduct more sophisticated research projects and collaborate on industry-sponsored AI initiatives. The lab is open to all Computer Science students and will host regular workshops and seminars on emerging AI technologies.",
    category: "announcement",
    date: "2024-01-15",
    author: "Dr. John Adeyemi",
    imageUrl: "/assets/news/ai-lab-opening.jpg",
    tags: ["AI", "Research", "Laboratory", "Equipment"],
    featured: true
  },
  {
    id: "news-2",
    title: "Students Win National Programming Competition",
    summary: "Team of HND2 students secures first place in the National Collegiate Programming Contest, bringing home ₦500,000 prize money.",
    content: "Congratulations to our outstanding HND2 Computer Science students - Ahmed Ibrahim, Grace Okoro, and Daniel Yakubu - who emerged victorious in the 2024 National Collegiate Programming Contest held in Lagos. The team, mentored by Dr. Sarah Okafor, competed against 120 teams from universities and polytechnics across Nigeria. The contest challenged participants to solve complex algorithmic problems within a limited timeframe, testing their programming skills, logical thinking, and teamwork abilities. Our students demonstrated exceptional problem-solving skills and innovative approaches that impressed the judges. The winning solution involved an elegant algorithm for optimizing resource allocation in distributed systems. The team receives ₦500,000 in prize money and guaranteed internship opportunities with leading tech companies. This victory highlights the quality of education and training provided by our Computer Science Department.",
    category: "achievement",
    date: "2024-01-20",
    author: "Dr. Sarah Okafor",
    imageUrl: "/assets/news/programming-contest.jpg",
    tags: ["Competition", "Students", "Programming", "Achievement"],
    featured: true
  },
  {
    id: "news-3",
    title: "New Partnership with Microsoft Nigeria",
    summary: "Department signs MOU with Microsoft Nigeria to provide students with Azure cloud credits and certification training programs.",
    content: "We are excited to announce a new strategic partnership with Microsoft Nigeria that will significantly enhance our students' learning experience and career prospects. Under this Memorandum of Understanding, all Computer Science students will receive free access to Microsoft Azure cloud services with $100 annual credits per student. The partnership also includes access to Microsoft Learn platform, certification training programs, and the Microsoft Student Partner program. Faculty members will receive professional development opportunities and access to Microsoft's latest educational resources. Additionally, Microsoft will provide guest lecturers for our Cloud Computing and Enterprise Application Development courses. Students will have opportunities to participate in Microsoft-sponsored hackathons and innovation challenges. This partnership aligns with our commitment to providing industry-relevant education and preparing our graduates for the modern technology workforce. The collaboration will also facilitate research projects using Microsoft's AI and cloud technologies.",
    category: "announcement",
    date: "2024-01-25",
    author: "Mr. Joseph Bulus",
    imageUrl: "/assets/news/microsoft-partnership.jpg",
    tags: ["Partnership", "Microsoft", "Cloud Computing", "Training"],
    featured: false
  },
  {
    id: "news-4",
    title: "Department Hosts Annual Tech Innovation Summit",
    summary: "Three-day summit brings together industry experts, students, and faculty to discuss emerging technologies and innovation opportunities.",
    content: "The Computer Science Department successfully hosted its Annual Tech Innovation Summit from February 1-3, 2024, attracting over 300 participants including students, faculty, industry professionals, and government representatives. The summit theme 'Driving Digital Transformation in Nigeria' featured keynote presentations from leading technology executives, panel discussions on emerging technologies, and innovation showcases. Day one focused on Artificial Intelligence and Machine Learning applications in various sectors. Day two explored Cybersecurity challenges and solutions for African organizations. Day three emphasized Entrepreneurship and startup ecosystem development. Notable speakers included CTOs from major Nigerian fintech companies, representatives from Google AI Nigeria, and successful alumni who have founded technology startups. Students had opportunities to network with industry professionals and explore internship and job opportunities. The summit also featured a startup pitch competition where students presented their innovative ideas to a panel of investors and industry experts. Three students received seed funding for their projects.",
    category: "event",
    date: "2024-02-03",
    author: "Dr. Blessing Okwu",
    imageUrl: "/assets/news/tech-summit.jpg",
    tags: ["Summit", "Innovation", "Technology", "Networking"],
    featured: false
  },
  {
    id: "news-5",
    title: "Faculty Member Receives International Research Grant",
    summary: "Dr. John Adeyemi awarded $50,000 research grant from International Development Research Centre for AI in Agriculture project.",
    content: "Dr. John Adeyemi, Head of the Computer Science Department, has been awarded a prestigious $50,000 research grant from the International Development Research Centre (IDRC) for his project on 'AI-Powered Crop Disease Detection and Management Systems for Smallholder Farmers.' This international recognition highlights the department's growing reputation in artificial intelligence research and its practical applications. The two-year project will develop machine learning models to identify common crop diseases using smartphone cameras, making advanced agricultural technology accessible to farmers across Nigeria and Sub-Saharan Africa. The research team includes three HND students who will work as research assistants, gaining valuable experience in AI/ML research and development. The project involves collaboration with agricultural extension workers and farming communities in Plateau State. Expected outcomes include a mobile application for disease detection, training datasets for African crop diseases, and policy recommendations for technology adoption in agriculture. This grant demonstrates our commitment to research that addresses real-world challenges and contributes to sustainable development.",
    category: "research",
    date: "2024-02-10",
    author: "Dr. John Adeyemi",
    imageUrl: "/assets/news/research-grant.jpg",
    tags: ["Research", "Grant", "AI", "Agriculture"],
    featured: true
  },
  {
    id: "news-6",
    title: "Cybersecurity Workshop for Local Businesses",
    summary: "Department organizes free cybersecurity awareness workshop for SMEs in Jos and surrounding communities.",
    content: "The Computer Science Department, in collaboration with the Nigerian Communications Commission, organized a free cybersecurity awareness workshop for small and medium enterprises (SMEs) in Jos and surrounding communities. Over 150 business owners and IT personnel attended the one-day workshop held at our conference center. The workshop covered essential topics including password security, phishing prevention, secure online banking practices, and basic network security measures. Mr. David Yusuf led sessions on practical cybersecurity implementations for small businesses, while industry experts shared real-world case studies of cyber attacks and prevention strategies. Participants received free cybersecurity assessment tools and step-by-step guides for implementing security measures in their organizations. The workshop is part of our community outreach initiative to support local economic development through technology education. Follow-up sessions are planned quarterly to provide ongoing support and address emerging cybersecurity threats. This initiative demonstrates our commitment to bridging the digital security gap in our local business community.",
    category: "event",
    date: "2024-02-15",
    author: "Mr. David Yusuf",
    imageUrl: "/assets/news/cybersecurity-workshop.jpg",
    tags: ["Cybersecurity", "Workshop", "SME", "Community"],
    featured: false
  },
  {
    id: "news-7",
    title: "New Computer Laboratory Complex Nearing Completion",
    summary: "Construction of the new 4-story computer laboratory complex with 6 modern labs is 85% complete and expected to open next semester.",
    content: "We are pleased to announce that the construction of our new Computer Laboratory Complex is 85% complete and on schedule for opening at the beginning of the next academic session. The impressive 4-story building will house six state-of-the-art computer laboratories, each equipped with 30 workstations featuring the latest Intel Core i7 processors and 16GB RAM. Special features include a dedicated Graphics and Game Development Lab with high-end GPUs, a Networking Lab with Cisco equipment, a Mobile Development Lab with Android and iOS development tools, and a Cybersecurity Lab with penetration testing tools. The building also includes a 100-seat multimedia lecture theater, faculty offices, student collaboration spaces, and a dedicated server room with redundant power and cooling systems. All labs will be connected via high-speed fiber optic networks with backup internet connectivity. The complex is designed with accessibility features and modern amenities including air conditioning, power backup systems, and 24/7 security. This facility represents a ₦2.5 billion investment in our students' future and will significantly enhance our capacity to deliver world-class computer science education.",
    category: "announcement",
    date: "2024-02-20",
    author: "Mr. Ahmed Kalu",
    imageUrl: "/assets/news/new-lab-complex.jpg",
    tags: ["Infrastructure", "Laboratory", "Construction", "Equipment"],
    featured: true
  },
  {
    id: "news-8",
    title: "Alumni Success Story: From Student to Tech Entrepreneur",
    summary: "2019 HND graduate Priscilla Dung launches successful fintech startup, raises $2M in seed funding and creates 50 jobs.",
    content: "We are proud to celebrate the remarkable success of our alumna, Priscilla Dung (HND Computer Science, Class of 2019), who has recently raised $2 million in seed funding for her fintech startup, PayEase Nigeria. Priscilla's company, which provides mobile payment solutions for rural communities, has grown from a final year project to a thriving business serving over 100,000 users across Northern Nigeria. During her time in our program, Priscilla excelled in mobile application development and database management courses under the mentorship of Mrs. Grace Musa. Her final year project focused on developing a mobile payment platform for unbanked populations, which later evolved into the foundation of PayEase Nigeria. The startup has created 50 direct jobs and supports hundreds of agent networks across rural areas. Priscilla recently returned to the department as a guest speaker, sharing her entrepreneurial journey with current students and encouraging them to pursue innovative solutions to local challenges. Her success story exemplifies the practical, industry-relevant education provided by our program and the entrepreneurial spirit we foster in our students. PayEase Nigeria is now expanding to other West African countries.",
    category: "achievement",
    date: "2024-02-25",
    author: "Mrs. Grace Musa",
    imageUrl: "/assets/news/alumni-success.jpg",
    tags: ["Alumni", "Entrepreneurship", "Fintech", "Success"],
    featured: false
  }
];