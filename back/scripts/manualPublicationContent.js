import path from 'node:path';

import { captures } from './manualScreenshotInventory.js';

const capturesById = new Map(captures.map(capture => [capture.id, capture]));
const profileBlock = /<!-- manual:(almacen|sistemas) -->\r?\n([\s\S]*?)<!-- \/manual:\1 -->/g;

export const getManualArea = output => {
    const parts = output.split(/[\\/]/);
    if (parts[0] !== 'manuales') return null;
    if (parts[1] === 'administrador') return 'sistemas';
    if (parts[1] === 'almacen') return 'almacen';
    throw new Error(`Perfil de manual desconocido: ${output}`);
};

export const prepareManualSource = (content, source, output) => {
    const area = getManualArea(output);
    if (!area) return content;

    return content.replace(profileBlock, (block, profile, text) => profile === area ? text : '')
        .replace(/^([ \t]*)!\[([^\]]*)\]\(([^) ]+)\)/gm, (reference, indentation, alternative) => {
            const baseId = alternative.match(/^CAP-[A-Z0-9-]+(?=:)/)?.[0];
            if (!baseId) throw new Error(`La captura de ${source} debe declarar su ID CAP-* en el texto alternativo.`);
            const id = `${baseId.replace(/-(?:ALMACEN|SISTEMAS)$/, '')}-${area.toUpperCase()}`;
            const capture = capturesById.get(id);
            if (!capture) throw new Error(`Captura no registrada para este perfil: ${id} (${source}).`);

            const image = path.posix.join('docs/user-manual/images/areas', area, capture.module, capture.name);
            const relativeImage = path.posix.relative(path.posix.dirname(source), image);
            return `${indentation}<a id="${id}"></a>\n${indentation}\n${indentation}![${id}: ${alternative.slice(baseId.length + 1).trim()}](${relativeImage})`;
        });
};

export const prepareManualNarration = content => content
    .replace(/^\*\*Casos? de uso:\*\*[^\r\n]*\r?\n\r?\n/gm, '')
    .replace(/^(#{1,6}) (?:\d+\. )?CAP-[A-Z0-9-]+ — /gm, '$1 ')
    .replace(/!\[CAP-[A-Z0-9-]+:\s*/g, '![')
    .replace(/CAP-[A-Z0-9-]+ — /g, '');
