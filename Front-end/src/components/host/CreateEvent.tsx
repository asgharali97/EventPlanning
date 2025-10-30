import { DashboardLayout } from "./DashboardLayout";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateEvent,
  useUpdateEvent,
  useGetEeventByHostId,
} from "@/hooks/useHostEvent";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "./RichTextEditor";
import { Loader2 } from "lucide-react";
import {
  SectionCard,
  FormLabel,
  FormDescription,
  ErrorMessage,
  ImageUpload,
  PageHeader,
  TagsInput,
} from "./HostComponents";

interface EventFormData {
  title: string;
  description: string;
  price: number;
  seats: number;
  category: string;
  date: string;
  time: string;
  location: string;
  eventType: "physical" | "online";
  onlineLink?: string;
  onlinePlatform?: string;
  onlinePassword?: string;
  tags: string[];
}

interface FormErrors {
  [key: string]: string;
}

export default function CreateOrEditEvent() {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const isEditMode = !!eventId;

  const { mutate: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent();

  const { data: existingEvent, isLoading: isLoadingEvent } =
    useGetEeventByHostId(eventId);

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    price: 0,
    seats: 0,
    category: "tech",
    date: "",
    time: "",
    location: "",
    eventType: "physical",
    onlineLink: "",
    onlinePlatform: "",
    onlinePassword: "",
    tags: [],
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const formatedTime = (time: string) => {
    const [hours, minutes] = time?.split(":").map(Number);
    const hour12 = hours % 12;
    return `${hour12.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isEditMode && existingEvent && !isLoadingEvent) {
      setFormData({
        title: existingEvent.title || "",
        description: existingEvent.description || "",
        price: existingEvent.price || 0,
        seats: existingEvent.seats || 0,
        category: existingEvent.category || "tech",
        date: existingEvent.date
          ? new Date(existingEvent.date).toISOString().split("T")[0]
          : "",
        time: formatedTime(existingEvent.time) || "",
        location: existingEvent.location || "",
        eventType: existingEvent.eventType || "physical",
        onlineLink: existingEvent.onlineDetails?.link || "",
        onlinePlatform: existingEvent.onlineDetails?.platform || "",
        onlinePassword: existingEvent.onlineDetails?.password || "",
        tags: existingEvent.tags || [],
      });

      if (existingEvent.coverImage) {
        setImagePreview(existingEvent.coverImage);
      }
    }
  }, [isEditMode, existingEvent]);

  const handleChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setCoverImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (errors.coverImage) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.coverImage;
        return newErrors;
      });
    }
  };

  const handleImageRemove = () => {
    setCoverImage(null);
    setImagePreview(null);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title || formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.description || formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!isEditMode && !coverImage) {
      newErrors.coverImage = "Cover image is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const eventDate = new Date(formData.date);
      if (eventDate < new Date()) {
        newErrors.date = "Event date must be in the future";
      }
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    if (!formData.location || formData.location.length < 3) {
      newErrors.location = "Location is required";
    }

    if (formData.price < 0) {
      newErrors.price = "Price must be positive";
    }

    if (formData.seats < 1) {
      newErrors.seats = "Must have at least 1 seat";
    }

    if (formData.eventType === "online" && !formData.onlineLink) {
      newErrors.onlineLink = "Meeting link is required for online events";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const submitData = new FormData();

    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("price", formData.price.toString());
    submitData.append("seats", formData.seats.toString());
    submitData.append("category", formData.category);
    submitData.append("date", formData.date);
    submitData.append("time", formData.time);
    submitData.append("location", formData.location);
    submitData.append("eventType", formData.eventType);
    if (formData.tags && formData.tags.length > 0) {
      formData.tags.forEach((tag) => {
        submitData.append("tags[]", tag);
      });
    }

    if (coverImage) {
      submitData.append("coverImage", coverImage);
    }
    if (formData.eventType === "online" && formData.onlineLink) {
      submitData.append("onlineDetails[link]", formData.onlineLink);
      if (formData.onlinePlatform) {
        submitData.append("onlineDetails[platform]", formData.onlinePlatform);
      }
      if (formData.onlinePassword) {
        submitData.append("onlineDetails[password]", formData.onlinePassword);
      }
    }

    if (isEditMode && eventId) {
      updateEvent(
        { eventId, formData: submitData },
        {
          onSuccess: () => {
            toast.success("Event updated successfully!");
            navigate("/host/events");
          },
          onError: (error: any) => {
            toast.error("Failed to update event", {
              description:
                error.response?.data?.message || "Something went wrong",
            });
          },
        }
      );
    } else {
      createEvent(submitData, {
        onSuccess: () => {
          toast.success("Event created successfully!", {
            description: "Your event is now live and visible to users.",
          });
          navigate("/host/events");
        },
        onError: (error: any) => {
          toast.error("Failed to create event", {
            description:
              error.response?.data?.message || "Something went wrong",
          });
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;

  if (isEditMode && isLoadingEvent) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster position="top-right" richColors closeButton />

      <PageHeader
        title={isEditMode ? "Edit Event" : "Create New Event"}
        description={
          isEditMode
            ? "Update your event details"
            : "Fill in the details below to create your event"
        }
        onBack={() => navigate("/host/events")}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        <SectionCard title="Basic Information">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-[85%]">
                <FormLabel required>Event Title</FormLabel>
                <Input
                  placeholder="e.g., Tech Conference 2024"
                  className="satoshi-regular bg-[var(--background)]"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
                <ErrorMessage message={errors.title} />
              </div>
              <div>
                <FormLabel required>Category</FormLabel>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className="satoshi-regular bg-[var(--background)] border border-[var(--border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage message={errors.category} />
              </div>
            </div>

            <div>
              <FormLabel required>Description</FormLabel>
              <RichTextEditor
                content={formData.description}
                onChange={(html) => handleChange("description", html)}
                placeholder="Describe your event in detail..."
              />
              <FormDescription>
                Use the toolbar to format your text with headings, lists, and
                links
              </FormDescription>
              <ErrorMessage message={errors.description} />
            </div>

            <div>
              <FormLabel required={!isEditMode}>Cover Image</FormLabel>
              <ImageUpload
                preview={imagePreview}
                onFileSelect={handleImageSelect}
                onRemove={handleImageRemove}
                error={errors.coverImage}
              />
              {isEditMode && !coverImage && (
                <FormDescription>
                  Leave empty to keep the current image
                </FormDescription>
              )}
            </div>

            <div>
              <FormLabel>Tags (optional)</FormLabel>
              <TagsInput
                tags={formData.tags}
                onChange={(tags) => handleChange("tags", tags)}
                placeholder="Add tags like 'networking', 'workshop', etc..."
              />
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Date & Location">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FormLabel required>Date</FormLabel>
              <Input
                type="date"
                className="satoshi-regular bg-[var(--background)]"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
              <ErrorMessage message={errors.date} />
            </div>
            <div>
              <FormLabel required>Time</FormLabel>
              <Input
                type="time"
                className="satoshi-regular bg-[var(--background)]"
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
              />
              <ErrorMessage message={errors.time} />
            </div>
            <div className="md:col-span-2">
              <FormLabel required>Event Type</FormLabel>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="physical"
                    checked={formData.eventType === "physical"}
                    onChange={() => handleChange("eventType", "physical")}
                    className="w-4 h-4"
                  />
                  <span className="satoshi-regular text-sm">
                    Physical Event
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="online"
                    checked={formData.eventType === "online"}
                    onChange={() => handleChange("eventType", "online")}
                    className="w-4 h-4"
                  />
                  <span className="satoshi-regular text-sm">Online Event</span>
                </label>
              </div>
              <ErrorMessage message={errors.eventType} />
            </div>
            {formData.eventType === "physical" && (
              <div className="md:col-span-2">
                <FormLabel required>Venue Address</FormLabel>
                <Input
                  placeholder="e.g., 123 Main St, City, State"
                  className="satoshi-regular bg-[var(--background)]"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
                <ErrorMessage message={errors.location} />
              </div>
            )}

            {formData.eventType === "online" && (
              <>
                <div className="md:col-span-2">
                  <FormLabel required>Meeting Link</FormLabel>
                  <Input
                    type="url"
                    placeholder="https://zoom.us/j/..."
                    className="satoshi-regular bg-[var(--background)]"
                    value={formData.onlineLink}
                    onChange={(e) => handleChange("onlineLink", e.target.value)}
                  />
                  <ErrorMessage message={errors.onlineLink} />
                </div>
                <div>
                  <FormLabel>Platform</FormLabel>
                  <Input
                    placeholder="e.g., Zoom, Google Meet"
                    className="satoshi-regular bg-[var(--background)]"
                    value={formData.onlinePlatform}
                    onChange={(e) =>
                      handleChange("onlinePlatform", e.target.value)
                    }
                  />
                </div>
                <div>
                  <FormLabel>Meeting Password (optional)</FormLabel>
                  <Input
                    type="text"
                    placeholder="Meeting password"
                    className="satoshi-regular bg-[var(--background)]"
                    value={formData.onlinePassword}
                    onChange={(e) =>
                      handleChange("onlinePassword", e.target.value)
                    }
                  />
                </div>
              </>
            )}
          </div>
        </SectionCard>
        <SectionCard title="Pricing & Capacity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FormLabel required>Ticket Price ($)</FormLabel>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="satoshi-regular bg-[var(--background)]"
                value={formData.price}
                onChange={(e) =>
                  handleChange("price", parseFloat(e.target.value) || 0)
                }
              />
              <FormDescription>Set to 0 for free events</FormDescription>
              <ErrorMessage message={errors.price} />
            </div>
            <div>
              <FormLabel required>Available Seats</FormLabel>
              <Input
                type="number"
                min="1"
                placeholder="50"
                className="satoshi-regular bg-[var(--background)]"
                value={formData.seats}
                onChange={(e) =>
                  handleChange("seats", parseInt(e.target.value) || 1)
                }
              />
              <FormDescription>Maximum number of attendees</FormDescription>
              <ErrorMessage message={errors.seats} />
            </div>
          </div>
        </SectionCard>
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/host/events")}
            disabled={isPending}
            className="satoshi-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="satoshi-medium cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : isEditMode ? (
              "Update Event"
            ) : (
              "Create Event"
            )}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
