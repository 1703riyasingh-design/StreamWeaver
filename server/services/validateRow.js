const FIELD_ALIASES = {
    id: [
        "id",
        "user_id",
        "customer_id",
        "student_id",
        "employee_id"
    ],

    name: [
        "name",
        "full_name",
        "username",
        "user_name",
        "student_name",
        "customer_name",
        "employee_name"
    ],

    email: [
        "email",
        "email_address",
        "mail",
        "user_email"
    ],

    age: [
        "age",
        "user_age",
        "student_age",
        "employee_age"
    ]
};


const findField = (row, aliases) => {
    const rowKeys = Object.keys(row);

    for (const key of rowKeys) {
        const normalizedKey = String(key)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/-/g, "_");

        if (aliases.includes(normalizedKey)) {
            return row[key];
        }
    }

    return undefined;
};


const validateRow = (row) => {

    const errors = [];


    // ========================================
    // FIND COMMON FIELDS
    // ========================================

    const id = findField(
        row,
        FIELD_ALIASES.id
    );

    const name = findField(
        row,
        FIELD_ALIASES.name
    );

    const email = findField(
        row,
        FIELD_ALIASES.email
    );

    const age = findField(
        row,
        FIELD_ALIASES.age
    );


    // ========================================
    // ID VALIDATION
    // ========================================

    if (
        id !== undefined &&
        id !== null &&
        String(id).trim() === ""
    ) {
        errors.push("ID cannot be empty");
    }


    // ========================================
    // NAME VALIDATION
    // ========================================

    if (
        name !== undefined &&
        name !== null &&
        String(name).trim() === ""
    ) {
        errors.push("Name cannot be empty");
    }


    // ========================================
    // EMAIL VALIDATION
    // ========================================

    if (
        email !== undefined &&
        email !== null &&
        String(email).trim() !== ""
    ) {

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailRegex.test(
                String(email).trim()
            )
        ) {
            errors.push(
                "Invalid email format"
            );
        }
    }


    // ========================================
    // AGE VALIDATION
    // ========================================

    if (
        age !== undefined &&
        age !== null &&
        String(age).trim() !== ""
    ) {

        const numericAge =
            Number(age);

        if (
            Number.isNaN(
                numericAge
            )
        ) {

            errors.push(
                "Age must be a number"
            );

        } else if (
            numericAge < 0
        ) {

            errors.push(
                "Age cannot be negative"
            );
        }
    }


    // ========================================
    // FINAL RESULT
    // ========================================

    return {
        isValid:
            errors.length === 0,

        errors
    };
};


module.exports = validateRow;