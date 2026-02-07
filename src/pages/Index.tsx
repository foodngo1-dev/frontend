import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Truck, TrendingUp, Utensils, Package, HandHeart } from "lucide-react";

const stats = [
  { icon: Utensils, value: "2.5M+", label: "Meals Served" },
  { icon: Users, value: "50K+", label: "Volunteers" },
  { icon: Truck, value: "1000+", label: "Partner Organizations" },
  { icon: TrendingUp, value: "95%", label: "Food Utilization" },
];

const features = [
  {
    icon: Package,
    title: "Food Donation",
    description: "Donate surplus food from restaurants, events, or homes. We ensure it reaches those in need.",
  },
  {
    icon: HandHeart,
    title: "Volunteer Network",
    description: "Join our community of volunteers helping collect, sort, and distribute food across India.",
  },
  {
    icon: Truck,
    title: "Real-time Tracking",
    description: "Track your donation from pickup to delivery. See the real impact you're making.",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[url('/fod.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-secondary/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-primary/10 blur-2xl animate-float" style={{ animationDelay: "2s" }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-slide-up">
              <Heart className="w-4 h-4 text-primary-foreground" />
              <span className="text-primary-foreground/90 text-sm font-medium">Making a difference since 2015</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Food Forward
              <span className="block text-primary-foreground/80">Foundation</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Feed the Needy, Save a Life.
              <span className="block mt-2 text-lg text-primary-foreground/70">
                Connecting surplus food with those who need it most across India.
              </span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/donate">
                  Donate Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/track">
                  Track Donation
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-soft">
          <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-primary-foreground/50" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card relative -mt-20 z-20 mx-4 lg:mx-auto lg:max-w-6xl rounded-2xl shadow-elevated">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary mx-auto mb-4 flex items-center justify-center shadow-soft">
                  <stat.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Bridging the Gap Between <span className="text-gradient">Surplus & Scarcity</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Every day, tons of food goes to waste while millions go hungry. We're on a mission to change that by creating an efficient, transparent food redistribution network across India.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-accent group-hover:bg-primary transition-all duration-300 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-warm">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-3xl p-8 md:p-16 shadow-elevated relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-secondary/10 blur-2xl" />
            
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Make a <span className="text-gradient">Difference?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Whether you want to donate food, volunteer your time, or support financially – every contribution counts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/donate">Start Donating</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/auth?mode=register">Join as Volunteer</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
