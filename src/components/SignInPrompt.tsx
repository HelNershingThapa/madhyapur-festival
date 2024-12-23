import { X } from "lucide-react";

import { SignInAction } from "@/components/Login";
import { TypographyH4 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStateDispatchContext } from "@/StateContext";

function SignInPrompt() {
  const dispatch = useStateDispatchContext();
  return (
    <div className="fixed left-2.5 right-2.5 top-20 z-[14] w-[min(410px,calc(100vw-20px))] bg-background p-3 pt-1.5 shadow-md">
      <div className="mb-[0.2rem] flex items-center justify-between">
        <TypographyH4>Contribute to Baato Maps</TypographyH4>
        <Button
          className="rounded-full"
          variant="ghost"
          size="icon"
          onClick={() =>
            dispatch({
              type: "update_state",
              payload: {
                isDisplaySignInPrompt: false,
              },
            })
          }
        >
          <X className="size-4" />
        </Button>
      </div>
      <Separator className="-mx-3 mb-4 w-auto" />
      <div className="flex items-start gap-4 text-sm">
        <img src={"/img/add-a-place.png"} width={120} alt="" />
        <div className="flex flex-col items-start gap-2">
          <span className="font-medium">To get started, please sign in</span>
          <span className="text-xs">
            If your contribution is added to Baato Maps, it will appear
            publicly.
          </span>
          <SignInAction shouldOpenContributeDialog />
        </div>
      </div>
    </div>
  );
}

export default SignInPrompt;
