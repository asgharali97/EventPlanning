import { DashboardLayout } from "./DashboardLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateEvent } from "@/hooks/useHostEvent";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "./RichTextEditor";
import { Upload, X, Loader2, ArrowLeft } from "lucide-react";
import axios from "@/lib/axios";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0, "Price must be positive"),
  seats: z.coerce.number().min(1, "Must have at least 1 seat"),
  category: z.enum(["tech", "sports", "arts", "music", "food", "health", "other"]),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(3, "Location is required"),
  coverImage: z.string().url("Cover image is required"),
  eventType: z.enum(["physical", "online"]),
  onlineLink: z.string().optional(),
  onlinePlatform: z.string().optional(),
  onlinePassword: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEvent() {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      seats: 50,
      category: "tech",
      date: "",
      time: "",
      location: "",
      coverImage: "",
      eventType: "physical",
      onlineLink: "",
      onlinePlatform: "",
      onlinePassword: "",
    },
  });

  const isOnline = form.watch("eventType") === "online";

  const { mutate: createEvent, isPending } = useCreateEvent();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);

    // try {
    //   const formData = new FormData();
    //   formData.append("image", file);

    //   const response = await axios.post("/upload", formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   });

    //   const imageUrl = response.data?.data?.url || response.data?.url;
      
    //   form.setValue("coverImage", imageUrl);
    //   setImagePreview(imageUrl);
      
    //   toast.success("Image uploaded successfully");
    // } catch (error: any) {
    //   toast.error("Failed to upload image", {
    //     description: error.response?.data?.message || "Try again",
    //   });
    // } finally {
    //   setIsUploadingImage(false);
    // }
  };

  const handleRemoveImage = () => {
    form.setValue("coverImage", "");
    setImagePreview("");
  };

  const onSubmit = (data: EventFormData) => {
    // Validate date is in future
    const eventDate = new Date(data.date);
    if (eventDate < new Date()) {
      toast.error("Event date must be in the future");
      return;
    }

    const payload: any = {
      title: data.title,
      description: data.description,
      price: data.price,
      seats: data.seats,
      category: data.category,
      date: data.date,
      time: data.time,
      location: data.location,
      coverImage: data.coverImage,
      eventType: data.eventType,
    };

    if (data.eventType === "online" && data.onlineLink) {
      payload.onlineDetails = {
        link: data.onlineLink,
        platform: data.onlinePlatform,
        password: data.onlinePassword,
      };
    }

    createEvent(payload, {
      onSuccess: () => {
        toast.success("Event created successfully!", {
          description: "Your event is now live and visible to users.",
        });
        navigate("/host/events");
      },
      onError: (error: any) => {
        toast.error("Failed to create event", {
          description: error.response?.data?.message || "Something went wrong",
        });
      },
    });
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" richColors closeButton />
      
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/host/events")}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
        <h1 className="clash-bold text-3xl md:text-4xl text-[var(--foreground)] mb-2">
          Create New Event
        </h1>
        <p className="satoshi-regular text-base text-[var(--muted-foreground)]">
          Fill in the details below to create your event
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="satoshi-bold text-xl text-[var(--foreground)] mb-6">
              Basic Information
            </h2>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="satoshi-medium">Event Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Tech Conference 2024"
                        className="satoshi-regular"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="satoshi-medium">Description *</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                        placeholder="Describe your event in detail..."
                      />
                    </FormControl>
                    <FormDescription className="satoshi-regular">
                      Use the toolbar to format your text with headings, lists, and links
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="satoshi-medium">Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="satoshi-regular">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="satoshi-medium">Cover Image *</FormLabel>
                    <FormControl>
                      <div>
                        {!imagePreview ? (
                          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {isUploadingImage ? (
                                <>
                                  <Loader2 className="w-10 h-10 text-[var(--muted-foreground)] animate-spin mb-3" />
                                  <p className="satoshi-medium text-sm text-[var(--muted-foreground)]">
                                    Uploading...
                                  </p>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-10 h-10 text-[var(--muted-foreground)] mb-3" />
                                  <p className="satoshi-medium text-sm text-[var(--foreground)] mb-1">
                                    Click to upload cover image
                                  </p>
                                  <p className="satoshi-regular text-xs text-[var(--muted-foreground)]">
                                    PNG, JPG up to 5MB
                                  </p>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={isUploadingImage}
                            />
                          </label>
                        ) : (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={handleRemoveImage}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="satoshi-bold text-xl text-[var(--foreground)] mb-6">
              Date & Location
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="satoshi-medium">Date *</FormLabel>
                    <FormControl>
                      <Input type="date" className="satoshi-regular" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="satoshi-medium">Time *</FormLabel>
                    <FormControl>
                      <Input type="time" className="satoshi-regular" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="satoshi-medium">Event Type *</FormLabel>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="radio"
                            value="physical"
                            checked={field.value === "physical"}
                            onChange={() => field.onChange("physical")}
                            className="w-4 h-4"
                          />
                        </FormControl>
                        <span className="satoshi-regular text-sm">Physical Event</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="radio"
                            value="online"
                            checked={field.value === "online"}
                            onChange={() => field.onChange("online")}
                            className="w-4 h-4"
                          />
                        </FormControl>
                        <span className="satoshi-regular text-sm">Online Event</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="satoshi-medium">
                      {isOnline ? "Event Location (for reference)" : "Venue Address *"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          isOnline
                            ? "e.g., Online via Zoom"
                            : "e.g., 123 Main St, City, State"
                        }
                        className="satoshi-regular"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isOnline && (
                <>
                  <FormField
                    control={form.control}
                    name="onlineLink"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="satoshi-medium">Meeting Link</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://zoom.us/j/..."
                            className="satoshi-regular"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="onlinePlatform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="satoshi-medium">Platform</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Zoom, Google Meet"
                            className="satoshi-regular"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="onlinePassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="satoshi-medium">
                          Meeting Password (optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Meeting password"
                            className="satoshi-regular"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="satoshi-bold text-xl text-[var(--foreground)] mb-6">
              Pricing & Capacity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="satoshi-medium">Ticket Price ($) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="satoshi-regular"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="satoshi-regular">
                      Set to 0 for free events
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="satoshi-medium">Available Seats *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="50"
                        className="satoshi-regular"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="satoshi-regular">
                      Maximum number of attendees
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

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
              disabled={isPending || isUploadingImage}
              className="satoshi-medium cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </DashboardLayout>
  );
}