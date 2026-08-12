import { FormAccessType } from "@xgovformbuilder/model";
import RadioInputOption from "./RadioInputOption";
import React from "react";

export default function RadioInputOptions({
    selectedAccessType,
    handleRadioCheck,
    formName,
    serverError,
}) {
    const formAccessTypeList = [
        FormAccessType.Public,
        FormAccessType.DFESignIn,
    ];
    const radioOptions = formAccessTypeList.map((formAccessType) => (
        <RadioInputOption
            key={formAccessType}
            formAccessType={formAccessType}
            handleRadioCheck={handleRadioCheck}
            selectedAccessType={selectedAccessType}
            formName={formName}
            serverError={serverError}
        />
    ));

    return <>{radioOptions}</>;
}
