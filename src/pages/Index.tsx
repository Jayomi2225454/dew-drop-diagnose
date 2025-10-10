import { useState } from "react";
import HomePage from "@/components/HomePage";
import ScanPage from "@/components/ScanPage";
import AIChatPage from "@/components/AIChatPage";
import ShopPage from "@/components/ShopPage";
import BottomNavigation from "@/components/BottomNavigation";
import SideMenu from "@/components/SideMenu";

interface AnalysisMessage {
  imageUrl: string;
  analysis: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState<AnalysisMessage | null>(null);

  const handleImageAnalyzed = (imageUrl: string, analysis: string) => {
    setAnalysisMessage({ imageUrl, analysis });
    setActiveTab(2); // Switch to AI Chat tab
  };

  const handleNavigateFromMenu = (page: string) => {
    // For now, these would be additional pages
    console.log("Navigate to:", page);
  };

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 0:
        return <HomePage onMenuOpen={() => setIsMenuOpen(true)} onNavigateToShop={() => setActiveTab(3)} onNavigateToScan={() => setActiveTab(1)} />;
      case 1:
        return (
          <ScanPage 
            onMenuOpen={() => setIsMenuOpen(true)}
            onImageAnalyzed={handleImageAnalyzed}
          />
        );
      case 2:
        return (
          <AIChatPage 
            onMenuOpen={() => setIsMenuOpen(true)}
            analysisMessage={analysisMessage}
          />
        );
      case 3:
        return <ShopPage onMenuOpen={() => setIsMenuOpen(true)} />;
      default:
        return <HomePage onMenuOpen={() => setIsMenuOpen(true)} onNavigateToShop={() => setActiveTab(3)} onNavigateToScan={() => setActiveTab(1)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentPage()}
      
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <SideMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigateFromMenu}
      />
    </div>
  );
};

export default Index;
