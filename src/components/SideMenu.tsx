import { X, ShoppingBag, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export default function SideMenu({ isOpen, onClose, onNavigate }: SideMenuProps) {
  const menuItems = [
    { icon: ShoppingBag, label: "Shop", page: "shop" },
    { icon: CreditCard, label: "Subscription", page: "subscription" },
  ];

  return (
    <div className={cn(
      "fixed inset-0 z-50 transition-opacity duration-300",
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className={cn(
        "relative z-50 w-80 h-full bg-surface shadow-elegant p-6 ml-auto transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Menu
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-primary/10 rounded-xl transition-smooth"
          >
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>
        
        <nav className="flex flex-col space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  onNavigate(item.page);
                  onClose();
                }}
                className="flex items-center space-x-3 w-full p-4 text-left hover:bg-primary/10 rounded-xl transition-smooth group"
              >
                <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-smooth" />
                <span className="font-medium text-foreground group-hover:text-primary transition-smooth">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}