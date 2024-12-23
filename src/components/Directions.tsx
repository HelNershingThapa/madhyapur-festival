import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { LngLatBoundsLike, MarkerDragEvent } from "react-map-gl/maplibre";
import {
  Layer,
  MapLayerMouseEvent,
  Source,
  useMap,
} from "react-map-gl/maplibre";
import { uid } from "react-uid";

import Polyline from "@mapbox/polyline";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { featureCollection, nearestPointOnLine } from "@turf/turf";
import * as turf from "@turf/turf";
import _ from "lodash";
import { Bike, BusFront, CarFront, Footprints, Loader2, X } from "lucide-react";

import DirectionsForm from "@/components/DirectionsForm";
import { Icon } from "@/components/icons";
import { DirectionMarker } from "@/components/markers";
import { RouteDetails } from "@/components/RouteDetails";
import RoutingInstructions from "@/components/RoutingInstructions";
import TransitDetails from "@/components/TransitDetails";
import TransitInstructions from "@/components/TransitInstructions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useStateContext, useStateDispatchContext } from "@/StateContext";
import type { DirectionsMode } from "@/types/baato";
import type { RoutingPoint } from "@/types/miscellaneous";
import type { SearchPlace } from "@/types/place";
import BaatoService from "@/utils/baatoService";
import { getCorners } from "@/utils/getCorners";
import { getLineArc } from "@/utils/getLineArc";
import { dottedLayer } from "@/utils/layers";
import {
  getEndoftheLeg,
  getStartoftheLeg,
  transitModeColorMap,
} from "@/utils/publicTransitConfig";

const modeOfTravels = [
  {
    value: "foot",
    tooltipTitle: "Walking",
    icon: Footprints,
  },
  {
    value: "bike",
    tooltipTitle: "Cycling",
    icon: Bike,
  },
  {
    value: "car",
    tooltipTitle: "Driving",
    icon: CarFront,
  },
  {
    value: "transit",
    tooltipTitle: "Transit",
    icon: BusFront,
  },
] as { value: DirectionsMode; tooltipTitle: string; icon: Icon }[];

const Directions = () => {
  const { current: map } = useMap();
  const state = useStateContext();
  const dispatch = useStateDispatchContext();
  const routerLocation = useLocation();

  const navigate = useNavigate();
  const params = useParams({ from: "/_layout/directions/$locations/$mode/$" });
  const baatoService = useMemo(
    () => new BaatoService(import.meta.env.VITE_BAATO_API_URL),
    [],
  );
  // initializers
  const [activeRouteIndex, setActiveRouteIndex] = useState<number>(-1);
  const [activeTransitRouteIndex, setActiveTransitRouteIndex] =
    useState<number>(-1);
  const [modeOfTravel, setModeOfTravel] = useState<DirectionsMode>(
    (params.mode as DirectionsMode) || "foot",
  );
  const [searchResults, setSearchResults] = useState<SearchPlace[] | null>(
    null,
  );
  const [showInstructions, setShowInstructions] = useState(false);
  const [showTransitInstructions, setShowTransitInstructions] = useState(false);
  const [focussedListItemIndex, setFocussedListItemIndex] = useState(-1);
  const isTransitMode = modeOfTravel === "transit";
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const [routingPoints, setRoutingPoints] = useState<RoutingPoint[]>([
    {
      query: "",
      coordinates: null,
    },
    {
      query: "",
      coordinates: null,
    },
  ]);
  const boundsPadding = useMemo(() => {
    return !isSmallScreen
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
        };
  }, [isSmallScreen]);

  const { userLocation, currentMarkers, focussed } = state;

  const { isLoading: isTransitInstructionsLoading, data: transitInstructions } =
    useQuery({
      queryKey: ["transit-instructions", params.locations],
      queryFn: async () => await baatoService.transit(routingPoints),
      enabled:
        isTransitMode &&
        routingPoints.filter((e) => e.coordinates && e.coordinates).length > 1,
    });

  const { isLoading: isDirectionsLoading, data: routes } = useQuery({
    queryKey: ["directions", params.locations, modeOfTravel],
    queryFn: async () =>
      await baatoService.routing(routingPoints, modeOfTravel),
    enabled:
      !isTransitMode &&
      routingPoints.filter((e) => e.coordinates && e.coordinates).length > 1,
  });

  useEffect(() => {
    const { locations } = params;
    // had to introduce 'notFromUrl' state because query were messed up
    // did this to only run this piece of code on fresh refresh and not on mount

    if (locations && locations !== "empty") {
      const locs = _.chunk(locations.split(",").map(Number), 2);
      const tempPoints = [...routingPoints];
      locs.forEach((loc, index) => {
        if (loc.toString() !== [0, 0].toString()) {
          tempPoints[index] = {
            query: `${loc[0]},${loc[1]}`,
            coordinates: [loc[1], loc[0]],
          };
        } else {
          tempPoints[index] = {
            query: "",
            coordinates: null,
          };
        }
      });
      setRoutingPoints(tempPoints);
      // Handle scenario where only the destination is set
      if (locs.length === 1 && locs[0].toString() !== [0, 0].toString()) {
        tempPoints[0] = {
          query: "", // Leave the starting point empty
          coordinates: null,
        };
        tempPoints[1] = {
          query: `${locs[0][0]},${locs[0][1]}`,
          coordinates: [locs[0][1], locs[0][0]],
        };
      }
      setRoutingPoints(tempPoints);
      // Perform reverse geocoding for any non-empty points
      locs.forEach(async (loc, index) => {
        if (loc.toString() !== [0, 0].toString()) {
          const res = await baatoService.reverseGeocode([loc[0], loc[1]]);
          tempPoints[index].query = res.data[0].name;
        }
      });
      setRoutingPoints(tempPoints);
      navigateToRoutingPoints();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToRoutingPoints = useCallback(() => {
    const latLng = routingPoints.map((a) => a.coordinates);
    const parsedPoints = latLng.map((a) => a && `${a[1]},${a[0]}`);
    const definedParsedPoints = parsedPoints.filter((a) => a).join(",");
    navigate({
      to: "/directions/$locations/$mode/$",
      params: {
        locations: definedParsedPoints || "empty",
        mode: modeOfTravel,
        _splat: params._splat,
      },
    });
  }, [routingPoints, modeOfTravel, navigate, params._splat]);

  useEffect(() => {
    const handleMapClick = async (e: MapLayerMouseEvent) => {
      const {
        lngLat: { lat, lng },
      } = e;
      // Find which point is empty and update it with the clicked location
      const firstEmptyPointIndex = routingPoints.findIndex(
        (point) => point.coordinates === null,
      );
      if (firstEmptyPointIndex === -1) {
        return;
      }

      const newPoints = [...routingPoints];
      newPoints[firstEmptyPointIndex]["query"] = `${lat.toFixed(
        4,
      )}, ${lng.toFixed(4)}`;
      setRoutingPoints(newPoints);
      const res = await baatoService.reverseGeocode([lat, lng]);
      const tempPoints = [...routingPoints];
      tempPoints[firstEmptyPointIndex]["query"] = res.data[0].name;
      tempPoints[firstEmptyPointIndex]["coordinates"] = [lng, lat];
      setRoutingPoints(tempPoints);
      navigateToRoutingPoints();
      return;
    };

    map?.on("click", handleMapClick);

    return () => {
      map?.off("click", handleMapClick);
    };
  }, [baatoService, dispatch, map, navigateToRoutingPoints, routingPoints]);

  useEffect(() => {
    navigate({
      to: "/directions/$locations/$mode/$",
      params: {
        locations: params.locations,
        mode: modeOfTravel,
        _splat: params._splat,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeOfTravel]);

  useEffect(() => {
    if (transitInstructions) {
      if (transitInstructions?.plan?.itineraries?.length) {
        // set map bounds to the first of the iteneraries geometry if iteneraries exists
        const { coordinates } = Polyline.toGeoJSON(
          transitInstructions.plan.itineraries[0].itineraryGeometry.points,
        );
        const corners = getCorners(coordinates);
        map?.fitBounds(corners, boundsPadding);
      }
      // add all available transit itineraries on the map as new layers
      transitInstructions?.plan?.itineraries?.forEach((itinerary, index) => {
        // setting pointer cursor on layer hover
        map?.on("mouseenter", `transitinstruction-${index}`, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map?.on("mouseleave", `transitinstruction-${index}`, () => {
          map.getCanvas().style.cursor = "";
        });
        // set clicked transit route as the active one
        map?.on("click", `transitinstruction-${index}`, (e) => {
          setActiveTransitRouteIndex(index);

          transitInstructions.plan.itineraries.forEach((_, i) => {
            map
              ?.getMap()
              .setPaintProperty(
                `transitinstruction-${i}`,
                "line-color",
                i === index ? ["get", "color"] : "#808080",
              );
          });
          fitMapToTransitInstructionBounds(index);
        });
      });
      if (transitInstructions?.plan?.itineraries?.length) {
        setActiveTransitRouteIndex(0);
      }
    }

    function fitMapToTransitInstructionBounds(transitInstructionIndex: number) {
      if (map?.getSource(`transitinstruction-${transitInstructionIndex}`)) {
        const { features } = map?.getSource(
          `transitinstruction-${transitInstructionIndex}`,
        )._data;
        const { itineraryBounds } = features[0].properties; // itinerarybounds is present in every itinerary leg feature as well.
        map?.fitBounds(itineraryBounds, boundsPadding);
      }
    }
  }, [boundsPadding, dispatch, map, transitInstructions]);

  useEffect(() => {
    if (routes) {
      setActiveRouteIndex(0);
      const bbox = turf.bbox(routes[0].geojson) as LngLatBoundsLike;
      map?.fitBounds(bbox, boundsPadding);
      routes.forEach((_, index) => {
        map?.on("mouseenter", `route-${index}`, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map?.on("mouseleave", `route-${index}`, () => {
          map.getCanvas().style.cursor = "";
        });
        map?.on("click", `route-${index}`, () => {
          setActiveRouteIndex(index);
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes]);

  const setOriginToUserLocation = useCallback(() => {
    if (userLocation) {
      const newRoutingPoints = [
        {
          query: "Your location",
          coordinates: [userLocation[1], userLocation[0]],
        },
        {
          query: "",
          coordinates: null,
        },
      ];
      setRoutingPoints(newRoutingPoints);
    }
  }, [userLocation]);

  const handleDirectionsClose = useCallback(() => {
    if (userLocation === null) {
      setRoutingPoints([
        {
          query: "",
          coordinates: null,
        },
        {
          query: "",
          coordinates: null,
        },
      ]);
    } else {
      setOriginToUserLocation();
    }
    navigate({
      from: "/directions/$locations/$mode/$",
      to: "/$",
      params: {
        _splat: params._splat,
      },
    });
  }, [navigate, params._splat, setOriginToUserLocation, userLocation]);

  const removeMarkerForDirections = (markerIndex: number) => {
    const newCurrentMarkers = [...currentMarkers];
    if (newCurrentMarkers[markerIndex]) {
      newCurrentMarkers[markerIndex].remove();
    }
    newCurrentMarkers.splice(markerIndex, 1);
    dispatch({
      type: "update_state",
      payload: {
        currentMarkers: newCurrentMarkers,
      },
    });
  };

  function onDragStart(markerIndex: number) {
    dispatch({
      type: "update_state",
      payload: {
        focussed: markerIndex,
      },
    });
  }

  async function onDragEnd({ lngLat }: MarkerDragEvent) {
    const newPoints = [...routingPoints];
    newPoints[focussed]["query"] = `${lngLat.lat.toFixed(
      4,
    )}, ${lngLat.lng.toFixed(4)}`;
    setRoutingPoints(newPoints);
    const res = await baatoService.reverseGeocode([lngLat.lat, lngLat.lng]);
    const tempPoints = [...routingPoints];
    tempPoints[focussed]["query"] = res.data[0].name;
    tempPoints[focussed]["coordinates"] = [lngLat.lng, lngLat.lat];
    setRoutingPoints(tempPoints);
    navigateToRoutingPoints();
  }

  return (
    <div className="fixed bottom-auto left-0 top-0 z-[15] h-auto w-[min(428px,100vw)] overflow-y-auto bg-white pt-2.5 md:bottom-0 md:h-screen">
      {routes?.[activeRouteIndex] &&
        !isDirectionsLoading &&
        routingPoints.every((routingPoint) => routingPoint.coordinates) &&
        routingPoints.map((routingPoint, index) => {
          const routingPointCoords = [
            routingPoint.coordinates[0],
            routingPoint.coordinates[1],
          ];
          const nearestPoint = [0, routingPoints.length - 1].includes(index)
            ? routes[activeRouteIndex]?.geojson.coordinates[
                index === routingPoints.length - 1
                  ? routes[activeRouteIndex]?.geojson.coordinates.length - 1
                  : 0
              ]
            : nearestPointOnLine(
                routes[activeRouteIndex].geojson,
                routingPointCoords,
              ).geometry.coordinates;

          return (
            <Source
              type="geojson"
              key={uid(routingPoint, index)}
              data={getLineArc(routingPointCoords, nearestPoint)}
            >
              <Layer id={uid(routingPoint, index)} {...dottedLayer} />
            </Source>
          );
        })}
      {routingPoints.map((point, index) => (
        <Fragment key={uid(point, index)}>
          {point.coordinates != null && (
            <DirectionMarker
              lat={point.coordinates[1]}
              lng={point.coordinates[0]}
              onDragStart={() => onDragStart(index)}
              onDragEnd={onDragEnd}
            />
          )}
        </Fragment>
      ))}
      {!isTransitMode &&
        routes?.map((route, index) => (
          <Fragment key={`route-${index}`}>
            <Source
              id={`route-${index}`}
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
                id={`route-${index}`}
                beforeId={
                  index !== 0 && index !== activeRouteIndex
                    ? `route-${index - 1}`
                    : "Poi-other"
                }
                type="line"
                layout={{
                  "line-join": "round",
                  "line-cap": "round",
                }}
                paint={{
                  "line-color": `${
                    index === activeRouteIndex ? "#2563eb" : "#cad8eb"
                  }`,
                  "line-width": 6,
                }}
              />
              <Layer
                id={`route-border-${index}`}
                beforeId={
                  index !== 0 && index !== activeRouteIndex
                    ? `route-border-${index - 1}`
                    : `route-${index}`
                }
                type="line"
                layout={{
                  "line-join": "round",
                  "line-cap": "round",
                }}
                paint={{
                  "line-color":
                    index === activeRouteIndex ? "#1e3a8a" : "#2563eb",
                  "line-width": 9,
                }}
              />
            </Source>
          </Fragment>
        ))}
      {isTransitMode &&
        transitInstructions?.plan?.itineraries?.map((itinerary, index) => {
          const legGeometry = itinerary.legs.map((leg, legindex) => {
            const legGeoJson = Polyline.toGeoJSON(leg.legGeometry.points);
            return {
              type: "Feature",
              properties: {
                itineraryBounds: itinerary.itineraryBounds,
                legBounds: leg.legBounds,
                color:
                  leg.mode === "WALK"
                    ? transitModeColorMap[leg.mode]
                    : transitModeColorMap[leg.agencyName],
              },
              geometry: legGeoJson,
            };
          });

          const legsAnchorPoints = itinerary.legs
            .map((leg) => {
              const legGeoJson = Polyline.toGeoJSON(leg.legGeometry.points);
              return getStartoftheLeg(legGeoJson), getEndoftheLeg(legGeoJson);
            })
            .flat(); // flatten the array to get geometry for each legs extremes individually

          return (
            <Fragment key={`transitinstruction-${index}`}>
              <Source
                id={`transitinstruction-${index}`}
                type="geojson"
                data={featureCollection(legGeometry)}
              >
                <Layer
                  id={`transitinstruction-${index}`}
                  beforeId={
                    index !== 0 && index !== activeTransitRouteIndex
                      ? `transitinstruction-${index - 1}`
                      : "Poi-other"
                  }
                  type="line"
                  source={`transitinstruction-${index}`}
                  layout={{
                    "line-join": "round",
                    "line-cap": "round",
                  }}
                  paint={{
                    "line-color":
                      index === activeTransitRouteIndex
                        ? ["get", "color"]
                        : "#808080",
                    "line-width": 5,
                  }}
                />
              </Source>
              {index === activeTransitRouteIndex &&
                legsAnchorPoints.map((legsAnchorPoint, legindex) => (
                  <Source
                    key={`anchors-${legindex}`}
                    id={`anchors-${legindex}`}
                    type="geojson"
                    data={legsAnchorPoint}
                  >
                    <Layer
                      id={`anchors-${legindex}`}
                      type="circle"
                      source={`anchors-${legindex}`}
                      paint={{
                        "circle-color": "#ffffff",
                        "circle-stroke-width": 1,
                        "circle-radius": 5,
                      }}
                    />
                  </Source>
                ))}
            </Fragment>
          );
        })}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex gap-2" style={{ marginLeft: "2rem" }}>
              {modeOfTravels.map((mode) => (
                <Tooltip key={uid(mode)}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full text-gray-500",
                        modeOfTravel === mode.value &&
                          "bg-blue-100 text-blue-500 hover:bg-blue-100 hover:text-blue-500",
                      )}
                      aria-label="set mode of travel for directions"
                      onClick={() => setModeOfTravel(mode.value)}
                    >
                      <mode.icon className="size-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{mode.tooltipTitle}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-full"
                variant="ghost"
                size="icon"
                aria-label="close menu"
                onClick={handleDirectionsClose}
              >
                {isDirectionsLoading || isTransitInstructionsLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <X className="size-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Close directions</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <DirectionsForm
          isTransitMode={isTransitMode}
          setSearchResults={setSearchResults}
          searchResults={searchResults}
          routingPoints={routingPoints}
          setRoutingPoints={setRoutingPoints}
          navigateToRoutingPoints={navigateToRoutingPoints}
        />
        <Separator />
        {!isTransitMode && !isSmallScreen && routes && (
          <RouteDetails
            modeOfTravel={modeOfTravel}
            setShowInstructions={setShowInstructions}
            activeRouteIndex={activeRouteIndex}
            setActiveRouteIndex={setActiveRouteIndex}
            routes={routes}
          />
        )}
        {isTransitMode && !isSmallScreen && (
          <TransitDetails
            modeOfTravel={modeOfTravel}
            setShowTransitInstructions={setShowTransitInstructions}
            transitInstructions={transitInstructions}
          />
        )}
        {showInstructions && (
          <RoutingInstructions
            instructions={routes[activeRouteIndex].instructionList}
            points={routingPoints}
            activeRoute={routes[activeRouteIndex]}
            setShowInstructions={setShowInstructions}
          />
        )}
        {showTransitInstructions && (
          <TransitInstructions
            instructions={
              transitInstructions.plan.itineraries[activeTransitRouteIndex]
            }
            setShowTransitInstructions={setShowTransitInstructions}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(Directions);
