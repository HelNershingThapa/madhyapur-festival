import { Coffee, Hospital, Hotel, School, Utensils } from "lucide-react";

export const incidentReports = [
  {
    label: "Crash",
    path: "/img/contributions/Accident.png",
  },
  {
    label: "Pothole",
    path: "/img/contributions/Pothole.png",
  },
  {
    label: "Major Crash",
    path: "/img/contributions/Major Accident.png",
  },
  {
    label: "Minor Crash",
    path: "/img/contributions/Minor Accident.png",
  },
  {
    label: "Flood",
    path: "/img/contributions/Flood.png",
  },
  {
    label: "Landslide",
    path: "/img/contributions/Landslide.png",
  },
  {
    label: "Slippery Road",
    path: "/img/contributions/Slippery Road.png",
  },
  {
    label: "Turn Restriction",
    path: "/img/contributions/Turn Restriction.png",
  },
  {
    label: "Trace Road",
    path: "/img/contributions/Road Trace.png",
  },
  {
    label: "No Left Turn",
    path: "/img/contributions/Left TurnRestriction.png",
  },
  {
    label: "No Right Turn",
    path: "/img/contributions/Right Turn Restriction.png",
  },
  {
    label: "No U Turn",
    path: "/img/contributions/Turn Restriction-1.png",
  },
  {
    label: "Light",
    path: "/img/contributions/Light Traffic.png",
  },
  {
    label: "Moderate",
    path: "/img/contributions/Moderate Traffic.png",
  },
  {
    label: "Heavy",
    path: "/img/contributions/Major Traffic.png",
  },
  {
    label: "Festival",
    path: "/img/contributions/Festival.png",
  },
  {
    label: "Demonstration",
    path: "/img/contributions/Obstruction.png",
  },
  {
    label: "Construction",
    path: "/img/contributions/Road Construction.png",
  },
  {
    label: "Laser Speed Gun",
    path: "/img/contributions/Laser Speed Gun.png",
  },
  {
    label: "Static Camera",
    path: "/img/contributions/Speed Camera.png",
  },
  {
    label: "Dirt Road",
    path: "/img/contributions/Dirt Road.png",
  },
  {
    label: "Some Potholes",
    path: "/img/contributions/Some Potholes.png",
  },
  {
    label: "Lots of Potholes",
    path: "/img/contributions/Lots of Potholes.png",
  },
  {
    label: "Smooth Paved Road",
    path: "/img/contributions/Smooth Paved Road.png",
  },
];

export const incidents = [
  {
    label: "Disaster",
    path: "/img/contributions/Natural Disaster.png",
    categories: [
      {
        label: "Flood",
      },
      {
        label: "Landslide",
      },
      {
        label: "Slippery Road",
        path: "/img/contributions/Slippery Road.png",
      },
    ],
  },
  {
    label: "Police",
    path: "/img/contributions/Police.png",
    categories: [],
  },
  {
    label: "Road Hazard",
    path: "/img/contributions/Road Hazard.png",
    categories: [
      {
        label: "Pothole",
        path: "/img/contributions/Pothole.png",
      },
      {
        label: "Crash",
        path: "/img/contributions/Accident.png",
      },
    ],
  },
  {
    label: "Speed Camera",
    path: "/img/contributions/Speed Camera.png",
    categories: [
      {
        label: "Laser Speed Gun",
        path: "/img/contributions/Laser Speed Gun.png",
      },
      {
        label: "Static Camera",
        path: "/img/contributions/Speed Camera.png",
      },
    ],
  },
  {
    label: "Road Obstruction",
    path: "/img/contributions/Road Obstruction.png",
    categories: [
      {
        label: "Festival",
        path: "/img/contributions/Festival.png",
      },
      {
        label: "Demonstration",
        path: "/img/contributions/Obstruction.png",
      },
      {
        label: "Construction",
        path: "/img/contributions/Road Construction.png",
      },
    ],
  },
  {
    label: "Traffic",
    path: "/img/contributions/Major Traffic.png",
    categories: [
      {
        label: "Light",
        path: "/img/contributions/Light Traffic.png",
      },
      {
        label: "Moderate",
        path: "/img/contributions/Moderate Traffic.png",
      },
      {
        label: "Heavy",
        path: "/img/contributions/Major Traffic.png",
      },
    ],
  },
  {
    label: "Road Condition",
    path: "/img/contributions/Road Condition.png",
    categories: [
      {
        label: "Dirt Road",
        path: "/img/contributions/Dirt Road.png",
      },
      {
        label: "Smooth Paved Road",
        path: "/img/contributions/Smooth Paved Road.png",
      },
    ],
  },
  {
    label: "Map Issue",
    path: "/img/contributions/Map Issue.png",
    categories: [
      {
        label: "Turn Restriction",
        path: "/img/contributions/Turn Restriction.png",
      },
      {
        label: "Trace Road",
        path: "/img/contributions/Road Trace.png",
      },
    ],
  },
];

export const amenities = [
  {
    label: "Schools",
    value: "school",
    icon: School,
    iconPath: "/img/school.png",
  },
  {
    label: "Restaurants",
    value: "restaurant",
    icon: Utensils,
    iconPath: "/img/restaurant.png",
  },
  {
    label: "Hotels",
    value: "hotel",
    icon: Hotel,
    iconPath: "/img/hotel.png",
  },
  {
    label: "Hospitals",
    value: "hospital",
    icon: Hospital,
    iconPath: "/img/hospital.png",
  },
  {
    label: "Cafe",
    value: "cafe",
    icon: Coffee,
    iconPath: "/img/cafe.png",
  },
];
