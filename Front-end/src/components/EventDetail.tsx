import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Upload, X, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEventById } from "@/hooks/useEvent";
import { useUIStore } from "@/store/uiStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserById } from "@/hooks/useUser";
import BookEvent from "./BookEvent";
import { useReviews, useAddReview, useReviewEligibility } from "@/hooks/useReview";
import { useAuthStore } from "@/store/authStore";

const EventDetail = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: event, isLoading, error } = useEventById(eventId);
  const { data: reviews = [], isLoading: reviewsLoading, error: reviewError } = useReviews(eventId);
  const { mutate: addReview, isLoading: isSubmitting } = useAddReview();
  const { data: eligibility, isLoading: eligibilityLoading } = useReviewEligibility(eventId, user.data?._id);
  const hostId = event?.hostId;
  const { isBookingDialogOpen, setBookingDialog } = useUIStore();
  const {
    data: host,
    isLoading: hostLoading,
    error: hostError,
  } = useUserById(hostId);
  const [selectedEvent, setSelectedEvent] = useState(null);
 
  if (isLoading || hostLoading || reviewsLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="w-full aspect-video rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || hostError || reviewError) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load event details"}
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => navigate("/events")}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <Alert>
          <AlertDescription>Event not found</AlertDescription>
        </Alert>
        <Button
          onClick={() => navigate("/events")}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      
      const remainingSlots = 4 - reviewImages.length;
      const filesToAdd = filesArray.slice(0, remainingSlots);
      
      if (filesArray.length > remainingSlots) {
        alert(`You can only upload ${remainingSlots} more image(s). Maximum 4 images allowed.`);
      }
      
      setReviewImages([...reviewImages, ...filesToAdd]);
      
      const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewImages[index]);
    setReviewImages(reviewImages.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const handleSubmitReview = () => {
    if (!rating || !reviewText.trim()) {
      return;
    }

    addReview(
      {
        eventId: eventId!,
        review: reviewText,
        rating,
        images: reviewImages,
      },
      {
        onSuccess: () => {
          setRating(0);
          setReviewText("");
          setReviewImages([]);
          previewImages.forEach(url => URL.revokeObjectURL(url));
          setPreviewImages([]);
        },
      }
    );
  };

  const handleBookClick = (event) => {
    setSelectedEvent(event);
    setBookingDialog(true);
  };

  return (
    <>
     <div className="container mx-auto max-w-4xl min-h-screen pb-4 border-r border-l border-[var(--border)] satoshi-medium text-[var(--foreground)]">
  <img
    src={event.coverImage}
    className="w-full h-48 sm:h-64 md:h-80 lg:h-[400px] object-cover"
    alt={event.title}
  />
  
  <div className="py-4 sm:py-6 md:py-8 px-4 sm:px-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
      <h1 className="satoshi-bold text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--foreground)] flex-1">
        {event.title}
      </h1>
      <Button
        className="cursor-pointer shadow-[var(--shadow-m)] w-full sm:w-auto satoshi-medium"
        onClick={() => handleBookClick(event)}
      >
        Book Now
      </Button>
    </div>

    <Badge
      variant={"secondary"}
      className="my-2 bg-[var(--foreground)] text-[var(--popover)] text-xs sm:text-sm py-1 px-2 sm:px-3 shadow-[var(--shadow-s)]"
    >
      {event.category || "General"}
    </Badge>
    <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4 items-center border-t border-b border-[var(--border)] -mx-4 sm:-mx-6 px-4 sm:px-8 py-3 sm:py-4">
      <img
        src={host?.avatar}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
        alt="Host avatar"
      />
      <h3 className="text-sm sm:text-base satoshi-medium">By {host?.name}</h3>
    </div>

    <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div>
        <h4 className="text-lg sm:text-xl font-bold satoshi-bold">Location</h4>
        <p className="text-[var(--secondary)] text-sm sm:text-base mt-2 satoshi-regular">
          {event.location}
        </p>
      </div>
      <div>
        <h4 className="text-lg sm:text-xl font-bold satoshi-bold">Available Seats</h4>
        <p className="text-[var(--secondary)] text-sm sm:text-base mt-2 satoshi-regular">
          {event.seats}
        </p>
      </div>
    </div>
    <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border-b border-[var(--border)] -mx-4 sm:-mx-6 px-4 sm:px-8 pb-4 sm:pb-6">
      <div>
        <h4 className="text-lg sm:text-xl font-bold satoshi-bold">Date</h4>
        <p className="text-[var(--secondary)] text-sm sm:text-base mt-2 satoshi-regular">
          {event.date.toString().split("T")[0]} at{" "}
          {event.date.toString().split("T")[1].split(".")[0]}
        </p>
      </div>
      <div>
        <h4 className="text-lg sm:text-xl font-bold satoshi-bold">Price</h4>
        <p className="text-[var(--secondary)] text-sm sm:text-base mt-2 satoshi-regular">
          ${event.price}
        </p>
      </div>
    </div>
f
    <div className="mt-6 sm:mt-8 border-b border-[var(--border)] -mx-4 sm:-mx-6 px-4 sm:px-8 pb-6">
      <h4 className="text-xl sm:text-2xl font-bold satoshi-bold mb-3 sm:mb-4">About This Event</h4>
      <p className="text-sm sm:text-base lg:text-lg text-[var(--secondary)] leading-relaxed satoshi-regular">
        {event.description || "No description available."}
      </p>
    </div>f
    <div className="flex gap-2 flex-wrap border-b border-[var(--border)] -mx-4 sm:-mx-6 px-4 sm:px-8 py-4 sm:py-6">
      {event.tags &&
        event.tags.map((tag) => (
          <Badge
            key={tag}
            variant={"secondary"}
            className="bg-[var(--foreground)] text-[var(--popover)] text-xs sm:text-sm"
          >
            {tag}
          </Badge>
        ))}
    </div>

    <div className="mt-6 sm:mt-8 border-b border-[var(--border)] -mx-4 sm:-mx-6 px-4 sm:px-8 pb-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h4 className="text-xl sm:text-2xl font-bold satoshi-bold">Reviews</h4>
        <p className="text-[var(--secondary)] text-sm sm:text-base satoshi-regular">
          {reviews.reviews.length} review{reviews.reviews.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {reviewsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-[var(--secondary)] text-center py-8 text-sm sm:text-base satoshi-regular">
          No reviews yet. Be the first to review this event!
        </p>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {reviews.reviews.map((review) => (
            <div key={review._id} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex gap-3 items-start flex-1">
                  <img
                    src={review.userId?.avatar || "https://i.pravatar.cc/150?img=0"}
                    alt={review.userId?.name || "User"}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="font-semibold text-[var(--foreground)] text-sm sm:text-base satoshi-medium">
                      {review.userId?.name || "Anonymous User"}
                    </h5>
                    <p className="text-xs sm:text-sm text-[var(--secondary)] satoshi-regular">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-[var(--border)]"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[var(--foreground)] leading-relaxed text-sm sm:text-base satoshi-regular">
                {review.review}
              </p>
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-[var(--border)] flex-shrink-0"
                    />
                  ))}
                </div>
              )}
              {review._id !== reviews.reviews[reviews.reviews.length - 1]._id && (
                <div className="border-t border-[var(--border)] pt-4 sm:pt-6" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Write Review Section */}
    <div className="mt-6 sm:mt-8 -mx-4 sm:-mx-6 px-4 sm:px-8 pb-6">
      <h4 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 satoshi-bold">Write a Review</h4>
      
      {!user ? (
        <Alert className="mb-4">
          <AlertDescription className="text-sm satoshi-regular">
            Please log in to write a review.
          </AlertDescription>
        </Alert>
      ) :
      eligibilityLoading ? (
        <Skeleton className="h-32 w-full" />
      ) :
      !eligibility?.canReview ? (
        <Alert className="mb-4">
          <AlertDescription className="text-sm satoshi-regular">
            {eligibility?.reason || "You are not able to review this event"}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="mb-4 sm:mb-6">
            <p className="text-sm text-[var(--secondary)] mb-2 satoshi-regular">
              Your Rating
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-6 h-6 sm:w-8 sm:h-8 cursor-pointer transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-[var(--border)]"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4 sm:mb-6">
            <p className="text-sm text-[var(--secondary)] mb-2 satoshi-regular">
              Your Review
            </p>
            <Textarea
              placeholder="Share your experience with this event..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-[120px] resize-none border-[var(--border)] satoshi-regular text-sm sm:text-base"
            />
          </div>
          <div className="mb-4 sm:mb-6">
            <p className="text-sm text-[var(--secondary)] mb-2 satoshi-regular">
              Add Photos (Optional) - Max 4 images
            </p>
            {previewImages.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {previewImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-[var(--border)]"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-[var(--foreground)] text-[var(--background)] rounded-full p-1 hover:bg-[var(--secondary)] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {reviewImages.length < 4 && (
              <label className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--accent)] transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-xs sm:text-sm satoshi-regular">
                  Upload Photos ({reviewImages.length}/4)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <Button
            onClick={handleSubmitReview}
            disabled={!rating || !reviewText.trim() || isSubmitting}
            className="w-full satoshi-medium cursor-pointer text-sm sm:text-base"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </>
      )}
    </div>
  </div>
</div>

<BookEvent
  isOpen={isBookingDialogOpen}
  onClose={() => setBookingDialog(false)}
  event={selectedEvent}
/>
    </>
  );
};

export default EventDetail;