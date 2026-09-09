import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const TABLE_OR_PARAGRAPH = /<w:tbl(?:\s[^>]*)?>|<\/w:tbl>|<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g;
const EXCLUDED_PARAGRAPH_STYLE = /^(?:Title|Subtitle|Author|Date|Heading\d+|TOCHeading|ImageCaption|TableCaption|SourceCode)$/;
const JUSTIFIED_ALIGNMENT = '<w:jc w:val="both"/>';

const addJustifiedAlignment = (paragraph) => {
    const paragraphStyle = paragraph.match(/<w:pStyle\s[^>]*w:val="([^"]+)"[^>]*\/>/)?.[1];
    if (paragraphStyle && EXCLUDED_PARAGRAPH_STYLE.test(paragraphStyle)) return paragraph;

    if (/<w:jc\s[^>]*\/>/.test(paragraph)) {
        return paragraph.replace(/<w:jc\s[^>]*\/>/, JUSTIFIED_ALIGNMENT);
    }
    if (paragraph.includes('<w:pPr>')) {
        return paragraph.replace('</w:pPr>', `${JUSTIFIED_ALIGNMENT}</w:pPr>`);
    }
    return paragraph.replace(/^(<w:p(?:\s[^>]*)?>)/, `$1<w:pPr>${JUSTIFIED_ALIGNMENT}</w:pPr>`);
};

const justifyDocxParagraphsXml = (documentXml) => {
    let tableDepth = 0;
    return documentXml.replace(TABLE_OR_PARAGRAPH, (element) => {
        if (element.startsWith('<w:tbl')) {
            tableDepth += 1;
            return element;
        }
        if (element === '</w:tbl>') {
            tableDepth -= 1;
            return element;
        }
        return tableDepth ? element : addJustifiedAlignment(element);
    });
};

export const justifyDocxParagraphs = async (documentPath, temporaryDirectory) => {
    const documentEntry = 'word/document.xml';
    const extractedDocument = spawnSync('unzip', ['-p', documentPath, documentEntry], { encoding: 'utf8' });
    if (extractedDocument.error || extractedDocument.status !== 0) {
        throw new Error('No se pudo leer el DOCX para justificar sus párrafos. Comprueba que unzip esté disponible.');
    }

    const documentXmlPath = path.join(temporaryDirectory, documentEntry);
    await mkdir(path.dirname(documentXmlPath), { recursive: true });
    await writeFile(documentXmlPath, justifyDocxParagraphsXml(extractedDocument.stdout));
    const updatedDocument = spawnSync('zip', ['-q', documentPath, documentEntry], { cwd: temporaryDirectory });
    if (updatedDocument.error || updatedDocument.status !== 0) {
        throw new Error('No se pudo actualizar el DOCX con los párrafos justificados. Comprueba que zip esté disponible.');
    }
};
