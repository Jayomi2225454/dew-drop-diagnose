import { Menu, ShoppingBag, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ShopPageProps {
  onMenuOpen: () => void;
}

const demoProducts = [
  {
    id: 1,
    name: "Vitamin C Brightening Serum",
    price: "₹899",
    originalPrice: "₹1299",
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    badge: "Best Seller",
    description: "Powerful antioxidant serum for glowing skin"
  },
  {
    id: 2,
    name: "Hydrating Face Moisturizer",
    price: "₹649",
    originalPrice: "₹899",
    rating: 4.6,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1570194065650-d99ef7bc6bfb?w=400&h=400&fit=crop",
    badge: "New",
    description: "24-hour deep hydration for all skin types"
  },
  {
    id: 3,
    name: "Gentle Cleansing Foam",
    price: "₹499",
    originalPrice: "₹699",
    rating: 4.7,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1556228852-80575bb6d9b5?w=400&h=400&fit=crop",
    badge: "Popular",
    description: "Mild cleanser perfect for sensitive skin"
  },
  {
    id: 4,
    name: "Sunscreen SPF 50",
    price: "₹799",
    originalPrice: "₹999",
    rating: 4.9,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop",
    badge: "Recommended",
    description: "Broad spectrum protection with zinc oxide"
  }
];

export default function ShopPage({ onMenuOpen }: ShopPageProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-6 pb-0 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          SkinTell Shop
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
        {/* Hero Section */}
        <Card className="bg-gradient-primary border-0 shadow-glow">
          <CardContent className="p-6 text-white text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">Curated Skincare</h2>
            <p className="opacity-90 mb-4">Products recommended by our AI skin experts</p>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              Free shipping on orders ₹999+
            </Badge>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Featured Products</h3>
          
          {demoProducts.map((product) => (
            <Card key={product.id} className="shadow-soft hover:shadow-glow transition-smooth">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 text-xs bg-primary text-primary-foreground"
                    >
                      {product.badge}
                    </Badge>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{product.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{product.price}</span>
                        <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="bg-gradient-primary hover:opacity-90 border-0">
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Special Offer */}
        <Card className="bg-gradient-hero border-0 shadow-glow">
          <CardContent className="p-6 text-white text-center">
            <h3 className="text-xl font-bold mb-2">Special Offer</h3>
            <p className="opacity-90 mb-4">Get 20% off on your first purchase</p>
            <Button 
              variant="secondary"
              className="bg-white/90 text-primary hover:bg-white font-semibold"
            >
              Use Code: FIRST20
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}