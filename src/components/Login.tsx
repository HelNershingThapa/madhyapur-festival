import { useEffect, useState } from "react";

import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

import { DeleteAccount } from "@/components/DeleteAccount";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth, provider } from "@/firebase-config";
import { useStateContext, useStateDispatchContext } from "@/StateContext";

export function Login() {
  const state = useStateContext();
  const dispatch = useStateDispatchContext();
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { isLoggedIn } = state;

  const handleSignOut = () => {
    signOut(auth);
  };

  // Had to wrap this thing into useEffect
  // because the app became unresponsive without it
  // after adding the loading flag
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already signed in
        dispatch({
          type: "update_login_status",
          payload: {
            isUserLoggedIn: true,
          },
        });
      } else {
        dispatch({
          type: "update_login_status",
          payload: {
            isUserLoggedIn: false,
          },
        });
      }
      setIsLoading(false);
    });
  }, [dispatch]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  if (isLoading) {
    return null;
  }

  return (
    <div>
      {!isLoggedIn ? (
        <SignInAction />
      ) : (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="size-10">
                  <AvatarImage
                    src={auth.currentUser?.photoURL}
                    alt={auth.currentUser?.displayName}
                  />
                  <AvatarFallback>
                    {auth.currentUser?.displayName
                      ?.split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleClickOpen} className="py-3">
                Delete account
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleSignOut} className="py-3">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DeleteAccount open={open} setOpen={setOpen} />
        </>
      )}
    </div>
  );
}

export const SignInAction = ({ shouldOpenContributeDialog = false }) => {
  const dispatch = useStateDispatchContext();
  const signInWithGoogle = () => {
    signInWithPopup(auth, provider).then(() => {
      if (shouldOpenContributeDialog) {
        dispatch({
          type: "update_state",
          payload: {
            isAddMissingDialogOpen: true,
          },
        });
      }
      dispatch({
        type: "update_state",
        payload: {
          isDisplaySignInPrompt: false,
        },
      });
    });
  };

  return (
    <Button variant="outline" onClick={signInWithGoogle}>
      <Icons.google className="size-4" />
      Sign in
    </Button>
  );
};
