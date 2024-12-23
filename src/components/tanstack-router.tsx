import React, { Suspense } from "react";

const TanStackRouterDevtoolsLazy = import.meta.env.PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      })),
    );

const TanStackRouterDevtools = () => (
  <Suspense>
    <TanStackRouterDevtoolsLazy position="bottom-right" />
  </Suspense>
);

export default TanStackRouterDevtools;
