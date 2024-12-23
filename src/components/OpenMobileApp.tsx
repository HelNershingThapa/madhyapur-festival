import * as React from "react";

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

export function OpenMobileApp() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [open, setOpen] = React.useState(isMobile);

  const handleOpenApp = () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
      window.location.replace("market://details?id=io.baato");
    } else if (isIOS) {
      window.location.replace(
        "https://apps.apple.com/np/app/baato-maps/id1538953783",
      );
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-[95%]">
        <AlertDialogHeader>
          <AlertDialogTitle>Open Baato mobile app?</AlertDialogTitle>
          <AlertDialogDescription>
            Would you like to open the Baato mobile app to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleOpenApp}>Open</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
