export const attachSelectFilterHandler = ({
    selector,
    onChange
}) => {

    $(selector)
        .off('select2:select.tableFilter')
        .on('select2:select.tableFilter', () => {
            onChange?.();
        });
};
