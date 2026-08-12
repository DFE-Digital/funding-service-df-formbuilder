import React, { useContext, useState, useRef } from "react";
import { clone } from "@xgovformbuilder/model";
import randomId from "./randomId";

import { toUrl } from "./helpers";
import { RenderInPortal } from "./components/RenderInPortal";
import { Flyout } from "./components/Flyout";
import { withI18n } from "./i18n";
import ErrorSummary from "./error-summary";
import { validateTitle, hasValidationErrors } from "./validations";
import { DataContext } from "./context";

import FeatureToggle from "./FeatureToggle";
import { FeatureFlags } from "./context/FeatureFlagContext";
import { findPage, updateLinksTo } from "./data";
import logger from "../client/plugins/logger";
import { LabelSizes, Spacing, SpacingUnit, TextFormComponent } from "./ui";
import LinkedPropertiesDetails from "./utils/LinkedPropertiesDetails";
import { Module as ReportModule } from "./utils/linkedProperties";
import { handleLinkedPropertyEffect, Module, PropertyAction } from "./utils";

export function PageEdit({ page, i18n, onEdit }) {
    const { data, save } = useContext(DataContext);
    const formEditSection = useRef();

    const generatePath = (title) => {
        let path = toUrl(title);
        if (data.pages.find((p) => p.path === path) && page.title !== title) {
            path = `${path}-${randomId()}`;
        }
        return path;
    };

    const [state, setState] = useState({
        path: page?.path ?? generatePath(page.title),
        controller: page?.controller ?? "",
        title: page?.title ?? "",
        section: page?.section ?? "",
        isEditingSection: false,
        isNewSection: false,
        errors: {},
    });

    const [confirm, setConfirm] = useState(false);

    const validate = (title, path) => {
        const titleErrors = validateTitle("page-title", title, i18n);
        const errors = { ...titleErrors };

        let pathHasErrors = false;
        if (path !== page.path)
            pathHasErrors = data.pages.find((p) => p.path === path);
        if (pathHasErrors) {
            errors.path = {
                href: "#page-path",
                children: `Path '${path}' already exists`,
            };
        }

        setState((prev) => ({ ...prev, errors }));
        return errors;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const { title, path, section, controller } = state;

        const errors = validate(title, path);
        if (hasValidationErrors(errors)) return;

        let copy = { ...data };
        const [copyPage, copyIndex] = findPage(data, page.path);
        const pathChanged = path !== page.path;

        if (pathChanged) {
            copy = updateLinksTo(data, page.path, path);
            copyPage.path = path;
            if (copy.startPage === page.path) copy.startPage = path;
        }

        Object.assign(copyPage, {
            title,
            ...(section ? { section } : { section: undefined }),
            ...(controller ? { controller } : { controller: undefined }),
        });

        copy.pages[copyIndex] = copyPage;
        if (controller === "./pages/start.js") copy.startPage = path;

        try {
            await save(copy);
            onEdit();
        } catch (err) {
            logger.error("PageEdit", err);
        }
    };

    const onClickDelete = async (e) => {
        e.preventDefault();

        if (!window.confirm("Confirm delete")) {
            return;
        }

        let copy = clone(data);

        copy = handleLinkedPropertyEffect(
            Module.Page,
            page,
            PropertyAction.Deleted,
            copy
        );

        const copyPageIdx = copy.pages.findIndex((p) => p.path === page.path);

        // Remove all links to the page
        copy.pages.forEach((p, index) => {
            if (index !== copyPageIdx && Array.isArray(p.next)) {
                for (let i = p.next.length - 1; i >= 0; i--) {
                    const next = p.next[i];
                    if (next.path === page.path) {
                        p.next.splice(i, 1);
                    }
                }
            }
        });

        const deletedPage = copy.pages[copyPageIdx];
        if (deletedPage.path === copy.startPage) {
            // If the deleted page is the start page, set the next page as the new start page
            const nextPage = deletedPage.next?.[0];
            copy.startPage = nextPage?.path || "";
        }

        // Remove the page from the copy
        copy.pages.splice(copyPageIdx, 1);

        try {
            await save(copy);
            // Close the edit flyout
            onEdit();
        } catch (error) {
            logger.error("PageEdit", error);
        }
    };

    const onClickDuplicate = async (e) => {
        e.preventDefault();
        const copy = clone(data);
        const duplicatedPage = clone(page);
        duplicatedPage.path = `${duplicatedPage.path}-${randomId()}`;
        duplicatedPage.components.forEach((component) => {
            component.name = `${duplicatedPage.path.substr(1)}-${randomId()}`;
        });
        copy.pages.push(duplicatedPage);
        try {
            await save(copy);
            onEdit();
        } catch (err) {
            logger.error("PageEdit", err);
        }
    };

    const onChangeTitle = (e) => {
        const title = e.target.value;
        setState((prev) => ({
            ...prev,
            title: title,
            path: generatePath(title),
        }));
    };

    const onChangePath = (e) => {
        const input = e.target.value;
        const path = input.startsWith("/") ? input : `/${input}`;
        setState((prev) => ({
            ...prev,
            path: path.replace(/\s/g, "-"),
        }));
    };

    const editSection = (e, newSection = false) => {
        e.preventDefault();
        setState((prev) => ({
            ...prev,
            isEditingSection: true,
            isNewSection: newSection,
        }));
    };

    const closeFlyout = (sectionName) => {
        const propSection = state.section ?? page?.section ?? "";
        setState((prev) => ({
            ...prev,
            isEditingSection: false,
            section: sectionName,
        }));
    };

    const onChangeSection = (e) => {
        const input = e.target;
        setState((prev) => ({
            ...prev,
            section: input.value,
        }));
    };

    const onChangePageType = (e) => {
        const input = e.target;
        setState((prev) => ({
            ...prev,
            controller: input.value,
        }));
    };

    const findSectionWithName = (name) => {
        const { sections } = data;
        return sections.find((section) => section.name === name);
    };

    const {
        title,
        path,
        controller,
        section,
        isEditingSection,
        isNewSection,
        errors,
    } = state;
    const { sections } = data;

    return (
        <div data-testid="page-edit">
            {errors && Object.keys(errors).length > 0 && (
                <ErrorSummary errorList={Object.values(errors)} />
            )}
            <form onSubmit={onSubmit} autoComplete="off">
                <div className="govuk-form-group">
                    <label
                        className="govuk-label govuk-label--s"
                        htmlFor="page-type"
                    >
                        {i18n("page.type")}
                    </label>
                    <select
                        className="govuk-select"
                        id="page-type"
                        name="page-type"
                        value={controller}
                        onChange={(e) => onChangePageType(e)}
                    >
                        <option value="">{i18n("page.types.question")}</option>
                        <option value="./pages/start.js">
                            {i18n("page.types.start")}
                        </option>
                        <option value="./pages/summary.js">
                            {i18n("page.types.summary")}
                        </option>
                        <option value="./pages/parentchild.js">
                            {i18n("page.types.parentchild")}
                        </option>
                    </select>
                </div>
                <TextFormComponent
                    name="title"
                    label={i18n("page.title")}
                    labelSize={LabelSizes.S}
                    value={title}
                    onChange={onChangeTitle}
                    error={errors?.title && errors?.title.children}
                />
                <Spacing mb={SpacingUnit.Six} />
                <TextFormComponent
                    name="path"
                    label={i18n("page.path")}
                    labelSize={LabelSizes.S}
                    hint={i18n("page.pathHint")}
                    value={path}
                    onChange={onChangePath}
                    error={errors?.path && errors?.path.children}
                />
                <Spacing mb={SpacingUnit.Six} />
                <div className="govuk-form-group">
                    <label
                        className="govuk-label govuk-label--s"
                        htmlFor="page-section"
                    >
                        {i18n("page.section")}
                    </label>
                    <span className="govuk-hint">
                        {i18n("page.sectionHint")}
                    </span>
                    {sections.length > 0 && (
                        <select
                            className="govuk-select"
                            id="page-section"
                            name="section"
                            value={section}
                            onChange={onChangeSection}
                        >
                            <option />
                            {sections.map((section) => (
                                <option key={section.name} value={section.name}>
                                    {section.title}
                                </option>
                            ))}
                        </select>
                    )}
                    {/* {section && (
                            <a
                                href="#"
                                className="govuk-link govuk-!-display-block"
                                onClick={this.editSection}
                            >
                                {i18n("section.edit")}
                            </a>
                        )} */}
                    {/* {!section && (
                            <a
                                href="#"
                                className="govuk-link govuk-!-display-block"
                                onClick={(e) => this.editSection(e, true)}
                            >
                                {i18n("section.create")}
                            </a>
                        )} */}
                </div>
                <button className="govuk-button" type="submit">
                    {i18n("page.save")}
                </button>{" "}
                <FeatureToggle
                    feature={FeatureFlags.FEATURE_EDIT_PAGE_DUPLICATE_BUTTON}
                >
                    <button
                        className="govuk-button govuk-button--secondary"
                        type="button"
                        onClick={onClickDuplicate}
                    >
                        {i18n("page.duplicate")}
                    </button>{" "}
                </FeatureToggle>
                <Spacing mb={SpacingUnit.Six} />
                <LinkedPropertiesDetails
                    module={ReportModule.Page}
                    selectedComponent={page}
                    confirm={confirm}
                    setConfirm={setConfirm}
                />
                <button
                    className="govuk-button govuk-button--warning"
                    type="button"
                    onClick={onClickDelete}
                    disabled={!confirm}
                >
                    {i18n("page.delete")}
                </button>
            </form>
        </div>
    );
}

export default withI18n(PageEdit);
