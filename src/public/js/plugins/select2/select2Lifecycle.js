export const runAfterSelect2Close = ({ selector, action }) => {

    const $select = $(selector);

    if ($select.hasClass('select2-hidden-accessible')) $select.select2('close');

    // Select2 finishes its selection/close lifecycle after select2:select returns.
    // Opening a modal in that same stack is racy because the closing dropdown can
    // restore focus over the modal. Defer the action until that lifecycle is done.
    setTimeout(action, 0);
};
