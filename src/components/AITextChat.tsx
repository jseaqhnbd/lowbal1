import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Bot, User, Copy, Mic, MicOff, Image, Upload, Sparkles, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AITextChatProps {
  selectedCategory: string;
  negotiationData: {
    title: string;
    originalPrice: number;
    currentOffer?: number;
    maxBudget?: number;
    platform: string;
  };
  messages: Array<{
    id: string;
    type: 'user' | 'ai' | 'seller';
    content: string;
    timestamp: Date;
    isAudio?: boolean;
    hasImage?: boolean;
  }>;
  onUpdateMessages: (messages: any[]) => void;
}

const AITextChat: React.FC<AITextChatProps> = ({
  selectedCategory,
  negotiationData,
  messages,
  onUpdateMessages
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !uploadedImage) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputMessage || 'Shared an image',
      timestamp: new Date(),
      hasImage: !!uploadedImage
    };

    const updatedMessages = [...messages, userMessage];
    onUpdateMessages(updatedMessages);

    setIsLoading(true);
    setInputMessage('');
    setUploadedImage(null);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiResponse = generateAIResponse(inputMessage, negotiationData, selectedCategory);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: aiResponse,
        timestamp: new Date()
      };

      onUpdateMessages([...updatedMessages, aiMessage]);

      toast({
        title: "AI Response Generated",
        description: "Your negotiation assistant has provided guidance.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userInput: string, data: any, category: string) => {
    const responses = [
      `Based on your ${category} negotiation for "${data.title}", I recommend emphasizing the quick transaction and your serious buyer status. Here's a strategic approach: mention you're ready to move forward immediately and highlight any competitive advantages you have.`,
      
      `For this ${category} deal, consider the seller's perspective. They want a smooth, reliable transaction. I suggest positioning your offer as a win-win by mentioning your flexibility on timing and your commitment to the purchase.`,
      
      `Looking at the current market for ${category} items like "${data.title}", your approach should focus on building rapport first. Ask about the item's history or condition to show genuine interest before presenting your offer.`,
      
      `Given the ${data.platform} platform dynamics, sellers often appreciate direct communication. I recommend being upfront about your budget constraints while showing enthusiasm for the specific item.`,
      
      `For this negotiation, timing is key. Since you're dealing with a ${category} purchase, consider mentioning any urgency on your end (moving, gift, etc.) to create a natural reason for your offer timeline.`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate voice processing
      setTimeout(() => {
        setInputMessage("I'm interested in negotiating the price. What's your best advice?");
        toast({
          title: "Voice Recorded",
          description: "Your voice message has been converted to text.",
        });
      }, 1000);
    } else {
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak your message now...",
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        toast({
          title: "Image Uploaded",
          description: "Image ready to send with your message.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Speech Not Supported",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden h-[450px] flex flex-col">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
          </div>
          AI Negotiation Assistant
        </CardTitle>
        <p className="text-gray-600 text-xs">Have a conversation with your AI negotiation expert</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-3">
        {/* Enhanced Messages Area with Dynamic Scrolling */}
        <div className="flex-1 overflow-y-auto mb-3 space-y-2 max-h-[280px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ scrollBehavior: 'smooth' }}>
          {messages.length === 0 ? (
            <div className="text-center py-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">Start Your Conversation</h3>
              <p className="text-gray-500 text-xs">Ask me anything about your negotiation strategy!</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.type === 'ai' 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                      : 'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}>
                    {message.type === 'ai' ? (
                      <Bot className="w-3 h-3 text-white" />
                    ) : (
                      <User className="w-3 h-3 text-white" />
                    )}
                  </div>
                  
                  <div className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-2 rounded-xl max-w-[85%] ${
                      message.type === 'ai'
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-blue-900'
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 text-gray-900'
                    }`}>
                      <p className="text-xs leading-relaxed">{message.content}</p>
                      {message.hasImage && (
                        <div className="mt-1 text-xs text-gray-500 italic">📷 Image attached</div>
                      )}
                      {message.isAudio && (
                        <div className="mt-1 text-xs text-gray-500 italic">🎤 Voice message</div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.type === 'ai' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              toast({ title: "Copied!", description: "Message copied to clipboard." });
                            }}
                            className="h-4 px-1 text-xs"
                          >
                            <Copy className="w-2 h-2" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speakMessage(message.content)}
                            className="h-4 px-1 text-xs"
                          >
                            <Volume2 className="w-2 h-2" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-2">
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                      <span className="text-xs text-blue-700 ml-1">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Image Preview */}
        {uploadedImage && (
          <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Image className="w-3 h-3 text-gray-600" />
                <span className="text-xs text-gray-600">Image ready to send</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadedImage(null)}
                className="h-4 w-4 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="space-y-2">
          <Textarea
            placeholder="Ask me about negotiation strategies, market insights, or get help crafting your next message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="min-h-[50px] border-2 focus:border-blue-500 transition-colors resize-none text-xs"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 h-6 px-2 text-xs"
            >
              <Upload className="w-2 h-2 mr-1" />
              Image
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleVoiceRecording}
              className={`flex-shrink-0 h-6 px-2 text-xs ${isRecording ? 'bg-red-100 border-red-300 text-red-700' : ''}`}
            >
              {isRecording ? <MicOff className="w-2 h-2 mr-1" /> : <Mic className="w-2 h-2 mr-1" />}
              {isRecording ? 'Stop' : 'Voice'}
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || (!inputMessage.trim() && !uploadedImage)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold h-6 text-xs"
            >
              {isLoading ? (
                <div className="w-2 h-2 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1"></div>
              ) : (
                <Send className="w-2 h-2 mr-1" />
              )}
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AITextChat;