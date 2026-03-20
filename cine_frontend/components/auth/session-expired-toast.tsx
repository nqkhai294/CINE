"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { errorToast } from "@/components/ui/toast";

/**
 * Component hiển thị toast khi session hết hạn
 * Đặt trong layout hoặc page để tự động kiểm tra URL params
 */
export default function SessionExpiredToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check nếu có query param session_expired=true
    if (searchParams.get("session_expired") === "true") {
      errorToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      
      // Remove query param khỏi URL sau khi hiển thị toast
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("session_expired");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [searchParams]);

  return null; // Component này không render gì
}

