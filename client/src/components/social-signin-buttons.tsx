import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { signInWithGoogle, checkRedirectResult, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { FirebaseError } from "firebase/app";
import { User as FirebaseUser } from "firebase/auth";

interface FirebaseAuthError {
  code: string;
  message: string;
}

export function SocialSignInButtons() {
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Check for redirect result and handle any auth state changes
  useEffect(() => {
    const checkForRedirect = async () => {
      try {
        console.log("Checking for redirect result");
        const user = await checkRedirectResult();
        
        if (user) {
          setIsGoogleLoading(true);
          console.log("Got user from redirect result, getting token");
          await handleFirebaseUser(user);
        } else {
          console.log("No redirect result found");
        }
      } catch (error) {
        console.error("Redirect error:", error);
        
        // Display error if needed
        if (error instanceof Error) {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } finally {
        setIsGoogleLoading(false);
      }
    };
    
    // Also monitor auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user: FirebaseUser | null) => {
      if (user) {
        console.log("User detected from auth state change");
        try {
          setIsGoogleLoading(true);
          await handleFirebaseUser(user);
        } catch (error) {
          console.error("Auth state change error:", error);
        } finally {
          setIsGoogleLoading(false);
        }
      }
    });
    
    checkForRedirect();
    
    // Clean up auth listener
    return () => unsubscribe();
  }, [toast]);
  
  // Helper function to handle Firebase user authentication with backend
  const handleFirebaseUser = async (user: FirebaseUser) => {
    try {
      // Send the Firebase token to our backend to create/login user
      const idToken = await user.getIdToken();
      console.log("Got token, sending to server");
      
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
      
      // Reload the page to reflect login state
      window.location.href = "/";
    } catch (tokenError) {
      console.error("Error processing token:", tokenError);
      throw tokenError;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      
      try {
        // This will redirect the page to Google sign-in
        await signInWithGoogle();
        
        // The code below won't execute due to the redirect
        // When redirect completes, the useEffect above will handle the result
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
        } else if (firebaseError && firebaseError.code === "auth/unauthorized-domain") {
          toast({
            title: "Domain Not Authorized",
            description: `Add ${window.location.hostname} to Firebase authorized domains.`,
            variant: "destructive",
            duration: 7000,
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

  return (
    <div className="flex flex-col gap-3 w-full">
      <Button
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="flex items-center justify-center gap-2 w-full"
      >
        {isGoogleLoading ? (
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <FaGoogle className="h-4 w-4 text-red-500" />
        )}
        Continue with Google
      </Button>
    </div>
  );
}