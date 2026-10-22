import { shallowRef } from 'vue';
import { showSuccess } from '../ui/feedback.js';

export const useListEditor = <Target>(options: {
    canOpen: (target: Target) => boolean;
    reload: () => unknown;
    savedMessage: string;
}) => {
    const editor = shallowRef<Target | null>(null);

    const openEditor = (target: Target) => {
        if (options.canOpen(target)) editor.value = target;
    };

    const closeEditor = () => {
        editor.value = null;
    };

    const reloadEditor = () => {
        closeEditor();
        void options.reload();
    };

    const onSaved = () => {
        reloadEditor();
        void showSuccess(options.savedMessage);
    };

    return { editor, openEditor, closeEditor, reloadEditor, onSaved };
};
