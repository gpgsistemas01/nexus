export const buildMdbActionButton = ({
    className,
    colorClass,
    iconClass,
    title,
    ariaLabel,
    rippleColor = 'light'
}) => (
    `<button type="button" data-mdb-ripple-init data-mdb-ripple-color="${ rippleColor }" class="btn ${ colorClass } btn-floating btn-sm table-action-btn ${ className }" title="${ title }" aria-label="${ ariaLabel }"><i class="${ iconClass }"></i></button>`
);
