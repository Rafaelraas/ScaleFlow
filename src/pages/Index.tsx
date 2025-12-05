import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Clock, CheckCircle, LayoutDashboard, Settings } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Create and manage shifts with intuitive calendar interface and automated scheduling tools.",
      color: "text-blue-500"
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Easily manage employees, roles, and permissions with comprehensive team tools.",
      color: "text-green-500"
    },
    {
      icon: Clock,
      title: "Shift Templates",
      description: "Save time with reusable shift templates for common scheduling patterns.",
      color: "text-purple-500"
    },
    {
      icon: CheckCircle,
      title: "Preference Handling",
      description: "Let employees submit preferences and automatically match them with schedules.",
      color: "text-orange-500"
    },
    {
      icon: LayoutDashboard,
      title: "Real-time Dashboard",
      description: "Monitor your workforce with live updates and comprehensive analytics.",
      color: "text-cyan-500"
    },
    {
      icon: Settings,
      title: "Flexible Configuration",
      description: "Customize settings to match your business needs and workflows.",
      color: "text-pink-500"
    }
  ];

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="relative max-w-7xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            Modern Workforce Management
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              ScaleFlow
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Streamline your shift scheduling and workforce management with our powerful, intuitive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to manage your workforce
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to simplify scheduling, improve team coordination, and boost productivity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-background ${feature.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to transform your scheduling?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join teams that are already using ScaleFlow to manage their workforce more efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto"
            >
              Create Free Account
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;