import * as React from "react";
import MaplibreMap, {
  GeolocateControl,
  Layer,
  type LngLat,
  type MapLayerMouseEvent,
  type MapRef,
  NavigationControl,
  Popup,
  type PopupEvent,
  ScaleControl,
} from "react-map-gl/maplibre";

import { DrawDeleteEvent, DrawUpdateEvent } from "@mapbox/mapbox-gl-draw";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";

import { ContextMenu } from "@/components/context-menu";
import { DrawControl } from "@/components/DrawControl";
import { Icons } from "@/components/icons";
import { MapImage } from "@/components/MapImage";
import { ReverseMarker } from "@/components/markers";
import { RectangleBboxSnackbar } from "@/components/RectangleBbox";
import { MapillaryCompo } from "@/components/render-mapillary";
import { ReverseToast } from "@/components/reverse-toast";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useStateContext, useStateDispatchContext } from "@/StateContext";
import { generateMapAttribution } from "@/utils/mapAttributions";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

export function RootMap({ children }: { children: React.ReactNode }) {
  const mapRef = React.useRef<MapRef>(null);
  const drawRef = React.useRef(null);
  const location = useLocation();
  const state = useStateContext();
  const dispatch = useStateDispatchContext();
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const [contextMenu, setContextMenu] = React.useState<LngLat>();
  const [cursor, setCursor] = React.useState<string | undefined>(undefined);
  const [reverseMarker, setReverseMarker] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const { toast } = useToast();
  const [imageId, setImageId] = React.useState(null);
  const [drawnFeatures, setDrawnFeatures] = React.useState({});
  const geoControlRef = React.useRef<maplibregl.GeolocateControl>(null);

  const { mapStyle, isMapillaryEnabled, selectedFeature } = state;

  // Extract map view state from last session
  const lastSessionLocation = localStorage.getItem("lastSessionLocation");
  const mapSubString = lastSessionLocation?.substring(1).split("/");

  const mapStyleInteractiveLayerIds =
    mapRef.current
      ?.getStyle()
      ?.layers.filter((layer) =>
        ["poi", "pois"].includes(layer["source-layer"]),
      )
      .map((layer) => layer.id) || [];

  const removeFeatureFilter = () => {
    if (selectedFeature === null) return;
    const featureId = selectedFeature.id;
    const layerId = selectedFeature.layer.id;
    const currentFilter = mapRef.current?.getFilter(layerId);
    mapRef.current?.getMap().setFeatureState(
      {
        id: selectedFeature.id,
        source: selectedFeature.source,
        sourceLayer: selectedFeature.sourceLayer,
      },
      {
        selected: false,
      },
    );
    if (!currentFilter) return;

    let newFilter;
    if (Array.isArray(currentFilter) && currentFilter[0] === "all") {
      newFilter = currentFilter.filter(
        (condition) =>
          !(
            Array.isArray(condition) &&
            condition[0] === "!=" &&
            condition[1] === "$id" &&
            condition[2] === featureId
          ),
      );
      if (newFilter.length === 2) newFilter = newFilter[1]; // If only one condition left, remove the 'all'
    } else if (
      Array.isArray(currentFilter) &&
      currentFilter[0] === "!=" &&
      currentFilter[1] === "$id" &&
      currentFilter[2] === featureId
    ) {
      newFilter = null; // Remove the filter entirely if it's the only condition
    } else {
      return; // No change needed
    }

    mapRef.current?.getMap().setFilter(layerId, newFilter);
    dispatch({
      type: "update_state",
      payload: {
        selectedFeature: null,
      },
    });
  };

  const displayReverseToast = ({ lat, lng }: { lat: number; lng: number }) => {
    toast({
      className: "px-4 py-3",
      description: <ReverseToast lng={lng} lat={lat} />,
      action: (
        <Button
          className="aspect-square rounded-full fill-blue-500 hover:fill-blue-600"
          variant="ghost"
          size="icon"
          onClick={() => {
            navigate({
              to: "/directions/$locations/$mode/$",
              params: {
                locations: ",," + lat + "," + lng,
                mode: "car",
              },
            });
          }}
        >
          <Icons.directions className="size-6" />
        </Button>
      ),
      onOpenChange: (open) => {
        if (!open) {
          setReverseMarker(null);
        }
      },
    });
    setReverseMarker({ lat, lng });
  };

  const handleMapClick = async (e: MapLayerMouseEvent) => {
    const {
      features: clickedFeatures,
      lngLat: { lat, lng },
    } = e;
    const feature = clickedFeatures?.[0];
    if (
      feature?.id &&
      feature?.id !== selectedFeature?.id &&
      !location.pathname.startsWith("/directions") &&
      !isMapillaryEnabled
    ) {
      // Update state to clicked feature as selected
      dispatch({
        type: "update_state",
        payload: {
          selectedFeature: feature,
        },
      });
      mapRef.current?.getMap().setFeatureState(
        {
          id: feature.id,
          source: feature.layer.source,
          sourceLayer: feature.layer["source-layer"],
        },
        {
          selected: true,
        },
      );
      // Exclude selected feature from its layer
      const featureLayerId = feature.layer.id;
      removeFeatureFilter();
      // Apply new filter to exclude clicked feature
      const currentFilter = mapRef.current?.getFilter(featureLayerId);
      const newFilter = ["!=", "$id", feature.id];
      const updatedFilter =
        currentFilter[0] === "all"
          ? [...currentFilter, newFilter]
          : ["all", currentFilter, newFilter];
      mapRef.current?.getMap().setFilter(featureLayerId, updatedFilter);

      // Unselect previously selected feature
      navigate({
        to: "/place/$osmId/$",
        params: {
          osmId: String(feature.id),
          _splat: params._splat,
        },
      });
    }
    // While drawing, do nothing
    if (
      drawRef.current?.draw.getMode() !== "simple_select" ||
      Object.keys(drawnFeatures).length > 0
    )
      return;
    if (
      location.pathname.startsWith("/nearby/") ||
      location.pathname.startsWith("/places/") ||
      location.pathname.startsWith("/contributions/") ||
      location.pathname.startsWith("/directions/")
    ) {
      return;
    }
    // Update imageId state to show Mapillary image
    if (clickedFeatures?.length > 0) {
      setImageId(clickedFeatures[0].properties.id);
      mapRef.current?.flyTo({ center: [lng, lat] });
    } else {
      displayReverseToast({ lat, lng });
    }
  };

  const onUpdate = React.useCallback((e: DrawUpdateEvent) => {
    setDrawnFeatures((currFeatures) => {
      const newFeatures = { ...currFeatures };
      for (const f of e.features) {
        newFeatures[f.id] = f;
      }
      return newFeatures;
    });
  }, []);

  const onDelete = React.useCallback((e: DrawDeleteEvent) => {
    setDrawnFeatures((currFeatures) => {
      const newFeatures = { ...currFeatures };
      for (const f of e.features) {
        delete newFeatures[f.id];
      }
      return newFeatures;
    });
  }, []);

  const onContextMenu = (e: MapLayerMouseEvent | PopupEvent) => {
    if ("lngLat" in e) {
      setContextMenu(e.lngLat);
    } else {
      setContextMenu(undefined);
    }
  };

  return (
    <div className="h-screen w-screen">
      <MaplibreMap
        ref={mapRef}
        initialViewState={{
          longitude: parseFloat(mapSubString?.[2] ?? "85.3217"),
          latitude: parseFloat(mapSubString?.[1] ?? "27.6996"),
          zoom: parseFloat(mapSubString?.[0]?.split("=")[1] ?? "12.5"),
        }}
        // hash="map"
        mapStyle={mapStyle}
        onClick={handleMapClick}
        pitch={0}
        maxPitch={45}
        cooperativeGestures={false}
        customAttribution={generateMapAttribution()}
        interactiveLayerIds={
          isMapillaryEnabled
            ? [
                "mapillary-images",
                ...mapStyleInteractiveLayerIds,
                "contributions",
              ]
            : [...mapStyleInteractiveLayerIds, "contributions"]
        }
        cursor={cursor}
        onContextMenu={onContextMenu}
        onLoad={() => {
          mapRef.current?.on("draw.create", onUpdate);
          mapRef.current?.on("draw.update", onUpdate);
          mapRef.current?.on("draw.delete", onDelete);
          mapStyleInteractiveLayerIds.forEach((layerId) => {
            const originalColor = mapRef.current?.getPaintProperty(
              layerId,
              "text-color",
            );
            mapRef.current
              ?.getMap()
              .setPaintProperty(layerId, "text-color", [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                "#2563eb",
                ["boolean", ["feature-state", "selected"], false],
                "#2563eb",
                originalColor,
              ]);
          });
          // Display user location circle but don't move the map there
          if (geoControlRef.current) {
            const updateCamera = geoControlRef.current._updateCamera;
            geoControlRef.current._updateCamera = function () {};
            geoControlRef.current.once("geolocate", () => {
              geoControlRef.current._updateCamera = updateCamera;
            });
            geoControlRef.current.trigger();
          }
        }}
        onMouseEnter={(e: maplibregl.MapLayerMouseEvent) => {
          const feature = e.features[0];
          if (feature?.id) {
            setCursor("pointer");
            if (isMapillaryEnabled) {
              mapRef.current?.setFeatureState(
                {
                  id: feature.id,
                  source: "mapillaryImages",
                  sourceLayer: "image",
                },
                {
                  hover: true,
                },
              );
            }
            mapRef.current?.getMap().setFeatureState(
              {
                id: feature.id,
                source: feature.layer.source,
                sourceLayer: feature.layer["source-layer"],
              },
              {
                hover: true,
              },
            );
          }
        }}
        onMouseLeave={(e: maplibregl.MapLayerMouseEvent) => {
          const feature = e.features?.[0];
          setCursor("");
          if (feature?.id) {
            if (isMapillaryEnabled) {
              mapRef.current?.getMap().setFeatureState(
                {
                  id: feature.id,
                  source: "mapillaryImages",
                  sourceLayer: "image",
                },
                {
                  hover: false,
                },
              );
            }
            mapRef.current?.getMap().setFeatureState(
              {
                id: feature.id,
                source: feature.layer.source,
                sourceLayer: feature.layer["source-layer"],
              },
              {
                hover: false,
              },
            );
          }
        }}
      >
        <ScaleControl position="bottom-right" />
        <DrawControl
          ref={drawRef}
          position="bottom-right"
          displayControlsDefault={false}
          controls={{
            trash: true,
          }}
          onCreate={onUpdate}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
        <NavigationControl position="bottom-right" />
        <GeolocateControl
          ref={geoControlRef}
          position="bottom-right"
          showAccuracyCircle={false}
          positionOptions={{ enableHighAccuracy: true }}
          onGeolocate={({ coords: { latitude, longitude } }) =>
            dispatch({
              type: "update_state",
              payload: {
                userLocation: [longitude, latitude],
              },
            })
          }
        />
        {contextMenu && (
          <Popup
            anchor="top-left"
            longitude={contextMenu.lng}
            latitude={contextMenu.lat}
            onClose={onContextMenu}
            closeButton={false}
            className="min-w-[8rem] rounded-md border bg-popover text-popover-foreground shadow-lg"
          >
            <ContextMenu
              closeContextMenu={() => setContextMenu(undefined)}
              coordinates={[contextMenu.lng, contextMenu.lat]}
              displayReverseToast={displayReverseToast}
            />
          </Popup>
        )}
        <MapImage />
        {children}
        {reverseMarker && (
          <ReverseMarker lng={reverseMarker.lng} lat={reverseMarker.lat} />
        )}
        <Layer
          id="poi-selected"
          source="all_data"
          type="symbol"
          layout={{
            "icon-image": "selected-marker",
            "icon-size": 0.5,
            "icon-allow-overlap": false,
            "text-optional": false,
            "text-field": [
              "case",
              ["has", "name:en"],
              ["get", "name:en"],
              ["get", "name:latin"],
            ],
            "text-anchor": "top",
            "text-size": 13,
            "text-allow-overlap": false,
            "icon-ignore-placement": false,
            "text-font": ["OpenSans"],
            "icon-optional": false,
            "icon-padding": 20,
            "text-max-width": 8,
            "text-offset": [0, 1.5],
            "text-ignore-placement": false,
            visibility: "visible",
          }}
          paint={{
            "text-halo-color": "rgba(255, 255, 255, 1)",
            "text-color": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              "#2563eb",
              ["boolean", ["feature-state", "selected"], false],
              "#FB3242",
              "rgba(91, 106, 93, 1)",
            ],
            "text-halo-width": 2,
          }}
          source-layer="poi"
          filter={[
            "==",
            "$id",
            selectedFeature?.id || Number(params.osmId) || false,
          ]}
        />
        {isMapillaryEnabled && <MapillaryCompo imageId={imageId} />}
      </MaplibreMap>
      <RectangleBboxSnackbar
        features={Object.values(drawnFeatures)}
        setDrawnFeatures={setDrawnFeatures}
      />
    </div>
  );
}
