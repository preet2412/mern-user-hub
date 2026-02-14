import { useState } from "react";
import { useAuth, User } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

const AdminUsers = () => {
  const { users, deleteUser, warnUser } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [warningUser, setWarningUser] = useState<User | null>(null);
  const [warningMessage, setWarningMessage] = useState("");

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || u.role === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleDelete = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id);
      toast({ title: "User deleted", description: `${deletingUser.firstName} ${deletingUser.lastName} has been removed.` });
      setDeletingUser(null);
    }
  };

  const handleWarn = () => {
    if (warningUser && warningMessage.trim()) {
      warnUser(warningUser.id, warningMessage);
      toast({ title: "Warning sent", description: `Warning sent to ${warningUser.firstName} ${warningUser.lastName}.` });
      setWarningUser(null);
      setWarningMessage("");
    }
  };

  const tabs = [
    { value: "all", label: "All Users" },
    { value: "patient", label: "Patients" },
    { value: "doctor", label: "Doctors" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
      <p className="text-muted-foreground">View and manage all registered users.</p>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, email, or username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                          u.role === "admin" ? "bg-destructive" : u.role === "doctor" ? "bg-secondary" : "bg-primary"
                        }`}>
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        {u.firstName} {u.lastName}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.username}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-muted-foreground">{u.phone}</TableCell>
                    <TableCell>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase text-white ${
                        u.role === "admin" ? "bg-destructive" : u.role === "doctor" ? "bg-secondary" : "bg-primary"
                      }`}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.role === "doctor" && <>{u.specialization} • ₹{u.consultationFee} • {u.location}</>}
                      {u.role === "patient" && <>{u.age ? `Age: ${u.age}` : "—"} • {u.medicalHistory || "No history"}</>}
                      {u.role === "admin" && "System Admin"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-warning hover:text-warning"
                          onClick={() => setWarningUser(u)} disabled={u.role === "admin"}
                          title="Send Warning"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingUser(u)} disabled={u.role === "admin"}
                          title="Delete User"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingUser?.firstName} {deletingUser?.lastName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Warning Dialog */}
      <AlertDialog open={!!warningUser} onOpenChange={() => { setWarningUser(null); setWarningMessage(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Warning to {warningUser?.firstName} {warningUser?.lastName}</AlertDialogTitle>
            <AlertDialogDescription>
              This warning will be visible on the user's profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Enter warning message..."
            value={warningMessage}
            onChange={(e) => setWarningMessage(e.target.value)}
            className="my-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleWarn} disabled={!warningMessage.trim()} className="bg-warning text-warning-foreground hover:bg-warning/90">
              Send Warning
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
