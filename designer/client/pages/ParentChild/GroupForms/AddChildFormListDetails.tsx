import React from "react";

import {
    GridColumn,
    GridColumnType,
    GridRow,
    MultilineFormComponent,
    Spacing,
    SpacingUnit,
    TextFormComponent,
} from "../../../ui";
import ChildContainer from "./ChildContainer";
import {
    setChildHeading,
    setDescription,
    parentChildSelector,
} from "../../../store/reducers/parentChildReducer";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import ChildCardEdit from "./ChildCardEdit";

type Props = {};

const AddChildFormListDetails = (props: Props) => {
    const dispatch = useAppDispatch();
    const parentChildData = useAppSelector(parentChildSelector);
    const { childHeading, description, selectedFormData } = parentChildData;

    const onChildListDescriptionChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const description = e.target.value ?? "";
        dispatch(setDescription(description));
    };

    const onChildListHeadingChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const heading = e.target.value ?? "";
        dispatch(setChildHeading(heading));
    };

    return (
        <>
            <GridRow>
                <GridColumn type={GridColumnType.TwoThirds}>
                    <MultilineFormComponent
                        key={"add-child-list-description"}
                        name={"add-child-list-description"}
                        label={"Add description"}
                        hint={
                            "This is displayed on the runner page above all child form list"
                        }
                        onChange={onChildListDescriptionChange}
                        value={description}
                    />
                    <Spacing mb={SpacingUnit.Four} />
                    <TextFormComponent
                        name={"add-child-list-heading"}
                        label={"Add child list heading"}
                        hint={
                            "This is displayed as a heading for the child form list"
                        }
                        onChange={onChildListHeadingChange}
                        value={childHeading}
                    />
                </GridColumn>
            </GridRow>
            <Spacing mb={SpacingUnit.Eight} />
            <ChildContainer />
            <ChildCardEdit isNewChild={true} formData={selectedFormData} />
        </>
    );
};

export default AddChildFormListDetails;
