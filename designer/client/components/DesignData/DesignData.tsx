import React, { useContext, useState } from "react";
import { i18n } from "../../i18n";
import SummaryScreen from "../DataSets/SummaryScreen";
import { Flyout } from "../Flyout";
import DesignScreen from "./DesignScreen";
import "./DesignData.scss";
import { DataContext } from "../../context";
import { retrieveCsvName } from "./utils/utils";
import { renderDate } from "../../utils/renderDate";
import { DesignedDataSet, FormDefinition } from "@xgovformbuilder/model";
import {
    handleLinkedPropertyEffect,
    Module,
    PropertyAction,
} from "../../utils";
import { Module as ReportModule } from "../../utils/linkedProperties";

export default function DesignData() {
    const { data, save } = useContext(DataContext);
    const [showDesignScreen, setShowDesignScreen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [
        selectedDataSet,
        setSelectedDataSet,
    ] = useState<DesignedDataSet | null>(null);
    const [confirm, setConfirm] = useState(false);

    const columns = [
        {
            key: "dataSetName",
            label: "designData.summaryPage.table.firstHeading",
            render: (val) => val,
            class: "title-ellipsis",
        },
        {
            key: "csvFileUsed",
            label: "designData.summaryPage.table.secondHeading",
            render: (val) => val,
            class: "title-ellipsis",
        },
        {
            key: "designedOn",
            label: "designData.summaryPage.table.thirdHeading",
            render: renderDate,
        },
    ];

    const rows =
        data?.designedDataSets?.map((obj) => ({
            id: obj.id,
            dataSetName: obj.title,
            csvFileUsed: retrieveCsvName(data, obj.csvUsed),
            designedOn: obj.uploadedDate,
        })) ?? [];

    const onAddNewDesign = () => {
        setIsEdit(false);
        setShowDesignScreen(true);
    };

    const onEditDesign = () => {
        setIsEdit(true);
        setShowDesignScreen(true);
    };

    const onDeleteDesign = () => {
        if (selectedDataSet) {
            const updatedDesignedDataSets = data?.designedDataSets?.filter(
                (dataset) => dataset.id !== selectedDataSet.id
            );
            let updatedData: FormDefinition = {
                ...data,
                designedDataSets: updatedDesignedDataSets,
            };
            updatedData = handleLinkedPropertyEffect(
                Module.DesignedDataSet,
                selectedDataSet!,
                PropertyAction.Deleted,
                updatedData
            );
            save(updatedData);
            setSelectedDataSet(null);
            setConfirm(false);
        }
    };

    const isChecked = (id: string) => {
        if (!selectedDataSet) return false;
        return selectedDataSet?.id === id;
    };
    const onItemSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const id = e.target?.value;
        const selectedDesignedDataSet = data?.designedDataSets?.find(
            (dataset) => dataset.id === id
        );
        if (selectedDesignedDataSet) {
            setSelectedDataSet(selectedDesignedDataSet);
            setConfirm(false);
        }
    };

    if (showDesignScreen) {
        return (
            <Flyout
                show={showDesignScreen}
                onHide={() => setShowDesignScreen(false)}
                width="md2"
            >
                <DesignScreen
                    selectedId={selectedDataSet?.id}
                    isEdit={isEdit}
                    setShowDesignScreen={setShowDesignScreen}
                />
            </Flyout>
        );
    }

    return (
        <SummaryScreen
            selectedDataSet={selectedDataSet}
            introMesage={i18n("designData.summaryPage.intro")}
            addLabel={i18n("designData.summaryPage.buttons.design")}
            editLabel={i18n("designData.summaryPage.buttons.edit")}
            deleteLabel={i18n("designData.summaryPage.buttons.delete")}
            onAdd={onAddNewDesign}
            onEdit={onEditDesign}
            onDelete={onDeleteDesign}
            emptyMessage={i18n("importData.summaryPage.table.emptyDataMessage")}
            rows={rows}
            onItemSelect={onItemSelect}
            isChecked={isChecked}
            columns={columns}
            moduleType={ReportModule.DesignedDataSet}
            confirm={confirm}
            setConfirm={setConfirm}
        />
    );
}
