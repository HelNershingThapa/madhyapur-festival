import { useRef } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import Map, { Marker } from "react-map-gl/maplibre";

import { MapPinned } from "lucide-react";
import maplibregl from "maplibre-gl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ReportIncidentMap({ coordinates }) {
  const { lat, lng } = coordinates;

  return (
    <div className="relative">
      <Map
        initialViewState={{
          longitude: lng,
          latitude: lat,
          zoom: 17,
        }}
        latitude={lat}
        longitude={lng}
        interactive={false}
        scrollZoom={false}
        style={{ height: "180px", width: "100%", cursor: "pointer" }}
        mapStyle={`${import.meta.env.VITE_BAATO_API_URL}/v1/styles/breeze?key=${import.meta.env.VITE_BAATO_ACCESS_TOKEN}`}
      >
        <Marker latitude={lat} longitude={lng} />
      </Map>
      <Button
        variant="outline"
        className="absolute bottom-2 left-2 rounded-full shadow-md"
      >
        <MapPinned className="size-4" />
        Edit map location
      </Button>
    </div>
  );
}

export function MapDialog({
  coordinates,
  handleCloseMapDialog,
  isMapDialogOpen,
  onCoordinatesSave,
}) {
  const mapRef = useRef<MapRef>(null);

  const handleAddressSave = () => {
    const center = mapRef.current?.getCenter();
    onCoordinatesSave(center);
    handleCloseMapDialog();
  };

  return (
    <Dialog
      open={isMapDialogOpen}
      onOpenChange={(open) => !open && handleCloseMapDialog()}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Location</DialogTitle>
        </DialogHeader>
        <ReportIncidentDetailMap coordinates={coordinates} mapRef={mapRef} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAddressSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const ReportIncidentDetailMap = ({ coordinates, mapRef }) => {
  const markerRef = useRef<maplibregl.Marker>(null);
  const { lat, lng } = coordinates;

  return (
    <Map
      ref={mapRef}
      mapStyle={`${import.meta.env.VITE_BAATO_API_URL}/v1/styles/breeze?key=${import.meta.env.VITE_BAATO_ACCESS_TOKEN}`}
      initialViewState={{
        longitude: lng,
        latitude: lat,
        zoom: 17,
      }}
      style={{
        height: "369px",
        minWidth: "300px",
        width: "100%",
      }}
      onMove={({ viewState }) => {
        markerRef.current?.setLngLat({
          lat: viewState.latitude,
          lng: viewState.longitude,
        });
      }}
    >
      <Marker ref={markerRef} latitude={lat} longitude={lng} />
    </Map>
  );
};
