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
      const response = await axios.get('/coupons/get-all');
      return response.data?.data || response.data;
    },
  });
};

export const useCouponStats = () => {
  return useQuery<CouponStats>({
    queryKey: ['coupon-stats'],
    queryFn: async () => {
      const response = await axios.get('/coupons/stats');
      return response.data?.data || response.data;
    },
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponData: any) => {
      const response = await axios.post('/coupons/create', couponData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hostStats'] });
    },
    onError: (error: any) => {
      console.error("Create coupon error:", error);
    },
  });
};

// Update coupon
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ couponId, data }: { couponId: string; data: any }) => {
      const response = await axios.patch(`/coupons/${couponId}/update`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon-stats'] });
    },
    onError: (error: any) => {
      console.error(" Update coupon error:", error);
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponId: string) => {
      const response = await axios.delete(`/coupons/${couponId}/delete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hostStats'] });
    },
    onError: (error: any) => {
      console.error("Delete coupon error:", error);
    },
  });
};

export const useToggleCouponStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponId: string) => {
      const response = await axios.patch(`/coupons/${couponId}/deactivate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon-stats'] });
    },
    onError: (error: any) => {
      console.error("Toggle status error:", error);
    },
  });
};