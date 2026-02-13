import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  from: "bot" | "user";
  text: string;
  options?: string[];
}

const symptomToSpecialization: Record<string, string> = {
  "chest pain": "Cardiology",
  "heart": "Cardiology",
  "skin": "Dermatology",
  "rash": "Dermatology",
  "acne": "Dermatology",
  "bone": "Orthopedics",
  "joint": "Orthopedics",
  "fracture": "Orthopedics",
  "fever": "General Medicine",
  "cold": "General Medicine",
  "cough": "General Medicine",
  "headache": "General Medicine",
  "stomach": "General Medicine",
};

type Step = "greeting" | "symptoms" | "confirm_spec" | "date" | "time" | "select_doctor" | "confirm" | "done";

const Chatbot = () => {
  const { user, users } = useAuth();
  const { bookAppointment } = useClinic();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("greeting");
  const [selectedSpec, setSelectedSpec] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const doctors = users.filter((u) => u.role === "doctor");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ from: "bot", text: `Hi ${user?.firstName || "there"}! I can help you book an appointment. What symptoms are you experiencing?` }]);
      setStep("symptoms");
    }
  }, [open, messages.length, user?.firstName]);

  const addMessage = (from: "bot" | "user", text: string, options?: string[]) => {
    setMessages((prev) => [...prev, { from, text, options }]);
  };

  const matchSpecialization = (text: string): string | null => {
    const lower = text.toLowerCase();
    for (const [keyword, spec] of Object.entries(symptomToSpecialization)) {
      if (lower.includes(keyword)) return spec;
    }
    return null;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput("");
    addMessage("user", userText);

    switch (step) {
      case "symptoms": {
        const spec = matchSpecialization(userText);
        if (spec) {
          setSelectedSpec(spec);
          addMessage("bot", `Based on your symptoms, I'd suggest a ${spec} specialist. Shall I proceed with this? (yes/no)`);
          setStep("confirm_spec");
        } else {
          addMessage("bot", "I couldn't determine the specialization. Could you describe your symptoms more specifically? (e.g., chest pain, skin rash, joint pain, fever)");
        }
        break;
      }
      case "confirm_spec": {
        if (userText.toLowerCase().includes("yes")) {
          addMessage("bot", "Great! What date would you prefer? (YYYY-MM-DD format)");
          setStep("date");
        } else {
          const specs = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))];
          addMessage("bot", `Please choose a specialization: ${specs.join(", ")}`);
          setStep("symptoms");
        }
        break;
      }
      case "date": {
        if (/^\d{4}-\d{2}-\d{2}$/.test(userText)) {
          setSelectedDate(userText);
          addMessage("bot", "What time do you prefer? (HH:MM format, e.g., 10:00)");
          setStep("time");
        } else {
          addMessage("bot", "Please enter a valid date in YYYY-MM-DD format.");
        }
        break;
      }
      case "time": {
        if (/^\d{2}:\d{2}$/.test(userText)) {
          setSelectedTime(userText);
          const available = doctors.filter((d) => d.specialization === selectedSpec);
          if (available.length === 0) {
            addMessage("bot", `No ${selectedSpec} doctors available. Please try different symptoms.`);
            setStep("symptoms");
          } else {
            const doctorList = available.map((d, i) => `${i + 1}. Dr. ${d.firstName} ${d.lastName} (${d.location || "N/A"}) - ₹${d.consultationFee}`).join("\n");
            addMessage("bot", `Available ${selectedSpec} doctors:\n${doctorList}\n\nPlease enter the number to select.`);
            setStep("select_doctor");
          }
        } else {
          addMessage("bot", "Please enter a valid time in HH:MM format.");
        }
        break;
      }
      case "select_doctor": {
        const available = doctors.filter((d) => d.specialization === selectedSpec);
        const idx = parseInt(userText) - 1;
        if (idx >= 0 && idx < available.length) {
          setSelectedDoctorId(available[idx].id);
          const doc = available[idx];
          addMessage("bot", `Confirm booking:\nDoctor: Dr. ${doc.firstName} ${doc.lastName}\nDate: ${selectedDate}\nTime: ${selectedTime}\n\nType "confirm" to book.`);
          setStep("confirm");
        } else {
          addMessage("bot", "Invalid selection. Please enter a valid number.");
        }
        break;
      }
      case "confirm": {
        if (userText.toLowerCase().includes("confirm")) {
          const doc = doctors.find((d) => d.id === selectedDoctorId);
          if (doc && user) {
            bookAppointment({
              patientId: user.id,
              patientName: `${user.firstName} ${user.lastName}`,
              patientAge: user.age,
              patientMedicalHistory: user.medicalHistory,
              doctorId: doc.id,
              doctorName: `Dr. ${doc.firstName} ${doc.lastName}`,
              specialization: doc.specialization || "",
              location: doc.location,
              date: selectedDate,
              time: selectedTime,
            });
            addMessage("bot", "✅ Appointment booked successfully! You can view it in your dashboard.");
            setStep("done");
          }
        } else {
          addMessage("bot", "Booking cancelled. Type anything to start over.");
          setStep("greeting");
          setMessages([]);
        }
        break;
      }
      case "done": {
        setMessages([]);
        setStep("greeting");
        break;
      }
      default:
        break;
    }
  };

  if (user?.role !== "patient") return null;

  return (
    <>
      {/* Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96">
          <Card className="border-0 shadow-xl flex flex-col" style={{ height: "28rem" }}>
            {/* Header */}
            <div className="flex items-center justify-between bg-primary text-primary-foreground px-4 py-3 rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold text-sm">MediConnect Assistant</span>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-primary-foreground hover:bg-primary/80" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-line ${
                      msg.from === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3 flex gap-2">
              <Input
                placeholder={step === "done" ? "Type to start over..." : "Type your message..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="text-sm"
              />
              <Button size="icon" onClick={handleSend} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default Chatbot;
