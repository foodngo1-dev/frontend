import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { adminApi, Donation, User } from "@/lib/api";
import { 
  Package, 
  Users, 
  TrendingUp, 
  Clock, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Calendar,
  IndianRupee,
  Heart,
  Building,
  User as UserIcon,
  Loader2
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

interface AdminStats {
  totalDonations: number;
  totalUsers: number;
  activeUsers: number;
  pendingDonations: number;
  completedDonations: number;
  totalFunds: number;
  estimatedMeals: number;
  monthlyDonations: number;
  donationChange: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [updatingDonationId, setUpdatingDonationId] = useState<string | null>(null);
  
  // Loading states
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingDonations, setIsLoadingDonations] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  // Data states
  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats();
        setStatsData(response.stats);
      } catch (error: any) {
        console.error("Failed to fetch stats:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load statistics",
          variant: "destructive",
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch donations with filters
  useEffect(() => {
    const fetchDonations = async () => {
      setIsLoadingDonations(true);
      try {
        const response = await adminApi.getDonations({
          status: statusFilter !== "all" ? statusFilter : undefined,
          type: typeFilter !== "all" ? typeFilter : undefined,
          search: searchTerm || undefined,
          limit: 50,
        });
        setDonations(response.donations);
      } catch (error: any) {
        console.error("Failed to fetch donations:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load donations",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDonations(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(fetchDonations, searchTerm ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [statusFilter, typeFilter, searchTerm]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await adminApi.getUsers({
          search: searchTerm || undefined,
          limit: 50,
        });
        setUsers(response.users);
      } catch (error: any) {
        console.error("Failed to fetch users:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    const timeoutId = setTimeout(fetchUsers, searchTerm ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  // Stats cards data
  const stats = statsData ? [
    { label: "Total Donations", value: statsData.totalDonations.toLocaleString(), icon: Package, change: `+${statsData.donationChange}%`, color: "text-primary" },
    { label: "Active Donors", value: statsData.activeUsers.toLocaleString(), icon: Users, change: "+8%", color: "text-success" },
    { label: "Meals Served", value: statsData.estimatedMeals.toLocaleString(), icon: Heart, change: "+23%", color: "text-secondary" },
    { label: "Funds Raised", value: formatCurrency(statsData.totalFunds), icon: IndianRupee, change: "+15%", color: "text-accent-foreground" },
  ] : [];

  // Get donor name from donation
  const getDonorName = (donor: User | string | null | undefined) => {
    if (!donor) return 'Unknown';
    if (typeof donor === 'string') return 'Unknown';
    return donor.name || 'Unknown';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle status update
  const handleStatusUpdate = async (donationId: string, newStatus: string) => {
    setUpdatingDonationId(donationId);
    try {
      const response = await adminApi.updateDonationStatus(donationId, {
        status: newStatus,
        description: `Status updated to ${statusConfig[newStatus]?.label || newStatus}`,
      });

      // Update local state
      setDonations(donations.map(d => 
        d._id === donationId ? { ...d, status: newStatus as Donation['status'] } : d
      ));

      toast({
        title: "Status Updated",
        description: `Donation status changed to ${statusConfig[newStatus]?.label || newStatus}`,
      });

      // Refresh stats
      const statsResponse = await adminApi.getStats();
      setStatsData(statsResponse.stats);
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update donation status",
        variant: "destructive",
      });
    } finally {
      setUpdatingDonationId(null);
    }
  };

  return (
    <Layout>
      <section className="min-h-screen py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor donations, manage users, and track impact</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLoadingStats ? (
              // Loading skeleton for stats
              [...Array(4)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-8 bg-muted rounded w-16"></div>
                        <div className="h-3 bg-muted rounded w-20"></div>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-muted"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              stats.map((stat, index) => (
                <Card key={stat.label} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className="text-sm text-success mt-1">{stat.change} this month</p>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl bg-accent flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-7 h-7" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="donations" className="animate-fade-in">
            <TabsList className="mb-6">
              <TabsTrigger value="donations" className="gap-2">
                <Package className="w-4 h-4" />
                Donations
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Donations Tab */}
            <TabsContent value="donations">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>All Donations</CardTitle>
                      <CardDescription>Manage and track all donation activities</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search donations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-full sm:w-64"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="pickup-scheduled">Pickup Scheduled</SelectItem>
                          <SelectItem value="in-transit">In Transit</SelectItem>
                          <SelectItem value="quality-check">Quality Check</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="monetary">Monetary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingDonations ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Donor</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Item/Amount</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {donations.map((donation) => {
                              const status = statusConfig[donation.status];
                              const StatusIcon = status?.icon || Clock;
                              const isMonetary = donation.type === "monetary";
                              return (
                                <TableRow key={donation._id}>
                                  <TableCell className="font-mono text-sm">{donation.donationId}</TableCell>
                                  <TableCell className="font-medium">{getDonorName(donation.donor)}</TableCell>
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
                                  <TableCell>
                                    <Badge variant={status?.variant || "outline"} className="gap-1">
                                      <StatusIcon className="w-3 h-3" />
                                      {status?.label || donation.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(donation.createdAt)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Select 
                                        value={donation.status} 
                                        onValueChange={(value) => handleStatusUpdate(donation._id, value)}
                                        disabled={updatingDonationId === donation._id}
                                      >
                                        <SelectTrigger className="w-32 h-8 text-xs">
                                          {updatingDonationId === donation._id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                          ) : (
                                            <SelectValue />
                                          )}
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
                                      <Button variant="ghost" size="sm" onClick={() => navigate(`/track?id=${donation.donationId}`)}>
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      {donations.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No donations found matching your criteria</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Registered Users</CardTitle>
                      <CardDescription>Manage donors and organizations</CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => {
                            const userType = userTypeConfig[user.userType || 'individual'];
                            const TypeIcon = userType?.icon || UserIcon;
                            return (
                              <TableRow 
                                key={user._id} 
                                className="cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={() => navigate(`/admin/user/${user._id}`)}
                              >
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                <TableCell>
                                  <span className={`flex items-center gap-1 capitalize ${userType?.color}`}>
                                    <TypeIcon className="w-4 h-4" />
                                    {user.userType || 'individual'}
                                  </span>
                                </TableCell>
                                <TableCell>{user.phone || '-'}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatDate(user.createdAt)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={user.status === "active" ? "default" : "secondary"}>
                                    {user.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      {users.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No users found</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Donation Trends</CardTitle>
                    <CardDescription>Monthly donation activity overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-accent/50 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Chart visualization</p>
                        <p className="text-sm">Connect to backend for live data</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribution by Type</CardTitle>
                    <CardDescription>Food vs Monetary donations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const foodCount = donations.filter(d => d.type === 'food' || d.type === 'supplies').length;
                      const monetaryCount = donations.filter(d => d.type === 'monetary').length;
                      const total = donations.length || 1;
                      const foodPercent = Math.round((foodCount / total) * 100);
                      const monetaryPercent = Math.round((monetaryCount / total) * 100);
                      
                      return (
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">Food & Supplies</span>
                              <span className="text-sm text-muted-foreground">{foodPercent}% ({foodCount})</span>
                            </div>
                            <div className="h-3 bg-accent rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${foodPercent}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">Monetary Donations</span>
                              <span className="text-sm text-muted-foreground">{monetaryPercent}% ({monetaryCount})</span>
                            </div>
                            <div className="h-3 bg-accent rounded-full overflow-hidden">
                              <div className="h-full bg-success rounded-full transition-all" style={{ width: `${monetaryPercent}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Donors</CardTitle>
                    <CardDescription>Most active contributors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingUsers ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {users
                          .filter(u => u.role !== 'admin')
                          .slice(0, 5)
                          .map((user, index) => {
                            const userType = userTypeConfig[user.userType || 'individual'];
                            const TypeIcon = userType?.icon || UserIcon;
                            return (
                              <div key={user._id} className="flex items-center gap-4">
                                <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                                <div className={`w-10 h-10 rounded-full bg-accent flex items-center justify-center ${userType?.color}`}>
                                  <TypeIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-muted-foreground capitalize">{user.userType || 'individual'}</p>
                                </div>
                                <Badge variant="secondary">{user.email}</Badge>
                              </div>
                            );
                          })}
                        {users.filter(u => u.role !== 'admin').length === 0 && (
                          <p className="text-center text-muted-foreground py-4">No donors yet</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest platform updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDonations ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {donations.slice(0, 5).map((donation) => {
                          const status = statusConfig[donation.status];
                          const StatusIcon = status?.icon || Clock;
                          const isMonetary = donation.type === 'monetary';
                          return (
                            <div key={donation._id} className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center mt-0.5">
                                <StatusIcon className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-medium">{getDonorName(donation.donor)}</span> donated{" "}
                                  <span className="font-medium">
                                    {isMonetary ? `₹${donation.amount?.toLocaleString()}` : donation.foodItem}
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground">{formatDate(donation.createdAt)}</p>
                              </div>
                            </div>
                          );
                        })}
                        {donations.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">No recent activity</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Admin;
