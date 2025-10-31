import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

export interface Coupon {
  _id: string;
  code: string;
  eventId: {
    _id: string;
    title: string;
    coverImage: string;
  };
  hostId: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalUsage: number;
}

export const useHostCoupons = () => {
  return useQuery<Coupon[]>({
    queryKey: ['host-coupons'],
    queryFn: async () => {
      console.log("🎟️ Fetching host coupons...");
      const response = await axios.get('/coupons/get-all');
      console.log("✅ Coupons data:", response.data);
      return response.data?.data || response.data;
    },
  });
};

// Get coupon stats
export const useCouponStats = () => {
  return useQuery<CouponStats>({
    queryKey: ['coupon-stats'],
    queryFn: async () => {
      console.log("📊 Fetching coupon stats...");
      const response = await axios.get('/coupons/stats');
      console.log("✅ Stats data:", response.data);
      return response.data?.data || response.data;
    },
  });
};

// Create coupon
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponData: any) => {
      console.log("📝 Creating coupon:", couponData);
      const response = await axios.post('/coupons/create', couponData);
      console.log("✅ Coupon created:", response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log("♻️ Invalidating coupon queries...");
      queryClient.invalidateQueries({ queryKey: ['host-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hostStats'] });
    },
    onError: (error: any) => {
      console.error("❌ Create coupon error:", error);
    },
  });
};

// Update coupon
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ couponId, data }: { couponId: string; data: any }) => {
      console.log("📝 Updating coupon:", couponId, data);
      const response = await axios.patch(`/coupons/${couponId}/update`, data);
      console.log("✅ Coupon updated:", response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log("♻️ Invalidating coupon queries...");
      queryClient.invalidateQueries({ queryKey: ['host-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon-stats'] });
    },
    onError: (error: any) => {
      console.error("❌ Update coupon error:", error);
    },
  });
};

// Delete coupon
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponId: string) => {
      console.log("🗑️ Deleting coupon:", couponId);
      const response = await axios.delete(`/coupons/${couponId}/delete`);
      console.log("✅ Coupon deleted");
      return response.data;
    },
    onSuccess: () => {
      console.log("♻️ Invalidating coupon queries...");
      queryClient.invalidateQueries({ queryKey: ['host-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hostStats'] });
    },
    onError: (error: any) => {
      console.error("❌ Delete coupon error:", error);
    },
  });
};

// Toggle coupon status (activate/deactivate)
export const useToggleCouponStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponId: string) => {
      console.log("🔄 Toggling coupon status:", couponId);
      const response = await axios.patch(`/coupons/${couponId}/deactivate`);
      console.log("✅ Status toggled:", response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log("♻️ Invalidating coupon queries...");
      queryClient.invalidateQueries({ queryKey: ['host-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon-stats'] });
    },
    onError: (error: any) => {
      console.error("❌ Toggle status error:", error);
    },
  });
};