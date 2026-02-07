import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Building, Briefcase, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type UserType = "individual" | "organization" | "corporate";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, isAdmin } = useAuth();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "individual" as UserType,
  });

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "register");
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast({
          title: "Welcome Back!",
          description: "You have successfully logged in.",
        });
      } else {
        await register(formData.name, formData.email, formData.password, formData.userType);
        toast({
          title: "Registration Successful!",
          description: "Your account has been created. Welcome to Food Forward!",
        });
      }
      // Navigation is handled by the useEffect above when isAuthenticated changes
    } catch (error: any) {
      toast({
        title: isLogin ? "Login Failed" : "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const userTypes = [
    { value: "individual", label: "Individual", icon: User, description: "Personal donor" },
    { value: "organization", label: "Organization", icon: Building, description: "NGO or charity" },
    { value: "corporate", label: "Corporate", icon: Briefcase, description: "Business partner" },
  ];

  return (
    <Layout>
      <section className="min-h-[calc(100vh-4rem)] py-20 gradient-warm flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8 animate-slide-up">
              <div className="w-16 h-16 rounded-2xl gradient-hero mx-auto mb-4 flex items-center justify-center shadow-soft">
                <Heart className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {isLogin ? "Welcome Back" : "Join Our Mission"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Sign in to continue making a difference"
                  : "Create an account to start donating"}
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="bg-card rounded-2xl shadow-elevated overflow-hidden animate-scale-in">
              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    isLogin
                      ? "text-primary border-b-2 border-primary bg-accent/50"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    !isLogin
                      ? "text-primary border-b-2 border-primary bg-accent/50"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Name Field - Only for Register */}
                {!isLogin && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="h-12"
                    />
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password - Only for Register */}
                {!isLogin && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="h-12 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* User Type - Only for Register */}
                {!isLogin && (
                  <div className="space-y-3 animate-fade-in">
                    <Label>I am a/an</Label>
                    <RadioGroup
                      value={formData.userType}
                      onValueChange={(value) => setFormData({ ...formData, userType: value as UserType })}
                      className="grid grid-cols-3 gap-3"
                    >
                      {userTypes.map((type) => (
                        <Label
                          key={type.value}
                          htmlFor={type.value}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.userType === type.value
                              ? "border-primary bg-accent"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                          <type.icon className={`w-6 h-6 ${formData.userType === type.value ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="text-sm font-medium">{type.label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : (
                    <>{isLogin ? "Sign In" : "Create Account"}</>
                  )}
                </Button>

                {/* Footer Link */}
                <p className="text-center text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary font-medium hover:underline"
                  >
                    {isLogin ? "Register" : "Login"}
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
