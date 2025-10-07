// Clean a raw dataset string (handles brackets and spacing)
export const cleanDataString = (input) => {
  if (!input) return "";

  // Replace curly, square, and round brackets with nothing
  let cleaned = input.replace(/[\[\]\{\}\(\)]/g, "");

  // Split by commas, trim each, remove empty values, and join with commas
  cleaned = cleaned
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join(",");

  return cleaned;
};
