import { useState, useRef, useEffect } from "react";
import { Menu, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  image?: string;
}

interface AIChatPageProps {
  onMenuOpen: () => void;
  analysisMessage?: { imageUrl: string; analysis: string } | null;
}

export default function AIChatPage({ onMenuOpen, analysisMessage }: AIChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm Zara, your AI skincare assistant. I can help you with skincare routines, product recommendations, and answer any beauty questions you have. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle new analysis message
  useEffect(() => {
    if (analysisMessage) {
      const newMessages: Message[] = [
        {
          id: Date.now().toString(),
          text: "Here's my analysis of your skin:",
          sender: "user",
          timestamp: new Date(),
          image: analysisMessage.imageUrl,
        },
        {
          id: (Date.now() + 1).toString(),
          text: analysisMessage.analysis,
          sender: "ai",
          timestamp: new Date(),
        },
      ];
      
      setMessages(prev => [...prev, ...newMessages]);
    }
  }, [analysisMessage]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your question! I'm here to help with your skincare journey. For the most accurate and personalized advice, I recommend taking a skin scan so I can analyze your specific concerns and provide tailored recommendations.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="p-4 border-b border-border bg-surface flex justify-between items-center flex-shrink-0 shadow-soft">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-primary p-2 rounded-full shadow-glow">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg">Zara AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Your personal skincare expert</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuOpen}
          className="hover:bg-primary/10"
        >
          <Menu className="h-6 w-6 text-muted-foreground" />
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.sender === "user" ? "justify-end" : ""
            }`}
          >
            {message.sender === "ai" && (
              <div className="bg-gradient-primary p-2 rounded-full shadow-soft flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            
            <Card className={`max-w-xs md:max-w-md shadow-soft ${
              message.sender === "user" 
                ? "bg-gradient-primary text-white border-0" 
                : "bg-surface"
            }`}>
              <CardContent className="p-4">
                {message.image && (
                  <img 
                    src={message.image} 
                    alt="Skin analysis" 
                    className="w-full rounded-lg mb-3 shadow-soft"
                  />
                )}
                <p className={`text-sm leading-relaxed ${
                  message.sender === "user" ? "text-white" : "text-foreground"
                }`}>
                  {message.text}
                </p>
                <p className={`text-xs mt-2 text-right ${
                  message.sender === "user" ? "text-white/70" : "text-muted-foreground"
                }`}>
                  {formatTimestamp(message.timestamp)}
                </p>
              </CardContent>
            </Card>
            
            {message.sender === "user" && (
              <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-surface border-t border-border flex-shrink-0">
        <div className="flex items-center bg-muted rounded-full p-1 gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about skincare, routines, products..."
            className="flex-1 bg-transparent border-0 focus-visible:ring-0 px-4"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="bg-gradient-primary hover:opacity-90 border-0 shadow-glow rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}