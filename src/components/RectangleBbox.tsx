import { useState } from "react";

import type { Position } from "geojson";
import { Check, Clipboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export const RectangleBboxSnackbar = ({ features, setDrawnFeatures }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const [open, setOpen] = useState(true);

  if (features.length < 1) return null;

  // Calculate bounding box
  const coordinates: Position[] = features.flatMap(
    (feature) => feature.geometry.coordinates[0],
  );
  const boundingBox = {
    minX: coordinates
      .map((coord) => coord[0])
      .reduce((a, b) => Math.min(a, b), Infinity),
    minY: coordinates
      .map((coord) => coord[1])
      .reduce((a, b) => Math.min(a, b), Infinity),
    maxX: coordinates
      .map((coord) => coord[0])
      .reduce((a, b) => Math.max(a, b), -Infinity),
    maxY: coordinates
      .map((coord) => coord[1])
      .reduce((a, b) => Math.max(a, b), -Infinity),
  };

  const message = `${boundingBox.minX.toFixed(
    6,
  )}, ${boundingBox.minY.toFixed(6)}, ${boundingBox.maxX.toFixed(
    6,
  )}, ${boundingBox.maxY.toFixed(6)}`;

  return (
    <ToastProvider swipeDirection="down">
      <Toast
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setDrawnFeatures({});
          }
        }}
        duration={Infinity}
        className="px-3 py-2"
      >
        <div className="grid">
          <ToastTitle>Bounding Box</ToastTitle>
          <ToastDescription>
            <div className="flex items-center gap-1">
              {message}
              <Button
                onClick={() => {
                  copyToClipboard(message);
                }}
                className="h-7 w-7 shrink-0 rounded-lg p-0 [&>svg]:size-3"
                variant="ghost"
              >
                {isCopied ? <Check /> : <Clipboard />}
              </Button>
            </div>
          </ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
};
