import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { facultyMembers } from '@/data/faculty';
import { FacultyMember } from '@/data/types';
import { Users, Mail, Phone, MapPin, GraduationCap, BookOpen, Search, Award, Star, Building } from 'lucide-react';

const Faculty = () => {
  const isMobile = useIsMobile();
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaculty = facultyMembers.filter(faculty =>
    faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faculty.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faculty.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const FacultyCard = ({ faculty }: { faculty: FacultyMember }) => (
    <Card 
      className="glass-morphism-card border-primary/20 modern-shadow hover-lift group cursor-pointer transition-all duration-300 hover:border-primary/40"
      onClick={() => setSelectedFaculty(faculty)}
    >
      <CardHeader className="text-center p-4 sm:p-6">
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          {faculty.profileImage ? (
            <img 
              src={faculty.profileImage} 
              alt={faculty.name}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Users className={`h-10 w-10 sm:h-12 sm:w-12 text-primary ${faculty.profileImage ? 'hidden' : ''}`} />
        </div>
        <CardTitle className="text-base sm:text-lg font-bold gradient-text">{faculty.name}</CardTitle>
        <CardDescription className="text-sm font-medium text-primary">{faculty.title}</CardDescription>
        <Badge variant="secondary" className="text-xs">{faculty.position}</Badge>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{faculty.yearsOfExperience} years experience</span>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground mb-2">Specializations:</p>
            <div className="flex flex-wrap gap-1">
              {faculty.specializations.slice(0, 3).map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {faculty.specializations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{faculty.specializations.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const FacultyModal = ({ faculty }: { faculty: FacultyMember }) => (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setSelectedFaculty(null)}
    >
      <div 
        className="glass-morphism-card border-primary/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="p-4 sm:p-6 border-b border-primary/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                {faculty.profileImage ? (
                  <img 
                    src={faculty.profileImage} 
                    alt={faculty.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <Users className={`h-10 w-10 sm:h-12 sm:w-12 text-primary ${faculty.profileImage ? 'hidden' : ''}`} />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold gradient-text mb-2">
                  {faculty.name}
                </CardTitle>
                <CardDescription className="text-base font-medium text-primary mb-2">
                  {faculty.title}
                </CardDescription>
                <Badge variant="secondary" className="text-sm">{faculty.position}</Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedFaculty(null)}
              className="hover:bg-primary/10"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
              <Mail className="h-4 w-4 mr-2 text-primary" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 text-sm text-foreground">
                <Mail className="h-3 w-3 text-primary" />
                <span>{faculty.email}</span>
              </div>
              {faculty.phone && (
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <Phone className="h-3 w-3 text-primary" />
                  <span>{faculty.phone}</span>
                </div>
              )}
              {faculty.office && (
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <Building className="h-3 w-3 text-primary" />
                  <span>{faculty.office}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-foreground">
                <GraduationCap className="h-3 w-3 text-primary" />
                <span>{faculty.yearsOfExperience} years experience</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3">Biography</h4>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {faculty.bio}
            </p>
          </div>

          {/* Qualifications */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
              <Award className="h-4 w-4 mr-2 text-accent" />
              Qualifications
            </h4>
            <div className="space-y-2">
              {faculty.qualifications.map((qual, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-accent to-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-foreground">{qual}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
              <Star className="h-4 w-4 mr-2 text-primary" />
              Specializations
            </h4>
            <div className="flex flex-wrap gap-2">
              {faculty.specializations.map((spec, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          {/* Research Interests */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
              <Search className="h-4 w-4 mr-2 text-accent" />
              Research Interests
            </h4>
            <div className="space-y-2">
              {faculty.researchInterests.map((interest, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-foreground">{interest}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Publications */}
          {faculty.publications && faculty.publications.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-primary" />
                Recent Publications
              </h4>
              <div className="space-y-2">
                {faculty.publications.map((pub, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-foreground italic">{pub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );

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
            <Users className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Our Faculty
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Meet the dedicated educators and researchers driving innovation in computer science
          </p>
        </div>

        {/* Search Bar */}
        <Card className="glass-morphism-card border-primary/20 modern-shadow mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <CardContent className="p-4 sm:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search faculty by name, position, or specialization..."
                className="w-full pl-10 pr-4 py-3 bg-background/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredFaculty.map((faculty, index) => (
            <div 
              key={faculty.id} 
              className="animate-fade-in-up"
              style={{animationDelay: `${0.2 + index * 0.1}s`}}
            >
              <FacultyCard faculty={faculty} />
            </div>
          ))}
        </div>

        {filteredFaculty.length === 0 && (
          <Card className="glass-morphism-card border-primary/20 modern-shadow mt-8">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Faculty Found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        )}

        {/* Department Stats */}
        <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift mt-12 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold gradient-text">Faculty Statistics</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-primary">{facultyMembers.length}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Faculty</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-accent">
                  {facultyMembers.filter(f => f.title.includes('Dr.')).length}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">PhD Holders</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-primary">
                  {Math.round(facultyMembers.reduce((sum, f) => sum + f.yearsOfExperience, 0) / facultyMembers.length)}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Avg. Experience</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-accent">
                  {facultyMembers.reduce((sum, f) => sum + (f.publications?.length || 0), 0)}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Publications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faculty Modal */}
      {selectedFaculty && <FacultyModal faculty={selectedFaculty} />}

      <SiteFooter />
    </div>
  );
};

export default Faculty;