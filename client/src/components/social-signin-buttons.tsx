import { Button } from "@/components/ui/button";
import { FaGoogle, FaApple } from "react-icons/fa";
import { signInWithGoogle, signInWithApple } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

export function SocialSignInButtons() {
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const user = await signInWithGoogle();
      
      // Send the Firebase token to our backend to create/login user
      const idToken = await user.getIdToken();
      const response = await apiRequest("POST", "/api/auth/firebase", { 
        idToken,
        provider: "google" 
      });
      
      if (!response.ok) {
        throw new Error("Failed to authenticate with server");
      }
      
      const userData = await response.json();
      queryClient.setQueryData(["/api/user"], userData);
      
      toast({
        title: "Signed in successfully",
        description: `Welcome${userData.name ? ', ' + userData.name : ''}!`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsAppleLoading(true);
      const user = await signInWithApple();
      
      // Send the Firebase token to our backend to create/login user
      const idToken = await user.getIdToken();
      const response = await apiRequest("POST", "/api/auth/firebase", { 
        idToken,
        provider: "apple" 
      });
      
      if (!response.ok) {
        throw new Error("Failed to authenticate with server");
      }
      
      const userData = await response.json();
      queryClient.setQueryData(["/api/user"], userData);
      
      toast({
        title: "Signed in successfully",
        description: `Welcome${userData.name ? ', ' + userData.name : ''}!`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <Button
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isAppleLoading}
        className="flex items-center justify-center gap-2 w-full"
      >
        {isGoogleLoading ? (
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <FaGoogle className="h-4 w-4 text-red-500" />
        )}
        Continue with Google
      </Button>
      
      <Button
        variant="outline"
        onClick={handleAppleSignIn}
        disabled={isAppleLoading || isGoogleLoading}
        className="flex items-center justify-center gap-2 w-full"
      >
        {isAppleLoading ? (
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <FaApple className="h-4 w-4" />
        )}
        Continue with Apple
      </Button>
    </div>
  );
}