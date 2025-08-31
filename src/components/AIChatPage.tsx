import { useState, useRef, useEffect } from "react";
import { Menu, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

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
      text: "Hi! I'm SkinTell, your AI skincare assistant. I can help you with skincare routines, product recommendations, and answer any beauty questions you have. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageContext, setCurrentImageContext] = useState<string | null>(null);
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
      setCurrentImageContext(analysisMessage.imageUrl);
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

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      console.log('Sending message to SkinTell AI:', inputValue);
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: inputValue,
          imageContext: currentImageContext
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Failed to get AI response: ${error.message}`);
      }

      console.log('Received response from SkinTell AI:', data);

      if (data?.success && data?.response) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response.replace(/\*\*/g, '').replace(/\*/g, ''),
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      } else if (data?.fallbackResponse) {
        // Use fallback response if available
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.fallbackResponse,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error('Invalid response from SkinTell AI');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. In the meantime, I recommend maintaining a consistent skincare routine and staying hydrated!",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="font-bold text-foreground text-lg">SkinTell AI Assistant</h1>
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
      <div className="p-4 bg-surface border-t border-border flex-shrink-0 mb-16">
        <div className="flex items-end bg-muted rounded-2xl p-2 gap-2 shadow-soft">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask SkinTell anything about skincare..."
            className="flex-1 bg-transparent border-0 focus:outline-none resize-none px-4 py-3 text-sm min-h-[44px] max-h-32 placeholder:text-muted-foreground"
            rows={1}
            style={{
              height: 'auto',
              minHeight: '44px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
          <Button
            onClick={handleSend}
            size="icon"
            disabled={isLoading || !inputValue.trim()}
            className="bg-gradient-primary hover:opacity-90 border-0 shadow-glow rounded-full disabled:opacity-50 disabled:bg-muted-foreground flex-shrink-0 h-10 w-10"
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}