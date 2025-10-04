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

const mockReviews = [
  {
    id: "1",
    userName: "Sarah Johnson",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    comment:
      "Amazing event! The organization was top-notch and I learned so much. Highly recommend!",
    images: ["https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400"],
    createdAt: "2 days ago",
  },
  {
    id: "2",
    userName: "Mike Chen",
    userAvatar: "https://i.pravatar.cc/150?img=12",
    rating: 4,
    comment:
      "Great experience overall. The venue was perfect and the host was very knowledgeable.",
    images: [],
    createdAt: "5 days ago",
  },
  {
    id: "3",
    userName: "Emma Davis",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    comment:
      "Absolutely loved it! Met amazing people and had a fantastic time. Will definitely attend again.",
    images: [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
    ],
    createdAt: "1 week ago",
  },
];

const EventDetail = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEventById(eventId);
  const hostId = event?.hostId;
  const { data:host, isLoading:hostLoading, error:hostError } = useUserById(hostId)
  console.log(host)
  const { setBookingDialog } = useUIStore();

  if (isLoading && hostLoading) {
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

  if (error && hostError) {
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
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setReviewImages([...reviewImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index));
  };

  const handleSubmitReview = () => {
    console.log({
      rating,
      reviewText,
      images: reviewImages,
    });

    setRating(0);
    setReviewText("");
    setReviewImages([]);
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
            <Button className="cursor-pointer">Book Now</Button>
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

          {/* Location and Seats */}
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
                {mockReviews.length} reviews
              </p>
            </div>
            <div className="space-y-6">
              {mockReviews.map((review) => (
                <div key={review.id} className="space-y-3">
                  {/* User Info and Rating */}
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 items-start">
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h5 className="font-semibold text-[var(--foreground)]">
                          {review.userName}
                        </h5>
                        <p className="text-sm text-[var(--secondary)]">
                          {review.createdAt}
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
                    {review.comment}
                  </p>

                  {review.images.length > 0 && (
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

                  {review.id !== mockReviews[mockReviews.length - 1].id && (
                    <div className="border-t border-[var(--border)] pt-6" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 -mx-6 px-8 pb-6">
            <h4 className="text-2xl font-bold mb-6">Write a Review</h4>

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
                Add Photos (Optional)
              </p>

              {reviewImages.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {reviewImages.map((image, index) => (
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

              <label className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--accent)] transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm satoshi-regular">Upload Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <Button
              onClick={handleSubmitReview}
              disabled={!rating || !reviewText.trim()}
              className="w-full satoshi-medium"
            >
              Submit Review
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetail;
