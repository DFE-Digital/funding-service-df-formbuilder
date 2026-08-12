import React, { useContext } from "react";
import { FormDefinition } from "@xgovformbuilder/model";

import { getUnitLabel } from "./util";
import { DataContext } from "../../context/DataContext";
import {
    ComputeComponentUnit,
    ComputeCalculationUnit,
    ComputeUnit,
} from "../../store/types";

import computeUnitBlockStyles from "./ComputeUnitBlock.module.scss";

type Props = {
    hideTooltip: boolean;
    unit: ComputeUnit;
};

type UnitWithEntity = ComputeComponentUnit | ComputeCalculationUnit;

const getTooltipData = (unit: UnitWithEntity, data: FormDefinition) => {
    const componentName = (unit.entity as any)?.name;
    const componentType =
        (unit.entity as any)?.type === "NumberField"
            ? "Number component"
            : unit.type === "calculation"
            ? "Existing calculation"
            : (unit.entity as any)?.designedDataSetId != undefined
            ? "Design data set"
            : (unit.entity as any)?.type;

    // For dataset-selected entities the useful label is often the cell/value; for components/calculations prefer title
    let componentTitle: string | undefined;
    if (
        (unit.entity as any)?.designedDataSetId !== undefined &&
        (unit.entity as any)?.value !== undefined
    ) {
        componentTitle = String((unit.entity as any).value)
            .split("-")
            .join(" - ");
    } else {
        componentTitle =
            (unit.entity as any)?.title ??
            String((unit.entity as any)?.value ?? "");
    }

    const page = data.pages.find((p) =>
        p.components?.some((c) => c.name === componentName)
    );
    const sectionTitle = page
        ? data.sections.find((s) => s.name === page.section)?.title
        : undefined;

    return {
        title: componentTitle,
        page:
            (unit.entity as any)?.designedDataSetId != undefined
                ? (unit.entity as any)?.index
                : page?.title,
        comptype: componentType,
        pageName:
            (unit.entity as any)?.designedDataSetId != undefined
                ? "Cell"
                : "Page",
        section: sectionTitle,
    };
};

const ComputeTooltip = (props: Props) => {
    const { hideTooltip, unit } = props;
    const { data } = useContext(DataContext);
    const tooltip =
        unit.type === "component" || unit.type === "calculation"
            ? getTooltipData(unit as UnitWithEntity, data)
            : null;
    if (hideTooltip || !tooltip) return <></>;
    return (
        <div className={computeUnitBlockStyles.tooltip}>
            {tooltip!.comptype} : <b>{getUnitLabel(unit)}</b>
            <hr
                className={`govuk-section-break govuk-section-break--visible ${computeUnitBlockStyles.margin10}`}
            />
            <div className={computeUnitBlockStyles.tooltipRow}>
                <span>Title</span>
                <span>:</span>
                <span>{tooltip!.title}</span>
            </div>
            {unit.type === "component" && (
                <div className={computeUnitBlockStyles.tooltipRow}>
                    <span>{tooltip!.pageName}</span>
                    <span>:</span>
                    <span>{tooltip!.page}</span>
                </div>
            )}
            {tooltip!.section != null && (
                <div className={computeUnitBlockStyles.tooltipRow}>
                    <span>Section</span>
                    <span>:</span>
                    <span>{tooltip!.section}</span>
                </div>
            )}
        </div>
    );
};

export default ComputeTooltip;
