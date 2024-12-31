import * as React from "react";
import { Layer, Source } from "react-map-gl/maplibre";
import { uid } from "react-uid";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Position } from "geojson";
import {
  Accessibility,
  Binoculars,
  Check,
  Clipboard,
  Clock10,
  Globe,
  Hash,
  IdCard,
  Languages,
  Mail,
  MapPinned,
  Phone,
  Signpost,
  Tag,
  Tent,
  Wifi,
} from "lucide-react";

import { encodeGeohash } from "@/api/geohash";
import { Icons } from "@/components/icons";
import { ParkingMarker } from "@/components/markers";
import { TypographyH4 } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { NearbyPlace } from "@/types/baato";
import { RoutingPoint } from "@/types/miscellaneous";
import BaatoService from "@/utils/baatoService";
import { capitalizeFirstLetter } from "@/utils/capitalize";

// Tags for OSM elements that should not be displayed in the place detail
const BLACKLISTED_TAGS = [
  "created",
  "dataAddedOn",
  "data_from",
  "id",
  "is_landmark",
  "osmId",
  "real_time_update",
  "remarks",
  "status",
  "type",
  "uniqueId",
  "user_id",
  "location",
  "geometry",
  "userLocation",
  "timestamp",
  "version",
  "changeset",
  "user",
  "uid",
];

interface PlaceDetailProps {
  title: string;
  description: string;
  position: Position;
  tags?: Record<string, string>;
  isParkingArea?: boolean;
}

export default function PlaceDetail({
  title,
  description,
  position,
  tags = {},
  isParkingArea = false,
}: PlaceDetailProps) {
  const navigate = useNavigate();
  const baatoService = new BaatoService(import.meta.env.VITE_BAATO_API_URL);
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const [activeParkingIndex, setActiveParkingIndex] = React.useState(-1);

  const { data: parkings } = useQuery({
    queryKey: ["nearby", "parking", { lat: position[1], lon: position[0] }],
    queryFn: async () =>
      await baatoService.nearby("parking", [position[1], position[0]]),
    enabled: !isParkingArea,
    select: (data) => data.data,
  });

  const { data: reverseSearchResult } = useQuery({
    queryKey: ["reverse", { lat: position[1], lng: position[0] }],
    queryFn: async () =>
      await baatoService.reverseGeocode([position[1], position[0]]),
    select: (data) => data.data[0],
  });

  const { data: geohash } = useQuery({
    queryKey: ["geohash", "encode", position],
    queryFn: async () =>
      await encodeGeohash({ latitude: position[1], longitude: position[0] }),
  });

  const routingPoints: RoutingPoint[] = [
    {
      query: "",
      coordinates: [position[0], position[1]],
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
    geohash: <Hash className="size-4" />,
  };

  return (
    <div>
      <img
        className="pointer-events-none hidden rounded-lg sm:block"
        src={`/img/place-info.png`}
        width="100%"
        alt=""
      />
      <div className="px-6 py-4 pt-0">
        <TypographyH4 className="font-normal">{title}</TypographyH4>
        <span className="text-muted-foreground">{description}</span>
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
                locations: `,,${position[1]},${position[0]}`,
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
        <div className="group/geohash flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger className="text-primary">
              {iconMap["geohash"]}
            </TooltipTrigger>
            <TooltipContent align="start">
              <p>Geohash</p>
            </TooltipContent>
          </Tooltip>
          <span className="text-sm text-gray-700">{geohash?.localCode}</span>
          <Tooltip>
            <TooltipTrigger className="text-primary" asChild>
              <Button
                onClick={() => {
                  copyToClipboard(geohash?.localCode);
                }}
                className="hidden h-4 w-4 shrink-0 items-center justify-center rounded-full p-0 group-hover/geohash:inline-flex [&>svg]:size-3"
                variant="unstyledGhost"
              >
                {isCopied ? <Check /> : <Clipboard />}
              </Button>
            </TooltipTrigger>
            <TooltipContent align="start">Copy geohash</TooltipContent>
          </Tooltip>
        </div>
        {Object.keys(tags).map((tag) => (
          <React.Fragment key={uid(tag)}>
            {!BLACKLISTED_TAGS.includes(tag) && (
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
                <span className="inline-block break-words break-all text-sm text-gray-700">
                  {tags[tag]}
                </span>
              </div>
            )}
          </React.Fragment>
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
          {parkings?.[activeParkingIndex] && (
            <ParkingMarker
              lat={parkings[activeParkingIndex].centroid.lat}
              lng={parkings[activeParkingIndex].centroid.lon}
            />
          )}
        </>
      )}
    </div>
  );
}

interface ParkingListItemProps {
  parking: NearbyPlace;
  index: number;
  setActiveParkingIndex: (index: number) => void;
}

const ParkingListItem = ({
  parking,
  index,
  setActiveParkingIndex,
}: ParkingListItemProps) => {
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
            placeId: String(parking.placeId),
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
