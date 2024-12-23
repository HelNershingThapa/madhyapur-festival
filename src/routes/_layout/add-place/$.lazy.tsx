import { Fragment, useState } from "react";

import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { addDoc, collection } from "firebase/firestore";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { auth, db } from "@/firebase-config";

import { CategoriesDialog } from "./-components/category-dialog";
import { additionalFields, fields } from "./-components/fields";
import { AddAPlaceMap, MapDialog } from "./-components/map";
import UploadImage from "./-components/upload-image";

export const Route = createLazyFileRoute("/_layout/add-place/$")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const initialState = {};
  fields.forEach((field) => {
    initialState[field.name] = "";
  });
  additionalFields.forEach((field) => {
    initialState[field.name] = "";
  });
  const [formData, setFormData] = useState(initialState);
  const [activeDialog, setActiveDialog] = useState<
    "main" | "map" | "category" | null
  >("main");
  const [isShowAdditionalFields, setIsShowAdditionalFields] = useState(false);

  const handleFormChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCloseMainDialog = () => {
    setActiveDialog(null);
    setFormData(initialState);
    navigate({
      to: "/$",
    });
  };

  const handleOpenCategoryDialog = () => {
    setActiveDialog("category");
  };

  const handleOpenMapDialog = () => {
    setActiveDialog("map");
  };

  const handleCloseCategoryDialog = () => {
    setActiveDialog("main");
  };

  const handleCloseMapDialog = () => {
    setActiveDialog("main");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const placesCollectionRef = collection(db, "pois");
    const metaData = {
      // TODO: Only add supported as of now. update type value when other actions are also supported
      type: "add",
      platform: "web",
      user_id: auth.currentUser?.email,
      created: Date.now(),
    };
    await addDoc(placesCollectionRef, { ...formData, ...metaData })
      .then(() => {
        toast.success(
          "Thank you. Your submission has been received for review.",
        );
        handleCloseMainDialog();
      })
      .catch(() => {
        toast.error("Server error. Please try again later.");
      });
  };

  const renderField = (field) => {
    switch (field.type) {
      case "text":
        return (
          <div className="grid gap-1.5">
            <Label htmlFor={field.label}>{field.label}</Label>
            <Input
              id={field.label}
              required={field.required}
              placeholder={field.label}
              value={formData[field.name]}
              onChange={(e) => handleFormChange(field.name, e.target.value)}
            />
            {field.name === "address" && (
              <p className="mt-0.5 px-3 text-xs text-muted-foreground">
                Address will be generated if you adjust the map location below,
                or you can provide it manually
              </p>
            )}
          </div>
        );
      case "category":
        // Not so generic case; only used for category.
        return (
          <div className="grid gap-1.5">
            <Label htmlFor="category">Category</Label>
            <div
              id="category"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              onClick={handleOpenCategoryDialog}
            >
              <span className="text-muted-foreground">
                {formData[field.name] || "Category *"}
              </span>
              <ChevronRight className="size-4" />
            </div>
          </div>
        );
      case "radio":
        // Not so generic case; only used for landmark.
        return (
          <div className="grid gap-1.5">
            <Label>Is this place a landmark?</Label>
            <RadioGroup
              name={field.name}
              value={formData[field.name]}
              onValueChange={(newValue) =>
                handleFormChange(field.name, newValue)
              }
              className="flex gap-4"
            >
              <div className="peer flex items-center space-x-2 rounded-md border-2 border-muted bg-popover py-3 pl-3 pr-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="yes" id="yes" className="peer" />
                <Label htmlFor="yes">Yes</Label>
              </div>
              <div className="peer flex items-center space-x-2 rounded-md border-2 border-muted bg-popover py-3 pl-3 pr-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog
        open={activeDialog === "main"}
        onOpenChange={(open) => !open && handleCloseMainDialog()}
      >
        <DialogContent className="max-h-[95%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add a place</DialogTitle>
            <DialogDescription>
              Provide some information about this place. If this place is added
              to Baato Maps, it will appear publicly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6 py-4">
              {fields.map((field) => (
                <Fragment key={field.name}>{renderField(field)}</Fragment>
              ))}
              <div onClick={handleOpenMapDialog}>
                <AddAPlaceMap formData={formData} setFormData={setFormData} />
              </div>
              {!isShowAdditionalFields && (
                <>
                  <Separator className="-mx-6 w-auto" />
                  <div
                    className="flex cursor-pointer justify-between"
                    onClick={() => setIsShowAdditionalFields(true)}
                  >
                    <div>
                      <span className="font-medium">Add more details</span>
                      <p className="text-sm text-muted-foreground">
                        Add phone, hours, website or photos to help Baato Maps
                        verify this place
                      </p>
                    </div>
                    <ChevronDown className="size-5 shrink-0" />
                  </div>
                  <Separator className="-mx-6 w-auto" />
                </>
              )}
              {isShowAdditionalFields && (
                <>
                  {additionalFields.map((field) => (
                    <Fragment key={field.label}>{renderField(field)}</Fragment>
                  ))}
                  <UploadImage formData={formData} setFormData={setFormData} />
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={handleCloseMainDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !fields
                    .filter((field) => field.required) // Filter out only required fields
                    .every((field) => formData[field.name] !== "")
                }
              >
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <CategoriesDialog
        handleOpenCategoryDialog={handleOpenCategoryDialog}
        handleCloseCategoryDialog={handleCloseCategoryDialog}
        formData={formData}
        setFormData={setFormData}
        activeDialog={activeDialog}
        setActiveDialog={setActiveDialog}
      />
      <MapDialog
        handleOpenMapDialog={handleOpenMapDialog}
        handleCloseMapDialog={handleCloseMapDialog}
        formData={formData}
        setFormData={setFormData}
        activeDialog={activeDialog}
      />
    </>
  );
}
