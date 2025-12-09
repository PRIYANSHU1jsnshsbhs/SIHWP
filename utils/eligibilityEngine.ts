export const calculateRiskScore = (formData: any) => {
    let status = "PENDING";
    let message = "";
    let color = "gray";

    const { income, caste } = formData;

    if (income > 250000) {
        status = "REJECTED";
        message = "Income exceeds limit (2.5L). Not Eligible.";
        color = "red";
        return { status, message, color };
    }

    if (caste && caste !== 'SC') { // Constraint: "If Caste != SC -> Status: Rejected"
        status = "REJECTED";
        message = "Scheme applicable for SC category only.";
        color = "red";
        return { status, message, color };
    }

    if (income < 50000) {
        status = "HIGH_PRIORITY";
        message = "High Probability of Selection (Income < 50k)";
        color = "green";
    } else {
        status = "ELIGIBLE";
        message = "Eligible for consideration.";
        color = "blue";
    }

    return { status, message, color };
};
