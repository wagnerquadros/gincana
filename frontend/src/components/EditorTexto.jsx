import { useEffect, useRef } from "react";

/**
 * EditorTexto – editor leve com contentEditable.
 * Props:
 *  - value (string HTML)
 *  - onChange(htmlString)
 *  - placeholder (string)
 *  - height (ex.: "160px")
 */
export default function EditorTexto({ value = "", onChange, placeholder = "", height = "160px" }) {
    const divRef = useRef(null);

    // sincroniza valor externo -> editor
    useEffect(() => {
        if (divRef.current && divRef.current.innerHTML !== value) {
            divRef.current.innerHTML = value || "";
        }
    }, [value]);

    function handleInput() {
        onChange?.(divRef.current?.innerHTML || "");
    }

    function cmd(command, arg = null) {
        // foca na área editável antes do comando
        divRef.current?.focus();
        document.execCommand(command, false, arg);
        // dispara onChange após o comando
        onChange?.(divRef.current?.innerHTML || "");
    }

    function addLink() {
        const url = window.prompt("Informe a URL do link:");
        if (!url) return;
        cmd("createLink", url);
    }

    function clearFormat() {
        cmd("removeFormat");
    }

    return (
        <div className="rte-wrap">
            <div className="rte-toolbar">
                <button type="button" className="rte-btn" onClick={() => cmd("bold")} title="Negrito"><b>B</b></button>
                <button type="button" className="rte-btn" onClick={() => cmd("italic")} title="Itálico"><i>I</i></button>
                <button type="button" className="rte-btn" onClick={() => cmd("underline")} title="Sublinhar"><u>U</u></button>
                <span className="rte-sep" />
                <button type="button" className="rte-btn" onClick={() => cmd("insertUnorderedList")} title="Lista não ordenada">• List</button>
                <button type="button" className="rte-btn" onClick={() => cmd("insertOrderedList")} title="Lista ordenada">1. List</button>
                <span className="rte-sep" />
                <button type="button" className="rte-btn" onClick={addLink} title="Inserir link">🔗</button>
                <button type="button" className="rte-btn" onClick={clearFormat} title="Limpar formatação">🧹</button>
            </div>

            <div
                ref={divRef}
                className="rte-area input"
                contentEditable
                onInput={handleInput}
                data-placeholder={placeholder || ""}
                style={{ height }}
            />
        </div>
    );
}
