interface Nd {
  $: {
    ref: string;
  };
}

interface Tag {
  $: {
    k: string;
    v: string;
  };
}

interface Node {
  $: {
    id: string;
    visible: string;
    version: string;
    changeset: string;
    timestamp: string;
    user: string;
    uid: string;
    lat: string;
    lon: string;
  };
  tag: Tag[];
}

interface Way {
  $: {
    id: string;
    visible: string;
    version: string;
    changeset: string;
    timestamp: string;
    user: string;
    uid: string;
  };
  nd: Nd[];
  tag: Tag[];
}

export type ElementType = "node" | "way" | "relation";

export type OsmElement<T extends ElementType> = T extends "node"
  ? Node
  : T extends "way"
    ? Way
    : never;

type OSM = {
  [key in ElementType]: OsmElement<key>[]; // Using an index signature to accommodate dynamic keys
} & {
  $: {
    version: string;
    generator: string;
    copyright: string;
    attribution: string;
    license: string;
  };
};

export interface ElementJson {
  osm: OSM;
}
