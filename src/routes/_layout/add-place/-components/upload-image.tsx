import { useState } from "react";
import { uid } from "react-uid";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ImageUp, Loader2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { storage } from "@/firebase-config";
import { cn } from "@/lib/utils";

function UploadImage({ formData, setFormData }) {
  const [isUploading, setIsUploading] = useState(false);

  const onHandleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const imageUpload = event.target.files?.[0];
    if (imageUpload) {
      const imageRef = ref(storage, `images/${imageUpload.name}`);
      setIsUploading(true);
      uploadBytes(imageRef, imageUpload).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadUrl) => {
          setIsUploading(false);
          setFormData((prev) => ({
            ...prev,
            photos: [...(prev.photos ? prev.photos : []), downloadUrl],
          }));
        });
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Place photos</Label>
        <p className="text-sm text-muted-foreground">
          Add helpful photos like storefronts, notices, or signs
        </p>
      </div>
      <label
        className={cn(
          buttonVariants({
            className: "cursor-pointer rounded-full",
            variant: "outline",
          }),
        )}
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImageUp className="size-4" />
        )}
        Upload a photo
        <input
          type="file"
          className="sr-only"
          accept="image/*"
          onChange={onHandleImageUpload}
        />
      </label>
      <div className="overflow-x-auto whitespace-nowrap">
        {formData.photos?.map((image) => (
          <img
            key={uid(image)}
            src={image}
            alt="user-uploaded-photos"
            height={96}
            width={112}
            className="mr-4 rounded-md object-cover"
          />
        ))}
      </div>
    </div>
  );
}

export default UploadImage;
