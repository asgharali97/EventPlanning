import { DashboardLayout } from "./DashboardLayout";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useCreateCoupon, useUpdateCoupon } from "@/hooks/useCoupons";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  SectionCard,
  FormLabel,
  FormDescription,
  ErrorMessage,
  PageHeader,
} from "./HostComponents";
import { useEventByHostId } from "@/hooks/useEvent";

interface CouponFormData {
  code: string;
  eventId: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  validUntil: string;
  description: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CreateOrEditCoupon() {
  const navigate = useNavigate();
  const { couponId } = useParams<{ couponId: string }>();
  const isEditMode = !!couponId;

  const { data: hostEvents, isLoading: eventsLoading } = useEventByHostId()

  const { data: existingCoupon, isLoading: couponLoading } = useQuery({
    queryKey: ["coupon", couponId],
    queryFn: async () => {
      const response = await axios.get(`/coupons/get/${couponId}`);
      return response.data?.data || response.data;
    },
    enabled: !!couponId,
  });

  const { mutate: createCoupon, isPending: isCreating } = useCreateCoupon();
  const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCoupon();

  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    eventId: "",
    discountType: "percentage",
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    validUntil: "",
    description: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isEditMode && existingCoupon) {
      console.log("📝 Pre-filling coupon form:", existingCoupon);
      setFormData({
        code: existingCoupon.code || "",
        eventId: existingCoupon.eventId?._id || existingCoupon.eventId || "",
        discountType: existingCoupon.discountType || "percentage",
        discountValue: existingCoupon.discountValue || 0,
        minOrderAmount: existingCoupon.minOrderAmount || 0,
        maxDiscountAmount: existingCoupon.maxDiscountAmount || 0,
        usageLimit: existingCoupon.usageLimit || 0,
        validUntil: existingCoupon.validUntil
          ? new Date(existingCoupon.validUntil).toISOString().split("T")[0]
          : "",
        description: existingCoupon.description || "",
      });
    }
  }, [isEditMode, existingCoupon]);

  const handleChange = (field: keyof CouponFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code || formData.code.length < 3) {
      newErrors.code = "Code must be at least 3 characters";
    }

    if (!formData.eventId) {
      newErrors.eventId = "Please select an event";
    }

    if (formData.discountValue <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    }

    if (
      formData.discountType === "percentage" &&
      formData.discountValue > 100
    ) {
      newErrors.discountValue = "Percentage discount cannot exceed 100%";
    }

    if (!formData.validUntil) {
      newErrors.validUntil = "Valid until date is required";
    } else {
      const validDate = new Date(formData.validUntil);
      if (validDate < new Date()) {
        newErrors.validUntil = "Valid until date must be in the future";
      }
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

    const submitData = {
      code: formData.code.toUpperCase(),
      eventId: formData.eventId,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      minOrderAmount: formData.minOrderAmount || undefined,
      maxDiscountAmount: formData.maxDiscountAmount || undefined,
      usageLimit: formData.usageLimit || undefined,
      validUntil: formData.validUntil,
      description: formData.description || undefined,
    };

    if (isEditMode && couponId) {
      updateCoupon(
        { couponId, data: submitData },
        {
          onSuccess: () => {
            toast.success("Coupon updated successfully!");
            navigate("/host/coupons");
          },
          onError: (error: any) => {
            toast.error("Failed to update coupon", {
              description:
                error.response?.data?.message || "Something went wrong",
            });
          },
        }
      );
    } else {
      createCoupon(submitData, {
        onSuccess: () => {
          toast.success("Coupon created successfully!");
          navigate("/host/coupons");
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message;
          if (errorMessage?.includes("already exists")) {
            toast.error("Coupon code already exists", {
              description: "Please use a different code for this event.",
            });
          } else {
            toast.error("Failed to create coupon", {
              description: errorMessage || "Something went wrong",
            });
          }
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;
  const isLoading = eventsLoading || (isEditMode && couponLoading);

  if (isLoading) {
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
        title={isEditMode ? "Edit Coupon" : "Create New Coupon"}
        description={
          isEditMode
            ? "Update your coupon details"
            : "Create a discount code for your event"
        }
        onBack={() => navigate("/host/coupons")}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        <SectionCard title="Basic Information">
          <div className="space-y-6">
            <div>
              <FormLabel required>Coupon Code</FormLabel>
              <Input
                placeholder="e.g., SUMMER2024"
                className="satoshi-regular bg-[var(--background)] uppercase"
                value={formData.code}
                onChange={(e) =>
                  handleChange("code", e.target.value.toUpperCase())
                }
                maxLength={20}
              />
              <FormDescription>
                Enter a unique code (letters and numbers only)
              </FormDescription>
              <ErrorMessage message={errors.code} />
            </div>

            {/* Select Event */}
            <div>
              <FormLabel required>Event</FormLabel>
              <Select
                value={formData.eventId}
                onValueChange={(value) => handleChange("eventId", value)}
                disabled={isEditMode} // Can't change event in edit mode
              >
                <SelectTrigger className="satoshi-regular bg-[var(--background)]">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {hostEvents?.map((event: any) => (
                    <SelectItem key={event._id} value={event._id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEditMode && (
                <FormDescription>
                  Event cannot be changed after creation
                </FormDescription>
              )}
              <ErrorMessage message={errors.eventId} />
            </div>

            <div>
              <FormLabel>Description (optional)</FormLabel>
              <Textarea
                placeholder="e.g., Early bird discount for summer event"
                className="satoshi-regular bg-[var(--background)] resize-none"
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
              <FormDescription>
                Internal note about this coupon (not visible to users)
              </FormDescription>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Discount Settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FormLabel required>Discount Type</FormLabel>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="percentage"
                    checked={formData.discountType === "percentage"}
                    onChange={() => handleChange("discountType", "percentage")}
                    className="w-4 h-4"
                  />
                  <span className="satoshi-regular text-sm">
                    Percentage (%)
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="fixed"
                    checked={formData.discountType === "fixed"}
                    onChange={() => handleChange("discountType", "fixed")}
                    className="w-4 h-4"
                  />
                  <span className="satoshi-regular text-sm">Fixed Amount ($)</span>
                </label>
              </div>
            </div>
            <div>
              <FormLabel required>
                Discount Value{" "}
                {formData.discountType === "percentage" ? "(%)" : "($)"}
              </FormLabel>
              <Input
                type="number"
                min="0"
                max={formData.discountType === "percentage" ? 100 : undefined}
                step={formData.discountType === "percentage" ? 1 : 0.01}
                placeholder="0"
                className="satoshi-regular bg-[var(--background)]"
                value={formData.discountValue}
                onChange={(e) =>
                  handleChange("discountValue", parseFloat(e.target.value) || 0)
                }
              />
              <ErrorMessage message={errors.discountValue} />
            </div>

            <div>
              <FormLabel>Minimum Order Amount ($)</FormLabel>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0 (no minimum)"
                className="satoshi-regular bg-[var(--background)]"
                value={formData.minOrderAmount}
                onChange={(e) =>
                  handleChange("minOrderAmount", parseFloat(e.target.value) || 0)
                }
              />
              <FormDescription>
                Minimum purchase required to use coupon
              </FormDescription>
            </div>
            {formData.discountType === "percentage" && (
              <div>
                <FormLabel>Maximum Discount Amount ($)</FormLabel>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0 (no limit)"
                  className="satoshi-regular bg-[var(--background)]"
                  value={formData.maxDiscountAmount}
                  onChange={(e) =>
                    handleChange(
                      "maxDiscountAmount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
                <FormDescription>
                  Cap the maximum discount amount
                </FormDescription>
              </div>
            )}
          </div>
        </SectionCard>
        <SectionCard title="Usage & Validity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FormLabel>Usage Limit</FormLabel>
              <Input
                type="number"
                min="0"
                placeholder="0 (unlimited)"
                className="satoshi-regular bg-[var(--background)]"
                value={formData.usageLimit}
                onChange={(e) =>
                  handleChange("usageLimit", parseInt(e.target.value) || 0)
                }
              />
              <FormDescription>
                Maximum number of times this coupon can be used
              </FormDescription>
            </div>
            <div>
              <FormLabel required>Valid Until</FormLabel>
              <Input
                type="date"
                className="satoshi-regular bg-[var(--background)]"
                value={formData.validUntil}
                onChange={(e) => handleChange("validUntil", e.target.value)}
              />
              <FormDescription>Coupon expiration date</FormDescription>
              <ErrorMessage message={errors.validUntil} />
            </div>
          </div>
        </SectionCard>
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/host/coupons")}
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
              "Update Coupon"
            ) : (
              "Create Coupon"
            )}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}