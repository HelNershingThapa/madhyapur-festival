import { useRef } from "react";
import { uid } from "react-uid";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { CirclePlus, CircleX, GripVertical, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStateContext, useStateDispatchContext } from "@/StateContext";
import type { RoutingPoint } from "@/types/miscellaneous";
import { SearchPlace } from "@/types/place";
import BaatoService from "@/utils/baatoService";

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

type DirectionsFormProps = {
  isTransitMode: boolean;
  routingPoints: RoutingPoint[];
  setRoutingPoints: React.Dispatch<React.SetStateAction<RoutingPoint[]>>;
  setSearchResults: React.Dispatch<React.SetStateAction<SearchPlace[] | null>>;
  searchResults: SearchPlace[] | null;
  navigateToRoutingPoints: () => void;
};

function DirectionsForm({
  isTransitMode,
  setSearchResults,
  searchResults,
  routingPoints,
  setRoutingPoints,
  navigateToRoutingPoints,
}: DirectionsFormProps) {
  const state = useStateContext();
  const dispatch = useStateDispatchContext();
  const myRefs = useRef<HTMLInputElement[]>([]);
  const baatoService = new BaatoService(import.meta.env.VITE_BAATO_API_URL);
  const { currentMarkers, focussed } = state;

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const newItems = reorder(
      routingPoints,
      result.source.index,
      result.destination.index,
    );
    const newMarkers = reorder(
      currentMarkers,
      result.source.index,
      result.destination.index,
    );
    setRoutingPoints(newItems);
    dispatch({
      type: "waypoints_order_changed",
      payload: {
        newRoutingPoints: newItems,
        newCurrentMarkers: newMarkers,
      },
    });
  };

  const getItemStyle = (draggableStyle) => ({
    userSelect: "none",
    display: "flex",
    alignItems: "center",
    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const firstEmptyPointIndex = routingPoints.findIndex(
    (point) => point.coordinates === null,
  );

  const handleQueryChange = async (query: string, index: number) => {
    const newPoints = [...routingPoints];
    if (query === "") {
      newPoints[index]["query"] = "";
      newPoints[index]["coordinates"] = null;
      setRoutingPoints(newPoints);
      navigateToRoutingPoints();
      return;
    }

    newPoints[index]["query"] = query;
    setRoutingPoints(newPoints);
    navigateToRoutingPoints();
    const res = await baatoService.search(query);
    setSearchResults(res);
  };

  const handleSearchResultSelect = async (result: SearchPlace) => {
    const newPoints = [...routingPoints];
    newPoints[focussed]["query"] = result.name;
    const res = await baatoService.places(result.placeId);
    newPoints[focussed]["coordinates"] = [res.centroid.lon, res.centroid.lat];
    setRoutingPoints(newPoints);
    navigateToRoutingPoints();
  };

  const addFormFields = () => {
    setRoutingPoints([...routingPoints, { query: "", coordinates: null }]);
  };

  const removeFormField = (index: number) => {
    const newPoints = [...routingPoints];
    newPoints.splice(index, 1);
    setRoutingPoints(newPoints);
    navigateToRoutingPoints();
  };

  const doesValueExist = () => {
    if (
      routingPoints.filter((e) => e.coordinates && e.coordinates).length > 1 &&
      routingPoints.every((routingPoint) => routingPoint.coordinates)
    ) {
      return true;
    }
    return false;
  };

  return (
    <div className="pb-1 pl-1 pr-2 pt-2 shadow-sm sm:pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" direction="vertical">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col gap-2"
            >
              {routingPoints.map((routingPoint, index) => {
                return (
                  <Draggable
                    key={uid(routingPoint, index)}
                    draggableId={`draggable-${index}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        className="flex items-center gap-1.5 hover:cursor-grab"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        // style={getItemStyle(
                        //   snapshot.isDragging,
                        //   provided.draggableProps.style,
                        // )}
                      >
                        <GripVertical className="size-5 shrink-0" />
                        <Command
                          className="rounded-lg border"
                          shouldFilter={false}
                        >
                          <CommandInput
                            ref={(el) => el && (myRefs.current[index] = el)}
                            searchIconClassName="hidden"
                            placeholder={`${
                              index === 0
                                ? `Set Origin${
                                    firstEmptyPointIndex === index
                                      ? ", or click on the map"
                                      : ""
                                  }`
                                : `Set destination${
                                    firstEmptyPointIndex === index
                                      ? ", or click on the map"
                                      : ""
                                  }`
                            }`}
                            onFocus={() =>
                              dispatch({
                                type: "focussed_changed",
                                payload: {
                                  newIndex: index,
                                },
                              })
                            }
                            onBlur={() =>
                              dispatch({
                                type: "focussed_changed",
                                payload: {
                                  newIndex: null,
                                },
                              })
                            }
                            value={routingPoint.query}
                            onValueChange={(query) =>
                              handleQueryChange(query, index)
                            }
                          />
                          <CommandList
                            hidden={focussed !== index}
                            className="py-2"
                          >
                            {searchResults?.map((result) => (
                              <CommandItem
                                key={uid(result)}
                                className="flex gap-4 py-2.5 pl-3"
                                onSelect={() =>
                                  handleSearchResultSelect(result)
                                }
                              >
                                <MapPin className="size-5" />
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
                        {routingPoints.length > 2 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="unstyledGhost"
                                size="icon"
                                onClick={() => removeFormField(index)}
                              >
                                <CircleX className="size-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start">
                              <p>
                                {index === 0
                                  ? "Remove starting point"
                                  : "Remove this destination"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {doesValueExist() && !isTransitMode && (
        <Button
          variant="ghost"
          className="mt-2 pl-0"
          onClick={() => addFormFields()}
        >
          <CirclePlus className="size-5" />
          Add points
        </Button>
      )}
      {isTransitMode && (
        <Button variant="ghost" className="mt-2.5 text-primary">
          Route Options
        </Button>
      )}
    </div>
  );
}

export default DirectionsForm;
