import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { donationsApi, Donation } from "@/lib/api";
import { Search, Package, Truck, CheckCircle, ClipboardCheck, MapPin, Users, Check, Loader2, AlertCircle } from "lucide-react";

const Track = () => {
  const [donationId, setDonationId] = useState("");
  const [donation, setDonation] = useState<Donation | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!donationId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a donation ID",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setNotFound(false);
    setDonation(null);
    
    try {
      const response = await donationsApi.track(donationId.trim());
      setDonation(response.donation as Donation);
    } catch (error: any) {
      console.error("Failed to track donation:", error);
      setNotFound(true);
      toast({
        title: "Donation Not Found",
        description: "Please check your donation ID and try again",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Donation Confirmed",
      "pickup-scheduled": "Pickup Scheduled",
      "in-transit": "In Transit",
      "quality-check": "Quality Check",
      delivered: "Delivered & Impact Made",
      completed: "Donation Successfully Received",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const formatLocation = (location: any) => {
    if (!location) return 'N/A';
    
    // If location is a string, return it directly
    if (typeof location === 'string') return location;
    
    // If location is an object, build full address
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.pincode) parts.push(location.pincode);
    
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920')] bg-cover bg-center mix-blend-overlay opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-slide-up">
              Track Your Donation's Journey
            </h1>
            <p className="text-primary-foreground/80 text-lg mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              See exactly where your donation is and the impact it's making
            </p>
            
            <form 
              onSubmit={handleSearch} 
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter Donation ID (e.g., DON-2024-78945)"
                  value={donationId}
                  onChange={(e) => setDonationId(e.target.value)}
                  className="pl-12 h-14 text-base bg-card border-0 shadow-lg"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8" disabled={isSearching}>
                {isSearching ? (
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  "Track"
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Tracking Results */}
      {donation && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            {/* Status Header */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-3 bg-secondary/10 text-secondary px-6 py-3 rounded-full mb-4">
                <Check className="w-5 h-5" />
                <span className="font-semibold">{getStatusLabel(donation.status)}</span>
              </div>
              <h2 className="text-2xl font-bold">Donation ID: {donation.donationId}</h2>
              {donation.type === 'monetary' && (
                <p className="text-muted-foreground mt-2">
                  Amount: ₹{donation.amount?.toLocaleString()}
                </p>
              )}
              {donation.type !== 'monetary' && (
                <p className="text-muted-foreground mt-2">
                  {donation.foodItem} - {donation.quantity}
                </p>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Timeline */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>Delivery Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {donation.timeline && donation.timeline.length > 0 ? (
                        donation.timeline.map((step, index) => {
                          const icons: Record<string, React.ElementType> = {
                            pending: CheckCircle,
                            "pickup-scheduled": Package,
                            "in-transit": Truck,
                            "quality-check": ClipboardCheck,
                            delivered: MapPin,
                            completed: Users,
                          };
                          const StepIcon = icons[step.status] || CheckCircle;

                          return (
                            <div 
                              key={index} 
                              className="flex gap-4 pb-8 last:pb-0 animate-slide-up"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              {/* Line */}
                              <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 gradient-hero shadow-soft">
                                  <StepIcon className="w-5 h-5 text-primary-foreground" />
                                </div>
                                {index < donation.timeline.length - 1 && (
                                  <div className="w-0.5 flex-1 mt-2 bg-primary" />
                                )}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                                  <h3 className="font-semibold">{step.title}</h3>
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(step.timestamp)} • {formatTime(step.timestamp)}
                                  </span>
                                </div>
                                <p className="text-muted-foreground text-sm">{step.description}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No timeline updates yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Donation Details */}
              <div className="space-y-6">
                <Card className="border-0 shadow-card animate-scale-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Donation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-semibold capitalize">{donation.type}</p>
                    </div>

                    {donation.type === 'monetary' ? (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-semibold text-success">₹{donation.amount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Method</p>
                          <p className="font-medium capitalize">{donation.paymentMethod || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Purpose</p>
                          <p className="font-medium capitalize">{donation.purpose || 'General Fund'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Item</p>
                          <p className="font-semibold">{donation.foodItem}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Quantity</p>
                          <p className="font-medium">{donation.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">
                            {formatLocation(donation.location)}
                          </p>
                        </div>
                        {donation.bestBefore && (
                          <div>
                            <p className="text-sm text-muted-foreground">Best Before</p>
                            <p className="font-medium">{donation.bestBefore} hours</p>
                          </div>
                        )}
                      </>
                    )}

                    {donation.notes && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm text-foreground italic">{donation.notes}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-1">Donation Date</p>
                      <p className="text-sm">{formatDate(donation.createdAt)}</p>
                    </div>

                    {donation.recipient && (
                      <div className="pt-4 border-t border-border">
                        <div className="bg-secondary/10 rounded-xl p-4">
                          <p className="text-sm text-muted-foreground mb-1">Recipient</p>
                          <p className="font-semibold text-secondary">
                            {donation.recipient.name || 'Assigned to recipient'}
                          </p>
                          {donation.recipient.location && (
                            <p className="text-sm text-muted-foreground mt-1">{donation.recipient.location}</p>
                          )}
                          {donation.recipient.type && (
                            <p className="text-sm text-muted-foreground mt-1 capitalize">{donation.recipient.type}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {donation.location && (
                  <Card className="border-0 shadow-card overflow-hidden animate-scale-in" style={{ animationDelay: "0.1s" }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        {donation.type === 'monetary' ? 'Transaction Details' : 'Pickup Location'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {donation.type === 'monetary' ? (
                        <div className="text-center py-4">
                          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-success" />
                          <p className="font-semibold text-success">Payment Successful</p>
                          <p className="text-sm text-muted-foreground mt-1">Thank you for your contribution</p>
                        </div>
                      ) : (
                        <div className="h-32 bg-muted flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">{donation.location.city || 'Location'}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* No Results State */}
      {!donation && !isSearching && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-md mx-auto">
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${notFound ? 'bg-destructive/10' : 'bg-muted'}`}>
                {notFound ? (
                  <AlertCircle className="w-10 h-10 text-destructive" />
                ) : (
                  <Search className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {notFound ? 'Donation Not Found' : 'Enter Your Donation ID'}
              </h3>
              <p className="text-muted-foreground">
                {notFound 
                  ? 'Please check your donation ID and try again. Make sure to enter the complete ID (e.g., DON-2026-00012).'
                  : "You'll find your donation ID in the confirmation email we sent you after your donation was registered."
                }
              </p>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Track;
