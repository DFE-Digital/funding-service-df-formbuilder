import React from "react";

import type { PropsWithChildren } from "react";

type Props = {
    show: boolean;
    hideClose?: boolean;
    closeStyleOverride?: boolean;
    onHide?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
    additionalClasses?: string;
};

const Modal = (props: PropsWithChildren<Props>) => {
    const additionalClasses = props.additionalClasses ?? "";
    if (!props.show) {
        return null;
    }

    return (
        <div className={`modal govuk-body`}>
            <div
                className={`${additionalClasses} ${
                    props.closeStyleOverride && "modal-close-link"
                }`}
            >
                {!props.hideClose && (
                    <a
                        title="Close"
                        className={`close govuk-body govuk-!-font-size-16 ${
                            props.closeStyleOverride && "govuk-link"
                        }`}
                        onClick={(e) => {
                            e.preventDefault();
                            props?.onHide?.(e);
                        }}
                    >
                        Close
                    </a>
                )}
                {props.children}
            </div>
        </div>
    );
};

export default Modal;
