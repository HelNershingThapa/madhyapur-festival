import Baato from "@baatomaps/baato-js-client";
import axios from "axios";

import {
  DirectionsMode,
  NearbyResponse,
  Place,
  ReverseGeocodingResult,
  Route,
} from "@/types/baato";
import type { RoutingPoint } from "@/types/miscellaneous";
import { SearchPlace } from "@/types/place";

const baatoToken = import.meta.env.VITE_BAATO_ACCESS_TOKEN;

class BaatoService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = baatoToken;
  }

  async reverseGeocode(coordinates) {
    try {
      const response = await new Baato.Reverse()
        .setBaseUrl(this.baseUrl)
        .setKey(this.token)
        .setCoordinates(coordinates)
        .setRadius(0.05)
        .doRequest();

      return response as ReverseGeocodingResult;
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
      throw error; // Re-throw the error to be caught by the component
    }
  }

  async places(placeId: number | string) {
    try {
      const response = await new Baato.Places()
        .setBaseUrl(import.meta.env.VITE_BAATO_API_URL) // Baato base URL
        .setPlaceId(placeId) // PlaceId for the place to search
        .setKey(this.token) // your Baato access key
        .doRequest();

      const place = response.data[0] as Place;
      const tags = Object.fromEntries(place.tags.map((tag) => tag.split("|")));
      place.tags = tags;
      return place;
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
      throw error; // Re-throw the error to be caught by the component
    }
  }

  async nearby(type, coordinates) {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BAATO_API_URL}/v1/search/nearby`,
        {
          params: {
            key: this.token,
            lat: coordinates[0],
            lon: coordinates[1],
            type,
            radius: 2,
            limit: 7,
            sortBy: "distance",
          },
        },
      );
      return response.data as NearbyResponse;
    } catch (error) {
      console.error("Error during nearby:", error);
      throw error; // Re-throw the error to be caught by the component
    }
  }

  async search(query: string) {
    try {
      const response = await new Baato.Search()
        .setApiVersion("1.0") // default
        .setBaseUrl(import.meta.env.VITE_BAATO_API_URL) // detault Baato base URL
        .setKey(baatoToken)
        .setQuery(query) // string query to search for
        .setLimit(5) // limit the number of responses
        .doRequest();

      return response.data as SearchPlace[];
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
      throw error; // Re-throw the error to be caught by the component
    }
  }

  async routing(routingPoints: RoutingPoint[], modeOfTravel: DirectionsMode) {
    try {
      const latLng = routingPoints.map((a) => a.coordinates);
      const parsedPoints = latLng.map((a) => `${a[1]},${a[0]}`);
      const response = await new Baato.Routing()
        .setKey(this.token)
        .setApiVersion("1.0") // default
        .setBaseUrl(this.baseUrl) // detault Baato base URL
        .addPoints(parsedPoints) // points for which route is to be calculated
        .setVehicle(modeOfTravel) // one of car, bike, or foot
        .getAlternatives(routingPoints.length === 2) // showing alternative routes for only two points
        .hasInstructions(true)
        .doRequest();

      return response as Route[];
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
      throw error; // Re-throw the error to be caught by the component
    }
  }

  async transit(routingPoints) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_TRANSIT_API_URL}/otp/routers/default/plan?` +
          new URLSearchParams({
            // see http://dev.opentripplanner.org/apidoc/1.0.0/resource_PlannerResource.html for transit plan parameters
            mode: "TRANSIT,WALK",
            fromPlace: `${routingPoints[0].coordinates[1]},${routingPoints[0].coordinates[0]}`,
            toPlace: `${routingPoints[1].coordinates[1]},${routingPoints[1].coordinates[0]}`,
            numItineraries: 3,
            maxTransfers: 3,
            maxWalkDistance: "1000",
          }),
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
      throw error; // Re-throw the error to be caught by the component
    }
  }
}

export default BaatoService;
