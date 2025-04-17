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
import { User, Lock } from "lucide-react";

const loginSchema = insertUserSchema.pick({ email: true }).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

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

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              {isLogin ? "Login" : "Sign Up"}
            </h1>
          </div>

          {isLogin ? (
            // Login Form
            <form
              onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium">Username</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-4 w-4 text-muted-foreground" />
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
                <Button variant="link" className="text-xs" size="sm">
                  Forgot password?
                </Button>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "LOGIN"}
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
              onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="register-name" className="text-sm font-medium">Name</Label>
                <Input
                  id="register-name"
                  placeholder="Your full name"
                  {...registerForm.register("name")}
                />
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-sm font-medium">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Your email address"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Create a password"
                  {...registerForm.register("password")}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating Account..." : "SIGN UP"}
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
