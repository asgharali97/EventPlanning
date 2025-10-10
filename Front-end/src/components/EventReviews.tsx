import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Star, Upload, X, ArrowLeft } from "lucide-react";
import {
  useReviews,
  useAddReview,
  useReviewEligibility,
} from "@/hooks/useReview";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
const EventReviews = ({
  eventId,
}: {
  eventId: string;
}) => {
  const { user } = useAuthStore();
  const [hoverRating, setHoverRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const {
    data: reviews = [],
    isLoading,
    error: reviewError,
  } = useReviews(eventId);
  const { mutate: addReview, isLoading: isSubmitting } = useAddReview();
  const { data: eligibility, isLoading: eligibilityLoading } =
    useReviewEligibility(eventId, user?._id);
  const navigate = useNavigate();

  if (reviewError) {
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
        alert(
          `You can only upload ${remainingSlots} more image(s). Maximum 4 images allowed.`
        );
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
          previewImages.forEach((url) => URL.revokeObjectURL(url));
          setPreviewImages([]);
        },
      }
    );
  };
  console.log(reviews.reviews);
  return (
    <>
      <div className="mt-6 sm:mt-8 border-b border-[var(--border)] -mx-4 sm:-mx-6 px-4 sm:px-8 pb-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h4 className="text-xl sm:text-2xl font-bold satoshi-bold">
            Reviews
          </h4>
          {/* <p className="text-[var(--secondary)] text-sm sm:text-base satoshi-regular">
            {reviews.reviews.length} review
            {reviews.reviews.length !== 1 ? "s" : ""} */}
          {/* </p> */}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : reviews.reviews.length === 0 ? (
          <p className="text-[var(--secondary)] text-center py-8 text-sm sm:text-base satoshi-regular">
            No reviews yet. Be the first to review this event!
          </p>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {reviews.reviews?.map((review) => (
              <div key={review._id} className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex gap-3 items-start flex-1">
                    <img
                      src={
                        review.userId?.avatar ||
                        "https://i.pravatar.cc/150?img=0"
                      }
                      alt={review.userId?.name || "User"}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-semibold text-[var(--foreground)] text-sm sm:text-base satoshi-medium">
                        {review.userId?.name || "Anonymous User"}
                      </h5>
                      <p className="text-xs sm:text-sm text-[var(--secondary)] satoshi-regular">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
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
                {review._id !==
                  reviews[reviews.length - 1]._id && (
                  <div className="border-t border-[var(--border)] pt-4 sm:pt-6" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 sm:mt-8 -mx-4 sm:-mx-6 px-4 sm:px-8 pb-6">
        <h4 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 satoshi-bold">
          Write a Review
        </h4>

        {!user ? (
          <Alert className="mb-4">
            <AlertDescription className="text-sm satoshi-regular">
              Please log in to write a review.
            </AlertDescription>
          </Alert>
        ) : eligibilityLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !eligibility?.canReview ? (
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
              {reviewImages.length && (
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
    </>
  );
};

export default EventReviews;