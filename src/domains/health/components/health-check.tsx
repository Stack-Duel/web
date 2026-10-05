"use client";

const SLOW_STARTUP_TOAST_ID = "server-startup";
const SLOW_STARTUP_DELAY_MS = 5000;
const SLOW_STARTUP_AUTO_DISMISS_MS = 60000;

import { toast } from "sonner";
import { useHealth } from "../api/get-health";
import { useEffect } from "react";
import { Loader2Icon } from "lucide-react";

export default function HealthCheck() {
  const { isFetching, isSuccess, isError } = useHealth();
  const settled = isSuccess || isError;

  useEffect(() => {
    if (!isFetching) return;

    const timer = setTimeout(() => {
      toast("Server is starting up. This may take up to a minute.", {
        id: SLOW_STARTUP_TOAST_ID,
        icon: <Loader2Icon className="size-4 animate-spin" />,
        closeButton: true,
        duration: SLOW_STARTUP_AUTO_DISMISS_MS,
      });
    }, SLOW_STARTUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isFetching]);

  useEffect(() => {
    if (settled) {
      toast.dismiss(SLOW_STARTUP_TOAST_ID);
    }
  }, [settled]);

  return null;
}
