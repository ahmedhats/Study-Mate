/**
 * Formats education level values for display
 * @param {string} educationValue - The raw education value from the database
 * @returns {string} Formatted education level text
 */
export const formatEducation = (educationValue) => {
  const educationMap = {
    high_school: "High School",
    bachelors: "Bachelor's",
    masters: "Master's",
    phd: "PhD",
    other: "Other",
  };
  return educationMap[educationValue] || educationValue || "Not specified";
};

/**
 * Formats major/field of study values for display
 * @param {string} majorValue - The raw major value from the database
 * @returns {string} Formatted major text
 */
export const formatMajor = (majorValue) => {
  const majorMap = {
    computer_science: "Computer Science",
    biology: "Biology",
    engineering: "Engineering",
    mathematics: "Mathematics",
    business: "Business",
    literature: "Literature",
    physics: "Physics",
    chemistry: "Chemistry",
    psychology: "Psychology",
    medicine: "Medicine",
    arts: "Arts",
    other: "Other",
  };
  return majorMap[majorValue] || majorValue || "Not specified";
};

/**
 * Formats study preference values for display
 * @param {string} preference - The raw study preference value from the database
 * @returns {string} Formatted study preference text
 */
export const formatStudyPreference = (preference) => {
  const preferenceMap = {
    individual: "Individual Study",
    group: "Group Study",
    both: "Both Individual & Group",
  };
  return preferenceMap[preference] || preference || "Not specified";
};

/**
 * Formats array data for display
 * @param {Array|string} data - Array or string data to format
 * @returns {string} Comma separated list or original value
 */
export const formatArrayData = (data) => {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return "Not specified";
  }

  if (Array.isArray(data)) {
    return data.join(", ");
  }

  return data;
};
