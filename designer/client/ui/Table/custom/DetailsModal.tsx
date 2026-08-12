import React from "react";
import { FormConfiguration } from "@xgovformbuilder/model";

import Modal from "../../Modal";

type Props = {
    show: boolean;
    formDetails: FormConfiguration;
    onHide: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
};

const DetailsModal = (props: Props) => {
    return (
        <Modal show={props.show} onHide={props.onHide} closeStyleOverride>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-8">
                Form details
            </h2>
            <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Form name</dt>
                    <dd className="govuk-summary-list__value">
                        {props.formDetails?.DisplayName ?? ""}
                    </dd>
                </div>
                <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Created by</dt>
                    <dd className="govuk-summary-list__value">
                        {props.formDetails?.CreatedBy ?? ""}
                    </dd>
                </div>
                <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                        Last modified by
                    </dt>
                    <dd className="govuk-summary-list__value">
                        {props.formDetails?.lastModifiedByName ?? ""}
                    </dd>
                </div>
                <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                        Last modified on
                    </dt>
                    <dd className="govuk-summary-list__value">
                        {props.formDetails?.LastModified ?? ""}
                    </dd>
                </div>
            </dl>
        </Modal>
    );
};

export default DetailsModal;
