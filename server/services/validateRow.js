const validateRow = (row) => {
    const errors = [];

    // ID validation
    if (
        row.id === undefined ||
        row.id === null ||
        String(row.id).trim() === ""
    ) {
        errors.push("ID is required");
    }

    // Name validation
    if (
        row.name === undefined ||
        row.name === null ||
        String(row.name).trim() === ""
    ) {
        errors.push("Name is required");
    }

    // Email validation
    if (
        row.email !== undefined &&
        row.email !== null &&
        String(row.email).trim() !== ""
    ) {
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(String(row.email).trim())) {
            errors.push("Invalid email format");
        }
    }

    // Age validation
    if (
        row.age !== undefined &&
        row.age !== null &&
        String(row.age).trim() !== ""
    ) {
        const age = Number(row.age);

        if (Number.isNaN(age)) {
            errors.push("Age must be a number");
        } else if (age < 0) {
            errors.push("Age cannot be negative");
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = validateRow;