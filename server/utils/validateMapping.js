const validateMapping = (mapping) => {

    const values = Object.values(mapping)
        .filter((value) => value);

    // Empty mapping
    if (values.length === 0) {

        return {
            isValid: false,
            message: "At least one column must be mapped"
        };

    }

    // Duplicate target fields
    const uniqueValues = [...new Set(values)];

    if (uniqueValues.length !== values.length) {

        return {
            isValid: false,
            message: "Duplicate database fields are not allowed"
        };

    }

    return {
        isValid: true,
        message: "Mapping is valid"
    };

};

module.exports = validateMapping;