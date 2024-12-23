import { createContext, useContext, useReducer } from "react";

export type StateContextType = typeof initialState;

export const StateContext = createContext<StateContextType | null>(null);
export const StateDispatchContext = createContext(null);

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <StateDispatchContext.Provider value={dispatch}>
        {children}
      </StateDispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useStateContext() {
  return useContext(StateContext);
}

export function useStateDispatchContext() {
  return useContext(StateDispatchContext);
}

function reducer(state: StateContextType, action) {
  switch (action.type) {
    case "update_state":
      return { ...state, ...action.payload };
    case "search_query_cleared":
      return {
        ...state,
        searchQuery: "",
        isClearSearchShown: false,
        pois: [],
      };
    case "search_results_cleared":
      return {
        ...state,
        searchQuery: "",
        isClearSearchShown: false,
        pois: [],
      };
    case "waypoints_order_changed":
      return {
        ...state,
        routingPoints: action.payload.newRoutingPoints,
        currentMarkers: action.payload.newCurrentMarkers,
      };
    case "focussed_changed":
      return {
        ...state,
        focussed: action.payload.newIndex,
      };
    case "routing_points_changed":
      return {
        ...state,
        routingPoints: action.payload.newPoints,
      };
    case "nearby_poi_clicked":
      return {
        ...state,
        drawerOpen: true,
      };
    case "contribution_list_item_clicked":
      return {
        ...state,
        contributionPlaceId: action.payload.placeId,
      };
    case "active_transit_instruction_changed":
      return {
        ...state,
        activeTransitInstruction: action.payload.newIndex,
      };
    case "update_login_status":
      return {
        ...state,
        isLoggedIn: action.payload.isUserLoggedIn,
      };
    case "toggle_mapillary_overlay":
      return {
        ...state,
        isMapillaryEnabled: !state.isMapillaryEnabled,
      };
    case "update_selected_incident_types":
      return {
        ...state,
        selectedIncidentTypes: action.payload.selectedIncidentTypes,
      };
    default:
      throw Error("Invalid action received");
  }
}

const initialState = {
  lng: 85.3217,
  lat: 27.6996,
  zoom: 12.5,
  mapStyle: `https://tileboundaries.baato.io/admin_boundary/breeze.json?key=${import.meta.env.VITE_BAATO_ACCESS_TOKEN}`,
  searchQuery: "",
  isClearSearchShown: false,
  isDirectionsLoading: false,
  userLocation: null,
  nearbyLoading: false,
  activeTransitInstruction: 0,
  pois: [],
  isAddMissingDialogOpen: false,
  isReportIncidentDialogOpen: false,
  isLoggedIn: false,
  isDisplaySignInPrompt: false,
  drawerOpen: false,
  // REFS
  routingPoints: [
    {
      query: "",
      value: null,
    },
    {
      query: "",
      value: null,
    },
  ],
  routes: [],
  transitInstructions: {},
  marker: null,
  currentMarkers: [],
  focussed: null,
  contributionPlaceId: null,
  isContributionsLoading: false,
  isMapillaryEnabled: false,
  selectedFeature: null,
  selectedIncidentTypes: [],
};
