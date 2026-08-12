import { ComputeUnit, SelectedEntity } from "../../store/types";

export const getUnitLabel = (unit: ComputeUnit) => {
    if (unit.type === "operator") return unit.value ?? "";
    if (unit.type === "number")
        return unit.value !== null ? String(unit.value) : "";
    if (unit.type === "component") {
        // entity is SelectedEntity
        // For components, show name; for datasets show designedDataSetId-index
        const ent = (unit as any).entity as SelectedEntity | undefined;
        if (!ent) return "";
        if ((ent as any).isComponent) {
            return (ent as any).name ?? "";
        }
        // dataset
        return `
                ${(ent as any).designedDataSetId ?? ""}-${
            (ent as any).index ?? ""
        }
            `;
    }
    if (unit.type === "calculation") {
        const calc = unit.entity;
        return calc.name;
    }
    return "";
};
