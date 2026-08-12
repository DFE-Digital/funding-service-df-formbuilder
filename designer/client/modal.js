import React from "react";

function Modal(props) {
    if (!props.show) {
        return null;
    }

    return (
        <div className="modal govuk-body">
            <div className={`${props.closeStyleOverride && "modal-close"}`}>
                <a
                    title="Close"
                    className={`close govuk-body govuk-!-font-size-16 ${
                        props.closeStyleOverride && "govuk-link"
                    }`}
                    onClick={(e) => {
                        e.preventDefault();
                        props.onHide(e);
                    }}
                >
                    Close
                </a>
                {props.children}
            </div>
        </div>
    );
}
export default Modal;
