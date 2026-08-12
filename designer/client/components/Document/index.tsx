import React, { useContext, useState } from "react";
import { Documents, FormDefinition } from "@xgovformbuilder/model";
import { i18n } from "../../i18n";
import SummaryScreen from "../DataSets/SummaryScreen";
import { renderDate } from "../../utils/renderDate";
import DocumentUpload from "./DocumentUpload";
import { DataContext } from "../../context";
import { Flyout } from "../Flyout";
import {
    Module,
    handleLinkedPropertyEffect,
    PropertyAction,
} from "../../utils";
import { Module as ReportModule } from "../../utils/linkedProperties";

/** Translation Function */
const t = (key) => i18n("documents.summaryPage." + key);

type Props = {};

const Document = (props: Props) => {
    const { data, save } = useContext(DataContext);
    const [selectedDocument, setSelectedDocument] = useState<Documents | null>(
        null
    );
    const [showDocumentUpload, setShowDocumentUpload] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [confirm, setConfirm] = useState(false);

    const onAddDocument = () => {
        setIsEdit(false);
        setShowDocumentUpload(true);
    };
    const onEditDocument = () => {
        setIsEdit(true);
        setShowDocumentUpload(true);
    };
    const onDeleteDocument = () => {
        if (!selectedDocument) return;
        const filteredDocuments = data?.documents?.filter(
            (doc) => doc.id !== selectedDocument.id
        );
        let updatedData: FormDefinition = {
            ...data,
            documents: filteredDocuments ?? [],
        };
        updatedData = handleLinkedPropertyEffect(
            Module.Document,
            selectedDocument!,
            PropertyAction.Deleted,
            updatedData
        );
        save(updatedData);
        setSelectedDocument(null);
        setConfirm(false);
    };
    const onDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDocumentId = e.target?.value;
        if (!selectedDocumentId) return;
        const filterDocumentById = data?.documents?.filter(
            (doc) => doc.id === selectedDocumentId
        );
        if (!filterDocumentById?.length) return;
        setSelectedDocument(filterDocumentById[0]);
        setConfirm(false);
    };
    const isChecked = (id: string) => {
        if (!selectedDocument) return false;
        return selectedDocument?.id === id;
    };
    const rows = data?.documents ?? [];
    const columns = [
        {
            key: "title",
            label: "documents.summaryPage.table.fileTitle",
            render: (val) => val,
            class: "title-ellipsis",
        },
        {
            key: "uploadedDate",
            label: "documents.summaryPage.table.importedOn",
            render: renderDate,
        },
        {
            key: "type",
            label: "documents.summaryPage.table.documentType",
            render: (val: string) => val.toUpperCase(),
            class: "title-ellipsis",
        },
    ];

    if (showDocumentUpload) {
        return (
            <Flyout
                show={showDocumentUpload}
                onHide={() => setShowDocumentUpload(false)}
                width="md2"
            >
                <DocumentUpload
                    isEdit={isEdit}
                    selectedId={selectedDocument?.id!}
                    setShowDocumentUpload={setShowDocumentUpload}
                />
            </Flyout>
        );
    }

    return (
        <SummaryScreen
            selectedDataSet={selectedDocument}
            introMesage={t("intro")}
            addLabel={t("buttons.import")}
            editLabel={t("buttons.edit")}
            deleteLabel={t("buttons.delete")}
            onAdd={onAddDocument}
            onEdit={onEditDocument}
            onDelete={onDeleteDocument}
            emptyMessage={t("table.emptyDataMessage")}
            rows={rows}
            onItemSelect={onDocumentSelect}
            isChecked={isChecked}
            columns={columns}
            moduleType={ReportModule.Document}
            confirm={confirm}
            setConfirm={setConfirm}
        />
    );
};

export default Document;
