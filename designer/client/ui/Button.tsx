import React, { PropsWithChildren } from "react";

type Props = {
    name: string;
    text: string;
    type?: ButtonType;
    variant?: ButtonVariant;
    href?: string;
    additionalClasses?: string;
    isAnchor?: boolean;
    isDisabled?: boolean;
    startIcon?: boolean;
    onButtonClick?: (
        e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>
    ) => void;
};

type ButtonGroupProps = {};

export enum ButtonType {
    Button = "button",
    Submit = "submit",
    Reset = "reset",
}

export enum ButtonVariant {
    Primary = "govuk-button",
    Secondary = "govuk-button govuk-button--secondary",
    Warning = "govuk-button govuk-button--warning",
    Inverse = "govuk-button govuk-button--inverse",
    Start = "govuk-button govuk-button--start",
}

export const ButtonGroup = (props: PropsWithChildren<ButtonGroupProps>) => {
    return <div className="govuk-button-group">{props.children}</div>;
};

const Button = (props: Props) => {
    const type = props.type ?? ButtonType.Button;
    const variant = props.variant ?? ButtonVariant.Primary;
    const emptyClickFn = (
        e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
    };

    const onClick = props.onButtonClick ?? emptyClickFn;
    if (!!props.isAnchor) {
        return (
            <a
                href={props.href ?? "#"}
                role="button"
                draggable="false"
                className={`${variant} ${
                    props.isDisabled ? "disabled_a_button" : ""
                } ${props.additionalClasses ?? ""}`}
                data-module="govuk-button"
                onClick={onClick}
            >
                {props.text}
                {!!props.startIcon && (
                    <svg
                        className="govuk-button__start-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        width="17.5"
                        height="19"
                        viewBox="0 0 33 40"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path
                            fill="currentColor"
                            d="M0 0h13l20 20-20 20H0l20-20z"
                        />
                    </svg>
                )}
            </a>
        );
    }
    return (
        <button
            name={`${props.name}-button`}
            type={type}
            className={`${variant} ${props.additionalClasses ?? ""}`}
            data-module="govuk-button"
            disabled={props.isDisabled}
            aria-disabled={props.isDisabled}
            onClick={onClick}
        >
            {props.text}
        </button>
    );
};

export default Button;
