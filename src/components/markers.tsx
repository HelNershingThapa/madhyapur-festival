import { Marker, MarkerDragEvent, MarkerProps } from "react-map-gl/maplibre";

import { Icons } from "@/components/icons";

export function ReverseMarker({ lng, lat }: { lng: number; lat: number }) {
  return (
    <Marker longitude={lng} latitude={lat}>
      <img
        src={"/img/map-marker.png"}
        width={15}
        height={15}
        alt="reverse geocode marker"
      />
    </Marker>
  );
}

interface DirectionMarkerProps {
  lng: number;
  lat: number;
  onDragStart: (e: MarkerDragEvent) => void;
  onDragEnd: (e: MarkerDragEvent) => void;
}

export function DirectionMarker({
  lng,
  lat,
  onDragStart,
  onDragEnd,
}: DirectionMarkerProps) {
  return (
    <Marker
      longitude={lng}
      latitude={lat}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <img
        src={"/img/directions-pin.png"}
        width={25}
        height={25}
        alt="reverse geocode marker"
      />
    </Marker>
  );
}

export function PoiMarker(props: MarkerProps) {
  return (
    <Marker {...props}>
      <img
        src={"/img/selected-marker.png"}
        width={20}
        height={20}
        alt="search result marker"
      />
    </Marker>
  );
}

export function ParkingMarker({ lng, lat }: { lng: number; lat: number }) {
  return (
    <Marker longitude={lng} latitude={lat}>
      <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-red-600 shadow-sm">
        <Icons.localParking className="size-5 fill-white" />
      </div>
    </Marker>
  );
}
