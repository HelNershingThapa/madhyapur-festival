import { Viewer } from "mapillary-js";
import React, { useEffect, useRef, useState } from "react";
import { Marker, useMap, Source, Layer } from "react-map-gl/maplibre";
import "mapillary-js/dist/mapillary.css";

const accessToken = "MLY|4142433049200173|72206abe5035850d6743b23a49c41333";

export function MapillaryCompo({ imageId }) {
  const { current: map } = useMap();
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const activeImagesRef = useRef(null);
  const activeSequenceIdRef = useRef(null);
  const [cameraCoordinates, setCameraCoordinates] = useState(null);
  const svgRef = useRef(null); // Create a ref for the SVG element

  useEffect(() => {
    viewerRef.current = new Viewer({
      accessToken: accessToken,
      container: containerRef.current,
    });

    viewerRef.current.on("image", (event) => onImage(event.image));
    viewerRef.current.on("pov", onPov);
    viewerRef.current.on("fov", onFov);

    return () => {
      if (viewerRef.current) {
        viewerRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    imageId && viewerRef.current.moveTo(imageId);
  }, [imageId]);

  const onImage = (image) => {
    // document.getElementById("mapillaryWindowLoader").style.display = "none";

    const lngLat = [image.lngLat.lng, image.lngLat.lat];

    map.flyTo({ center: lngLat });

    const originalPos = [image.originalLngLat.lng, image.originalLngLat.lat];
    setCameraCoordinates(originalPos);

    if (activeSequenceIdRef.current !== image.sequenceId) {
      if (activeSequenceIdRef.current) {
        activeImagesRef.current.forEach((feature) => {
          map.setFeatureState(
            {
              id: feature.id,
              source: "mapillaryImages",
              sourceLayer: "image",
            },
            {
              selected: false,
            },
          );
        });

        map.setFeatureState(
          {
            id: activeSequenceIdRef.current,
            source: "mapillarySequences",
            sourceLayer: "sequence",
          },
          {
            selected: false,
          },
        );
      }
    }
    activeSequenceIdRef.current = image.sequenceId;

    const activeImagesTemp = map.querySourceFeatures("mapillaryImages", {
      filter: ["==", "sequence_id", image.sequenceId],
      sourceLayer: "image",
    });
    activeImagesRef.current = activeImagesTemp;
    activeImagesTemp.forEach((feature) => {
      map.setFeatureState(
        {
          id: feature.id,
          source: "mapillaryImages",
          sourceLayer: "image",
        },
        {
          selected: true,
        },
      );
    });

    map.setFeatureState(
      {
        id: image.sequenceId,
        source: "mapillarySequences",
        sourceLayer: "sequence",
      },
      {
        selected: true,
      },
    );
  };

  const pathData = makeArc(90);
  const rotationStyle = { transform: rotateArc(0) }; // Assuming rotateArc is available in the scope

  const onFov = async () => {
    const viewerContainer = viewerRef.current.getContainer(); // Use viewerRef to get the container
    const height = viewerContainer.offsetHeight;
    const width = viewerContainer.offsetWidth;
    const aspect = height === 0 ? 0 : width / height;

    const verticalFov = DEG2RAD * (await viewerRef.current.getFieldOfView());
    const horizontalFov =
      RAD2DEG * Math.atan(aspect * Math.tan(0.5 * verticalFov)) * 2;

    if (svgRef.current) {
      const path = svgRef.current.querySelector("path"); // Use ref to access the path
      path.setAttribute("d", makeArc(horizontalFov));
    }
  };

  const onPov = async () => {
    const pov = await viewerRef.current.getPointOfView(); // Use viewerRef to get the POV
    if (svgRef.current) {
      svgRef.current.style.transform = rotateArc(pov.bearing); // Use ref to access the SVG
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          zIndex: 1,
          left: "100px",
          bottom: "20px",
          width: "400px",
          height: "220px",
        }}
      />
      <Source
        id="mapillaryImages"
        type="vector"
        tiles={[
          "https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token=MLY|4142433049200173|72206abe5035850d6743b23a49c41333",
        ]}
        minzoom={6}
        maxzoom={14}
        promoteId={{ image: "id" }}
      >
        <Layer
          id="mapillary-images"
          type="circle"
          source="mapillaryImages"
          source-layer="image"
          paint={{
            "circle-radius": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              7,
              6,
            ],
            "circle-opacity": 1,
            "circle-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#00bcff",
              "#05CB63",
            ],
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              3,
              0,
            ],
          }}
        />
        <Layer
          id="mapillary-images-360"
          type="circle"
          source="mapillaryImages"
          source-layer="image"
          paint={{
            "circle-radius": 20,
            "circle-opacity": 0.4,
            "circle-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#00bcff",
              "#05CB63",
            ],
          }}
          beforeId="mapillary-images"
        />
      </Source>
      <Source
        id="mapillarySequences"
        type="vector"
        tiles={[
          "https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token=MLY|4142433049200173|72206abe5035850d6743b23a49c41333",
        ]}
        minzoom={6}
        maxzoom={14}
        promoteId={{ sequence: "id" }}
      >
        <Layer
          id="mapillary-sequence"
          type="line"
          source-layer="sequence"
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
          paint={{
            "line-opacity": 0.6,
            "line-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#00bcff",
              "#05CB63",
            ],
            "line-width": 2,
          }}
          beforeId="Poi-other"
        />
      </Source>
      {cameraCoordinates && (
        <>
          {/* Camera Marker */}
          <Marker
            rotationAlignment="map"
            latitude={cameraCoordinates[1]}
            longitude={cameraCoordinates[0]}
          >
            <div style={{ height: "60px", width: "60px" }}>
              <svg
                ref={svgRef} // Attach the ref to the SVG element
                viewBox="0 0 100 100"
                style={{ height: "100%", width: "100%", ...rotationStyle }}
              >
                <path d={pathData} fill="#ffc01b" />
              </svg>
            </div>
          </Marker>
          {/* Active image marker */}
          <Marker
            rotationAlignment="map"
            latitude={cameraCoordinates[1]}
            longitude={cameraCoordinates[0]}
          >
            <div
              style={{
                border: `2px solid #fff`,
                backgroundColor: "#ff861b",
                height: "18px",
                borderWidth: "3px",
                borderRadius: "50%",
                width: "18px",
                zIndex: "5",
              }}
            />
          </Marker>
        </>
      )}
    </>
  );
}

function rotateArc(bearing) {
  return `rotateZ(${bearing}deg)`;
}

// Helper Functions
const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

function makeArc(fov) {
  const radius = 45;
  const centerX = 50;
  const centerY = 50;

  const fovRad = DEG2RAD * fov;

  const arcStart = -Math.PI / 2 - fovRad / 2;
  const arcEnd = arcStart + fovRad;

  const startX = centerX + radius * Math.cos(arcStart);
  const startY = centerY + radius * Math.sin(arcStart);

  const endX = centerX + radius * Math.cos(arcEnd);
  const endY = centerY + radius * Math.sin(arcEnd);

  const center = `M ${centerX} ${centerY}`;
  const line = `L ${startX} ${startY}`;
  const arc = `A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;

  return `${center} ${line} ${arc} Z`;
}
