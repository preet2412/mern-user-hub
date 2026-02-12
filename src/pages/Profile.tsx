import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });

  if (!user) return null;

  const handleSave = () => {
    updateUser(user.id, form);
    toast({ title: "Profile updated" });
    setEditing(false);
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
            <Label>Email</Label>
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
          {user.role === "doctor" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input disabled value={user.specialization || ""} />
              </div>
              <div className="space-y-2">
                <Label>Consultation Fee</Label>
                <Input disabled value={`₹${user.consultationFee || 0}`} />
              </div>
            </div>
          )}
          {user.role === "patient" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input disabled value={user.age?.toString() || "—"} />
              </div>
              <div className="space-y-2">
                <Label>Medical History</Label>
                <Input disabled value={user.medicalHistory || "None"} />
              </div>
            </div>
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
    </div>
  );
};

export default Profile;
