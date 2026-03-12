"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import type { Item } from "@/lib/types";

interface ItemActionsProps {
  folderId?: string;
  item: Item;
}

export function ItemActions({ folderId, item }: ItemActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const goBack = () => {
    if (folderId) {
      try {
        sessionStorage.setItem("refresh-folder-on-back", "1");
      } catch (error) {
        console.warn("Failed to set refresh-folder-on-back flag:", error);
      }
    }

    window.history.back();
  };

  const markAsRead = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/mark-as-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: item.id, folderId }),
      });

      const responseText = (await response.text()).trim();

      if (!response.ok) {
        throw new Error(responseText || "Failed to mark as read");
      }

      if (responseText !== "OK") {
        throw new Error(
          `Failed to mark as read: unexpected response '${responseText}'`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 80));
      goBack();
    } catch (ex) {
      const error =
        ex instanceof Error ? ex.message : "An unknown error occurred";
      console.warn("ItemActions.markAsRead error:", ex);
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/remove-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: item.id, folderId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to remove item");
      }

      toast.success("Item removed.");
      goBack();
    } catch (ex) {
      const error =
        ex instanceof Error ? ex.message : "An unknown error occurred";
      console.warn("ItemActions.removeItem error:", ex);
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const originalUrl = item?.canonical?.[0]?.href;

  const commonButtonClass = "h-14 flex-1 rounded-none text-lg";
  const linkButtonClass =
    "inline-flex items-center justify-center whitespace-nowrap";

  return (
    <>
      <Button
        onClick={markAsRead}
        disabled={isLoading}
        variant="outline"
        className={commonButtonClass}
      >
        已读
      </Button>

      <a
        href={originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${linkButtonClass} ${commonButtonClass} border bg-background hover:bg-accent hover:text-accent-foreground`}
        style={{ opacity: isLoading ? 0.5 : 1 }}
      >
        原文
      </a>

      <Button
        onClick={async () => {
          if (originalUrl) {
            window.open(originalUrl, "_blank");
          }

          await markAsRead();
        }}
        disabled={isLoading}
        variant="outline"
        className={commonButtonClass}
      >
        读&开
      </Button>

      <Button
        onClick={removeItem}
        disabled={isLoading}
        variant="outline"
        className={commonButtonClass}
      >
        稍后
      </Button>
    </>
  );
}
