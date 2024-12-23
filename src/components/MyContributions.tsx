import { Fragment, useEffect, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";

import { useQuery } from "@tanstack/react-query";
import { bbox } from "@turf/turf";
import { collection, getDocs, query, where } from "firebase/firestore";
import GeoJSON from "geojson";
import { AlertCircle, Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { auth, db } from "@/firebase-config";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useStateContext, useStateDispatchContext } from "@/StateContext";

const getContributions = async (userEmail: string) => {
  const docRef = query(
    collection(db, "pois"),
    where("user_id", "==", userEmail),
  );
  const querySnapshot = await getDocs(docRef);
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
};

export function MyContributions() {
  const state = useStateContext();
  const { current: map } = useMap();
  const [hoveredListItemIndex, setHoveredListItemIndex] = useState<
    number | null
  >(null);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const { isUserLoggedIn } = state;

  const {
    data: contributions,
    isLoading: isContributionsLoading,
    isError,
  } = useQuery({
    queryKey: ["contributions", auth.currentUser?.email],
    queryFn: () => getContributions(auth.currentUser?.email),
    enabled: isUserLoggedIn,
  });

  const geojson =
    contributions &&
    GeoJSON.parse(contributions, {
      Point: ["location._lat", "location._long"],
    });

  useEffect(() => {
    if (!contributions) return;
    const bounds = bbox(geojson);
    map.fitBounds(
      bounds,
      !isSmallScreen
        ? {
            padding: {
              left: 540,
              top: 100,
              right: 100,
              bottom: 100,
            },
          }
        : {
            padding: {
              top: 280,
              left: 50,
              right: 50,
              bottom: 50,
            },
          },
    );
  }, [contributions, geojson, isSmallScreen, map]);

  return (
    <>
      <div className="fixed bottom-0 left-0 top-0 z-[9] w-[428px] bg-background pt-14">
        <ScrollArea className="h-full">
          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                An error occured and your contributions failed to load. Please
                try again later.
              </AlertDescription>
            </Alert>
          )}
          {isContributionsLoading && (
            <div className="mt-8 flex justify-center">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}
          <div className="pb-0">
            {contributions?.map((contribution) => (
              <Fragment key={contribution.id}>
                <ContributionListItem
                  setHoveredListItemIndex={setHoveredListItemIndex}
                  {...contribution}
                />
                <Separator />
              </Fragment>
            ))}
          </div>
        </ScrollArea>
      </div>
      <Source id="contributions" type="geojson" data={geojson}>
        <Layer
          id="contributions"
          type="symbol"
          source="contributions"
          layout={{
            "icon-image": "marker-contribution",
            "icon-size": [
              "case",
              ["==", ["get", "id"], hoveredListItemIndex],
              0.075,
              0.06,
            ],
            "icon-allow-overlap": true,
            "icon-ignore-placement": false,
            "icon-keep-upright": true,
            "icon-padding": 0,
            "text-optional": true,
            "text-field": ["coalesce", ["get", "name_en"], ["get", "name_np"]],
            "text-font": ["OpenSans"],
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            "text-variable-anchor": ["right", "left"],
            "text-radial-offset": 1.4,
            "text-size": 13,
          }}
          paint={{
            "text-halo-color": "rgba(255, 255, 255, 1)",
            "text-halo-width": 2,
          }}
        />
      </Source>
    </>
  );
}

function ContributionListItem(props) {
  const dispatch = useStateDispatchContext();
  const {
    id,
    name_np,
    name_en,
    address,
    category,
    status,
    setHoveredListItemIndex,
    placeId,
  } = props;

  const statusColor = {
    INAPPROPRIATE: "text-red-500 border-red-500",
    APPROVED: "text-green-500 border-green-500",
    PENDING: "text-orange-500 border-orange-500",
  };

  const handleClick = () => {
    dispatch({
      type: "contribution_list_item_clicked",
      payload: {
        placeId,
      },
    });
  };

  return (
    <div
      className="px-3 py-3 text-sm hover:bg-muted"
      onClick={handleClick}
      onMouseEnter={() => setHoveredListItemIndex(id)}
      onMouseLeave={() => setHoveredListItemIndex(null)}
    >
      <Badge
        variant="outline"
        className={cn(
          "mb-1 font-medium capitalize text-orange-500",
          statusColor[status],
        )}
      >
        {status?.toLowerCase() || "Pending"}
      </Badge>
      <p className="text-base font-medium">{name_np || name_en}</p>
      <span>{category}</span>
      &nbsp;&#8226;&nbsp;
      <span className="text-muted-foreground">{address}</span>
    </div>
  );
}
