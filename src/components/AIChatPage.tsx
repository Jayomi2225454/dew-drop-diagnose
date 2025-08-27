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

// Helper function to convert image to base64
const imageToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return '';
  }
};

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
      const GEMINI_API_KEY = "AIzaSyB1FoeIdgLNsFlQGNDscaDdxT6rEFskwX4";
      
      let requestBody: any = {
        contents: [{
          parts: [{
            text: `You are Zara, a professional skincare expert AI assistant. Answer the user's skincare question in a helpful, friendly, and professional manner. 

${currentImageContext ? 'You have access to the user\'s skin image that was previously analyzed. Use this context to provide personalized advice.' : ''}

User question: ${inputValue}

Provide a clear, helpful response without using asterisks (*) or special formatting symbols. Use plain text with proper paragraphs.`
          }]
        }]
      };

      // If we have image context, include it in the request
      if (currentImageContext) {
        try {
          const base64Image = await imageToBase64(currentImageContext);
          if (base64Image) {
            requestBody.contents[0].parts.unshift({
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            });
          }
        } catch (error) {
          console.log('Could not include image in request:', error);
        }
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.candidates[0].content.parts[0].text.replace(/\*\*/g, '').replace(/\*/g, ''),
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error('Invalid response from Gemini API');
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
            disabled={isLoading}
            className="bg-gradient-primary hover:opacity-90 border-0 shadow-glow rounded-full disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}