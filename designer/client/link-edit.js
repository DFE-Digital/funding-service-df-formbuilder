import React, { useContext, useState } from "react";
import SelectConditions from "./conditions/SelectConditions";
import { clone } from "@xgovformbuilder/model";
import { i18n } from "./i18n";

import { DataContext } from "./context";
import { findPage } from "./data";
import { updateLink } from "./data/page";
import logger from "../client/plugins/logger";

const LinkEdit = ({ edge, data, onEdit }) => {
    const context = useContext(DataContext);
    const [page] = findPage(context.data, edge.source);
    const link = page.next.find((n) => n.path === edge.target);
    const [selectedCondition, setSelectedCondition] = useState(link?.condition);

    const onSubmit = async (e) => {
        e.preventDefault();
        const { data, save } = context;
        const updatedData = updateLink(
            data,
            page.path,
            link.path,
            selectedCondition
        );

        try {
            await save(updatedData);
            onEdit();
        } catch (err) {
            logger.error("LinkEdit", err);
        }
    };

    const onClickDelete = (e) => {
        e.preventDefault();

        if (!window.confirm("Confirm delete")) {
            return;
        }

        const { data, save } = context;

        const copy = { ...data };
        const [copyPage] = findPage(data, page.path);
        const copyLinkIdx = copyPage.next.findIndex(
            (n) => n.path === link.path
        );
        copyPage.next.splice(copyLinkIdx, 1);
        copy.pages = copy.pages.map((p) =>
            p.path === copyPage.path ? copyPage : p
        );

        save(copy)
            .then((data) => {
                onEdit({ data });
            })
            .catch((err) => {
                logger.error("LinkEdit", err);
            });
    };

    const conditionSelected = (condition) => {
        setSelectedCondition(condition);
    };

    const { pages } = data;

    return (
        <form onSubmit={onSubmit} autoComplete="off">
            <div className="govuk-form-group">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="link-source"
                >
                    From
                </label>
                <select
                    value={edge.source}
                    className="govuk-select"
                    id="link-source"
                    disabled
                >
                    <option />
                    {pages.map((page) => (
                        <option key={page.path} value={page.path}>
                            {page.title}
                        </option>
                    ))}
                </select>
            </div>
            <div className="govuk-form-group">
                <label
                    className="govuk-label govuk-label--s"
                    htmlFor="link-target"
                >
                    To
                </label>
                <select
                    value={edge.target}
                    className="govuk-select"
                    id="link-target"
                    disabled
                >
                    <option />
                    {pages.map((page) => (
                        <option key={page.path} value={page.path}>
                            {page.title}
                        </option>
                    ))}
                </select>
            </div>
            <SelectConditions
                path={edge.source}
                selectedCondition={selectedCondition}
                conditionsChange={conditionSelected}
                noFieldsHintText={i18n("addLink.noFieldsAvailable")}
            />
            <button className="govuk-button" type="submit">
                Save
            </button>
            &nbsp;
            <button
                className="govuk-button"
                type="button"
                onClick={onClickDelete}
            >
                Delete
            </button>
        </form>
    );
};

export default LinkEdit;
