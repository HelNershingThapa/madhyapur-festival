/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LayoutImport } from './routes/_layout'
import { Route as LayoutLeftDetailImport } from './routes/_layout/_left-detail'
import { Route as LayoutLeftDetailPlaceOsmIdSplatImport } from './routes/_layout/_left-detail.place.$osmId.$'
import { Route as LayoutLeftDetailNearbyAmenitySplatImport } from './routes/_layout/_left-detail.nearby.$amenity.$'
import { Route as LayoutLeftDetailEventsMadhyapurFestivalSplatImport } from './routes/_layout/_left-detail.events.madhyapur-festival.$'

// Create Virtual Routes

const LayoutSplatLazyImport = createFileRoute('/_layout/$')()
const LayoutReportIncidentSplatLazyImport = createFileRoute(
  '/_layout/report-incident/$',
)()
const LayoutAddPlaceSplatLazyImport = createFileRoute('/_layout/add-place/$')()
const LayoutLeftDetailContributionsLazyImport = createFileRoute(
  '/_layout/_left-detail/contributions',
)()
const LayoutLeftDetailPlacesPlaceIdLazyImport = createFileRoute(
  '/_layout/_left-detail/places/$placeId',
)()
const LayoutDirectionsLocationsModeSplatLazyImport = createFileRoute(
  '/_layout/directions/$locations/$mode/$',
)()

// Create/Update Routes

const LayoutRoute = LayoutImport.update({
  id: '/_layout',
  getParentRoute: () => rootRoute,
} as any)

const LayoutSplatLazyRoute = LayoutSplatLazyImport.update({
  id: '/$',
  path: '/$',
  getParentRoute: () => LayoutRoute,
} as any).lazy(() => import('./routes/_layout/$.lazy').then((d) => d.Route))

const LayoutLeftDetailRoute = LayoutLeftDetailImport.update({
  id: '/_left-detail',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutReportIncidentSplatLazyRoute =
  LayoutReportIncidentSplatLazyImport.update({
    id: '/report-incident/$',
    path: '/report-incident/$',
    getParentRoute: () => LayoutRoute,
  } as any).lazy(() =>
    import('./routes/_layout/report-incident/$.lazy').then((d) => d.Route),
  )

const LayoutAddPlaceSplatLazyRoute = LayoutAddPlaceSplatLazyImport.update({
  id: '/add-place/$',
  path: '/add-place/$',
  getParentRoute: () => LayoutRoute,
} as any).lazy(() =>
  import('./routes/_layout/add-place/$.lazy').then((d) => d.Route),
)

const LayoutLeftDetailContributionsLazyRoute =
  LayoutLeftDetailContributionsLazyImport.update({
    id: '/contributions',
    path: '/contributions',
    getParentRoute: () => LayoutLeftDetailRoute,
  } as any).lazy(() =>
    import('./routes/_layout/_left-detail.contributions.lazy').then(
      (d) => d.Route,
    ),
  )

const LayoutLeftDetailPlacesPlaceIdLazyRoute =
  LayoutLeftDetailPlacesPlaceIdLazyImport.update({
    id: '/places/$placeId',
    path: '/places/$placeId',
    getParentRoute: () => LayoutLeftDetailRoute,
  } as any).lazy(() =>
    import('./routes/_layout/_left-detail.places.$placeId.lazy').then(
      (d) => d.Route,
    ),
  )

const LayoutDirectionsLocationsModeSplatLazyRoute =
  LayoutDirectionsLocationsModeSplatLazyImport.update({
    id: '/directions/$locations/$mode/$',
    path: '/directions/$locations/$mode/$',
    getParentRoute: () => LayoutRoute,
  } as any).lazy(() =>
    import('./routes/_layout/directions.$locations.$mode.$.lazy').then(
      (d) => d.Route,
    ),
  )

const LayoutLeftDetailPlaceOsmIdSplatRoute =
  LayoutLeftDetailPlaceOsmIdSplatImport.update({
    id: '/place/$osmId/$',
    path: '/place/$osmId/$',
    getParentRoute: () => LayoutLeftDetailRoute,
  } as any)

const LayoutLeftDetailNearbyAmenitySplatRoute =
  LayoutLeftDetailNearbyAmenitySplatImport.update({
    id: '/nearby/$amenity/$',
    path: '/nearby/$amenity/$',
    getParentRoute: () => LayoutLeftDetailRoute,
  } as any)

const LayoutLeftDetailEventsMadhyapurFestivalSplatRoute =
  LayoutLeftDetailEventsMadhyapurFestivalSplatImport.update({
    id: '/events/madhyapur-festival/$',
    path: '/events/madhyapur-festival/$',
    getParentRoute: () => LayoutLeftDetailRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_layout': {
      id: '/_layout'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof LayoutImport
      parentRoute: typeof rootRoute
    }
    '/_layout/_left-detail': {
      id: '/_layout/_left-detail'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof LayoutLeftDetailImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/$': {
      id: '/_layout/$'
      path: '/$'
      fullPath: '/$'
      preLoaderRoute: typeof LayoutSplatLazyImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/_left-detail/contributions': {
      id: '/_layout/_left-detail/contributions'
      path: '/contributions'
      fullPath: '/contributions'
      preLoaderRoute: typeof LayoutLeftDetailContributionsLazyImport
      parentRoute: typeof LayoutLeftDetailImport
    }
    '/_layout/add-place/$': {
      id: '/_layout/add-place/$'
      path: '/add-place/$'
      fullPath: '/add-place/$'
      preLoaderRoute: typeof LayoutAddPlaceSplatLazyImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/report-incident/$': {
      id: '/_layout/report-incident/$'
      path: '/report-incident/$'
      fullPath: '/report-incident/$'
      preLoaderRoute: typeof LayoutReportIncidentSplatLazyImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/_left-detail/places/$placeId': {
      id: '/_layout/_left-detail/places/$placeId'
      path: '/places/$placeId'
      fullPath: '/places/$placeId'
      preLoaderRoute: typeof LayoutLeftDetailPlacesPlaceIdLazyImport
      parentRoute: typeof LayoutLeftDetailImport
    }
    '/_layout/_left-detail/events/madhyapur-festival/$': {
      id: '/_layout/_left-detail/events/madhyapur-festival/$'
      path: '/events/madhyapur-festival/$'
      fullPath: '/events/madhyapur-festival/$'
      preLoaderRoute: typeof LayoutLeftDetailEventsMadhyapurFestivalSplatImport
      parentRoute: typeof LayoutLeftDetailImport
    }
    '/_layout/_left-detail/nearby/$amenity/$': {
      id: '/_layout/_left-detail/nearby/$amenity/$'
      path: '/nearby/$amenity/$'
      fullPath: '/nearby/$amenity/$'
      preLoaderRoute: typeof LayoutLeftDetailNearbyAmenitySplatImport
      parentRoute: typeof LayoutLeftDetailImport
    }
    '/_layout/_left-detail/place/$osmId/$': {
      id: '/_layout/_left-detail/place/$osmId/$'
      path: '/place/$osmId/$'
      fullPath: '/place/$osmId/$'
      preLoaderRoute: typeof LayoutLeftDetailPlaceOsmIdSplatImport
      parentRoute: typeof LayoutLeftDetailImport
    }
    '/_layout/directions/$locations/$mode/$': {
      id: '/_layout/directions/$locations/$mode/$'
      path: '/directions/$locations/$mode/$'
      fullPath: '/directions/$locations/$mode/$'
      preLoaderRoute: typeof LayoutDirectionsLocationsModeSplatLazyImport
      parentRoute: typeof LayoutImport
    }
  }
}

// Create and export the route tree

interface LayoutLeftDetailRouteChildren {
  LayoutLeftDetailContributionsLazyRoute: typeof LayoutLeftDetailContributionsLazyRoute
  LayoutLeftDetailPlacesPlaceIdLazyRoute: typeof LayoutLeftDetailPlacesPlaceIdLazyRoute
  LayoutLeftDetailEventsMadhyapurFestivalSplatRoute: typeof LayoutLeftDetailEventsMadhyapurFestivalSplatRoute
  LayoutLeftDetailNearbyAmenitySplatRoute: typeof LayoutLeftDetailNearbyAmenitySplatRoute
  LayoutLeftDetailPlaceOsmIdSplatRoute: typeof LayoutLeftDetailPlaceOsmIdSplatRoute
}

const LayoutLeftDetailRouteChildren: LayoutLeftDetailRouteChildren = {
  LayoutLeftDetailContributionsLazyRoute:
    LayoutLeftDetailContributionsLazyRoute,
  LayoutLeftDetailPlacesPlaceIdLazyRoute:
    LayoutLeftDetailPlacesPlaceIdLazyRoute,
  LayoutLeftDetailEventsMadhyapurFestivalSplatRoute:
    LayoutLeftDetailEventsMadhyapurFestivalSplatRoute,
  LayoutLeftDetailNearbyAmenitySplatRoute:
    LayoutLeftDetailNearbyAmenitySplatRoute,
  LayoutLeftDetailPlaceOsmIdSplatRoute: LayoutLeftDetailPlaceOsmIdSplatRoute,
}

const LayoutLeftDetailRouteWithChildren =
  LayoutLeftDetailRoute._addFileChildren(LayoutLeftDetailRouteChildren)

interface LayoutRouteChildren {
  LayoutLeftDetailRoute: typeof LayoutLeftDetailRouteWithChildren
  LayoutSplatLazyRoute: typeof LayoutSplatLazyRoute
  LayoutAddPlaceSplatLazyRoute: typeof LayoutAddPlaceSplatLazyRoute
  LayoutReportIncidentSplatLazyRoute: typeof LayoutReportIncidentSplatLazyRoute
  LayoutDirectionsLocationsModeSplatLazyRoute: typeof LayoutDirectionsLocationsModeSplatLazyRoute
}

const LayoutRouteChildren: LayoutRouteChildren = {
  LayoutLeftDetailRoute: LayoutLeftDetailRouteWithChildren,
  LayoutSplatLazyRoute: LayoutSplatLazyRoute,
  LayoutAddPlaceSplatLazyRoute: LayoutAddPlaceSplatLazyRoute,
  LayoutReportIncidentSplatLazyRoute: LayoutReportIncidentSplatLazyRoute,
  LayoutDirectionsLocationsModeSplatLazyRoute:
    LayoutDirectionsLocationsModeSplatLazyRoute,
}

const LayoutRouteWithChildren =
  LayoutRoute._addFileChildren(LayoutRouteChildren)

export interface FileRoutesByFullPath {
  '': typeof LayoutLeftDetailRouteWithChildren
  '/$': typeof LayoutSplatLazyRoute
  '/contributions': typeof LayoutLeftDetailContributionsLazyRoute
  '/add-place/$': typeof LayoutAddPlaceSplatLazyRoute
  '/report-incident/$': typeof LayoutReportIncidentSplatLazyRoute
  '/places/$placeId': typeof LayoutLeftDetailPlacesPlaceIdLazyRoute
  '/events/madhyapur-festival/$': typeof LayoutLeftDetailEventsMadhyapurFestivalSplatRoute
  '/nearby/$amenity/$': typeof LayoutLeftDetailNearbyAmenitySplatRoute
  '/place/$osmId/$': typeof LayoutLeftDetailPlaceOsmIdSplatRoute
  '/directions/$locations/$mode/$': typeof LayoutDirectionsLocationsModeSplatLazyRoute
}

export interface FileRoutesByTo {
  '': typeof LayoutLeftDetailRouteWithChildren
  '/$': typeof LayoutSplatLazyRoute
  '/contributions': typeof LayoutLeftDetailContributionsLazyRoute
  '/add-place/$': typeof LayoutAddPlaceSplatLazyRoute
  '/report-incident/$': typeof LayoutReportIncidentSplatLazyRoute
  '/places/$placeId': typeof LayoutLeftDetailPlacesPlaceIdLazyRoute
  '/events/madhyapur-festival/$': typeof LayoutLeftDetailEventsMadhyapurFestivalSplatRoute
  '/nearby/$amenity/$': typeof LayoutLeftDetailNearbyAmenitySplatRoute
  '/place/$osmId/$': typeof LayoutLeftDetailPlaceOsmIdSplatRoute
  '/directions/$locations/$mode/$': typeof LayoutDirectionsLocationsModeSplatLazyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_layout': typeof LayoutRouteWithChildren
  '/_layout/_left-detail': typeof LayoutLeftDetailRouteWithChildren
  '/_layout/$': typeof LayoutSplatLazyRoute
  '/_layout/_left-detail/contributions': typeof LayoutLeftDetailContributionsLazyRoute
  '/_layout/add-place/$': typeof LayoutAddPlaceSplatLazyRoute
  '/_layout/report-incident/$': typeof LayoutReportIncidentSplatLazyRoute
  '/_layout/_left-detail/places/$placeId': typeof LayoutLeftDetailPlacesPlaceIdLazyRoute
  '/_layout/_left-detail/events/madhyapur-festival/$': typeof LayoutLeftDetailEventsMadhyapurFestivalSplatRoute
  '/_layout/_left-detail/nearby/$amenity/$': typeof LayoutLeftDetailNearbyAmenitySplatRoute
  '/_layout/_left-detail/place/$osmId/$': typeof LayoutLeftDetailPlaceOsmIdSplatRoute
  '/_layout/directions/$locations/$mode/$': typeof LayoutDirectionsLocationsModeSplatLazyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | ''
    | '/$'
    | '/contributions'
    | '/add-place/$'
    | '/report-incident/$'
    | '/places/$placeId'
    | '/events/madhyapur-festival/$'
    | '/nearby/$amenity/$'
    | '/place/$osmId/$'
    | '/directions/$locations/$mode/$'
  fileRoutesByTo: FileRoutesByTo
  to:
    | ''
    | '/$'
    | '/contributions'
    | '/add-place/$'
    | '/report-incident/$'
    | '/places/$placeId'
    | '/events/madhyapur-festival/$'
    | '/nearby/$amenity/$'
    | '/place/$osmId/$'
    | '/directions/$locations/$mode/$'
  id:
    | '__root__'
    | '/_layout'
    | '/_layout/_left-detail'
    | '/_layout/$'
    | '/_layout/_left-detail/contributions'
    | '/_layout/add-place/$'
    | '/_layout/report-incident/$'
    | '/_layout/_left-detail/places/$placeId'
    | '/_layout/_left-detail/events/madhyapur-festival/$'
    | '/_layout/_left-detail/nearby/$amenity/$'
    | '/_layout/_left-detail/place/$osmId/$'
    | '/_layout/directions/$locations/$mode/$'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  LayoutRoute: typeof LayoutRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  LayoutRoute: LayoutRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_layout"
      ]
    },
    "/_layout": {
      "filePath": "_layout.tsx",
      "children": [
        "/_layout/_left-detail",
        "/_layout/$",
        "/_layout/add-place/$",
        "/_layout/report-incident/$",
        "/_layout/directions/$locations/$mode/$"
      ]
    },
    "/_layout/_left-detail": {
      "filePath": "_layout/_left-detail.tsx",
      "parent": "/_layout",
      "children": [
        "/_layout/_left-detail/contributions",
        "/_layout/_left-detail/places/$placeId",
        "/_layout/_left-detail/events/madhyapur-festival/$",
        "/_layout/_left-detail/nearby/$amenity/$",
        "/_layout/_left-detail/place/$osmId/$"
      ]
    },
    "/_layout/$": {
      "filePath": "_layout/$.lazy.tsx",
      "parent": "/_layout"
    },
    "/_layout/_left-detail/contributions": {
      "filePath": "_layout/_left-detail.contributions.lazy.tsx",
      "parent": "/_layout/_left-detail"
    },
    "/_layout/add-place/$": {
      "filePath": "_layout/add-place/$.lazy.tsx",
      "parent": "/_layout"
    },
    "/_layout/report-incident/$": {
      "filePath": "_layout/report-incident/$.lazy.tsx",
      "parent": "/_layout"
    },
    "/_layout/_left-detail/places/$placeId": {
      "filePath": "_layout/_left-detail.places.$placeId.lazy.tsx",
      "parent": "/_layout/_left-detail"
    },
    "/_layout/_left-detail/events/madhyapur-festival/$": {
      "filePath": "_layout/_left-detail.events.madhyapur-festival.$.tsx",
      "parent": "/_layout/_left-detail"
    },
    "/_layout/_left-detail/nearby/$amenity/$": {
      "filePath": "_layout/_left-detail.nearby.$amenity.$.tsx",
      "parent": "/_layout/_left-detail"
    },
    "/_layout/_left-detail/place/$osmId/$": {
      "filePath": "_layout/_left-detail.place.$osmId.$.tsx",
      "parent": "/_layout/_left-detail"
    },
    "/_layout/directions/$locations/$mode/$": {
      "filePath": "_layout/directions.$locations.$mode.$.lazy.tsx",
      "parent": "/_layout"
    }
  }
}
ROUTE_MANIFEST_END */
