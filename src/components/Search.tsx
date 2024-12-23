import * as React from "react";
import { useMap } from "react-map-gl/maplibre";
import { uid } from "react-uid";

import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Clock4, Loader2, MapPin, Menu, X } from "lucide-react";

import { AppDrawer } from "@/components/AppBar";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { auth } from "@/firebase-config";
import { cn } from "@/lib/utils";
import { StateContext, StateDispatchContext } from "@/StateContext";
import { SearchPlace } from "@/types/place";
import BaatoService from "@/utils/baatoService";

// TODO - some implementation using usemediaquery to toggle drawer

export function Search() {
  const { current: map } = useMap();
  const inputBaseRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const baatoService = new BaatoService(import.meta.env.VITE_BAATO_API_URL);
  const params = useParams({ strict: false });
  const state = React.useContext(StateContext);
  const dispatch = React.useContext(StateDispatchContext);
  const [focussed, setFocussed] = React.useState(false);
  const {
    searchQuery,
    isInputBaseLoading,
    nearbyLoading,
    isClearSearchShown,
    isContributionsLoading,
    routingPoints,
    selectedFeature,
  } = state;

  const [query, setQuery] = React.useState("");
  const [isAppDrawerOpen, setIsAppDrawerOpen] = React.useState(false);
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => await baatoService.search(query),
    enabled: query.length > 0,
  });

  const initialDirectionsNavigate = React.useCallback(() => {
    let latLng = routingPoints.map((a) => a.value?.centroid);
    const parsedPoints = latLng.map((a) => a && `${a?.lat},${a?.lon}`);
    const definedParsedPoints = parsedPoints.filter((a) => a).join(",");
    navigate({
      to: "/directions/$locations/$mode/$",
      params: {
        locations: definedParsedPoints || "empty",
        mode: "foot",
        _splat: params._splat,
      },
      state: {
        notFromUrl: true,
      },
    });
  }, [navigate, params, routingPoints]);

  const removeFeatureFilter = () => {
    if (selectedFeature === null) return;
    const featureId = selectedFeature.id;
    const layerId = selectedFeature.layer.id;
    const currentFilter = map?.getFilter(layerId);
    map?.getMap().setFeatureState(
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

    map?.getMap().setFilter(layerId, newFilter);
    dispatch({
      type: "update_state",
      payload: {
        selectedFeature: null,
      },
    });
  };

  const onSearchResultSelect = async (result: SearchPlace) => {
    let recentSearches = JSON.parse(localStorage.getItem("recent")) || [];
    if (recentSearches.some((e) => e.placeId === result.placeId)) {
      recentSearches = recentSearches.filter(
        (item) => item.placeId !== result.placeId,
      );
    }
    navigate({
      to: "/places/$placeId",
      params: {
        placeId: result.placeId,
      },
    });
    setQuery("");
    recentSearches.unshift(result);
    recentSearches.splice(5, 1);
    localStorage.setItem("recent", JSON.stringify(recentSearches));
  };

  const handleInputChange = (search: string) => {
    setQuery(search);
    if (search === "") {
      dispatch({
        type: "search_query_cleared",
      });
      return;
    }
    dispatch({
      type: "update_state",
      payload: {
        searchQuery: search,
      },
    });
  };

  const clearSearchResults = () => {
    dispatch({
      type: "search_results_cleared",
    });
    removeFeatureFilter();
    inputBaseRef.current?.focus();
    navigate({
      to: "/$",
      params: {
        _splat: params._splat,
      },
    });
  };

  const listItems =
    query === ""
      ? (JSON.parse(localStorage.getItem("recent") ?? "[]") as SearchPlace[])
      : searchResults;

  const renderActionButton = () => {
    if (nearbyLoading || isContributionsLoading || isLoading) {
      return (
        <Button variant="unstyledGhost" size="icon">
          <Loader2 className="size-5 animate-spin" />
        </Button>
      );
    }

    if (
      params.placeId ||
      params.osmId ||
      isClearSearchShown ||
      searchQuery ||
      location.pathname.startsWith("/contributions")
    ) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="unstyledGhost"
              size="icon"
              onClick={clearSearchResults}
            >
              <X className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear search</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="group"
            variant="unstyledGhost"
            size="icon"
            aria-label="directions"
            onClick={initialDirectionsNavigate}
          >
            <Icons.directions className="fill-blue-500 group-hover:fill-blue-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Directions</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const handleAddMissingPlaceClick = () => {
    setIsAppDrawerOpen(false);
    if (!auth.currentUser) {
      dispatch({
        type: "update_state",
        payload: {
          isDisplaySignInPrompt: true,
        },
      });
      return;
    }
    dispatch({
      type: "update_state",
      payload: {
        isAddMissingDialogOpen: true,
      },
    });
  };

  return (
    <div
      className="relative"
      style={{ width: "min(410px, calc(100vw - 12px))" }}
    >
      <Command className="absolute h-max shadow-xl" shouldFilter={false}>
        <div className="relative">
          <CommandInput
            ref={inputBaseRef}
            className="px-9"
            placeholder="Search Baato Maps..."
            value={searchQuery || ""}
            onValueChange={handleInputChange}
            onFocus={() => setFocussed(true)}
            onBlur={() => setFocussed(false)}
          />
          <div className="absolute left-1 top-0.5">
            <Button
              variant="ghost"
              aria-label="menu"
              size="icon"
              onClick={() => {
                setIsAppDrawerOpen(true);
              }}
            >
              <Menu className="size-5" />
            </Button>
          </div>
          <div className="absolute bottom-0 right-1 top-0 z-50 flex h-full items-center py-2">
            <Separator orientation="vertical" />
            {renderActionButton()}
          </div>
        </div>
        <CommandList className={cn("py-2", !focussed && "hidden")}>
          {searchQuery && searchResults?.length === 0 && (
            <CommandEmpty
              onClick={handleAddMissingPlaceClick}
              className="flex gap-4 py-2.5 pl-3"
            >
              <MapPin className="size-5" />
              Add a missing place
            </CommandEmpty>
          )}
          {listItems?.map((result) => (
            <CommandItem
              key={uid(result)}
              className="flex gap-4 py-2.5 pl-3"
              onSelect={() => onSearchResultSelect(result)}
            >
              {!searchQuery ? (
                <Clock4 className="size-5" />
              ) : result.type === "administrative" ? (
                <Icons.borderInner className="size-5" />
              ) : (
                <MapPin className="size-5" />
              )}
              <div>
                <span>{result.name}</span>
                <span className="text-muted-foreground">
                  &nbsp;{result.address}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
      <AppDrawer
        isAppDrawerOpen={isAppDrawerOpen}
        setIsAppDrawerOpen={setIsAppDrawerOpen}
      />
    </div>
  );
}
