import { Fragment, useEffect, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";
import { uid } from "react-uid";

import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Accessibility,
  AlertCircle,
  Binoculars,
  Clock10,
  Globe,
  IdCard,
  Languages,
  Loader2,
  Mail,
  MapPinned,
  Phone,
  Signpost,
  Tag,
  Tent,
  Wifi,
} from "lucide-react";

import { Icons } from "@/components/icons";
import { ParkingMarker, PoiMarker } from "@/components/markers";
import { TypographyH4 } from "@/components/typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStateDispatchContext } from "@/StateContext";
import { RoutingPoint } from "@/types/miscellaneous";
import BaatoService from "@/utils/baatoService";
import { capitalizeFirstLetter } from "@/utils/capitalize";
import { polygonLayer, polygonOutlineLayer } from "@/utils/layers";

function PlaceInfo() {
  const navigate = useNavigate();
  const baatoService = new BaatoService(import.meta.env.VITE_BAATO_API_URL);
  const params = useParams({ from: "/_layout/_left-detail/places/$placeId" });
  const { current: map } = useMap();
  const dispatch = useStateDispatchContext();
  const [activeParkingIndex, setActiveParkingIndex] = useState(-1);
  const {
    isLoading,
    data: placeInfo,
    isError,
  } = useQuery({
    queryKey: ["place", params.placeId],
    queryFn: async () => await baatoService.places(params.placeId),
    enabled: !!params.placeId,
  });

  const { data: reverseSearchResult } = useQuery({
    queryKey: [
      "reverse",
      { lat: placeInfo?.centroid.lat, lng: placeInfo?.centroid.lon },
    ],
    queryFn: async () =>
      await baatoService.reverseGeocode([
        placeInfo?.centroid.lat,
        placeInfo?.centroid.lon,
      ]),
    select: (data) => data.data[0],
    enabled: !!placeInfo,
  });

  const isParkingArea = [
    "parking",
    "bicycle_parking",
    "underground",
    "multi-storey",
    "parking_space",
    "car_parking",
  ].includes(placeInfo?.type);

  const { data: parkings } = useQuery({
    queryKey: [
      "nearby",
      "parking",
      { lat: placeInfo?.centroid.lat, lon: placeInfo?.centroid.lon },
    ],
    queryFn: async () =>
      await baatoService.nearby("parking", [
        placeInfo?.centroid.lat,
        placeInfo?.centroid.lon,
      ]),
    enabled: !!placeInfo && !isParkingArea,
    select: (data) => data.data.data,
  });

  const routingPoints: RoutingPoint[] = [
    {
      query: "",
      coordinates: [placeInfo?.centroid.lon, placeInfo?.centroid.lat],
    },
    {
      query: "",
      coordinates: parkings?.[activeParkingIndex]?.geometry.coordinates,
    },
  ];

  const { data: route } = useQuery({
    queryKey: ["directions", routingPoints, "car"],
    queryFn: async () => await baatoService.routing(routingPoints, "car"),
    enabled: !!parkings?.[activeParkingIndex],
    select: (data) => data[0],
  });

  useEffect(() => {
    if (placeInfo && map) {
      map.flyTo({
        center: [placeInfo.centroid.lon, placeInfo.centroid.lat],
        padding: {
          left: 420,
        },
      });
      dispatch({
        type: "update_state",
        payload: {
          searchQuery: placeInfo.name,
        },
      });
    }
  }, [dispatch, map, placeInfo]);

  const iconMap = {
    address: <MapPinned className="size-4" />,
    "contact:email": <Mail className="size-4" />,
    "contact:phone": <Phone className="size-4" />,
    name: <IdCard className="size-4" />,
    "name:ne": <Languages className="size-4" />,
    opening_hours: <Clock10 className="size-4" />,
    website: <Globe className="size-4" />,
    wheelchair: <Accessibility className="size-4" />,
    internet_access: <Wifi className="size-4" />,
    "addr:street": <Signpost className="size-4" />,
    shelter: <Tent className="size-4" />,
    tourism: <Binoculars className="size-4" />,
    phone: <Phone className="size-4" />,
  };

  return (
    <div>
      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>An error occured</AlertTitle>
          <AlertDescription>
            Failed to fetch data from the Baato OSM server.
          </AlertDescription>
        </Alert>
      )}
      {!isLoading && placeInfo && (
        <>
          <Source id="maine" type="geojson" data={placeInfo.geometry}>
            {["boundary", "administrative"].includes(placeInfo.type) && (
              <>
                <Layer source="maine" {...polygonLayer} />
                <Layer source="maine" {...polygonOutlineLayer} />
              </>
            )}
          </Source>
          <PoiMarker
            latitude={placeInfo.centroid.lat}
            longitude={placeInfo.centroid.lon}
          />
          {route && activeParkingIndex > -1 && (
            <>
              <Source
                id="route-parking"
                type="geojson"
                data={{
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: route.geojson.coordinates,
                  },
                }}
              >
                <Layer
                  type="line"
                  layout={{
                    "line-join": "round",
                    "line-cap": "round",
                  }}
                  paint={{
                    "line-color": "#008148",
                    "line-width": 8,
                  }}
                />
              </Source>
              <ParkingMarker
                lat={parkings[activeParkingIndex].centroid.lat}
                lng={parkings[activeParkingIndex].centroid.lon}
              />
            </>
          )}
          <img
            className="pointer-events-none hidden rounded-lg sm:block"
            src={`/img/place-info.png`}
            width="100%"
            alt=""
          />
          <div className="px-6 py-4 pt-0">
            <TypographyH4 className="font-normal">
              {placeInfo.name}
            </TypographyH4>
            <span className="text-muted-foreground">
              {capitalizeFirstLetter(placeInfo.type)}
            </span>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 px-6 py-4">
            <Button
              variant="ghost"
              className="uppercase text-primary"
              onClick={() => {
                navigate({
                  to: "/directions/$locations/$mode/$",
                  from: "/places/$placeId",
                  params: {
                    locations: `,,${placeInfo.centroid.lat},${placeInfo.centroid.lon}`,
                    mode: "car",
                  },
                });
              }}
            >
              Click for directions
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 px-6 py-4">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger className="text-primary">
                  {iconMap["address"]}
                </TooltipTrigger>
                <TooltipContent align="start">
                  <p>Address</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-sm text-gray-700">
                {reverseSearchResult?.address}
              </span>
            </div>
            {Object.keys(placeInfo.tags).map((tag) => (
              <Fragment key={uid(tag)}>
                {tag !== placeInfo.type && (
                  <div className="flex items-center gap-4">
                    <Tooltip>
                      <TooltipTrigger className="text-primary">
                        {iconMap[tag as keyof typeof iconMap] || (
                          <Tag className="size-4 text-primary" />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tag}</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-sm text-gray-700">
                      {placeInfo.tags[tag]}
                    </span>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
          <Separator />
          {!isParkingArea && (
            <div className="flex flex-col gap-0.5">
              <TypographyH4 className="px-4 py-4">Parking Nearby</TypographyH4>
              {parkings?.map((parking, index) => (
                <ParkingListItem
                  key={parking.placeId}
                  parking={parking}
                  index={index}
                  setActiveParkingIndex={setActiveParkingIndex}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PlaceInfo;

const ParkingListItem = ({ parking, index, setActiveParkingIndex }) => {
  const navigate = useNavigate();

  return (
    <button
      className="items flex items-center px-4 py-2 text-left transition-all hover:bg-accent"
      onMouseEnter={() => setActiveParkingIndex(index)}
      onMouseLeave={() => setActiveParkingIndex(-1)}
      onClick={() => {
        navigate({
          to: "/places/$placeId",
          params: {
            placeId: parking.placeId,
          },
        });
      }}
    >
      <div className="min-w-10">
        <Icons.localParking className="size-5" />
      </div>
      <div className="text-sm">
        <span className="block text-base font-medium">{parking.name}</span>
        <span className="">
          {capitalizeFirstLetter(parking.type.split("_").join(" "))}
        </span>
        &nbsp;&#8226;&nbsp;
        <span className="text-muted-foreground">{parking.address}</span>
        {parking.open !== null && (
          <span>{parking.open ? "Open now" : "Closed now"}</span>
        )}
      </div>
    </button>
  );
};
