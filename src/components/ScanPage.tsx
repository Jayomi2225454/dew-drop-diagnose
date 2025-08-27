import { useState, useRef } from "react";
import { Menu, Camera, Upload, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ScanPageProps {
  onMenuOpen: () => void;
  onImageAnalyzed: (imageUrl: string, analysis: string) => void;
}

export default function ScanPage({ onMenuOpen, onImageAnalyzed }: ScanPageProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hardcoded API key
  const geminiApiKey = "AIzaSyB1FoeIdgLNsFlQGNDscaDdxT6rEFskwX4";

  const analyzeImageWithGemini = async (imageDataUrl: string) => {
    if (!geminiApiKey.trim()) {
      toast.error("Please enter your Gemini API key");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Convert data URL to base64
      const base64Image = imageDataUrl.split(',')[1];
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "You are a professional skincare expert AI. Analyze this facial image for skincare assessment. Even if the lighting isn't perfect, do your best to provide helpful advice. Please provide: 1) Skin type assessment (oily, dry, combination, sensitive) 2) Any visible skin concerns you can identify 3) A personalized skincare routine (morning & evening) 4) Product recommendations with specific ingredients 5) Lifestyle and dietary tips for healthy skin. Be encouraging, positive, and professional. If the image quality makes specific analysis difficult, provide general skincare advice based on common skin needs. Format your response clearly with headings and bullet points."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1500,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to analyze the image. Please try again.";
      
      // Send to chat
      onImageAnalyzed(imageDataUrl, analysis);
      
      toast.success("✨ Skin analysis complete! Check your AI chat for detailed recommendations.");
      
      // Reset the captured image
      setCapturedImage(null);
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze image. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setCapturedImage(imageDataUrl);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.addEventListener('loadedmetadata', () => {
        // Wait a moment for the camera to adjust
        setTimeout(() => {
          // Create canvas to capture frame with better quality
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Improve image quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(video, 0, 0);
          }
          
          // Stop stream
          stream.getTracks().forEach(track => track.stop());
          
          // Get image data with higher quality
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setCapturedImage(imageDataUrl);
        }, 1000); // Wait 1 second for camera to adjust lighting
      });
      
    } catch (error) {
      console.error('Camera error:', error);
      toast.error("Unable to access camera. Please upload an image instead.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="p-6 pb-0 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Skin Scan</h1>
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

        {/* Intro Text */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Skin Analysis
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Take a selfie or upload a photo to get personalized skincare recommendations powered by AI
          </p>
        </div>

        {/* Camera/Upload Area */}
        <Card className="relative overflow-hidden border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-8">
            {capturedImage ? (
              <div className="text-center space-y-4">
                <img 
                  src={capturedImage} 
                  alt="Captured selfie" 
                  className="w-full max-w-sm mx-auto rounded-xl shadow-soft"
                />
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setCapturedImage(null)}
                    disabled={isAnalyzing}
                  >
                    Retake
                  </Button>
                  <Button
                    onClick={() => analyzeImageWithGemini(capturedImage)}
                    disabled={isAnalyzing || !geminiApiKey.trim()}
                    className="bg-gradient-primary hover:opacity-90 border-0 shadow-glow glow-effect"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze Skin
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-32 h-32 mx-auto border-2 border-dashed border-primary/50 rounded-full flex items-center justify-center bg-primary/10">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">
                  Position your face in good lighting
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={startCamera}
                    className="w-full bg-gradient-primary hover:opacity-90 border-0 shadow-glow glow-effect"
                    disabled={isAnalyzing}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Take Selfie
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="w-full hover:bg-primary/10"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Tips for Best Results
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                Use natural lighting or bright indoor light
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                Remove makeup for more accurate analysis
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                Look directly at the camera
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                Ensure your entire face is visible
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}