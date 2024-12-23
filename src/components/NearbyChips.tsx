import { Link } from "@tanstack/react-router";

import { buttonVariants } from "@/components/ui/button";
import { amenities } from "@/config";
import { cn } from "@/lib/utils";

export const NearbyChips = () => {
  return (
    <div className="flex gap-2">
      <Link
        to="/events/madhyapur-festival/$"
        className={cn(
          buttonVariants({
            className: "shrink-0 rounded-full shadow-sm hover:shadow-md",
            variant: "outline",
            size: "sm",
          }),
        )}
      >
        <img
          src="/img/madhyapur-logo.jpg"
          height={20}
          width={20}
          alt="madhyapur thimi logo"
        />
        <span className="font-semibold text-[#263280]">
          Madhyapur Festival 2024
        </span>
      </Link>
      {amenities.map((amenity) => {
        const Icon = amenity.icon;
        return (
          <Link
            key={amenity.label}
            to="/nearby/$amenity/$"
            params={{ amenity: amenity.value }}
            className={cn(
              buttonVariants({
                className: "rounded-full shadow-sm hover:shadow-md",
                variant: "outline",
                size: "sm",
              }),
            )}
          >
            <Icon className="size-4" />
            {amenity.label}
          </Link>
        );
      })}
    </div>
  );
};
