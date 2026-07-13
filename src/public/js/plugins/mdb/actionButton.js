export const buildMdbActionButton = ({
    className,
    colorClass,
    iconClass,
    title,
    ariaLabel,
    rippleColor = 'light',
    htmlAttrs = {}
}) => {
    const extraAttrs = Object.entries(htmlAttrs)
        .filter(([, value]) => value !== false && value !== null && value !== undefined)
        .map(([key, value]) => `${ key }="${ value }"`)
        .join(' ');

    return `<button type="button" data-mdb-ripple-init data-mdb-tooltip-init data-mdb-ripple-color="${ rippleColor }" class="btn ${ colorClass } btn-floating btn-sm table-action-btn ${ className }" title="${ title }" aria-label="${ ariaLabel }" ${ extraAttrs }><i class="${ iconClass }"></i></button>`;
};
