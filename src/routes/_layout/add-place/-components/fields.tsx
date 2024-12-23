export const fields = [
  {
    label: "Name (in English)",
    type: "text",
    name: "name_en",
    required: true,
  },
  {
    label: "Name (in Nepali)",
    type: "text",
    name: "name_np",
    required: false,
  },
  {
    label: "Category",
    type: "category",
    name: "category",
    required: true,
  },
  {
    label: "Address",
    type: "text",
    name: "address",
    required: true,
  },
];

export const additionalFields = [
  {
    label: "Opening hours",
    type: "text",
    name: "opening_hour",
    required: false,
  },
  {
    label: "Website",
    type: "text",
    name: "website",
    required: false,
  },
  {
    label: "Phone number",
    type: "text",
    name: "phone_number",
    required: false,
  },
  {
    label: "Other additional information",
    type: "text",
    name: "other_info",
    required: false,
  },
  {
    label: "Is this a landmark?",
    type: "radio",
    name: "landmark",
    required: false,
  },
];
