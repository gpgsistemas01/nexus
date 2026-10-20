export const waitForCaptureReady = async (page, capture, baseURL) => {
    const terminalState = page.locator(`${ capture.ready }, #loginForm, .error-card`).first();
    await terminalState.waitFor({ state: 'visible' });

    if (await page.locator(capture.ready).first().isVisible()) return;

    if (await page.locator('#loginForm').isVisible()) {
        throw new Error(
            `${ capture.id } no puede prepararse porque Nexus redirigió la página protegida al inicio de sesión. `
            + `La sesión de ${ capture.area } expiró o no pertenece a la instancia ${ new URL(baseURL).origin }; `
            + 'genere nuevamente su archivo de sesión o use las credenciales automáticas.'
        );
    }

    throw new Error(
        `${ capture.id } no puede prepararse porque Nexus mostró una página de error en ${ page.url() }. `
        + `Compruebe que la cuenta de ${ capture.area } tenga permiso para abrir ${ capture.route }.`
    );
};
