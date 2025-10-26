import { useNavigate } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="clash-bold text-[120px] md:text-[180px] leading-none text-[var(--foreground)] opacity-10">
            404
          </h1>
        </div>
        <h2 className="clash-bold text-3xl md:text-4xl text-[var(--foreground)] mb-4 tracking-wide">
          Page Not Found
        </h2>
        <p className="satoshi-regular text-base md:text-lg text-[var(--muted-foreground)] mb-8 leading-relaxed max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been
          moved or deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full sm:w-auto satoshi-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto satoshi-medium cursor-pointer"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <p className="satoshi-medium text-sm text-[var(--foreground)] mb-4">
            Popular Pages
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate("/events")}
              className="px-4 py-2 text-sm satoshi-regular text-[var(--muted-foreground)] 
                       hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg 
                       transition-all duration-200 cursor-pointer"
            >
              Browse Events
            </button>
            <button
              onClick={() => navigate("/my-bookings")}
              className="px-4 py-2 text-sm satoshi-regular text-[var(--muted-foreground)] 
            hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg 
            ransition-all duration-200 cursor-pointer"
            >
              My Bookings
            </button>
            <button
              onClick={() => navigate("/host")}
              className="px-4 py-2 text-sm satoshi-regular text-[var(--muted-foreground)] 
                       hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg 
                       transition-all duration-200 cursor-pointer"
            >
              Become a Host
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
