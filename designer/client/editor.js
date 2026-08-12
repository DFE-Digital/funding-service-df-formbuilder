import React from "react";
import SimpleEditor from "react-simple-code-editor";
import core from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-markup";
import "prismjs/themes/prism.css";
import "./editor.scss";

class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value || "",
        };
    }

    setState(state, callback) {
        super.setState(state, callback);
        if (state.value && this.props.valueCallback) {
            this.props.valueCallback(state.value);
        }
    }

    render() {
        return (
            <main className="container">
                <div className="container__content">
                    <div className="container_editor_area">
                        <SimpleEditor
                            textareaId={this.props.id}
                            name={this.props.name}
                            className="container__editor"
                            value={this.state.value}
                            required={this.props.required}
                            highlight={(code) =>
                                core.highlight(code, core.languages.js)
                            }
                            onValueChange={(value) => this.setState({ value })}
                            padding={5}
                            style={{
                                fontFamily:
                                    '"Fira code", "Fira Mono", monospace',
                                border: "2px solid #0b0c0c",
                                fontSize: 16,
                            }}
                        />
                    </div>
                </div>
            </main>
        );
    }
}

export default Editor;
