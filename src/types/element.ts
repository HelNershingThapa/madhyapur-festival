export type OsmData = {
  version: string;
  generator: string;
  copyright: string;
  attribution: string;
  license: string;
  elements: OsmElement[];
};

type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number; // Only present for "node"
  lon?: number; // Only present for "node"
  timestamp: string;
  version: number;
  changeset: number;
  user: string;
  uid: number;
  tags?: Record<string, string>; // Tags are key-value pairs of strings
};
