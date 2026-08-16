import React from 'react';
import Editor from "@monaco-editor/react"

const Box = (props) => {

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
                    path={`inmemory://syncode/panel-${props.feature.toLowerCase()}`}
                    value={props.value}
                    options={{
                        fontSize: props.fontSize,
                        readOnly: true,
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

export default Box
