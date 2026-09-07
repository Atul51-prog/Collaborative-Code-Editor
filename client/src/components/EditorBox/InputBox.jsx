import React from 'react';

const InputBox = ({ feature, theme, setProperty, value, fontSize }) => {
    const isDark = theme !== "light";

    const handleInputChange = (e) => {
        const newVal = e.target.value;
        console.log("INPUT CHANGED:", JSON.stringify(newVal));
        setProperty(newVal);
    };

    return (
        <div className="syncode-panel-card">
            <div className="syncode-panel-header">
                <span className="syncode-panel-tag">{feature}</span>
                <span className="syncode-panel-hint">stdin</span>
            </div>
            <div
                className="syncode-panel-body"
                style={{
                    backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                }}
            >
                <textarea
                    className="syncode-panel-textarea"
                    value={value ?? ''}
                    onChange={handleInputChange}
                    placeholder="Enter standard input (stdin) here..."
                    spellCheck="false"
                    style={{
                        color: isDark ? '#d4d4d4' : '#1e1e1e',
                        fontSize: fontSize || "13px",
                    }}
                />
            </div>
        </div>
    );
};

export default InputBox;
