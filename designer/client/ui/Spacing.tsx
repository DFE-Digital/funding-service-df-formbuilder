import React, { PropsWithChildren } from "react";
import { useUid } from "../hooks";

enum SpacingOption {
    PL = "pl",
    PR = "pr",
    PT = "pt",
    PB = "pb",
    ML = "ml",
    MR = "mr",
    MT = "mt",
    MB = "mb",
    M = "m",
    P = "p",
}

type Props = {
    [SpacingOption.PL]?: SpacingUnit;
    [SpacingOption.PR]?: SpacingUnit;
    [SpacingOption.PT]?: SpacingUnit;
    [SpacingOption.PB]?: SpacingUnit;
    [SpacingOption.ML]?: SpacingUnit;
    [SpacingOption.MR]?: SpacingUnit;
    [SpacingOption.MT]?: SpacingUnit;
    [SpacingOption.MB]?: SpacingUnit;
    [SpacingOption.M]?: SpacingUnit;
    [SpacingOption.P]?: SpacingUnit;
    isStatic?: boolean;
    additionalClasses?: string;
    name?: string;
};

enum SpacingType {
    Margin = "margin",
    Padding = "padding",
}

enum SpacingDirection {
    Left = "left",
    Right = "right",
    Top = "top",
    Bottom = "bottom",
}
/**
 * Units used for spacing component
 * - Zero: Responsive - Large Screen: 0px, Small Screen: 0px; Static - All Screens: 0px
 * - One: Responsive - Large Screen: 5px, Small Screen: 5px; Static - All Screens: 5px
 * - Two: Responsive - Large Screen: 10px, Small Screen: 10px; Static - All Screens: 10px
 * - Three: Responsive - Large Screen: 10px, Small Screen: 10px; Static - All Screens: 10px
 * - Four: Responsive - Large Screen: 20px, Small Screen: 15px; Static - All Screens: 20px
 * - Five: Responsive - Large Screen: 25px, Small Screen: 15px; Static - All Screens: 25px
 * - Six: Responsive - Large Screen: 30px, Small Screen: 20px; Static - All Screens: 30px
 * - Seven: Responsive - Large Screen: 40px, Small Screen: 25px; Static - All Screens: 40px
 * - Eight: Responsive - Large Screen: 50px, Small Screen: 30px; Static - All Screens: 50px
 * - Nine: Responsive - Large Screen: 60px, Small Screen: 40px; Static - All Screens: 60px
 */
export enum SpacingUnit {
    /** Responsive - Large Screen: 0px, Small Screen: 0px; Static - All Screens: 0px */
    Zero = "0",
    /** Responsive - Large Screen: 5px, Small Screen: 5px; Static - All Screens: 5px */
    One = "1",
    /** Responsive - Large Screen: 10px, Small Screen: 10px; Static - All Screens: 10px */
    Two = "2",
    /** Responsive - Large Screen: 10px, Small Screen: 10px; Static - All Screens: 10px */
    Three = "3",
    /** Responsive - Large Screen: 20px, Small Screen: 15px; Static - All Screens: 20px */
    Four = "4",
    /** Responsive - Large Screen: 25px, Small Screen: 15px; Static - All Screens: 25px */
    Five = "5",
    /** Responsive - Large Screen: 30px, Small Screen: 20px; Static - All Screens: 30px */
    Six = "6",
    /** Responsive - Large Screen: 40px, Small Screen: 25px; Static - All Screens: 40px */
    Seven = "7",
    /** Responsive - Large Screen: 50px, Small Screen: 30px; Static - All Screens: 50px */
    Eight = "8",
    /** Responsive - Large Screen: 60px, Small Screen: 40px; Static - All Screens: 60px */
    Nine = "9",
}

const mapTypeAndDirection = {
    [SpacingOption.PL]: {
        type: SpacingType.Padding,
        direction: SpacingDirection.Left,
    },
    [SpacingOption.PR]: {
        type: SpacingType.Padding,
        direction: SpacingDirection.Right,
    },
    [SpacingOption.PT]: {
        type: SpacingType.Padding,
        direction: SpacingDirection.Top,
    },
    [SpacingOption.PB]: {
        type: SpacingType.Padding,
        direction: SpacingDirection.Bottom,
    },
    [SpacingOption.ML]: {
        type: SpacingType.Margin,
        direction: SpacingDirection.Left,
    },
    [SpacingOption.MR]: {
        type: SpacingType.Margin,
        direction: SpacingDirection.Right,
    },
    [SpacingOption.MT]: {
        type: SpacingType.Margin,
        direction: SpacingDirection.Top,
    },
    [SpacingOption.MB]: {
        type: SpacingType.Margin,
        direction: SpacingDirection.Bottom,
    },
    [SpacingOption.M]: {
        type: SpacingType.Margin,
        direction: null,
    },
    [SpacingOption.P]: {
        type: SpacingType.Padding,
        direction: null,
    },
};

type SpacingOptionParseObj = {
    unit: SpacingUnit;
    type: SpacingType;
    direction: SpacingDirection;
};

const convertPropsToClassesStr = (obj: Props) => {
    let spacingClassesStr = "";
    Object.entries(obj).forEach(([option, unit]) => {
        // This guard clause ensures only spacing related prop proceeds
        if (!mapTypeAndDirection[option]) return;
        const parseObj = {
            unit: unit,
            ...mapTypeAndDirection[option],
        };
        const spacingClassStr = constructSpacingClass(
            parseObj,
            obj.isStatic ?? false
        );
        spacingClassesStr = spacingClassesStr.concat(` ${spacingClassStr}`);
    });
    return spacingClassesStr;
};

const constructSpacingClass = (
    obj: SpacingOptionParseObj,
    isStatic: boolean
) => {
    let spacingClass = "govuk-!";
    if (isStatic) spacingClass = spacingClass.concat("-static");
    spacingClass = spacingClass.concat(`-${obj.type}`);
    if (obj.direction) spacingClass = spacingClass.concat(`-${obj.direction}`);
    spacingClass = spacingClass.concat(`-${obj.unit}`);
    return spacingClass;
};

const Spacing = (props: PropsWithChildren<Props>) => {
    const classesStr = convertPropsToClassesStr(props);
    const id = useUid();
    const isPaddingType = classesStr.search("padding") > -1;
    return isPaddingType ? (
        <span
            id={`${props.name ?? "spacing"}-${id}`}
            className={`${props.additionalClasses ?? ""} ${classesStr}`}
        >
            {props.children}
        </span>
    ) : (
        <div
            id={`${props.name ?? "spacing"}-${id}`}
            className={`${props.additionalClasses ?? ""} ${classesStr}`}
        >
            {props.children}
        </div>
    );
};

export default Spacing;
