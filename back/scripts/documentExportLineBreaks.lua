-- Conserva los saltos HTML de las tablas Markdown al exportar a DOCX/PDF.
function RawInline(element)
    if element.format == 'html' and element.text:lower():match('^<br%s*/?>$') then
        return pandoc.LineBreak()
    end
end
