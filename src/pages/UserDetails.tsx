import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { adminApi, User, Donation, Payment } from "@/lib/api";
import { 
  ArrowLeft, 
  User as UserIcon, 
  Building, 
  TrendingUp, 
  Mail, 
  Calendar,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Loader2,
  Phone
} from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  "pending": { label: "Pending", variant: "outline", icon: Clock },
  "pickup-scheduled": { label: "Pickup Scheduled", variant: "secondary", icon: Calendar },
  "in-transit": { label: "In Transit", variant: "secondary", icon: Truck },
  "quality-check": { label: "Quality Check", variant: "secondary", icon: Eye },
  "delivered": { label: "Delivered", variant: "default", icon: CheckCircle },
  "completed": { label: "Completed", variant: "default", icon: CheckCircle },
  "cancelled": { label: "Cancelled", variant: "destructive", icon: XCircle },
};

const userTypeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  "individual": { icon: UserIcon, color: "text-blue-600" },
  "organization": { icon: Building, color: "text-purple-600" },
  "corporate": { icon: TrendingUp, color: "text-green-600" },
};

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        navigate("/admin");
        return;
      }

      try {
        const response = await adminApi.getUserById(userId);
        setUser(response.user);
        setDonations(response.donations);
        setPayments(response.payments);
      } catch (error: any) {
        console.error("Failed to fetch user details:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load user details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatusChange = async (donationId: string, newStatus: string) => {
    try {
      await adminApi.updateDonationStatus(donationId, { status: newStatus });
      
      setDonations(prev => 
        prev.map(donation => 
          donation._id === donationId 
            ? { ...donation, status: newStatus as any }
            : donation
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Donation status changed to ${statusConfig[newStatus]?.label || newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="min-h-screen py-20 bg-background">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </section>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <section className="min-h-screen py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
            <Button onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const userType = userTypeConfig[user.userType || 'individual'];
  const TypeIcon = userType?.icon || UserIcon;

  return (
    <Layout>
      <section className="min-h-screen py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>

          {/* User Info Card */}
          <Card className="mb-8 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className={`w-20 h-20 rounded-2xl bg-accent flex items-center justify-center ${userType?.color}`}>
                  <TypeIcon className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <TypeIcon className="w-4 h-4" />
                      <span className="capitalize">{user.userType || 'individual'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(user.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      {donations.length} total donations
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User's Donations */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
              <CardDescription>View and manage all donations from this user</CardDescription>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No donations from this user yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Item/Amount</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Update Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations.map((donation) => {
                        const status = statusConfig[donation.status];
                        const StatusIcon = status?.icon || Clock;
                        const isMonetary = donation.type === 'monetary';
                        return (
                          <TableRow key={donation._id}>
                            <TableCell className="font-mono text-sm">{donation.donationId}</TableCell>
                            <TableCell>
                              <Badge variant={isMonetary ? "secondary" : "outline"} className="capitalize">
                                {donation.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {isMonetary ? `₹${donation.amount?.toLocaleString()}` : donation.foodItem}
                            </TableCell>
                            <TableCell>{isMonetary ? "-" : donation.quantity}</TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {donation.location?.address || donation.location?.city || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(donation.createdAt)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={status?.variant || "outline"} className="gap-1">
                                <StatusIcon className="w-3 h-3" />
                                {status?.label || donation.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={donation.status}
                                onValueChange={(value) => handleStatusChange(donation._id, value)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="pickup-scheduled">Pickup Scheduled</SelectItem>
                                  <SelectItem value="in-transit">In Transit</SelectItem>
                                  <SelectItem value="quality-check">Quality Check</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default UserDetails;
