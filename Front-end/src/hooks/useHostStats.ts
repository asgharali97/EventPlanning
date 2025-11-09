import { useQuery } from '@tanstack/react-query';
import axios from "@/lib/axios";
export interface HostStats {
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  activeCoupons: number;
}

export interface RecentEvent {
  _id: string;
  title: string;
  coverImage: string;
  date: string;
  time: string;
  price: number;
  seats: number;
  category: string;
  eventType: 'physical' | 'online';
  location: string;
}

export const useHostStats = () => {
  return useQuery<HostStats>({
    queryKey:['host-stats'],
    queryFn: async ()=>{
     try {
       const data = await axios.get(`/host/dashboard/stats`);
       const res = data.data.data || data.data

       return res as HostStats
     } catch (error) {
      throw new Error('HostStats error ')
     }
    }
  })
}
export const useRecentEvents = (limit: number = 5) => {
  return useQuery<RecentEvent[]>({
    queryKey: ['recent-events', limit],
    queryFn: async () => {
      const { data } = await axios.get(`/host/dashboard/recent-events`, {
        params: { limit }
      });
      return data.data;
    },
    refetchOnWindowFocus: true,
  });
};

export const useHostEvents = () => {
  return useQuery({
    queryKey: ['host-events'],
    queryFn: async () => {
      const { data } = await axios.get(`/host/dashboard/events/host/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return data.data;
    },
  });
};

export const useTotalBookings = () => {
  return useQuery<number>({
    queryKey: ['total-bookings'],
    queryFn: async () => {
      const { data } = await axios.get(`/host/dashboard/host/bookings/count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return data.data.totalBookings;
    },
  });
};

export const useTotalRevenue = () => {
  return useQuery<number>({
    queryKey: ['total-revenue'],
    queryFn: async () => {
      const { data } = await axios.get(`/host/dashboard/host/revenue`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return data.data.totalRevenue;
    },
  });
};

export const useActiveCoupons = () => {
  return useQuery<number>({
    queryKey: ['active-coupons'],
    queryFn: async () => {
      const { data } = await axios.get(`/host/dashboard/host/coupons/active`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return data.data.activeCoupons;
    },
  });
};