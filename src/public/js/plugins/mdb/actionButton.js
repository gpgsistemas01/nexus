export const buildMdbActionButton = ({
    className,
    colorClass,
    iconClass,
    label,
    rippleColor = 'light',
    htmlAttrs = {}
}) => {
    const extraAttrs = Object.entries(htmlAttrs)
        .filter(([, value]) => value !== false && value !== null && value !== undefined)
        .map(([key, value]) => `${ key }="${ value }"`)
        .join(' ');

    return `<button type="button" data-mdb-ripple-init data-mdb-tooltip-init data-mdb-ripple-color="${ rippleColor }" class="btn ${ colorClass } btn-floating btn-sm table-action-btn ${ className }" title="${ label }" aria-label="${ label }" ${ extraAttrs }><i class="${ iconClass }"></i></button>`;
};

export const buildMdbDeleteActionButton = ({ className, label, htmlAttrs = {} }) => buildMdbActionButton({
    className,
    colorClass: 'btn-danger',
    iconClass: 'fa-solid fa-trash',
    label,
    htmlAttrs
});

export const buildMdbEditActionButton = ({ className, label, htmlAttrs = {} }) => buildMdbActionButton({
    className,
    colorClass: 'btn-primary',
    iconClass: 'fa-solid fa-pencil',
    label,
    htmlAttrs
});

export const buildMdbEditDetailActionButton = ({ className, label, htmlAttrs = {} }) => buildMdbActionButton({
    className,
    colorClass: 'btn-info',
    iconClass: 'fa-solid fa-pen-to-square',
    label,
    htmlAttrs
});

export const buildMdbViewActionButton = ({ className, label, htmlAttrs = {} }) => buildMdbActionButton({
    className,
    colorClass: 'btn-secondary',
    iconClass: 'fa-solid fa-eye',
    label,
    htmlAttrs
});

export const buildMdbAdjustStockActionButton = ({ className, label, htmlAttrs = {} }) => buildMdbActionButton({
    className,
    colorClass: 'btn-success',
    iconClass: 'fa-solid fa-boxes-stacked',
    label,
    htmlAttrs
});

export const buildMdbSupplyActionButton = ({ className, label, htmlAttrs = {} }) => buildMdbActionButton({
    className,
    colorClass: 'btn-secondary',
    iconClass: 'fa-solid fa-dolly',
    label,
    htmlAttrs
});

export const buildMdbReturnActionButton = ({ className, label, htmlAttrs = {} }) => buildMdbActionButton({
    className,
    colorClass: 'btn-warning',
    iconClass: 'fa-solid fa-rotate-left',
    label,
    htmlAttrs
});
