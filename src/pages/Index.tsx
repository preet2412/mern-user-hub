import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, Shield, Video, Brain, Stethoscope, CalendarDays, FileText } from "lucide-react";

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated) return null;

  const features = [
    { icon: Shield, title: "Secure Auth", desc: "Role-based access for patients, doctors, and admins" },
    { icon: CalendarDays, title: "Appointments", desc: "Book and manage appointments with ease" },
    { icon: Video, title: "Video Consult", desc: "Real-time video consultations via WebRTC" },
    { icon: FileText, title: "Prescriptions", desc: "Digital prescriptions accessible anytime" },
    { icon: Brain, title: "Smart Booking", desc: "Chatbot-assisted appointment scheduling" },
    { icon: Stethoscope, title: "Doctor Search", desc: "Find doctors by specialization and location" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container mx-auto text-center max-w-3xl space-y-8">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl">
              <Activity className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Your Health,{" "}
            <span className="text-primary">One Click Away</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed">
            MediConnect brings patients and doctors together through seamless online consultations,
            smart appointment booking, and digital prescription management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="gap-2 px-6" asChild>
              <Link to="/register">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight mb-10">
            Everything You Need for Virtual Healthcare
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
