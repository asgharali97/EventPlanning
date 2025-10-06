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
  console.log(reviews)
  const { mutate: addReview, isLoading: isSubmitting } = useAddReview();
  const { data: eligibility, isLoading: eligibilityLoading } = useReviewEligibility(eventId, user.data?._id);
  console.log(eligibility)
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
      <div className="container mx-auto max-w-4xl min-h-screen pb-4 border-r border-l border-[var(--border)] satoshi-mdedium text-[var(--foreground)]">
        <img
          src={event.coverImage}
          className="w-full h-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] object-cover"
          alt={event.title}
        />

        <div className="py-8 px-6">
          <div className="flex items-center justify-between">
            <h1 className="satoshi-bold text-3xl font-bold text-[var(--foreground)]">
              {event.title}
            </h1>
            <Button
              className="cursor-pointer"
              onClick={() => handleBookClick(event)}
            >
              Book Now
            </Button>
          </div>
          <Badge
            variant={"secondary"}
            className="my-2 bg-[var(--foreground)] text-[var(--popover)] text-sm lg:text-md lg:py-1 lg:px-3 rounded-md"
          >
            {event.category || "General"}
          </Badge>

          <div className="mt-8 flex gap-4 items-center border-t border-b border-[var(--border)] -mx-6 px-8 py-2">
            <img
              src={host?.avatar}
              className="w-8 h-8 md:h-12 md:w-12 rounded-full"
              alt="Host avatar"
            />
            <h3>By {host?.name}</h3>
          </div>

          <div className="mt-8 flex gap-4 items-center justify-between">
            <div>
              <h4 className="text-xl font-bold">Location</h4>
              <p className="text-[var(--secondary)] text-md mt-2">
                {event.location}
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold">Available Seats</h4>
              <p className="text-[var(--secondary)] text-md mt-2">
                {event.seats}
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-4 items-center justify-between border-b border-[var(--border)] -mx-6 px-8 pb-2">
            <div>
              <h4 className="text-xl font-bold">Date</h4>
              <p className="text-[var(--secondary)] text-md mt-2">
                {event.date.toString().split("T")[0]} at{" "}
                {event.date.toString().split("T")[1].split(".")[0]}
              </p>
            </div>
            <div className="mr-20">
              <h4 className="text-xl font-bold">Price</h4>
              <p className="text-[var(--secondary)] text-md mt-2">
                ${event.price}
              </p>
            </div>
          </div>

          <div className="mt-8 border-b border-[var(--border)] -mx-6 px-8">
            <h4 className="text-2xl font-bold">About This Event</h4>
            <p className="my-4 text-lg text-[var(--secondary)]">
              {event.description || "No description available."}
            </p>
          </div>

          <div className="flex gap-4 border-b border-[var(--border)] -mx-6 px-8 py-6">
            {event.tags &&
              event.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={"secondary"}
                  className="bg-[var(--foreground)] text-[var(--popover)]"
                >
                  {tag}
                </Badge>
              ))}
          </div>

          <div className="mt-8 border-b border-[var(--border)] -mx-6 px-8 pb-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-bold">Reviews</h4>
              <p className="text-[var(--secondary)]">
                {reviews.reviews.length} review{reviews.reviews.length !== 1 ? 's' : ''}
              </p>
            </div>

            {reviewsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-[var(--secondary)] text-center py-8">
                No reviews yet. Be the first to review this event!
              </p>
            ) : (
              <div className="space-y-6">
                {reviews.reviews.map((review) => (
                  <div key={review._id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 items-start">
                        <img
                          src={review.userId?.avatar || "https://i.pravatar.cc/150?img=0"}
                          alt={review.userId?.name || "User"}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h5 className="font-semibold text-[var(--foreground)]">
                            {review.userId?.name || "Anonymous User"}
                          </h5>
                          <p className="text-sm text-[var(--secondary)]">
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

                    <p className="text-[var(--foreground)] leading-relaxed">
                      {review.review}
                    </p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border border-[var(--border)]"
                          />
                        ))}
                      </div>
                    )}

                    {review._id !== reviews.reviews[reviews.reviews.length - 1]._id && (
                      <div className="border-t border-[var(--border)] pt-6" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 -mx-6 px-8 pb-6">
            <h4 className="text-2xl font-bold mb-6">Write a Review</h4>
            {!user ? (
              <Alert className="mb-4">
                <AlertDescription>
                  Please log in to write a review.
                </AlertDescription>
              </Alert>
            ) :
            eligibilityLoading ? (
              <Skeleton className="h-32 w-full" />
            ) :
            !eligibility?.canReview ? (
              <Alert className="mb-4">
                <AlertDescription>
                  {eligibility?.reason || "You are not able review this event"}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-[var(--secondary)] mb-2">
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
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 cursor-pointer transition-colors ${
                            star <= (hoverRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-[var(--border)]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-[var(--secondary)] mb-2">
                    Your Review
                  </p>
                  <Textarea
                    placeholder="Share your experience with this event..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="min-h-[120px] resize-none border-[var(--border)] satoshi-regular"
                  />
                </div>

                <div className="mb-4">
                  <p className="text-sm text-[var(--secondary)] mb-2">
                    Add Photos (Optional) - Max 4 images
                  </p>

                  {previewImages.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {previewImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-[var(--border)]"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-[var(--foreground)] text-[var(--background)] rounded-full p-1 hover:bg-[var(--secondary)]"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {reviewImages.length < 4 && (
                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--accent)] transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm satoshi-regular">
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
                  className="w-full satoshi-medium cursor-pointer"
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