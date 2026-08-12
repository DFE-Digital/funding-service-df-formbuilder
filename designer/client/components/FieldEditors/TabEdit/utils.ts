import { DynamicDataSetTabs } from "./types";

export const isReadyToSave = (
    data: DynamicDataSetTabs,
    title: string | undefined,
    numberOfTabs: number
) => {
    const datasetArray = Object.values(data);
    if (datasetArray.length < numberOfTabs) return true;
    const flag = datasetArray.every((dataset) => {
        const readyToSave =
            !!dataset.value &&
            !!dataset.tabHeader &&
            !!dataset.tabLabel &&
            !!title;
        return readyToSave;
    });

    return !flag;
};
