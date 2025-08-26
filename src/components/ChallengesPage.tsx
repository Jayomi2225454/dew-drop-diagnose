import { Menu, Star, TrendingUp, Award, Eye, Zap, Flame, ShoppingBag, BookOpen, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ChallengesPageProps {
  onMenuOpen: () => void;
}

export default function ChallengesPage({ onMenuOpen }: ChallengesPageProps) {
  const dailyChallenges = [
    {
      id: 1,
      title: "Morning Hydration",
      description: "Drink 2 glasses of water",
      progress: 50,
      credits: 10,
      icon: TrendingUp,
      completed: false,
    },
    {
      id: 2,
      title: "SPF Protection",
      description: "Apply sunscreen before going out",
      progress: 100,
      credits: 15,
      icon: Award,
      completed: true,
    },
    {
      id: 3,
      title: "Night Routine",
      description: "Complete your skincare routine",
      progress: 0,
      credits: 20,
      icon: Star,
      completed: false,
    },
  ];

  const weeklyChallenges = [
    {
      id: 1,
      title: "Glow Streak Master",
      description: "Maintain 7-day scan streak",
      progress: 85,
      reward: "₹25 credits",
    },
    {
      id: 2,
      title: "Product Pioneer",
      description: "Try 3 recommended products",
      progress: 33,
      reward: "Premium Badge",
    },
  ];

  const achievements = [
    { id: 1, title: "First Scan", icon: Eye, earned: true, color: "text-error" },
    { id: 2, title: "Week Warrior", icon: Zap, earned: true, color: "text-warning" },
    { id: 3, title: "Glow Goddess", icon: Star, earned: false, color: "text-muted-foreground" },
    { id: 4, title: "Streak Star", icon: Flame, earned: true, color: "text-primary" },
    { id: 5, title: "Product Pro", icon: ShoppingBag, earned: false, color: "text-muted-foreground" },
    { id: 6, title: "Share Queen", icon: BookOpen, earned: false, color: "text-muted-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-6 pb-0 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Challenges</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuOpen}
          className="hover:bg-primary/10"
        >
          <Menu className="h-6 w-6 text-muted-foreground" />
        </Button>
      </header>

      <div className="p-6 pt-2 space-y-8">
        {/* Intro */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Glow Challenges
            </h2>
          </div>
          <p className="text-muted-foreground">
            Complete challenges to earn rewards and badges
          </p>
        </div>

        {/* Daily Challenges */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            Daily Challenges
          </h2>
          <div className="space-y-4">
            {dailyChallenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.id} className="shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${
                          challenge.completed 
                            ? 'bg-success/10 text-success' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{challenge.title}</h3>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        challenge.completed
                          ? 'text-white bg-primary'
                          : 'text-muted-foreground bg-muted'
                      }`}>
                        {challenge.credits} credits
                      </span>
                    </div>
                    <Progress value={challenge.progress} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Weekly Challenges */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-warning" />
            Weekly Challenges
          </h2>
          <div className="space-y-4">
            {weeklyChallenges.map((challenge) => (
              <Card key={challenge.id} className="shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary border border-primary px-3 py-1 rounded-full">
                      {challenge.reward}
                    </span>
                  </div>
                  <Progress value={challenge.progress} className="h-2.5" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Achievements</h2>
          <div className="grid grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Card 
                  key={achievement.id}
                  className={`text-center shadow-soft ${
                    achievement.earned 
                      ? 'border-2 border-primary bg-primary/5' 
                      : 'bg-muted/50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      achievement.earned 
                        ? 'bg-primary/10' 
                        : 'bg-muted'
                    }`}>
                      <Icon className={`w-6 h-6 ${achievement.color}`} />
                    </div>
                    <p className={`text-sm font-semibold ${
                      achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <Button 
          className="w-full bg-gradient-primary hover:opacity-90 border-0 shadow-glow glow-effect"
        >
          <Crown className="h-5 w-5 mr-2" />
          View All Challenges
        </Button>
      </div>
    </div>
  );
}