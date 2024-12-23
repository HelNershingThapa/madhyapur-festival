import * as React from "react";

import Baato from "@baatomaps/baato-js-client";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { addDoc, collection, GeoPoint } from "firebase/firestore";
import { LngLat } from "maplibre-gl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { incidents as incidentsConfig } from "@/config";
import { auth, db } from "@/firebase-config";

import { MapDialog, ReportIncidentMap } from "./-components/map";

export const Route = createLazyFileRoute("/_layout/report-incident/$")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { _splat } = useParams({ strict: false });
  const mapSubString = _splat?.substring(_splat?.indexOf("@") + 1).split("/");
  const initialState = {
    category: "",
    subcategory: "",
    address: "",
    comment: "",
    coordinates: new LngLat(
      Number(mapSubString?.[2]) || 85.3217,
      Number(mapSubString?.[1]) || 27.6996,
    ),
  };
  const [incident, setIncident] = React.useState(initialState);
  const [isMapDialogOpen, setIsMapDialogOpen] = React.useState(false);

  const onCloseReportIncidentDialog = () => {
    navigate({
      to: "/$",
    });
  };

  const handleOpenMapDialog = () => {
    setIsMapDialogOpen(true);
  };

  const handleCloseMapDialog = () => {
    setIsMapDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const realTimeContributionsRef = collection(db, "RealTimeContributions");
    const metaData = {
      platform: "web",
      userEmail: auth.currentUser.email,
      createdAt: Date.now(),
    };
    const report = {
      reportType: incident.category,
      reportItemType: incident.subcategory,
      address: incident.address,
      comment: incident.comment,
      latLng: new GeoPoint(incident.coordinates.lat, incident.coordinates.lng),
      ...(incident.speedLimit && { speedLimit: incident.speedLimit }),
    };
    await addDoc(realTimeContributionsRef, { ...report, ...metaData })
      .then(() => {
        toast.success(
          "Thank you. Your submission has been received for review.",
        );
        setIncident(initialState);
        onCloseReportIncidentDialog();
      })
      .catch(() => {
        toast.error("Server error. Please try again later.");
      });
  };

  const handleFieldChange = (name, value) => {
    setIncident((prev) => {
      const updatedIncident = { ...prev, [name]: value };
      if (name === "category" && value !== "Speed Camera") {
        delete updatedIncident.speedLimit;
      }
      return updatedIncident;
    });
  };

  const onCoordinatesSave = ({ lng, lat }) => {
    setIncident((prev) => ({
      ...prev,
      coordinates: new LngLat(lng, lat),
    }));
    new Baato.Reverse()
      .setApiVersion("1.0")
      .setBaseUrl(import.meta.env.VITE_BAATO_API_URL)
      .setKey(import.meta.env.VITE_BAATO_ACCESS_TOKEN)
      .setCoordinates([lat, lng])
      .doRequest()
      .then((res) =>
        setIncident((prev) => ({
          ...prev,
          address: res.data[0].address,
        })),
      );
  };

  return (
    <>
      <Dialog
        open={!isMapDialogOpen}
        onOpenChange={(open) => !open && onCloseReportIncidentDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an incident</DialogTitle>
            <DialogDescription>
              Let us know about the incident you encountered. Provide as much
              detail as possible.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 py-4">
              <div className="grid gap-1.5">
                <Label htmlFor="category">Category</Label>
                <Select
                  required
                  value={incident.category}
                  onValueChange={(newValue) =>
                    handleFieldChange("category", newValue)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      {incidentsConfig.map((report) => (
                        <SelectItem key={report.label} value={report.label}>
                          {report.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {incident.category !== "Police" && (
                <div className="grid gap-1.5">
                  <Label htmlFor="category">Subcategory</Label>
                  <Select
                    disabled={!incident.category}
                    onValueChange={(newValue) =>
                      handleFieldChange("subcategory", newValue)
                    }
                    required
                    value={incident.subcategory}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={`Select a subcategory ${incident.category && `- ${incident.category}`}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Sub Categories</SelectLabel>
                        {incidentsConfig
                          .find((report) => report.label === incident.category)
                          ?.categories.map((incident) => (
                            <SelectItem
                              key={incident.label}
                              value={incident.label}
                            >
                              {incident.label}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {incident.category === "Speed Camera" && (
                <div className="grid gap-1.5">
                  <Label htmlFor="speedLimit">Speed Limit</Label>
                  <Select
                    onValueChange={(newValue) =>
                      handleFieldChange("speedLimit", newValue)
                    }
                    required
                    value={incident?.speedLimit}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Speed Limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Sub Categories</SelectLabel>
                        {[...Array(10)].map((_, index) => {
                          const speed = (index + 1) * 10;
                          return (
                            <SelectItem key={speed} value={String(speed)}>
                              {speed} km/h
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-1.5">
                <Label htmlFor="address">Address</Label>
                <div className="space-y-0.5">
                  <Input
                    required
                    placeholder="Address"
                    value={incident.address}
                    name="address"
                    onChange={(e) =>
                      handleFieldChange(e.target.name, e.target.value)
                    }
                  />
                  <p className="mt-0.5 px-3 text-xs text-muted-foreground">
                    Address will be generated if you adjust the map location
                    below, or you can provide it manually by typing
                  </p>
                </div>
              </div>
              <div onClick={handleOpenMapDialog}>
                <ReportIncidentMap coordinates={incident.coordinates} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="category">Comment</Label>
                <Textarea
                  placeholder="Provide additional details about the incident"
                  value={incident.comment}
                  name="comment"
                  onChange={(e) =>
                    handleFieldChange(e.target.name, e.target.value)
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <MapDialog
        coordinates={incident.coordinates}
        handleCloseMapDialog={handleCloseMapDialog}
        isMapDialogOpen={isMapDialogOpen}
        onCoordinatesSave={onCoordinatesSave}
      />
    </>
  );
}
