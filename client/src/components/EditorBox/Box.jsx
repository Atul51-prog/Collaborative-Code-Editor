import React from 'react';
import Editor from "@monaco-editor/react";

const Box = ({ feature, theme, value, fontSize }) => {
    const isError = feature === "Error";

    return (
        <div className="syncode-panel-card">
            <div className={`syncode-panel-header ${isError ? 'is-error-header' : ''}`}>
                <span className="syncode-panel-tag">{feature}</span>
                {isError && <span className="syncode-panel-badge error">Error</span>}
            </div>
            <div className="syncode-panel-body">
                <Editor
                    defaultLanguage="plaintext"
                    height="100%"
                    width="100%"
                    theme={theme}
                    value={value || ''}
                    options={{
                        readOnly: true,
                        domReadOnly: true,
                        fontSize: fontSize || "13px",
                        minimap: { enabled: false },
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        lineNumbers: 'off',
                        glyphMargin: false,
                        folding: false,
                        lineDecorationsWidth: 6,
                        renderLineHighlight: 'none',
                    }}
                />
            </div>
        </div>
    );
};

export default Box;
