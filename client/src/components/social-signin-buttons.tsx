import { Button } from "@/components/ui/button";
import { FaGoogle, FaApple } from "react-icons/fa";
import { signInWithGoogle, signInWithApple } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { FirebaseError } from "firebase/app";

interface FirebaseAuthError {
  code: string;
  message: string;
}

export function SocialSignInButtons() {
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      
      try {
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
      } catch (error: unknown) {
        console.error(error);
        
        // Show specific configuration error and instructions
        const firebaseError = error as FirebaseError;
        if (firebaseError && firebaseError.code === "auth/configuration-not-found") {
          toast({
            title: "Firebase Configuration Required",
            description: "You need to enable Google sign-in in your Firebase console.",
            variant: "destructive",
            duration: 5000,
          });
        } else {
          throw error; // Rethrow for the outer catch
        }
      }
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
      
      try {
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
      } catch (error: unknown) {
        console.error(error);
        
        // Show specific configuration error and instructions
        const firebaseError = error as FirebaseError;
        if (firebaseError && firebaseError.code === "auth/configuration-not-found") {
          toast({
            title: "Firebase Configuration Required",
            description: "You need to enable Apple sign-in in your Firebase console.",
            variant: "destructive",
            duration: 5000,
          });
        } else {
          throw error; // Rethrow for the outer catch
        }
      }
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
      
      <div className="text-xs text-center text-muted-foreground mt-2">
        <p>Note: To use social login, you need to configure the Firebase Authentication settings.</p>
      </div>
    </div>
  );
}