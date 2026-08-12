import React, { createRef } from "react";
import "./FileUpload.scss";

type Props = {
    id: string;
    name: string;
    hintId: string;
    buttonText: string;
    emptyMessage: string;
    selectedFile: File | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    acceptableFileExtension: string;
};

const FileUpload = (props: Props) => {
    const fileInput = createRef<HTMLInputElement>();
    const onUploadButtonClick = () => {
        if (fileInput) {
            fileInput.current?.click();
        }
    };
    return (
        <div className="">
            <div className="file-upload-container">
                <button
                    id={props.id}
                    data-testid={`file-upload-button-${props.id}`}
                    name={props.name}
                    aria-describedby={props.hintId}
                    className="file-upload-button"
                    onClick={onUploadButtonClick}
                >
                    {props.buttonText}
                </button>
                <div className="govuk-body govuk-!-margin-bottom-0">
                    {props.selectedFile
                        ? props.selectedFile.name
                        : props.emptyMessage}
                </div>
            </div>
            <input
                id={props.id}
                name={props.name}
                ref={fileInput}
                type="file"
                aria-describedby={props.hintId}
                onChange={props.onChange}
                accept={props.acceptableFileExtension}
            />
        </div>
    );
};

export default FileUpload;
