import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function NavBar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-primary">
          Beauty AI
        </Link>
      </div>
    </nav>
  );
}