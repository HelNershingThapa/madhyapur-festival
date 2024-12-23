import { useCallback, useEffect } from "react";

import { useNavigate, useParams } from "@tanstack/react-router";

import "@/assets/styles/home.css";
import { IncidentReports } from "@/components/IncidentReports";
import { OpenMobileApp } from "@/components/OpenMobileApp";
import SignInPrompt from "@/components/SignInPrompt";
import { StylesHoverCard } from "@/components/StylesPopup";
import { useStateContext, useStateDispatchContext } from "@/StateContext";

function Home() {
  const state = useStateContext();
  const dispatch = useStateDispatchContext();
  const navigate = useNavigate();
  const params = useParams({ strict: false });

  const { lng, lat, zoom, userLocation, isDisplaySignInPrompt, routingPoints } =
    state;

  useEffect(() => {
    const newState = {};

    if (!("geolocation" in navigator)) {
      newState.userLocation = null;
    }

    dispatch({ type: "update_state", payload: newState });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userLocation) {
      const newRoutingPoints = [...routingPoints];
      newRoutingPoints[0].query = "Your location";
      newRoutingPoints[0].value = {
        centroid: {
          lat: userLocation[0],
          lon: userLocation[1],
        },
      };
      dispatch({
        type: "routing_points_changed",
        payload: {
          newPoints: newRoutingPoints,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  window.addEventListener(
    "beforeunload",
    function () {
      window.localStorage.setItem(
        "lastSessionLocation",
        `@map=${zoom}/${lat}/${lng}`,
      );
    },
    false,
  );

  const setDestination = useCallback(
    (placeInfo) => {
      const newPoints = [...routingPoints];
      newPoints[1]["query"] = placeInfo.name;
      newPoints[1]["value"] = placeInfo;
      dispatch({
        type: "routing_points_changed",
        payload: {
          newPoints,
        },
      });
      const latLng = newPoints.map((a) => a.value?.centroid);
      const parsedPoints = latLng.map((a) => a && `${a?.lat},${a?.lon}`);
      let definedParsedPoints = parsedPoints.filter((a) => a).join(",");
      if (routingPoints[0].query !== "Your location") {
        definedParsedPoints = ",," + definedParsedPoints;
      }
      navigate({
        to: "/directions/$locations/$mode/$",
        params: {
          locations: definedParsedPoints,
          mode: "foot",
          _splat: params._splat,
        },
      });
    },
    [dispatch, navigate, params, routingPoints],
  );

  return (
    <>
      <IncidentReports />
      <StylesHoverCard />
      {isDisplaySignInPrompt && <SignInPrompt />}
      <OpenMobileApp />
    </>
  );
}

export default Home;
