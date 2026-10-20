export const pickFormFields = (data, fields) => Object.fromEntries(
    fields
        .filter((field) => Object.prototype.hasOwnProperty.call(data, field))
        .map((field) => [field, data[field]])
);

export const hasValidationErrors = (errors) => {

    const check = (value) => {

        if (value == null) return false;

        if (typeof value !== 'object') return true;

        return Object.values(value).some(check);
    };

    return check(errors);
};

export const validateFields = (validators, formData) => {

    const errors = {};

    Object.entries(validators).forEach(([field, validator]) => {
        const error = validator(formData[field], formData);

        errors[field] = error;
    });

    return errors;
}

export const validateDetailsFields = (validators, details) => {

    const errors = {};

    details.forEach(detail => {

        const detailErrors = validateFields(validators, detail);
        errors[detail.id] = detailErrors;
    });

    return errors;
}
