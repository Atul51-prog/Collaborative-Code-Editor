import React from 'react';
import Editor from "@monaco-editor/react"

const InputBox = (props) => {

    const handleEditorChange = (value) => {
        props.setProperty(value ?? "");
    }

    return (
        <div className="workspace-box">
            <div className="workspace-box-title">
                <strong>{props.feature}</strong>
            </div>
            <section className="workspace-box-editor">
                <Editor
                    defaultLanguage="plaintext"
                    height="100%"
                    width="100%"
                    theme={props.theme}
                    path="inmemory://syncode/panel-input"
                    defaultValue=""
                    onChange={handleEditorChange}
                    options={{
                        fontSize: props.fontSize,
                        automaticLayout: true,
                        minimap: { enabled: false },
                        lineNumbers: "off",
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        padding: { top: 6 },
                    }}
                />
            </section>
        </div>
    )
}

export default InputBox
