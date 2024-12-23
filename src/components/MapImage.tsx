import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";

import { amenities, incidentReports } from "../config";

export function MapImage() {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map?.hasImage("selected-marker")) {
      map?.loadImage("/img/selected-marker.png").then(({ data }) => {
        if (!map?.hasImage("selected-marker"))
          map?.addImage("selected-marker", data);
      });
    }

    if (!map?.hasImage("jatra-marker")) {
      map?.loadImage("/img/jatra-marker.png").then(({ data }) => {
        if (!map?.hasImage("jatra-marker")) map?.addImage("jatra-marker", data);
      });
    }

    if (!map?.hasImage("jatra-food")) {
      map?.loadImage("/img/jatra-food.png").then(({ data }) => {
        if (!map?.hasImage("jatra-food")) map?.addImage("jatra-food", data);
      });
    }

    incidentReports.forEach((icon) => {
      if (!map?.hasImage(icon.label)) {
        map?.loadImage(icon.path).then(({ data }) => {
          if (!map?.hasImage(icon.label)) map?.addImage(icon.label, data);
        });
      }
    });

    amenities.forEach((amenity) => {
      if (!map?.hasImage(`marker-${amenity.value}`)) {
        map?.loadImage(amenity.iconPath).then(({ data }) => {
          if (!map?.hasImage(`marker-${amenity.value}`))
            map?.addImage(`marker-${amenity.value}`, data);
        });
      }
    });

    if (!map?.hasImage("marker-contribution")) {
      map?.loadImage("/img/map-marker.png").then(({ data }) => {
        if (!map?.hasImage("marker-contribution"))
          map?.addImage("marker-contribution", data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
