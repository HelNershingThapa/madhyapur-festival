import { useQuery } from "@tanstack/react-query";
import { Check, Clipboard } from "lucide-react";

import { TypographySmall } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import BaatoService from "@/utils/baatoService";

interface ReverseToastProps {
  lng: number;
  lat: number;
}

export const ReverseToast = ({ lng, lat }: ReverseToastProps) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const baatoService = new BaatoService(import.meta.env.VITE_BAATO_API_URL);

  const { isLoading, data: reverseSearchResult } = useQuery({
    queryKey: ["reverse", { lat, lng }],
    queryFn: async () => await baatoService.reverseGeocode([lat, lng]),
    select: (data) => data.data[0],
    enabled: !!lat,
  });

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex gap-2.5 bg-white text-xs">
      <img
        className="pointer-events-none h-16 mix-blend-luminosity"
        src={"/img/ktm-cartoon.png"}
        alt=""
      />
      <div>
        <TypographySmall className="font-semibold">
          {reverseSearchResult?.name}
        </TypographySmall>
        <p className="my-0.5">{reverseSearchResult?.address}</p>
        <div className="group/clipboard flex h-5 items-center gap-1">
          <p className="address">
            {lat.toFixed(6)},&nbsp;
            {lng.toFixed(6)}
          </p>
          <Button
            onClick={() => {
              copyToClipboard(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }}
            variant="ghost"
            className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-full group-hover/clipboard:block [&>svg]:size-3"
            size="icon"
          >
            {isCopied ? <Check /> : <Clipboard />}
          </Button>
        </div>
        <p className="text-muted-foreground">
          {reverseSearchResult?.type.split("_").join(" ")}
        </p>
      </div>
    </div>
  );
};
