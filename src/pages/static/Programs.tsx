import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { programs } from '@/data/programs';
import { Program, Course } from '@/data/types';
import { GraduationCap, BookOpen, Clock, Users, Target, ChevronDown, ChevronUp, Award, Briefcase } from 'lucide-react';

const Programs = () => {
  const isMobile = useIsMobile();
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  const toggleProgram = (programId: string) => {
    setExpandedProgram(expandedProgram === programId ? null : programId);
    setExpandedLevel(null);
  };

  const toggleLevel = (levelId: string) => {
    setExpandedLevel(expandedLevel === levelId ? null : levelId);
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="glass-morphism-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover-lift">
      <CardHeader className="p-3 sm:p-4">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-sm sm:text-base font-semibold text-primary">{course.code}</CardTitle>
            <CardDescription className="text-xs sm:text-sm font-medium text-foreground mt-1">
              {course.title}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {course.creditUnits} Units
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
          {course.description}
        </p>
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-foreground mb-1">Prerequisites:</p>
            <div className="flex flex-wrap gap-1">
              {course.prerequisites.map((prereq, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-foreground mb-2">Learning Outcomes:</p>
          <ul className="space-y-1">
            {course.learningOutcomes.slice(0, 2).map((outcome, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-xs text-muted-foreground">{outcome}</p>
              </li>
            ))}
            {course.learningOutcomes.length > 2 && (
              <li className="text-xs text-muted-foreground italic">
                +{course.learningOutcomes.length - 2} more outcomes...
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const ProgramCard = ({ program }: { program: Program }) => {
    const isExpanded = expandedProgram === program.id;
    
    return (
      <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift group">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold gradient-text mb-2">
                  {program.name}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="default">{program.type}</Badge>
                  <Badge variant="secondary">{program.duration}</Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleProgram(program.id)}
              className="hover:bg-primary/10"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          <CardDescription className="text-sm sm:text-base leading-relaxed text-foreground">
            {program.description}
          </CardDescription>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
            {/* Admission Requirements */}
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-foreground mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-primary" />
                Admission Requirements
              </h4>
              <div className="space-y-2">
                {program.admissionRequirements.map((req, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-xs sm:text-sm text-foreground">{req}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Prospects */}
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-foreground mb-3 flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-accent" />
                Career Prospects
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {program.careerProspects.map((career, index) => (
                  <Badge key={index} variant="outline" className="text-xs justify-center p-2">
                    {career}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-foreground mb-4 flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-primary" />
                Curriculum Structure
              </h4>
              <div className="space-y-4">
                {Object.entries(program.courses).map(([level, semesters]) => {
                  const levelId = `${program.id}-${level}`;
                  const isLevelExpanded = expandedLevel === levelId;
                  
                  return (
                    <Card key={level} className="border border-primary/10">
                      <CardHeader className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                              <Award className="h-4 w-4 text-primary" />
                            </div>
                            <h5 className="text-sm sm:text-base font-semibold text-primary">{level}</h5>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLevel(levelId)}
                            className="hover:bg-primary/10"
                          >
                            {isLevelExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </Button>
                        </div>
                      </CardHeader>
                      
                      {isLevelExpanded && (
                        <CardContent className="p-3 sm:p-4 pt-0">
                          <div className="space-y-4">
                            {Object.entries(semesters).map(([semester, courses]) => (
                              <div key={semester}>
                                <h6 className="text-sm font-medium text-accent mb-3 flex items-center">
                                  <Clock className="h-3 w-3 mr-2" />
                                  {semester} Semester ({courses.length} courses)
                                </h6>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                  {courses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-accent/5 -z-20"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl -z-10"></div>

      {/* Header */}
      {isMobile ? <MobileHeader /> : <SiteHeader />}

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="text-center mb-12 animate-fade-in">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-500">
            <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Academic Programs
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive Computer Science Education for the Digital Age
          </p>
        </div>

        {/* Programs Grid */}
        <div className="space-y-8">
          {programs.map((program, index) => (
            <div 
              key={program.id} 
              className="animate-fade-in-up"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <ProgramCard program={program} />
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift mt-12 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold gradient-text">Program Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-2">Class Sizes</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Small class sizes ensure personalized attention with maximum 30 students per class.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-2">Certification</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">All programs are fully accredited by NBTE and recognized internationally.</p>
              </div>
              <div className="text-center md:col-span-2 lg:col-span-1">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-2">Industry Experience</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Mandatory internships and industry partnerships ensure practical experience.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SiteFooter />
    </div>
  );
};

export default Programs;