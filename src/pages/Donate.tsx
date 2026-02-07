import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Package, Apple, Droplet, Truck, Users, BookOpen, ArrowRight, Check, CreditCard, Smartphone, Building2, Banknote, MapPin, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { paymentsApi, donationsApi } from "@/lib/api";
import { PaymentSimulation } from "@/components/PaymentSimulation";

const foodCategories = [
  {
    icon: Package,
    title: "Non-Perishable Essentials",
    items: ["Rice", "Pulses (Dal)", "Cooking Oil", "Flour (Atta)", "Sugar", "Salt"],
    color: "from-primary to-primary/70",
  },
  {
    icon: Apple,
    title: "Fresh & Ready-to-Eat",
    items: ["Fresh Fruits", "Vegetables", "Pre-packaged Meals", "Bread & Bakery", "Dairy Products"],
    color: "from-secondary to-secondary/70",
  },
  {
    icon: Droplet,
    title: "Supplies & Logistics",
    items: ["Water Bottles", "Blankets", "Soap & Hygiene", "Utensils", "Storage Containers"],
    color: "from-accent-foreground to-accent-foreground/70",
  },
];

const donationTiers = [
  {
    amount: 1500,
    title: "Community Meal",
    description: "Provides one full day of meals for a shelter or community kitchen",
    icon: Users,
    impact: "Feeds 50+ people",
    featured: false,
  },
  {
    amount: 15000,
    title: "Distribution Support",
    description: "Covers fuel and maintenance for our distribution fleet for one week",
    icon: Truck,
    impact: "Delivers 500+ meals",
    featured: true,
  },
  {
    amount: 30000,
    title: "Awareness Program",
    description: "Sponsors community awareness program and volunteer training session",
    icon: BookOpen,
    impact: "Trains 100+ volunteers",
    featured: false,
  },
];

const Donate = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Payment modal state
  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showPaymentSimulation, setShowPaymentSimulation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [cashOption, setCashOption] = useState<"pickup" | "visit" | "">("");
  const [cashLocation, setCashLocation] = useState("");
  const [pendingPayment, setPendingPayment] = useState<{
    orderId: string;
    paymentId: string;
  } | null>(null);

  const handleDonateClick = (amount: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to make a donation",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    setSelectedAmount(amount);
    setSelectedPaymentMethod("");
    setCashOption("");
    setCashLocation("");
    setShowPaymentTypeModal(true);
  };

  const handlePaymentMethodSelect = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please select a payment method to continue",
        variant: "destructive",
      });
      return;
    }

    if (selectedPaymentMethod === "cash") {
      setShowPaymentTypeModal(false);
      setShowCashModal(true);
    } else {
      // For UPI, Card, Bank - show payment simulation
      setIsSubmitting(true);
      try {
        const orderResponse = await paymentsApi.createOrder(selectedAmount, {
          tierTitle: "Donation",
          description: `₹${selectedAmount.toLocaleString()} donation`,
        });
        
        setPendingPayment({
          orderId: orderResponse.orderId,
          paymentId: orderResponse.paymentId,
        });
        
        setShowPaymentTypeModal(false);
        setShowPaymentSimulation(true);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to initiate payment",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCashDonation = async () => {
    if (!cashOption) {
      toast({
        title: "Select Option",
        description: "Please select how you want to donate cash",
        variant: "destructive",
      });
      return;
    }

    if (cashOption === "pickup" && !cashLocation.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter your address for cash pickup",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create donation with cash payment
      const response = await donationsApi.create({
        type: "monetary",
        amount: selectedAmount,
        paymentMethod: "cash",
        purpose: "general",
        location: { address: cashOption === "pickup" ? cashLocation : "Donor will visit office" },
        notes: cashOption === "pickup" 
          ? "Cash pickup requested from donor's location" 
          : "Donor will visit office to pay cash",
      });

      setShowCashModal(false);
      toast({
        title: "Donation Registered!",
        description: cashOption === "pickup"
          ? `Our volunteer will collect ₹${selectedAmount.toLocaleString()} from your location soon.`
          : `Please visit our office to complete your ₹${selectedAmount.toLocaleString()} donation. Donation ID: ${response.donation.donationId}`,
      });
      
      // Reset state
      setSelectedAmount(0);
      setSelectedPaymentMethod("");
      setCashOption("");
      setCashLocation("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register donation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (receiptId: string) => {
    if (!pendingPayment) return;

    try {
      await paymentsApi.verify({
        orderId: pendingPayment.orderId,
        paymentId: pendingPayment.paymentId,
        amount: selectedAmount,
        donationType: "general",
        paymentMethod: selectedPaymentMethod,
      });

      setShowPaymentSimulation(false);
      toast({
        title: "Donation Successful!",
        description: `Receipt ID: ${receiptId}. Thank you for your generous contribution of ₹${selectedAmount.toLocaleString()}!`,
      });
      
      // Reset state
      setSelectedAmount(0);
      setSelectedPaymentMethod("");
      setPendingPayment(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Payment verification failed",
        variant: "destructive",
      });
    }
  };

  const handleSchedulePickup = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to schedule a food pickup or drop-off.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    navigate("/dashboard");
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 gradient-warm">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4 animate-fade-in">
              Make a Difference Today
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-up">
              Your <span className="text-gradient">Donation</span> Feeds Hope
            </h1>
            <p className="text-muted-foreground text-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Choose how you'd like to contribute – donate food items or make a financial contribution to support our mission.
            </p>
          </div>
        </div>
      </section>

      {/* Food Donation Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Donate Food Items</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We accept various types of food items. From non-perishable essentials to fresh produce – every contribution makes an impact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {foodCategories.map((category, index) => (
              <Card 
                key={category.title}
                className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}>
                    <category.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="w-4 h-4 text-secondary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-card text-center">
            <h3 className="text-xl font-semibold mb-3">Ready to Donate Food?</h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              We accept bulk donations from businesses and individual drop-offs. Schedule a convenient pickup or find a drop-off point near you.
            </p>
            <Button size="lg" onClick={handleSchedulePickup}>
              <Truck className="w-5 h-5 mr-2" />
              Schedule a Pickup or Drop-off
            </Button>
          </div>
        </div>
      </section>

      {/* Financial Contribution Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Financial Contribution</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your monetary donation helps us maintain our operations, expand our reach, and serve more communities in need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {donationTiers.map((tier, index) => (
              <Card 
                key={tier.amount}
                className={`border-0 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 animate-slide-up relative overflow-hidden ${tier.featured ? 'ring-2 ring-primary' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {tier.featured && (
                  <div className="absolute top-0 left-0 right-0 gradient-hero text-center py-1">
                    <span className="text-xs font-semibold text-primary-foreground">Most Popular</span>
                  </div>
                )}
                <CardHeader className={tier.featured ? 'pt-10' : ''}>
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                    <tier.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold">₹{tier.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <CardTitle className="text-xl">{tier.title}</CardTitle>
                  <CardDescription className="text-base">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-secondary font-medium">
                    <Check className="w-5 h-5" />
                    <span>{tier.impact}</span>
                  </div>
                  <Button 
                    className="w-full" 
                    variant={tier.featured ? "default" : "outline"}
                    onClick={() => handleDonateClick(tier.amount)}
                  >
                    Donate ₹{tier.amount.toLocaleString('en-IN')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm">
              All donations are tax-deductible under Section 80G of the Income Tax Act.
            </p>
          </div>
        </div>
      </section>

      {/* Payment Type Selection Modal */}
      <Dialog open={showPaymentTypeModal} onOpenChange={setShowPaymentTypeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
            <DialogDescription>
              Choose how you'd like to donate ₹{selectedAmount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <div className="grid gap-3">
                <Label
                  htmlFor="upi"
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedPaymentMethod === "upi" ? "border-primary bg-primary/5" : "hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem value="upi" id="upi" />
                  <Smartphone className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">UPI</p>
                    <p className="text-sm text-muted-foreground">Pay using any UPI app</p>
                  </div>
                </Label>
                
                <Label
                  htmlFor="card"
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedPaymentMethod === "card" ? "border-primary bg-primary/5" : "hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem value="card" id="card" />
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</p>
                  </div>
                </Label>
                
                <Label
                  htmlFor="bank"
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedPaymentMethod === "bank" ? "border-primary bg-primary/5" : "hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem value="bank" id="bank" />
                  <Building2 className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-sm text-muted-foreground">Net Banking / NEFT / IMPS</p>
                  </div>
                </Label>
                
                <Label
                  htmlFor="cash"
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedPaymentMethod === "cash" ? "border-primary bg-primary/5" : "hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem value="cash" id="cash" />
                  <Banknote className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Cash</p>
                    <p className="text-sm text-muted-foreground">Pay in person</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentTypeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentMethodSelect} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cash Donation Modal */}
      <Dialog open={showCashModal} onOpenChange={setShowCashModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cash Donation</DialogTitle>
            <DialogDescription>
              How would you like to donate ₹{selectedAmount.toLocaleString()} in cash?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <RadioGroup value={cashOption} onValueChange={(v) => setCashOption(v as "pickup" | "visit")}>
              <div className="grid gap-3">
                <Label
                  htmlFor="pickup"
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    cashOption === "pickup" ? "border-primary bg-primary/5" : "hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem value="pickup" id="pickup" />
                  <MapPin className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Pickup from My Location</p>
                    <p className="text-sm text-muted-foreground">Our volunteer will collect from your address</p>
                  </div>
                </Label>
                
                <Label
                  htmlFor="visit"
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    cashOption === "visit" ? "border-primary bg-primary/5" : "hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem value="visit" id="visit" />
                  <Building2 className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">I'll Visit the Office</p>
                    <p className="text-sm text-muted-foreground">Visit our office at 123 Mission St, Food Hub City</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {cashOption === "pickup" && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="location">Your Address</Label>
                <Input
                  id="location"
                  placeholder="Enter your complete address for pickup"
                  value={cashLocation}
                  onChange={(e) => setCashLocation(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCashModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCashDonation} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirm Donation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Simulation Modal */}
      {pendingPayment && (
        <PaymentSimulation
          isOpen={showPaymentSimulation}
          onClose={() => {
            setShowPaymentSimulation(false);
            setPendingPayment(null);
          }}
          onSuccess={handlePaymentSuccess}
          amount={selectedAmount}
          paymentMethod={selectedPaymentMethod}
        />
      )}
    </Layout>
  );
};

export default Donate;
