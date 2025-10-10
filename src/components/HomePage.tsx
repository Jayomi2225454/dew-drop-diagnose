import { Menu, Gift, Sparkles, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-image.jpg";

interface HomePageProps {
  onMenuOpen: () => void;
  onNavigateToShop: () => void;
}

export default function HomePage({ onMenuOpen, onNavigateToShop }: HomePageProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-6 pb-0 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          SkinTell
        </h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuOpen}
          className="hover:bg-primary/10"
        >
          <Menu className="h-6 w-6 text-muted-foreground" />
        </Button>
      </header>

      <div className="p-6 pt-2 space-y-6">
        {/* Hero Card */}
        <Card className="relative overflow-hidden border-0 shadow-glow">
          <img 
            src={heroImage} 
            alt="Beautiful skincare routine" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
          <CardContent className="relative p-6 text-white min-h-[200px] flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">Good morning, Beautiful!</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Ready to glow today?</h1>
            <p className="text-lg mb-6 opacity-90">Track your skin journey with AI</p>
            <Button 
              variant="secondary" 
              className="w-full bg-white/90 text-primary hover:bg-white font-semibold shadow-soft glow-effect"
            >
              <Camera className="h-5 w-5 mr-2" />
              It's Open to Scan
            </Button>
          </CardContent>
        </Card>

        {/* Glow Score Card */}
        <Card className="bg-gradient-primary border-0 shadow-glow">
          <CardContent className="p-6 flex justify-between items-center text-white">
            <div>
              <p className="font-medium opacity-90">Today's Glow Score</p>
              <p className="text-5xl font-bold">89</p>
              <p className="text-sm opacity-80">+3 from yesterday</p>
            </div>
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm animate-pulse-glow">
              <Sparkles className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Weekly Progress</h2>
              <div className="flex items-center text-success text-sm font-medium">
                <span>↗</span>
                <span className="ml-1">Improving</span>
              </div>
            </div>
            <div className="flex justify-around text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
                return (
                  <div
                    key={index}
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-smooth ${
                      index === currentDay 
                        ? 'bg-primary text-primary-foreground shadow-glow' 
                        : 'text-muted-foreground hover:bg-primary/10'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="shadow-soft">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-muted-foreground font-medium">Current Streak</p>
              <p className="text-3xl font-bold text-foreground">7 days</p>
              <p className="text-muted-foreground text-sm">Keep it going!</p>
            </div>
            <div className="flex items-center space-x-2 bg-warning/10 text-warning font-semibold px-4 py-2 rounded-full">
              <span>Hot Streak!</span>
              <span>🔥</span>
            </div>
          </CardContent>
        </Card>

        {/* Featured Products */}
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Featured Products</h2>
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <img 
                  src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=60&h=60&fit=crop" 
                  alt="Vitamin C Serum"
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Vitamin C Serum</p>
                  <p className="text-xs text-muted-foreground">Brightening & Antioxidant</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-sm">₹899</p>
                  <p className="text-xs text-muted-foreground line-through">₹1299</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full hover:bg-primary/10"
                onClick={onNavigateToShop}
              >
                View All Products
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shop Now Button */}
        <Button
          className="h-20 w-full flex-col space-y-2 bg-gradient-primary hover:opacity-90 border-0 shadow-glow glow-effect"
          onClick={onNavigateToShop}
        >
          <Gift className="h-6 w-6" />
          <span className="font-semibold">Shop Now</span>
        </Button>
      </div>
    </div>
  );
}