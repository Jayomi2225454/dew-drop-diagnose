import { Home, Camera, MessageCircle, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

const navItems = [
  { icon: Home, label: "Home" },
  { icon: Camera, label: "Scan" },
  { icon: MessageCircle, label: "AI Chat" },
  { icon: ShoppingBag, label: "Shop" },
];

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around py-2 z-30 shadow-elegant">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            onClick={() => onTabChange(index)}
            className={cn(
              "flex flex-col items-center justify-center cursor-pointer py-2 px-4 rounded-xl transition-smooth",
              activeTab === index
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </div>
        );
      })}
    </nav>
  );
}