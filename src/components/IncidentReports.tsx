import React, { useEffect } from "react";
import {
  Layer,
  MapLayerMouseEvent,
  Popup,
  Source,
  SymbolLayer,
  useMap,
} from "react-map-gl/maplibre";

import { useQuery } from "@tanstack/react-query";
import { formatDistance } from "date-fns";
import { collection, getDocs, query } from "firebase/firestore";
import GeoJSON from "geojson";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { db } from "@/firebase-config";
import { useStateContext } from "@/StateContext";
import { Report } from "@/types/place";

const getContributions = async () => {
  const docRef = query(collection(db, "RealTimeContributions"));
  const querySnapshot = await getDocs(docRef);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Report,
  );
};

export function IncidentReports() {
  const state = useStateContext();
  const { current: map } = useMap();
  const [popupInfo, setPopupInfo] = React.useState<Report | null>(null);
  const { isLoading, data: contributions } = useQuery({
    queryKey: ["realtime-contributions"],
    queryFn: getContributions,
  });

  const { selectedIncidentTypes } = state;

  useEffect(() => {
    map?.on("click", "contributions", (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (feature) {
        const selectedContribution = contributions?.find(
          (contribution) => contribution.id === feature.properties.id,
        );
        if (selectedContribution) {
          setPopupInfo(selectedContribution);
        }
      }
    });
  }, [contributions, map]);

  if (isLoading) return null;

  const contributionsIconLayer: SymbolLayer = {
    id: "contributions",
    type: "symbol",
    source: "contributions",
    layout: {
      "icon-image": ["get", "reportItemType"],
      "icon-size": 0.1,
      "icon-allow-overlap": true,
    },
    minzoom: 13,
    filter: ["in", "reportItemType", ...selectedIncidentTypes],
  };

  const geojson =
    contributions &&
    GeoJSON.parse(contributions, {
      Point: ["latLng._lat", "latLng._long"],
    });

  return (
    <>
      <Source id="contributions" type="geojson" data={geojson}>
        <Layer {...contributionsIconLayer} />
      </Source>
      {popupInfo && (
        <Popup
          anchor="top"
          longitude={popupInfo.latLng.latitude}
          latitude={popupInfo.latLng.longitude}
          onClose={() => setPopupInfo(null)}
        >
          <div className="flex items-center gap-2">
            <div className="font-semibold">{popupInfo.reportType}</div>
            <div className="flex items-center">
              <ThumbsUp className="mr-[0.2rem] size-4 text-success" />
              {popupInfo.upVotes}
            </div>
            <div className="flex items-center">
              <ThumbsDown className="mr-[0.2rem] size-4 text-destructive" />
              {popupInfo.downVotes}
            </div>
          </div>
          <div className="text-[#4b5563]">{popupInfo.reportItemType}</div>
          <div className="text-[11px] leading-[1.6] text-[#374151]">
            {popupInfo.address}
          </div>
          <div className="text-[11px] leading-[1.6] text-[#374151]">
            {formatDistance(new Date(popupInfo.createdAt), new Date(), {
              addSuffix: true,
            })}
          </div>
        </Popup>
      )}
    </>
  );
}
