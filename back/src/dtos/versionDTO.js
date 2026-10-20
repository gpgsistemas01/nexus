export const createVersionDto = (body = {}) => (
    Object.prototype.hasOwnProperty.call(body, 'expectedVersion')
        ? { expectedVersion: body.expectedVersion } : {}
);
