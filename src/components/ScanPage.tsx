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
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [answers, setAnswers] = useState({
    age: '',
    skinType: '',
    concerns: '',
    currentRoutine: '',
    lifestyle: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Hardcoded API key
  const geminiApiKey = "AIzaSyB1FoeIdgLNsFlQGNDscaDdxT6rEFskwX4";

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
    } catch (error) {
      console.error('Camera error:', error);
      toast.error("Unable to access camera. Please upload an image instead.");
    }
  };

  const takePicture = () => {
    if (videoRef.current && stream) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(videoRef.current, 0, 0);
      }
      
      // Stop stream
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setShowCamera(false);
      
      // Get image data
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageDataUrl);
    }
  };

  const cancelCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const analyzeImageWithGemini = async (imageDataUrl: string) => {
    if (!geminiApiKey.trim()) {
      toast.error("Please enter your Gemini API key");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Convert data URL to base64
      const base64Image = imageDataUrl.split(',')[1];
      
      // Create personalized prompt with questionnaire data
      const personalizedPrompt = `You are a professional skincare expert AI. Analyze this facial image for skincare assessment.

USER INFORMATION:
- Age: ${answers.age || 'Not specified'}
- Current skin type belief: ${answers.skinType || 'Not specified'}
- Main skin concerns: ${answers.concerns || 'Not specified'}
- Current routine: ${answers.currentRoutine || 'Not specified'}
- Lifestyle factors: ${answers.lifestyle || 'Not specified'}

Based on the image analysis AND the user's information above, provide:
1) Professional skin type assessment (consider their current belief but give your expert opinion)
2) Visible skin concerns you can identify from the image
3) Personalized skincare routine (morning & evening) tailored to their age, concerns, and current routine
4) Specific product recommendations with ingredients that address their concerns
5) Lifestyle and dietary improvements based on their current habits
6) Timeline expectations for improvement

Be encouraging, positive, and professional. Address their specific concerns and build upon their current routine if it's good, or suggest improvements. Format your response clearly with headings and bullet points.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: personalizedPrompt
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
            maxOutputTokens: 2000,
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
      
      // Reset states
      setCapturedImage(null);
      setShowQuestionnaire(false);
      setAnswers({
        age: '',
        skinType: '',
        concerns: '',
        currentRoutine: '',
        lifestyle: ''
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze image. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuestionnaireSubmit = () => {
    if (!answers.age || !answers.skinType || !answers.concerns) {
      toast.error("Please fill in the required fields (age, skin type, and concerns)");
      return;
    }
    analyzeImageWithGemini(capturedImage!);
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
            {showCamera ? (
              <div className="text-center space-y-4">
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-w-sm mx-auto rounded-xl shadow-soft"
                />
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={cancelCamera}
                    disabled={isAnalyzing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={takePicture}
                    disabled={isAnalyzing}
                    className="bg-gradient-primary hover:opacity-90 border-0 shadow-glow glow-effect"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Picture
                  </Button>
                </div>
              </div>
            ) : capturedImage ? (
              <div className="text-center space-y-4">
                <div className="w-full max-w-sm mx-auto">
                  <img 
                    src={capturedImage} 
                    alt="Captured selfie" 
                    className="w-full rounded-xl shadow-soft object-cover"
                  />
                </div>
                {!showQuestionnaire && (
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setCapturedImage(null)}
                      disabled={isAnalyzing}
                    >
                      Retake
                    </Button>
                    <Button
                      onClick={() => setShowQuestionnaire(true)}
                      disabled={isAnalyzing}
                      className="bg-gradient-primary hover:opacity-90 border-0 shadow-glow glow-effect"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Continue to Questions
                    </Button>
                  </div>
                )}
              </div>
            ) : !capturedImage ? (
              <div className="text-center space-y-6">
                <div className="w-32 h-32 mx-auto border-2 border-dashed border-primary/50 rounded-full flex items-center justify-center bg-primary/10">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">
                  Position your face in good lighting and click to take picture
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={startCamera}
                    className="w-full bg-gradient-primary hover:opacity-90 border-0 shadow-glow glow-effect"
                    disabled={isAnalyzing}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Start Camera
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
            ) : null}
          </CardContent>
        </Card>

        {/* Questionnaire */}
        {showQuestionnaire && (
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Tell us about your skin
              </h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Help us provide more personalized recommendations by answering these questions.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Age Range <span className="text-destructive">*</span>
                  </label>
                  <select 
                    value={answers.age} 
                    onChange={(e) => setAnswers({...answers, age: e.target.value})}
                    className="w-full p-3 border border-border rounded-md bg-background"
                  >
                    <option value="">Select age range</option>
                    <option value="13-17">13-17</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55+">55+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    What do you think your skin type is? <span className="text-destructive">*</span>
                  </label>
                  <select 
                    value={answers.skinType} 
                    onChange={(e) => setAnswers({...answers, skinType: e.target.value})}
                    className="w-full p-3 border border-border rounded-md bg-background"
                  >
                    <option value="">Select skin type</option>
                    <option value="Oily">Oily</option>
                    <option value="Dry">Dry</option>
                    <option value="Combination">Combination</option>
                    <option value="Sensitive">Sensitive</option>
                    <option value="Normal">Normal</option>
                    <option value="Not sure">Not sure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    What are your main skin concerns? <span className="text-destructive">*</span>
                  </label>
                  <textarea 
                    value={answers.concerns} 
                    onChange={(e) => setAnswers({...answers, concerns: e.target.value})}
                    placeholder="e.g., acne, blackheads, dark spots, wrinkles, dryness, oiliness..."
                    className="w-full p-3 border border-border rounded-md bg-background h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    What's your current skincare routine?
                  </label>
                  <textarea 
                    value={answers.currentRoutine} 
                    onChange={(e) => setAnswers({...answers, currentRoutine: e.target.value})}
                    placeholder="e.g., face wash in morning, moisturizer, sunscreen..."
                    className="w-full p-3 border border-border rounded-md bg-background h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lifestyle factors
                  </label>
                  <textarea 
                    value={answers.lifestyle} 
                    onChange={(e) => setAnswers({...answers, lifestyle: e.target.value})}
                    placeholder="e.g., diet, sleep habits, stress levels, exercise, makeup use..."
                    className="w-full p-3 border border-border rounded-md bg-background h-20 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowQuestionnaire(false)}
                  disabled={isAnalyzing}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleQuestionnaireSubmit}
                  disabled={isAnalyzing}
                  className="flex-1 bg-gradient-primary hover:opacity-90 border-0 shadow-glow glow-effect"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get My Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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