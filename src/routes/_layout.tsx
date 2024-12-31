import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { Login } from "@/components/Login";
import { RootMap } from "@/components/map";
import { NearbyChips } from "@/components/NearbyChips";
import { Search } from "@/components/Search";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();
  const showNearbyChips = location.pathname === "/";

  return (
    <RootMap>
      <Outlet />
      <div className="absolute left-0 right-0 top-2.5 z-[14] flex flex-col justify-between gap-2 px-1.5 md:flex-row md:gap-8 md:px-2.5">
        <div className="flex min-w-0 flex-1 flex-col gap-x-8 md:flex-row">
          <Search />
          {showNearbyChips && (
            <div className="nearby-chips-overlay mt-14 min-w-0 flex-1 overflow-x-auto pb-2.5 sm:mt-1.5">
              <NearbyChips />
            </div>
          )}
        </div>
        <Login />
      </div>
    </RootMap>
  );
}
