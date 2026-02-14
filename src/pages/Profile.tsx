import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Profile = () => {
  const { user, updateUser, changePassword } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    age: user?.age?.toString() || "",
    medicalHistory: user?.medicalHistory || "",
    specialization: user?.specialization || "",
    consultationFee: user?.consultationFee?.toString() || "",
    location: user?.location || "",
    availableSlots: user?.availableSlots?.join(", ") || "",
    availableDays: user?.availableDays || [],
  });

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!user) return null;

  const handleSave = () => {
    const updates: Record<string, unknown> = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
    };
    if (user.role === "patient") {
      updates.age = form.age ? parseInt(form.age) : undefined;
      updates.medicalHistory = form.medicalHistory;
    }
    if (user.role === "doctor") {
      updates.specialization = form.specialization;
      updates.consultationFee = form.consultationFee ? parseInt(form.consultationFee) : undefined;
      updates.location = form.location;
      updates.availableSlots = form.availableSlots.split(",").map((s) => s.trim()).filter(Boolean);
      updates.availableDays = form.availableDays;
    }
    updateUser(user.id, updates);
    toast({ title: "Profile updated successfully" });
    setEditing(false);
  };

  const handleSendOtp = () => {
    setOtpSent(true);
    toast({ title: "OTP Sent", description: "Demo OTP: 1234 (sent to your phone/email)" });
  };

  const handleVerifyOtp = () => {
    if (otpValue === "1234") {
      setOtpVerified(true);
      toast({ title: "OTP Verified" });
    } else {
      toast({ title: "Invalid OTP", description: "Please enter 1234", variant: "destructive" });
    }
  };

  const handleChangePassword = () => {
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    changePassword(user.id, newPassword);
    toast({ title: "Password changed successfully" });
    setShowPasswordChange(false);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpValue("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const toggleDay = (day: number) => {
    setForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day].sort(),
    }));
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

      <Card className="border-0 shadow-md">
        <CardHeader className="items-center">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="mt-3">{user.firstName} {user.lastName}</CardTitle>
          <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input disabled={!editing} value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input disabled={!editing} value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email <span className="text-xs text-muted-foreground">(cannot be changed)</span></Label>
            <Input disabled value={user.email} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input disabled={!editing} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input disabled value={user.username} />
          </div>

          {user.role === "patient" && (
            <>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input disabled={!editing} type="number" value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Medical History</Label>
                <Textarea disabled={!editing} value={form.medicalHistory} onChange={(e) => setForm((p) => ({ ...p, medicalHistory: e.target.value }))} />
              </div>
            </>
          )}

          {user.role === "doctor" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input disabled={!editing} value={form.specialization} onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Consultation Fee (₹)</Label>
                  <Input disabled={!editing} type="number" value={form.consultationFee} onChange={(e) => setForm((p) => ({ ...p, consultationFee: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input disabled={!editing} value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Available Time Slots <span className="text-xs text-muted-foreground">(comma separated, e.g. 09:00, 10:00)</span></Label>
                <Input disabled={!editing} value={form.availableSlots} onChange={(e) => setForm((p) => ({ ...p, availableSlots: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Available Days</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      disabled={!editing}
                      onClick={() => toggleDay(i)}
                      className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                        form.availableDays.includes(i)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border"
                      } ${!editing ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {editing ? (
              <>
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showPasswordChange ? (
            <Button variant="outline" onClick={() => setShowPasswordChange(true)}>Change Password</Button>
          ) : !otpSent ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">We'll send an OTP to your registered phone/email for verification.</p>
              <div className="flex gap-2">
                <Button onClick={handleSendOtp}>Send OTP</Button>
                <Button variant="ghost" onClick={() => setShowPasswordChange(false)}>Cancel</Button>
              </div>
            </div>
          ) : !otpVerified ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Enter the OTP sent to your phone/email. <span className="text-primary font-medium">(Demo: 1234)</span></p>
              <div className="flex gap-2">
                <Input placeholder="Enter OTP" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} className="max-w-[200px]" />
                <Button onClick={handleVerifyOtp}>Verify</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-secondary">
                <CheckCircle className="h-4 w-4" />
                OTP Verified
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleChangePassword}>Update Password</Button>
                <Button variant="ghost" onClick={() => { setShowPasswordChange(false); setOtpSent(false); setOtpVerified(false); }}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warnings */}
      {user.warnings && user.warnings.length > 0 && (
        <Card className="border-0 shadow-md border-l-4 border-l-destructive">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">⚠ System Warnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {user.warnings.map((w, i) => (
              <p key={i} className="text-sm text-muted-foreground">• {w}</p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
