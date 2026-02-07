import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard, Smartphone, Building2, Banknote, Loader2 } from "lucide-react";

interface PaymentSimulationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (receiptId: string) => void;
  amount: number;
  paymentMethod: string;
}

const paymentIcons: Record<string, React.ElementType> = {
  upi: Smartphone,
  card: CreditCard,
  bank: Building2,
  cash: Banknote,
};

const paymentLabels: Record<string, string> = {
  upi: "UPI Payment",
  card: "Card Payment",
  bank: "Bank Transfer",
  cash: "Cash Payment",
};

type PaymentStage = "init" | "processing" | "verifying" | "success" | "failed";

export function PaymentSimulation({ 
  isOpen, 
  onClose, 
  onSuccess, 
  amount, 
  paymentMethod 
}: PaymentSimulationProps) {
  const [stage, setStage] = useState<PaymentStage>("init");
  const [progress, setProgress] = useState(0);

  const PaymentIcon = paymentIcons[paymentMethod] || CreditCard;
  const paymentLabel = paymentLabels[paymentMethod] || "Payment";

  useEffect(() => {
    if (!isOpen) {
      setStage("init");
      setProgress(0);
    }
  }, [isOpen]);

  const handleProceed = async () => {
    setStage("processing");
    
    // Simulate payment processing animation
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 30));
      setProgress(i);
    }

    setStage("verifying");
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate 95% success rate
    const isSuccess = Math.random() < 0.95;
    
    if (isSuccess) {
      setStage("success");
      const receiptId = `RCPT-${Date.now().toString(36).toUpperCase()}`;
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess(receiptId);
    } else {
      setStage("failed");
    }
  };

  const handleRetry = () => {
    setStage("init");
    setProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && stage !== "processing" && stage !== "verifying" && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {stage === "success" ? "Payment Successful!" : paymentLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {stage === "init" && (
            <div className="text-center space-y-6">
              {/* Payment Method Icon */}
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <PaymentIcon className="w-10 h-10 text-primary" />
              </div>

              {/* Amount */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                <p className="text-4xl font-bold text-primary">₹{amount.toLocaleString()}</p>
              </div>

              {/* Simulated Payment Details */}
              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                {paymentMethod === "upi" && (
                  <>
                    <p className="text-sm"><span className="text-muted-foreground">UPI ID:</span> feedindia@upi</p>
                    <p className="text-sm"><span className="text-muted-foreground">Merchant:</span> Feed India Foundation</p>
                  </>
                )}
                {paymentMethod === "card" && (
                  <>
                    <p className="text-sm"><span className="text-muted-foreground">Card:</span> **** **** **** 4242</p>
                    <p className="text-sm"><span className="text-muted-foreground">Type:</span> Visa Credit Card</p>
                  </>
                )}
                {paymentMethod === "bank" && (
                  <>
                    <p className="text-sm"><span className="text-muted-foreground">Bank:</span> HDFC Bank</p>
                    <p className="text-sm"><span className="text-muted-foreground">Account:</span> ****1234</p>
                  </>
                )}
                {paymentMethod === "cash" && (
                  <>
                    <p className="text-sm"><span className="text-muted-foreground">Type:</span> Cash Donation</p>
                    <p className="text-sm"><span className="text-muted-foreground">Collection:</span> Our volunteer will collect</p>
                  </>
                )}
              </div>

              {/* Proceed Button */}
              <Button onClick={handleProceed} className="w-full h-12" size="lg">
                <PaymentIcon className="w-5 h-5 mr-2" />
                Pay ₹{amount.toLocaleString()}
              </Button>

              <p className="text-xs text-muted-foreground">
                This is a simulated payment for demonstration purposes
              </p>
            </div>
          )}

          {stage === "processing" && (
            <div className="text-center space-y-6">
              {/* Animated Payment Icon */}
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center relative">
                <PaymentIcon className="w-10 h-10 text-primary animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-primary/20">
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
                    style={{ animationDuration: "1s" }}
                  />
                </div>
              </div>

              <div>
                <p className="text-lg font-semibold mb-2">Processing Payment</p>
                <p className="text-sm text-muted-foreground">Please wait while we process your payment...</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-100 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{progress}%</p>
            </div>
          )}

          {stage === "verifying" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
              </div>

              <div>
                <p className="text-lg font-semibold mb-2">Verifying Payment</p>
                <p className="text-sm text-muted-foreground">Confirming your transaction...</p>
              </div>
            </div>
          )}

          {stage === "success" && (
            <div className="text-center space-y-6">
              {/* Success Animation */}
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <div>
                <p className="text-lg font-semibold mb-2 text-green-600">Payment Successful!</p>
                <p className="text-3xl font-bold text-green-600 mb-2">₹{amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Thank you for your generous donation!</p>
              </div>

              {/* Confetti-like effect */}
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {stage === "failed" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-4xl">❌</span>
              </div>

              <div>
                <p className="text-lg font-semibold mb-2 text-red-600">Payment Failed</p>
                <p className="text-sm text-muted-foreground">
                  Something went wrong. Please try again.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
