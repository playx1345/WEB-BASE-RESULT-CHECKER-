import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { newsItems } from '@/data/news';
import { NewsItem } from '@/data/types';
import { Newspaper, Calendar, User, Tag, Star, Filter, ChevronRight, Trophy, Megaphone, Users, Lightbulb } from 'lucide-react';

const News = () => {
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const categories = [
    { id: 'all', label: 'All News', icon: Newspaper },
    { id: 'announcement', label: 'Announcements', icon: Megaphone },
    { id: 'event', label: 'Events', icon: Calendar },
    { id: 'achievement', label: 'Achievements', icon: Trophy },
    { id: 'research', label: 'Research', icon: Lightbulb }
  ];

  const filteredNews = selectedCategory === 'all' 
    ? newsItems 
    : newsItems.filter(item => item.category === selectedCategory);

  const sortedNews = filteredNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const featuredNews = sortedNews.filter(item => item.featured);
  const regularNews = sortedNews.filter(item => !item.featured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const categoryMap = {
      'announcement': Megaphone,
      'event': Calendar,
      'achievement': Trophy,
      'research': Lightbulb
    };
    const IconComponent = categoryMap[category as keyof typeof categoryMap] || Newspaper;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colorMap = {
      'announcement': 'bg-blue-100 text-blue-800 border-blue-200',
      'event': 'bg-green-100 text-green-800 border-green-200',
      'achievement': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'research': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colorMap[category as keyof typeof colorMap] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const NewsCard = ({ news, featured = false }: { news: NewsItem; featured?: boolean }) => (
    <Card 
      className={`glass-morphism-card border-primary/20 modern-shadow hover-lift group cursor-pointer transition-all duration-300 hover:border-primary/40 ${
        featured ? 'md:col-span-2 lg:col-span-1' : ''
      }`}
      onClick={() => setSelectedNews(news)}
    >
      {news.imageUrl && (
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={news.imageUrl} 
            alt={news.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-primary text-primary-foreground flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>Featured</span>
              </Badge>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className={`${getCategoryColor(news.category)} flex items-center space-x-1`}>
              {getCategoryIcon(news.category)}
              <span className="capitalize">{news.category}</span>
            </Badge>
          </div>
        </div>
      )}
      
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{formatDate(news.date)}</span>
          </div>
          {!news.imageUrl && (
            <Badge className={`${getCategoryColor(news.category)} flex items-center space-x-1`}>
              {getCategoryIcon(news.category)}
              <span className="capitalize">{news.category}</span>
            </Badge>
          )}
        </div>
        
        <CardTitle className={`${featured ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} font-bold text-foreground group-hover:text-primary transition-colors duration-300`}>
          {news.title}
        </CardTitle>
        
        <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {news.summary}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
            {news.author && (
              <>
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{news.author}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-1 text-primary text-sm group-hover:text-accent transition-colors">
            <span>Read More</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        
        {news.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {news.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {news.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{news.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const NewsModal = ({ news }: { news: NewsItem }) => (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setSelectedNews(null)}
    >
      <div 
        className="glass-morphism-card border-primary/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="p-4 sm:p-6 border-b border-primary/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <Badge className={`${getCategoryColor(news.category)} flex items-center space-x-1`}>
                  {getCategoryIcon(news.category)}
                  <span className="capitalize">{news.category}</span>
                </Badge>
                {news.featured && (
                  <Badge className="bg-primary text-primary-foreground flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>Featured</span>
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold gradient-text mb-3">
                {news.title}
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(news.date)}</span>
                </div>
                {news.author && (
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{news.author}</span>
                  </div>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedNews(null)}
              className="hover:bg-primary/10"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6">
          {news.imageUrl && (
            <img 
              src={news.imageUrl} 
              alt={news.title}
              className="w-full h-64 sm:h-80 object-cover rounded-lg mb-6"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          
          <div className="prose prose-sm sm:prose-base max-w-none">
            <p className="text-base sm:text-lg font-medium text-primary mb-4">
              {news.summary}
            </p>
            <div className="text-foreground leading-relaxed whitespace-pre-line">
              {news.content}
            </div>
          </div>
          
          {news.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-primary/10">
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {news.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
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
            <Newspaper className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Department News
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Stay updated with the latest announcements, events, achievements, and research from our department
          </p>
        </div>

        {/* Category Filter */}
        <Card className="glass-morphism-card border-primary/20 modern-shadow mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-4 w-4 text-primary" />
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Filter by Category</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <Button
                    key={category.id}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 justify-center ${
                      isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'
                    }`}
                  >
                    <IconComponent className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{category.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Featured News Section */}
        {featuredNews.length > 0 && selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Featured News
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredNews.slice(0, 3).map((news, index) => (
                <div 
                  key={news.id} 
                  className="animate-fade-in-up"
                  style={{animationDelay: `${0.3 + index * 0.1}s`}}
                >
                  <NewsCard news={news} featured />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All News Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-6 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            {selectedCategory === 'all' ? 'Latest News' : `${categories.find(c => c.id === selectedCategory)?.label}`}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'})
            </span>
          </h2>
          
          {filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {(selectedCategory === 'all' ? regularNews : filteredNews).map((news, index) => (
                <div 
                  key={news.id} 
                  className="animate-fade-in-up"
                  style={{animationDelay: `${0.5 + index * 0.1}s`}}
                >
                  <NewsCard news={news} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="glass-morphism-card border-primary/20 modern-shadow">
              <CardContent className="p-8 text-center">
                <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No News Found</h3>
                <p className="text-muted-foreground">
                  No articles available for the selected category. Try selecting a different category.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* News Summary */}
        <Card className="glass-morphism-card border-primary/20 modern-shadow hover-lift mt-12 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold gradient-text">News Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {categories.slice(1).map((category) => {
                const IconComponent = category.icon;
                const count = newsItems.filter(item => item.category === category.id).length;
                return (
                  <div key={category.id} className="text-center">
                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-primary">{count}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">{category.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* News Modal */}
      {selectedNews && <NewsModal news={selectedNews} />}

      <SiteFooter />
    </div>
  );
};

export default News;