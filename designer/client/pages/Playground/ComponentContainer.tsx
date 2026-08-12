import React, { PropsWithChildren } from "react";
import { Spacing, SpacingUnit } from "../../ui";

type Props = {
    title: string;
};

const ComponentContainer = (props: PropsWithChildren<Props>) => {
    return (
        <Spacing
            name={"component-container"}
            mb={SpacingUnit.Three}
            additionalClasses="component-container"
        >
            <h1 className="govuk-heading-m">{props.title}</h1>
            <Spacing mb={SpacingUnit.Two} />
            {props.children}
        </Spacing>
    );
};

export default ComponentContainer;
