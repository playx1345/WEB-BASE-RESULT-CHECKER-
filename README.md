omputer Science Department Website

## Overview
The Computer Science Department website for Plateau State Polytechnic Barkin Ladi serves as a comprehensive, mobile-first platform for students and administrators. It provides essential information about the department, academic programs, faculty, and news updates, while also offering a secure login portal with enhanced mobile responsiveness and modern user experience features.

## Project Structure
The project is organized into several directories and files, each serving a specific purpose:

- **public/**: Contains all the HTML files for the website.
  - `index.html`: Mobile-responsive landing page with hamburger navigation.
  - `admin.html`: Admin login interface with mobile sidebar support.
  - `student-portal.html`: Mobile-optimized dashboard for students.
  - `about.html`: Information about the department.
  - `programs.html`: List of academic programs.
  - `faculty.html`: Information about faculty members.
  - `news.html`: Latest news and announcements.
  - `contact.html`: Contact information for the department.
  - `login.html`: Student login page with enhanced validation.

- **assets/**: Contains all the assets for the website.
  - **css/**: Stylesheets for the website.
    - `main.css`: Shared styles with mobile-first approach and responsive navigation.
    - `admin.css`: Enhanced admin dashboard styles with mobile sidebar support.
    - `student.css`: Mobile-optimized student dashboard styles.
    - `responsive.css`: Comprehensive media queries for all device sizes.
  - **js/**: JavaScript files for functionality.
    - `main.js`: General functionality with mobile navigation support.
    - `admin.js`: Enhanced admin dashboard logic with mobile sidebar toggle.
    - `student.js`: Mobile-optimized student dashboard logic.
    - `auth.js`: Authentication logic with real-time form validation.
    - `utils.js`: Utility functions with notification system.
  - **fonts/**: Font files used in the website.
    - `inter.woff2`: Font for typography.

- **components/**: Reusable components for the website.
  - `header.js`: Mobile-responsive header component.
  - `footer.js`: Footer component.
  - `navigation.js`: Enhanced navigation component with mobile support.
  - `modal.js`: Modal component for alerts/forms.

- **data/**: JSON files containing data for the website.
  - `courses.json`: Course data.
  - `faculty.json`: Faculty data.
  - `news.json`: News data.
  - `students.json`: Student data.

- **docs/**: Documentation for the project.
  - `project-plan.md`: Project plan and objectives.
  - `features.md`: Key features of the website.
  - `deployment.md`: Deployment instructions.
  - `testing-guide.md`: Comprehensive testing documentation.

## Setup Instructions
1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies: `npm install`
4. Set up environment variables (copy `.env.example` to `.env` and fill in values)
5. Run database migrations if using Supabase
6. Create an admin account: `npm run create-admin`
7. Start the development server: `npm run dev`
8. Open `http://localhost:8080` in your web browser

## Role-Based Access Control

### User Roles
The system implements secure role-based access control with the following roles:
- **Admin**: Full system access, can create/manage students
- **Student**: Can view their own results (if fees are paid)  
- **Teacher**: Can manage courses and results (future)
- **Parent**: Can view child's results (future)

### Demo Credentials

#### Admin Access
- **Email**: admin@plateau.edu.ng
- **Password**: Admin123456

#### Sample Student Logins
| Student | Matric Number | PIN | Level | Fee Status |
|---------|---------------|-----|-------|------------|
| John Doe | PLT/ND/2023/001 | 123456 | ND1 | Paid |
| Jane Smith | PLT/ND/2023/002 | 234567 | ND1 | Unpaid |
| Michael Johnson | PLT/ND/2022/001 | 345678 | ND2 | Paid |

### Security Features
- **Server-side role verification** using Supabase functions
- **Row Level Security (RLS)** policies for data access control
- **Secure PIN hashing** for student authentication
- **Admin-only functions** for student creation and management
- **Client-side role checks** for improved UX (with server-side enforcement)

For detailed setup and testing instructions, see [RBAC_SETUP.md](RBAC_SETUP.md).

## Key Features

### 🎯 Core Functionality
- **User-friendly interface** for students and admins
- **Secure login system** with enhanced validation
- **Comprehensive department information**
- **Dynamic content loading** using modern JavaScript

### 📱 Mobile-First Design
- **Responsive design** optimized for all device sizes
- **Mobile navigation** with hamburger menu and smooth animations
- **Touch-friendly interfaces** with proper touch target sizes (44px+)
- **Mobile sidebar toggles** for admin and student portals
- **Optimized typography** with readable font sizes on mobile

### 🛡️ Enhanced Security & Validation
- **Real-time form validation** with immediate feedback
- **Enhanced password requirements** for admin accounts
- **Input sanitization** and proper error handling
- **Session management** with timeout protection

### 🔔 User Experience Enhancements
- **Toast notification system** with mobile-optimized positioning
- **Loading states** and progress indicators
- **Smooth animations** and transitions
- **Accessibility features** with proper ARIA labels and keyboard navigation

### 📊 Dashboard Features
- **Student Portal**: Results viewing, GPA tracking, announcements, profile management
- **Admin Portal**: Student management, result uploads, analytics, system administration
- **Mobile-responsive tables** with horizontal scrolling
- **Interactive charts** and statistics

## Demo Credentials

### Student Access
- **Matric Number**: ND/CS/2023/001
- **Password**: student123

### Admin Access
- **Username**: admin
- **Password**: admin123

## Testing
The project includes comprehensive testing capabilities:

1. **Functionality Tests**: Open `test-functionality.html` for automated testing
2. **Mobile Responsiveness**: Test across different viewport sizes
3. **Form Validation**: Real-time validation testing
4. **Notification System**: Toast notification testing
5. **Performance Testing**: Load time and accessibility checks

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Device Testing
- ✅ Desktop (1920px+)
- ✅ Laptop (1024px - 1919px)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (320px - 767px)

## Technical Implementation

### CSS Architecture
- **Mobile-first approach** with progressive enhancement
- **CSS Custom Properties** for consistent theming
- **Flexbox and Grid** for modern layouts
- **Media queries** for responsive breakpoints

### JavaScript Features
- **ES6+ syntax** with modern browser features
- **Class-based architecture** for maintainable code
- **Event delegation** for efficient event handling
- **LocalStorage** for session management

### Performance Optimizations
- **Optimized asset loading** with proper caching
- **Efficient CSS** with minimal render blocking
- **Compressed fonts** and optimized images
- **Minimal JavaScript** footprint

## Future Enhancements
- **Progressive Web App (PWA)** features
- **Dark mode** support
- **Offline functionality** for student results
- **Push notifications** for important announcements
- **API integration** for real-time data
- **Advanced analytics** dashboard
- **Multi-language support**

## Deployment Options
1. **Static hosting** (GitHub Pages, Netlify, Vercel)
2. **Web server** deployment (Apache, Nginx)
3. **Content Delivery Network (CDN)** integration
4. **Mobile app** wrapper (Cordova, React Native)

## Contributing
1. Fork the repository
2. Create a feature branch
3. Test your changes on multiple devices
4. Submit a pull request with detailed description

## License
This project is licensed under the MIT License.
