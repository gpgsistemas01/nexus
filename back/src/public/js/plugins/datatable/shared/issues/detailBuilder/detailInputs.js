import { bindDisabledControlWarning } from '../../../../../ui/disabledControlWarning.js';

export const DISABLED_PROJECT_QUANTITY_MESSAGE = 'Marque el detalle como surtido para capturar la cantidad de proyecto.';
const DISABLED_TABLE_INPUT_SELECTOR = 'input[data-disabled-warning], textarea[data-disabled-warning]';

export const buildDetailTableInput = ({ name, value, className, detailId, disabled = false, disabledWarning, min, step }) => `
    <div class="table-input-outline">
        <input
            type="number"
            name="${ name }"
            value="${ value ?? '' }"
            class="form-control ${ className }"
            data-detail-id="${ detailId }"
            ${ disabled ? 'disabled' : '' }
            ${ disabledWarning ? `data-disabled-warning="${ disabledWarning }"` : '' }
            ${ min !== undefined && min !== null ? `min="${ min }"` : '' }
            ${ step !== undefined && step !== null ? `step="${ step }"` : '' }
        >
    </div>
`;

const resolveDisabledTableInput = (cell, event) => {
    const point = event.touches?.[0] || event.changedTouches?.[0] || event;
    const pointedElement = typeof document !== 'undefined'
        && typeof document.elementFromPoint === 'function'
        && typeof point.clientX === 'number'
        && typeof point.clientY === 'number'
        ? document.elementFromPoint(point.clientX, point.clientY)
        : null;
    const pointedInput = (pointedElement || event.target)?.closest?.(DISABLED_TABLE_INPUT_SELECTOR);

    if (pointedInput && cell.contains(pointedInput)) return pointedInput;

    return cell.querySelector(`${ DISABLED_TABLE_INPUT_SELECTOR }:disabled:hover`);
};

export const bindDetailInputWarnings = () => bindDisabledControlWarning({
    eventTargetSelector: '#materialTable td',
    eventNamespace: 'materialTableDisabledInputWarning',
    resolveControl: resolveDisabledTableInput
});
