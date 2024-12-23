import { memo } from "react";

import { Link, useParams } from "@tanstack/react-router";

import { Separator } from "@/components/ui/separator";
import { capitalizeFirstLetter } from "@/utils/capitalize";

function PoiListItem({ poi, setHoveredPoiIndex, poiIndex }) {
  const params = useParams({ strict: false });

  return (
    <>
      <Link
        to="/places/$placeId/$"
        params={{ placeId: poi.placeId, _splat: params._splat }}
        onMouseEnter={() => setHoveredPoiIndex(poiIndex)}
        onMouseLeave={() => setHoveredPoiIndex(-1)}
      >
        <div className="px-3 py-3 text-sm hover:bg-muted">
          <p className="text-base font-medium">{poi.name}</p>
          <span>{capitalizeFirstLetter(poi.type.split("_").join(" "))}</span>
          &nbsp;&#8226;&nbsp;
          <span className="text-muted-foreground">{poi.address}</span>
          {poi.open !== null && <p>{poi.open ? "Open now" : "Closed now"}</p>}
        </div>
      </Link>
      <Separator />
    </>
  );
}

export default memo(PoiListItem);
