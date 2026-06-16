const selectEvent = 'select2:select';

export const attachSelectFilterHandler = ({
    selector,
    onChange
}) => {

    $(selector)
        .off(selectEvent)
        .on(selectEvent, () => {
            onChange?.();
        });
};
