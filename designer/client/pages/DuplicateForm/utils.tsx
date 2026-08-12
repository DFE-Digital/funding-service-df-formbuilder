import React from "react";
import { Generics, GenericsColor } from "../../ui";

type FlagProps = {
    hasUniqueName: boolean;
};

export const RenderDuplicateGeneric = (props: FlagProps) => {
    const text = props.hasUniqueName ? "C" : "NC";
    const color = props.hasUniqueName ? GenericsColor.Green : GenericsColor.Red;
    return <Generics text={text} color={color} />;
};
