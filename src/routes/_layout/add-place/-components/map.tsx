import { forwardRef, useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";

import Baato from "@baatomaps/baato-js-client";
import { useLocation } from "@tanstack/react-router";
import { GeoPoint } from "firebase/firestore";
import { MapPinned } from "lucide-react";
import maplibregl, { LngLat } from "maplibre-gl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Map for the main dialog
export function AddAPlaceMap({ formData }) {
  const mapContainer = useRef(null);
  const { current: rootMap } = useMap();
  const map = useRef(null);
  const location = useLocation();
  const { latitude, longitude } = formData.location || "";

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once
    let rootMapCenter: LngLat;
    if (latitude && longitude) {
      rootMapCenter = new LngLat(longitude, latitude);
    } else if (location.state.initialView) {
      rootMapCenter = new LngLat(
        location.state.initialView[0],
        location.state.initialView[1],
      );
    } else {
      rootMapCenter = rootMap!.getCenter();
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `${import.meta.env.VITE_BAATO_API_URL}/v1/styles/breeze?key=${import.meta.env.VITE_BAATO_ACCESS_TOKEN}`,
      center: rootMapCenter,
      zoom: 17,
      interactive: false,
      scrollZoom: false,
    });

    new maplibregl.Marker({}).setLngLat(rootMapCenter).addTo(map.current);
  }, [latitude, location.pathname, longitude, rootMap]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={mapContainer}
        style={{ height: "180px", width: "100%", cursor: "pointer" }}
      />
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
  handleCloseMapDialog,
  formData,
  setFormData,
  activeDialog,
}) {
  const map = useRef(null);
  const handleAddressSave = () => {
    const { lat, lng } = map.current.getCenter();

    setFormData((prev) => ({ ...prev, location: new GeoPoint(lat, lng) }));
    handleCloseMapDialog();
    new Baato.Reverse()
      .setApiVersion("1.0") // default
      .setBaseUrl(import.meta.env.VITE_BAATO_API_URL) // detault Baato base URL
      .setKey(import.meta.env.VITE_BAATO_ACCESS_TOKEN)
      .setCoordinates([lat, lng]) // coordinates to reverse geocode
      .doRequest()
      .then((res) =>
        setFormData((prev) => ({
          ...prev,
          location: new GeoPoint(lat, lng),
          address: res.data[0].address,
        })),
      );
    // Had to weirdly clear the map ref so that map ref would initialize
    // every time the dialog opens;
    map.current = null;
  };

  const handleCancel = () => {
    map.current = null;
    handleCloseMapDialog();
  };

  return (
    <Dialog
      open={activeDialog === "map"}
      onOpenChange={(open) => !open && handleCancel()}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add a place</DialogTitle>
        </DialogHeader>
        <AddAPlaceDetailMap formData={formData} ref={map} />
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

export const AddAPlaceDetailMap = forwardRef(({ formData }, ref) => {
  const mapContainer = useRef(null);
  const location = useLocation();
  const { latitude, longitude } = formData.location || "";
  const { current: rootMap } = useMap();

  useEffect(() => {
    if (ref.current) return; // stops map from intializing more than once
    const rootMapCenter =
      latitude && longitude
        ? new LngLat(longitude, latitude)
        : rootMap?.getCenter();
    ref.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `${import.meta.env.VITE_BAATO_API_URL}/v1/styles/breeze?key=${import.meta.env.VITE_BAATO_ACCESS_TOKEN}`,
      center: rootMapCenter,
      zoom: 17,
    });

    const marker = new maplibregl.Marker({})
      .setLngLat(rootMapCenter!)
      .addTo(ref.current);

    ref.current.on("move", function (e) {
      marker.setLngLat(ref.current?.getCenter());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div
      ref={mapContainer}
      style={{
        height: "369px",
        minWidth: "300px",
        width: "100%",
        cursor: "pointer",
      }}
    />
  );
});
