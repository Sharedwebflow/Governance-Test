import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { SocialSignInButtons } from "@/components/social-signin-buttons";
import { User, Lock, Mail, AlertCircle } from "lucide-react";
import { signInWithEmail, createAccountWithEmail, resetPassword, auth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const loginSchema = insertUserSchema.pick({ email: true }).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  const resetForm = useForm<{ email: string }>({
    resolver: zodResolver(z.object({
      email: z.string().email("Please enter a valid email address"),
    })),
    defaultValues: {
      email: ""
    }
  });

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleFirebaseEmailSignIn = async (data: LoginData) => {
    try {
      setIsLoading(true);
      const user = await signInWithEmail(data.email, data.password);
      
      // Get the Firebase token
      const idToken = await user.getIdToken();
      
      // Send to our backend
      const response = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken,
          provider: "email"
        }),
      });
      
      if (!response.ok) {
        throw new Error("Server authentication failed");
      }
      
      // Success! Reload
      window.location.href = "/";
    } catch (error: any) {
      console.error("Firebase sign in error:", error);
      let errorMessage = "Failed to sign in";
      
      // Handle Firebase error codes
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseEmailRegister = async (data: any) => {
    try {
      setIsLoading(true);
      const user = await createAccountWithEmail(data.email, data.password);
      
      // Update the user profile with the name
      if (user.displayName !== data.name) {
        await updateProfile(user, {
          displayName: data.name
        });
      }
      
      // Get the Firebase token
      const idToken = await user.getIdToken();
      
      // Send to our backend
      const response = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken,
          provider: "email"
        }),
      });
      
      if (!response.ok) {
        throw new Error("Server authentication failed");
      }
      
      // Success! Reload
      window.location.href = "/";
    } catch (error: any) {
      console.error("Firebase sign up error:", error);
      let errorMessage = "Failed to create account";
      
      // Handle Firebase error codes
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: { email: string }) => {
    try {
      setIsLoading(true);
      await resetPassword(data.email);
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password",
      });
      setForgotPassword(false);
    } catch (error: any) {
      console.error("Reset password error:", error);
      let errorMessage = "Failed to send reset email";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Reset failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              {forgotPassword ? "Reset Password" : isLogin ? "Login" : "Sign Up"}
            </h1>
          </div>

          {forgotPassword ? (
            // Password Reset Form
            <form
              onSubmit={resetForm.handleSubmit(handleResetPassword)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...resetForm.register("email")}
                  />
                </div>
                {resetForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{resetForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  We'll send you an email with instructions to reset your password.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setForgotPassword(false)}
                  disabled={isLoading}
                >
                  Back to Login
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </div>
            </form>
          ) : isLogin ? (
            // Login Form
            <form
              onSubmit={loginForm.handleSubmit(handleFirebaseEmailSignIn)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Type your email"
                    className="pl-10"
                    {...loginForm.register("email")}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Type your password"
                    className="pl-10"
                    {...loginForm.register("password")}
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="link" 
                  className="text-xs" 
                  size="sm"
                  onClick={() => {
                    setForgotPassword(true);
                    resetForm.setValue("email", loginForm.getValues("email"));
                  }}
                >
                  Forgot password?
                </Button>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "LOGIN"}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    Or sign in using
                  </span>
                </div>
              </div>
              
              <SocialSignInButtons />
              
              <div className="text-center mt-6">
                <span className="text-sm text-muted-foreground">Don't have an account? </span>
                <Button 
                  variant="link" 
                  className="text-sm p-0" 
                  onClick={() => setIsLogin(false)}
                >
                  SIGN UP
                </Button>
              </div>
            </form>
          ) : (
            // Register Form
            <form
              onSubmit={registerForm.handleSubmit(handleFirebaseEmailRegister)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="register-name" className="text-sm font-medium">Name</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="register-name"
                    placeholder="Your full name"
                    className="pl-10"
                    {...registerForm.register("name")}
                  />
                </div>
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Your email address"
                    className="pl-10"
                    {...registerForm.register("email")}
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10"
                    {...registerForm.register("password")}
                  />
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "SIGN UP"}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    Or sign up using
                  </span>
                </div>
              </div>
              
              <SocialSignInButtons />
              
              <div className="text-center mt-6">
                <span className="text-sm text-muted-foreground">Already have an account? </span>
                <Button 
                  variant="link" 
                  className="text-sm p-0" 
                  onClick={() => setIsLogin(true)}
                >
                  LOGIN
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
