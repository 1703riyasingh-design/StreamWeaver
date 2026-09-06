const FIELD_ALIASES = {
  id: [
    "id",
    "user_id",
    "student_id",
    "customer_id"
  ],

  name: [
    "name",
    "full_name",
    "username",
    "user_name",
    "student_name"
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
    "student_age"
  ]
};

const normalizeColumn = (column) => {
  return column
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
};

const generateAutoMapping = (columns) => {
  const mapping = {};

  columns.forEach((column) => {
    const normalizedColumn = normalizeColumn(column);

    for (const [targetField, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(normalizedColumn)) {
        mapping[column] = targetField;
        break;
      }
    }
  });

  return mapping;
};

module.exports = generateAutoMapping;