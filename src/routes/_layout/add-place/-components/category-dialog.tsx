import { useState } from "react";

import { ChevronRight } from "lucide-react";

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

import data from "./categories.json";

export function CategoriesDialog({
  handleCloseCategoryDialog,
  setFormData,
  activeDialog,
}) {
  const categories = data.data;
  const [category, setActiveCategory] = useState(null);
  const [isShowSubCategories, setIsShowSubCategories] = useState(false);

  const handleCategoryClick = (categoryLabel) => {
    setActiveCategory(categoryLabel);
    setIsShowSubCategories(true);
  };

  const handleSubCategoryClick = (subCategory) => {
    setFormData((prev) => ({
      ...prev,
      category: subCategory,
    }));
    handleCloseCategoryDialog();
  };

  const activeCategory =
    category && categories.find((cat) => cat.category === category);

  return (
    <Dialog
      open={activeDialog === "category"}
      onOpenChange={(open) => !open && handleCloseCategoryDialog()}
    >
      <DialogContent className="max-h-[95%] max-w-sm overflow-y-auto px-0">
        <DialogHeader className="px-4">
          <DialogTitle>
            {isShowSubCategories
              ? `Subcategories for ${activeCategory?.category}`
              : "Categories"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            List of categories for adding a place
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          {!isShowSubCategories &&
            categories.map((category) => (
              <Button
                className="flex justify-between rounded-none font-normal"
                key={category.category}
                variant="ghost"
                onClick={() => handleCategoryClick(category.category)}
              >
                {category.category}
                <ChevronRight className="size-4" />
              </Button>
            ))}
        </div>
        <div className="flex flex-col gap-1">
          {isShowSubCategories &&
            activeCategory?.subcategories?.map((subCategory) => (
              <Button
                className="flex justify-between rounded-none font-normal"
                variant="ghost"
                key={subCategory}
                onClick={() => handleSubCategoryClick(subCategory)}
              >
                {subCategory}
              </Button>
            ))}
        </div>
        <DialogFooter className="px-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
