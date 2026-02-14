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

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Chatbot = () => {
  const { user, users } = useAuth();
  const { bookAppointment, isSlotBooked } = useClinic();
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

  const addMessage = (from: "bot" | "user", text: string) => {
    setMessages((prev) => [...prev, { from, text }]);
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
          addMessage("bot", `Based on your symptoms, I'd suggest a ${spec} specialist. Shall I proceed? (yes/no)`);
          setStep("confirm_spec");
        } else {
          addMessage("bot", "Could you describe your symptoms more specifically? (e.g., chest pain, skin rash, joint pain, fever)");
        }
        break;
      }
      case "confirm_spec": {
        if (userText.toLowerCase().includes("yes")) {
          addMessage("bot", "What date would you prefer? (YYYY-MM-DD format)");
          setStep("date");
        } else {
          const specs = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))];
          addMessage("bot", `Please choose: ${specs.join(", ")}`);
          setStep("symptoms");
        }
        break;
      }
      case "date": {
        if (/^\d{4}-\d{2}-\d{2}$/.test(userText)) {
          const dayOfWeek = new Date(userText).getDay();
          const available = doctors.filter((d) => d.specialization === selectedSpec && d.availableDays?.includes(dayOfWeek));
          if (available.length === 0) {
            addMessage("bot", `No ${selectedSpec} doctors available on ${DAYS[dayOfWeek]}. Try another date.`);
          } else {
            setSelectedDate(userText);
            const slots = [...new Set(available.flatMap((d) => d.availableSlots || []))].sort();
            addMessage("bot", `Available time slots: ${slots.join(", ")}. Enter your preferred time (HH:MM).`);
            setStep("time");
          }
        } else {
          addMessage("bot", "Please enter a valid date in YYYY-MM-DD format.");
        }
        break;
      }
      case "time": {
        if (/^\d{2}:\d{2}$/.test(userText)) {
          setSelectedTime(userText);
          const available = doctors.filter((d) =>
            d.specialization === selectedSpec &&
            d.availableDays?.includes(new Date(selectedDate).getDay()) &&
            d.availableSlots?.includes(userText) &&
            !isSlotBooked(d.id, selectedDate, userText)
          );
          if (available.length === 0) {
            addMessage("bot", "No doctors available at that time. Try a different slot.");
            setStep("date");
          } else {
            const doctorList = available.map((d, i) => `${i + 1}. Dr. ${d.firstName} ${d.lastName} (${d.location || "N/A"}) - ₹${d.consultationFee}`).join("\n");
            addMessage("bot", `Available doctors:\n${doctorList}\n\nEnter number to select.`);
            setStep("select_doctor");
          }
        } else {
          addMessage("bot", "Please enter time in HH:MM format.");
        }
        break;
      }
      case "select_doctor": {
        const available = doctors.filter((d) =>
          d.specialization === selectedSpec &&
          d.availableDays?.includes(new Date(selectedDate).getDay()) &&
          d.availableSlots?.includes(selectedTime) &&
          !isSlotBooked(d.id, selectedDate, selectedTime)
        );
        const idx = parseInt(userText) - 1;
        if (idx >= 0 && idx < available.length) {
          setSelectedDoctorId(available[idx].id);
          const doc = available[idx];
          addMessage("bot", `Confirm booking:\nDoctor: Dr. ${doc.firstName} ${doc.lastName}\nDate: ${selectedDate}\nTime: ${selectedTime}\nFee: ₹${doc.consultationFee}\n\nType "confirm" to book.`);
          setStep("confirm");
        } else {
          addMessage("bot", "Invalid selection. Enter a valid number.");
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
              consultationFee: doc.consultationFee,
            });
            addMessage("bot", "✅ Appointment booked successfully! Check your dashboard.");
            setStep("done");
          }
        } else {
          addMessage("bot", "Booking cancelled. Type anything to start over.");
          setMessages([]);
          setStep("greeting");
        }
        break;
      }
      case "done": {
        setMessages([]);
        setStep("greeting");
        break;
      }
    }
  };

  if (user?.role !== "patient") return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96">
          <Card className="border-0 shadow-xl flex flex-col" style={{ height: "28rem" }}>
            <div className="flex items-center justify-between bg-primary text-primary-foreground px-4 py-3 rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold text-sm">MediConnect Assistant</span>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-primary-foreground hover:bg-primary/80" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-line ${
                    msg.from === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

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
