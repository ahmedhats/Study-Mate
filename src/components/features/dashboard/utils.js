export const formatEducation = (edu) => {
    if (!edu) return "Not specified";

    const formats = {
        high_school: "High School",
        undergraduate: "Undergraduate",
        graduate: "Graduate",
        phd: "PhD",
        other: "Other",
    };

    return formats[edu] || edu;
};

export const formatStudyPreference = (pref) => {
    if (!pref) return "Not specified";

    const formats = {
        individual: "Individual Study",
        group: "Group Study",
        both: "Both Individual and Group Study",
    };

    return formats[pref] || pref;
}; 