
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onResult: (transcript: string) => void;
}

const VoiceInput = ({ onResult }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptionResult = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptionResult;
        } else {
          interimTranscript += transcriptionResult;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);

      if (finalTranscript) {
        onResult(finalTranscript);
        toast({
          title: "Voice Input Captured",
          description: `Recorded: "${finalTranscript}"`
        });
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      toast({
        title: "Speech Recognition Error",
        description: "Could not capture speech. Please try again.",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`w-16 h-16 rounded-full ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          }`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </Button>
      </div>
      
      {isListening && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Listening...</p>
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-8 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      )}
      
      {transcript && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Captured:</strong> {transcript}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
