import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Activity, ArrowRight, Stethoscope, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [role, setRole] = useState<UserRole>("patient");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    consultationFee: "",
    age: "",
    medicalHistory: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,
        ...(role === "doctor" && {
          specialization: formData.specialization,
          consultationFee: Number(formData.consultationFee),
        }),
        ...(role === "patient" && {
          age: formData.age ? Number(formData.age) : undefined,
          medicalHistory: formData.medicalHistory || undefined,
        }),
      });
      if (result.success) {
        toast({ title: "Success!", description: "Account created. Please sign in." });
        navigate("/login");
      } else {
        toast({ title: "Registration failed", description: result.message, variant: "destructive" });
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Activity className="h-7 w-7" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground">Join Virtual Clinic as a patient or doctor</p>
        </div>

        <Card className="shadow-xl border-0">
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Registration</CardTitle>
              <CardDescription>Select your role and fill in your details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Role Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    role === "patient"
                      ? "border-primary bg-accent shadow-sm"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <User className={`h-6 w-6 ${role === "patient" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-semibold ${role === "patient" ? "text-primary" : "text-muted-foreground"}`}>
                    Patient
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("doctor")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    role === "doctor"
                      ? "border-primary bg-accent shadow-sm"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <Stethoscope className={`h-6 w-6 ${role === "doctor" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-semibold ${role === "doctor" ? "text-primary" : "text-muted-foreground"}`}>
                    Doctor
                  </span>
                </button>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>

              {/* Role-specific fields */}
              {role === "doctor" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select
                      value={formData.specialization}
                      onValueChange={(val) => setFormData((p) => ({ ...p, specialization: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Cardiology", "Dermatology", "Neurology", "Orthopedics", "Pediatrics", "Psychiatry", "General Medicine"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                    <Input id="consultationFee" name="consultationFee" type="number" value={formData.consultationFee} onChange={handleChange} required />
                  </div>
                </>
              )}

              {role === "patient" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (optional)</Label>
                    <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory">Medical History (optional)</Label>
                    <Textarea
                      id="medicalHistory"
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleChange}
                      placeholder="Any relevant medical history..."
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Password */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
