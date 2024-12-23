import * as React from "react";

import { useMutation } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { Database, Loader2, User } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { auth, db } from "@/firebase-config";
import { useToast } from "@/hooks/use-toast";

interface DeleteAccountProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteAccount({ open, setOpen }: DeleteAccountProps) {
  const { toast } = useToast();
  const [deletionType, setDeletionType] = React.useState("data");

  const mutation = useMutation({
    mutationFn: async () => {
      const userRef = doc(db, "users", auth.currentUser.email);
      return await updateDoc(
        userRef,
        deletionType === "data"
          ? {
              dataDeletionRequest: "submitted",
              dataDeletionRequestAt: new Date().getTime(),
            }
          : {
              accountDeletionRequest: "submitted",
              accountDeletionRequestAt: new Date().getTime(),
            },
      );
    },
    onSuccess: () => {
      handleClose();
      toast({
        variant: "success",
        title: "Deletion request submitted",
        description:
          "Your deletion request has been submitted. We will email you after successfully removing your data.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          "An error occured while submitting your deletion request. Please try again later.",
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete your account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
              <RadioGroup
                value={deletionType}
                className="mt-4 grid grid-cols-2 gap-4"
                onValueChange={setDeletionType}
              >
                <div>
                  <RadioGroupItem
                    value="data"
                    id="data"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="data"
                    className="flex flex-col items-center justify-between gap-4 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Database className="size-6" />
                    Delete data only
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="account"
                    id="account"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="account"
                    className="flex flex-col items-center justify-between gap-4 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <User className="size-6" />
                    Delete entire account
                  </Label>
                </div>
              </RadioGroup>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending && (
                <Loader2 className="size-5 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
}
