import { reactive, ref } from 'vue';
import { reportScopeError } from '../report.js';
import type { ReportScope } from '../report.js';
import { useFileExport } from './useFileExport.js';
import type { FileExportOptions } from './useFileExport.js';

export const useReportScope = (options: FileExportOptions<ReportScope>) => {
    const report = useFileExport(options);
    const isReportOpen = ref(false);
    const reportValues = reactive<ReportScope>({ mode: 'current-month', month: '' });
    const reportFormError = ref('');

    const clearErrors = () => {
        reportFormError.value = '';
        report.exportError.value = '';
    };

    const openReport = () => {
        if (!options.canExport()) return;

        clearErrors();
        isReportOpen.value = true;
    };

    const exportReport = async () => {
        if (!options.canExport() || report.isExporting.value) return;

        reportFormError.value = reportScopeError(reportValues);
        if (reportFormError.value) return;

        await report.exportReport({ ...reportValues });
        if (!report.exportError.value) isReportOpen.value = false;
    };

    const setReportMode = (value: ReportScope['mode']) => {
        if (report.isExporting.value) return;

        reportValues.mode = value;
        clearErrors();
    };

    const setReportMonth = (value: string) => {
        if (report.isExporting.value) return;

        reportValues.month = value;
        clearErrors();
    };

    return {
        ...report,
        isReportOpen,
        reportValues,
        reportFormError,
        openReport,
        exportReport,
        setReportMode,
        setReportMonth,
    };
};
