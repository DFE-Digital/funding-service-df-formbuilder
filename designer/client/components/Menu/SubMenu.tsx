import React, { useContext, useRef } from "react";
import { DataContext } from "../../context";
import { FormDefinition, whichMigrations } from "@xgovformbuilder/model";
import logger from "../../plugins/logger";
import moment from "moment";
import _ from "lodash";
import {
    convertDateTimeString,
    convertLastDownloaded,
} from "../../utils/date-time-fns";

export function migrate(form) {
    const { version = 0 } = form;
    const migrationList = whichMigrations(version);
    try {
        let migratedJson = { ...form };
        migrationList.forEach((migration) => {
            migratedJson = migration(migratedJson);
        });
        return migratedJson;
    } catch (e) {
        logger.error("SubMenu", "failed to migrate json");
    }
}

type Props = {
    id?: string;
    updateDownloadedAt?: (string) => void;
};

export function SubMenu({ id, updateDownloadedAt }: Props) {
    const { data, save } = useContext(DataContext);
    const fileInput = useRef<HTMLInputElement>(null);

    const onClickUpload = () => {
        fileInput.current!.click();
    };

    const onClickDownload = (e) => {
        e.preventDefault();
        const dateTimeNow = new Date();
        const updatedDate = moment(new Date()).format("YYYY/MM/DD, h:mm:ss a");
        data.lastDownloaded = updatedDate;
        save(data);
        const encodedData =
            "text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(data));
        updateDownloadedAt?.(updatedDate);
        const link = document.createElement("a");
        link.download = `${id}.json`;
        link.href = `data:${encodedData}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const onFileUpload = (e) => {
        const file = e.target.files.item(0);
        const reader = new window.FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            const value = (evt.target?.result as string) ?? "";
            const content = JSON.parse(value);
            const migrated = migrate(content) as FormDefinition;
            // This is to allow updating form through uploading json in designer view
            migrated.id = data?.id;
            migrated.key = data?.key;
            migrated.userId = data?.userId;
            migrated.createdBy = data?.createdBy;
            // Allows updating json from cosmosDB envs
            if (_.isEmpty(migrated.file)) migrated.file = "";
            if (migrated.lastModified) {
                migrated.lastModified = convertDateTimeString(
                    migrated.lastModified
                );
            }
            if (migrated.lastDownloaded) {
                migrated.lastDownloaded = convertLastDownloaded(
                    migrated.lastDownloaded
                );
            }
            save(migrated);
        };
    };

    return (
        <div className="menu__row">
            <a href="/app/dashboard" className="govuk-link submenu__link">
                Create new form
            </a>
            <button
                className="govuk-body govuk-link submenu__link"
                onClick={onClickUpload}
            >
                Import saved form
            </button>
            <button
                className="govuk-body govuk-link submenu__link"
                onClick={onClickDownload}
            >
                Download form
            </button>
            <input ref={fileInput} type="file" hidden onChange={onFileUpload} />
        </div>
    );
}
