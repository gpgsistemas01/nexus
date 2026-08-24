import { DOM_EVENT_NAMES, OFFCANVAS_EVENT_NAMES } from '../../constants/events.js';
export const initMdbModal = (el) => window.mdb.Modal.getOrCreateInstance(el);

export const showModal = (instance) => {

    if (!instance) return;

    instance.show();
}

export const hideModal = ({ el, instance, form }) => instance.hide();

export const initMdbWrapperInput = ({ selector, value }) => {

    const inputElement = document.querySelector(selector);

    if (!inputElement) return;

    const wrapper = inputElement.closest('.form-outline');
    inputElement.value = value || '';
    return window.mdb.Input.getOrCreateInstance(wrapper);
}

export const updateMdbWrapperInput = (instance) => {

    if (!instance) return;

    instance.update();
}

const tooltipDismissBoundElements = new WeakSet();
const submenuDismissBoundRoots = new WeakSet();
const offcanvasStateBoundTriggers = new WeakSet();

export const initMdbTooltips = (root = document) => {

    if (!root || !window.mdb?.Tooltip) return;

    root.querySelectorAll('[data-mdb-tooltip-init]').forEach((el) => {
        const instance = window.mdb.Tooltip.getOrCreateInstance(el);

        if (tooltipDismissBoundElements.has(el)) return;

        el.addEventListener(DOM_EVENT_NAMES.CLICK, () => instance.hide());
        tooltipDismissBoundElements.add(el);
    });
}

export const initMdbDismissibleSubmenus = (root = document) => {

    if (!root || !window.mdb?.Collapse || submenuDismissBoundRoots.has(root)) return;

    root.addEventListener(DOM_EVENT_NAMES.CLICK, ({ target }) => {
        root.querySelectorAll('.app-nav-list--flyout .app-nav-submenu.show').forEach((submenu) => {
            const navItem = submenu.closest('.nav-item');

            if (navItem?.contains(target)) return;

            window.mdb.Collapse.getOrCreateInstance(submenu).hide();
        });
    });

    submenuDismissBoundRoots.add(root);
}

export const initMdbOffcanvasTriggerStates = (root = document) => {

    if (!root) return;

    root.querySelectorAll('[data-mdb-offcanvas-init][aria-controls]').forEach((trigger) => {
        if (offcanvasStateBoundTriggers.has(trigger)) return;

        const offcanvas = trigger.ownerDocument.getElementById(trigger.getAttribute('aria-controls'));

        if (!offcanvas) return;

        offcanvas.addEventListener(OFFCANVAS_EVENT_NAMES.MDB_SHOW, () => {
            trigger.setAttribute('aria-expanded', 'true');
        });
        offcanvas.addEventListener(OFFCANVAS_EVENT_NAMES.MDB_HIDE, () => {
            trigger.setAttribute('aria-expanded', 'false');
        });
        offcanvasStateBoundTriggers.add(trigger);
    });
}
