const PNG_SIGNATURE = '89504e470d0a1a0a';

export const getPngDimensions = (image) => {
    if (image.length < 24 || image.subarray(0, 8).toString('hex') !== PNG_SIGNATURE) return null;
    return {
        width: image.readUInt32BE(16),
        height: image.readUInt32BE(20)
    };
};

export const getFigureSizeAttribute = (dimensions, {
    maximumWidthInches = 5.85,
    maximumHeightInches = 7
} = {}) => {
    if (!dimensions?.width || !dimensions?.height) return 'width=90%';
    const heightAtMaximumWidth = maximumWidthInches * dimensions.height / dimensions.width;
    return heightAtMaximumWidth > maximumHeightInches
        ? `height=${maximumHeightInches}in`
        : 'width=90%';
};
