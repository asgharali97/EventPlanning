import { DashboardLayout } from "./DashboardLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useHostCoupons,
  useCouponStats,
  useDeleteCoupon,
  useToggleCouponStatus,
} from "@/hooks/useCoupons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast, Toaster } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Tag,
  Percent,
  DollarSign,
} from "lucide-react";
import { PageHeader } from "./HostComponents";

export default function HostCoupons() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);

  const { data: coupons, isLoading } = useHostCoupons();
  const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCoupon();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleCouponStatus();

  const filteredCoupons = coupons?.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const handleDeleteConfirm = () => {
    if (!deleteCouponId) return;

    deleteCoupon(deleteCouponId, {
      onSuccess: () => {
        toast.success("Coupon deleted successfully");
        setDeleteCouponId(null);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message;
        if (errorMessage?.includes("has been used")) {
          toast.error("Cannot delete coupon", {
            description: "This coupon has already been used by customers.",
          });
        } else {
          toast.error("Failed to delete coupon", {
            description: errorMessage || "Something went wrong",
          });
        }
        setDeleteCouponId(null);
      },
    });
  };

  const handleToggleStatus = (couponId: string) => {
    toggleStatus(couponId, {
      onSuccess: (data: any) => {
        const isActive = data?.data?.isActive;
        toast.success(
          isActive ? "Coupon activated" : "Coupon deactivated"
        );
      },
      onError: (error: any) => {
        toast.error("Failed to update coupon status");
      },
    });
  };

  "email":"fsdev41@gmail.com","full_name":"Fs dev",

  return (
    <DashboardLayout>
      <Toaster position="top-right" richColors closeButton />
      <PageHeader heading="Coupons" description="Manage here your coupons" onClick={() => navigate("/host/coupons/create")} buttonChildern="Create coupon" />
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search coupons by code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 satoshi-regular"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && filteredCoupons && filteredCoupons.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-[var(--border)]">
                  <TableHead className="satoshi-medium">Code</TableHead>
                  <TableHead className="satoshi-medium">Event</TableHead>
                  <TableHead className="satoshi-medium">Discount</TableHead>
                  <TableHead className="satoshi-medium">Usage</TableHead>
                  <TableHead className="satoshi-medium">Valid Until</TableHead>
                  <TableHead className="satoshi-medium">Status</TableHead>
                  <TableHead className="satoshi-medium text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow
                    key={coupon._id}
                    className="hover:bg-[var(--muted)]/50 border-[var(--border)]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[var(--muted-foreground)]" />
                        <span className="satoshi-bold text-sm font-mono">
                          {coupon.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={coupon.eventId.coverImage}
                          alt={coupon.eventId.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <span className="satoshi-regular text-sm truncate max-w-[200px]">
                          {coupon.eventId.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 satoshi-medium text-sm">
                        {coupon.discountType === "percentage" ? (
                          <>
                            <Percent className="w-3 h-3" />
                            {coupon.discountValue}%
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-3 h-3" />
                            {coupon.discountValue}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="satoshi-regular text-sm">
                      {coupon.usedCount}
                      {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                    </TableCell>
                    <TableCell className="satoshi-regular text-sm">
                      {formatDate(coupon.validUntil)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          coupon.isActive && !isExpired(coupon.validUntil)
                            ? "default"
                            : "secondary"
                        }
                        className="satoshi-medium"
                      >
                        {isExpired(coupon.validUntil)
                          ? "Expired"
                          : coupon.isActive
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(coupon._id)}
                          disabled={isToggling || isExpired(coupon.validUntil)}
                          title={coupon.isActive ? "Deactivate" : "Activate"}
                        >
                          {coupon.isActive ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/host/coupons/${coupon._id}/edit`)
                          }
                          className="cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteCouponId(coupon._id)}
                          className="cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="lg:hidden divide-y divide-[var(--border)]">
            {filteredCoupons.map((coupon) => (
              <div key={coupon._id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-4 h-4 text-[var(--muted-foreground)]" />
                      <span className="satoshi-bold text-base font-mono">
                        {coupon.code}
                      </span>
                    </div>
                    <p className="satoshi-regular text-sm text-[var(--muted-foreground)]">
                      {coupon.eventId.title}
                    </p>
                  </div>
                  <Badge
                    variant={
                      coupon.isActive && !isExpired(coupon.validUntil)
                        ? "default"
                        : "secondary"
                    }
                    className="satoshi-medium text-xs"
                  >
                    {isExpired(coupon.validUntil)
                      ? "Expired"
                      : coupon.isActive
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs satoshi-regular text-[var(--muted-foreground)] mb-3">
                  <div>
                    Discount:{" "}
                    <span className="text-[var(--foreground)] satoshi-medium">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : `$${coupon.discountValue}`}
                    </span>
                  </div>
                  <div>
                    Usage:{" "}
                    <span className="text-[var(--foreground)] satoshi-medium">
                      {coupon.usedCount}
                      {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                    </span>
                  </div>
                  <div className="col-span-2">
                    Valid until:{" "}
                    <span className="text-[var(--foreground)] satoshi-medium">
                      {formatDate(coupon.validUntil)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(coupon._id)}
                    disabled={isToggling || isExpired(coupon.validUntil)}
                    className="flex-1"
                  >
                    {coupon.isActive ? (
                      <>
                        <PowerOff className="w-4 h-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-2 text-green-500" />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/host/coupons/${coupon._id}/edit`)}
                    className="cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteCouponId(coupon._id)}
                    className="cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!isLoading && (!filteredCoupons || filteredCoupons.length === 0) && (
        <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-12 text-center">
          <Tag className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <h3 className="satoshi-medium text-lg text-[var(--foreground)] mb-2">
            {searchQuery ? "No coupons found" : "No coupons yet"}
          </h3>
          <p className="satoshi-regular text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
            {searchQuery
              ? "Try adjusting your search"
              : "Create discount codes to attract more attendees"}
          </p>
          <Button
            onClick={() => navigate("/host/coupons/create")}
            className="satoshi-medium cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </div>
      )}
      <AlertDialog
        open={!!deleteCouponId}
        onOpenChange={(open) => !open && setDeleteCouponId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="satoshi-bold">
              Delete Coupon?
            </AlertDialogTitle>
            <AlertDialogDescription className="satoshi-regular">
              This action cannot be undone. This will permanently delete the coupon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="satoshi-medium" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="satoshi-medium bg-red-500 hover:bg-red-600 cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}