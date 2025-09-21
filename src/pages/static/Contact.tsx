import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { contactInfo } from '@/data/contact';
import { Mail, Phone, MapPin, Clock, Navigation, Send, AlertCircle, CheckCircle } from 'lucide-react';

const Contact = () => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }, 2000);
  };

  const formatOfficeHours = (hours: { [key: string]: string }) => {
    return Object.entries(hours).map(([day, time]) => ({
      day,
      time
    }));
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
            <Mail className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get in touch with the Computer Science Department for inquiries, admissions, or collaboration opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            {/* Department Contact */}
            <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold gradient-text">
                    Department Information
                  </CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-base text-foreground">
                  {contactInfo.department}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="text-sm sm:text-base text-primary hover:text-accent transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Phone</p>
                    <a 
                      href={`tel:${contactInfo.phone}`}
                      className="text-sm sm:text-base text-primary hover:text-accent transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Navigation className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Website</p>
                    <a 
                      href={contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base text-primary hover:text-accent transition-colors"
                    >
                      {contactInfo.website}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold gradient-text">
                    Location
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-2">
                  <p className="text-sm sm:text-base text-foreground font-medium">
                    {contactInfo.address.street}
                  </p>
                  <p className="text-sm sm:text-base text-foreground">
                    {contactInfo.address.city}, {contactInfo.address.state}
                  </p>
                  <p className="text-sm sm:text-base text-foreground">
                    {contactInfo.address.postalCode}, {contactInfo.address.country}
                  </p>
                </div>
                {contactInfo.mapCoordinates && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const url = `https://www.google.com/maps?q=${contactInfo.mapCoordinates!.latitude},${contactInfo.mapCoordinates!.longitude}`;
                        window.open(url, '_blank');
                      }}
                      className="hover:bg-primary/10"
                    >
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      View on Map
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold gradient-text">
                    Office Hours
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-2">
                  {formatOfficeHours(contactInfo.officeHours).map(({ day, time }) => (
                    <div key={day} className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-foreground font-medium">{day}</span>
                      <span className="text-sm sm:text-base text-muted-foreground">{time}</span>
                    </div>
                  ))}
                </div>
                {contactInfo.emergencyContact && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                    <p className="text-xs sm:text-sm text-foreground">
                      <strong>Emergency Contact:</strong> {contactInfo.emergencyContact}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center">
                    <Send className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold gradient-text">
                    Send us a Message
                  </CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-base text-foreground">
                  Have a question or need more information? Fill out the form below and we'll get back to you soon.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800">
                      Thank you! Your message has been sent successfully. We'll respond within 24 hours.
                    </p>
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-800">
                      Sorry, there was an error sending your message. Please try again or contact us directly.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-foreground">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="mt-1 border-primary/20 focus:border-primary/40 focus:ring-primary/30"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="mt-1 border-primary/20 focus:border-primary/40 focus:ring-primary/30"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium text-foreground">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="mt-1 border-primary/20 focus:border-primary/40 focus:ring-primary/30"
                      placeholder="What is this regarding?"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-foreground">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      rows={6}
                      className="mt-1 border-primary/20 focus:border-primary/40 focus:ring-primary/30 resize-none"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-gradient text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </div>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    * Required fields. We respect your privacy and will not share your information with third parties.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift mt-12 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold gradient-text">More Ways to Connect</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-2">Admissions</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  For admission inquiries and application procedures
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-2">Student Services</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Academic support and student affairs assistance
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
                  <Navigation className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-2">Partnerships</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Industry collaboration and research opportunities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SiteFooter />
    </div>
  );
};

export default Contact;