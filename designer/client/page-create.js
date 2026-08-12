import React, { useState, useContext } from "react";

import SelectConditions from "./conditions/SelectConditions";
import { toUrl } from "./helpers";
import { RenderInPortal } from "./components/RenderInPortal";
import { Flyout } from "./components/Flyout";
import { i18n, withI18n } from "./i18n";
import ErrorSummary from "./error-summary";
import { validateTitle, hasValidationErrors } from "./validations";
import { DataContext } from "./context";
import { addLink, findPage } from "./data";
import { addPage } from "./data/page/addPage";
import randomId from "./randomId";
import logger from "../client/plugins/logger";
import { LabelSizes, Spacing, SpacingUnit, TextFormComponent } from "./ui";

function PageCreate({ page, data, i18n, onCreate }) {
    const { save } = useContext(DataContext);
    const [state, setState] = useState({
        path: "/",
        controller: page?.controller ?? "",
        title: page?.title,
        section: page?.section ?? {},
        isEditingSection: false,
        errors: {},
        linkFrom: "",
        pageType: "",
        selectedCondition: "",
    });

    const findSectionWithName = (name) => {
        const { sections } = data;
        return sections.find((section) => section.name === name);
    };

    const generatePath = (title) => {
        let path = toUrl(title);
        if (
            title.length > 0 &&
            data.pages.find((page) => page.path.startsWith(path))
        ) {
            path = `${path}-${randomId()}`;
        }
        return path;
    };

    const validate = (title, path) => {
        const titleErrors = validateTitle("page-title", title, i18n);
        const errors = { ...titleErrors };
        const alreadyExists = data.pages.find((page) => page.path === path);
        if (alreadyExists) {
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

        const title = state.title?.trim();
        const linkFrom = state.linkFrom?.trim();
        const section = state.section?.name?.trim();
        const pageType = state.pageType?.trim();
        const selectedCondition = state.selectedCondition?.trim();
        const path = state.path;

        let validationErrors = validate(title, path);
        if (hasValidationErrors(validationErrors)) return;

        const value = {
            path,
            title,
            components: [],
            next: [],
        };
        if (section) {
            value.section = section;
        }
        if (pageType) {
            value.controller = pageType;
        }

        let copy = addPage({ ...data }, value);

        if (linkFrom) {
            copy = addLink(copy, linkFrom, path, selectedCondition);
        }

        if (pageType === "./pages/start.js") {
            copy.startPage = path;
        }

        try {
            await save(copy);
            onCreate({ value });
        } catch (err) {
            logger.error("PageCreate", err);
        }
    };

    const onChangeSection = (e) => {
        const input = e.target;
        setState((prev) => ({
            ...prev,
            section: findSectionWithName(input.value),
        }));
    };

    const onChangeLinkFrom = (e) => {
        const input = e.target;
        setState((prev) => ({
            ...prev,
            linkFrom: input.value,
        }));
    };

    const onChangePageType = (e) => {
        const input = e.target;
        setState((prev) => ({
            ...prev,
            pageType: input.value,
        }));
    };

    const onChangeTitle = (e) => {
        const input = e.target;
        const title = input.value;
        setState((prev) => ({
            ...prev,
            title,
            path: generatePath(title),
        }));
    };

    const onChangePath = (e) => {
        const input = e.target;
        const path = input.value.startsWith("/")
            ? input.value
            : `/${input.value}`;
        const sanitisedPath = path.replace(/\s/g, "-");
        setState((prev) => ({
            ...prev,
            path: sanitisedPath,
        }));
    };

    const conditionSelected = (selectedCondition) => {
        setState((prev) => ({
            ...prev,
            selectedCondition,
        }));
    };

    const editSection = (e, section) => {
        e.preventDefault();
        setState((prev) => ({
            ...prev,
            section,
            isEditingSection: true,
        }));
    };

    const closeFlyout = (sectionName) => {
        const propSection = state.section ?? {};
        setState((prev) => ({
            ...prev,
            isEditingSection: false,
            section: sectionName
                ? findSectionWithName(sectionName)
                : propSection,
        }));
    };

    const { sections, pages } = data;
    const {
        pageType,
        linkFrom,
        title,
        section,
        path,
        isEditingSection,
        errors,
    } = state;

    return (
        <div>
            {hasValidationErrors(errors) > 0 && (
                <ErrorSummary errorList={Object.values(errors)} />
            )}
            <form onSubmit={onSubmit} autoComplete="off">
                <div className="govuk-form-group">
                    <label
                        className="govuk-label govuk-label--s"
                        htmlFor="page-type"
                    >
                        {i18n("addPage.pageTypeOption.title")}
                    </label>
                    <span className="govuk-hint">
                        {i18n("addPage.pageTypeOption.helpText")}
                    </span>
                    <select
                        className="govuk-select"
                        id="page-type"
                        name="page-type"
                        value={pageType}
                        onChange={onChangePageType}
                    >
                        <option value="">Question Page</option>
                        <option value="./pages/start.js">Start Page</option>
                        <option value="./pages/summary.js">Summary Page</option>
                    </select>
                </div>

                <div className="govuk-form-group">
                    <label
                        className="govuk-label govuk-label--s"
                        htmlFor="link-from"
                    >
                        {i18n("addPage.linkFromOption.title")}
                    </label>
                    <span className="govuk-hint">
                        {i18n("addPage.linkFromOption.helpText")}
                    </span>
                    <select
                        className="govuk-select"
                        id="link-from"
                        name="from"
                        value={linkFrom}
                        onChange={onChangeLinkFrom}
                    >
                        <option />
                        {pages.map((page) => (
                            <option key={page.path} value={page.path}>
                                {page.path}
                            </option>
                        ))}
                    </select>
                </div>

                {linkFrom && linkFrom.trim() !== "" && (
                    <SelectConditions
                        data={data}
                        path={linkFrom}
                        conditionsChange={conditionSelected}
                        noFieldsHintText={i18n("conditions.noFieldsAvailable")}
                    />
                )}

                <TextFormComponent
                    name="title"
                    label={i18n("addPage.pageTitleField.title")}
                    labelSize={LabelSizes.S}
                    value={title || ""}
                    onChange={onChangeTitle}
                    error={errors?.title && errors?.title.children}
                />
                <Spacing mb={SpacingUnit.Six} />

                <TextFormComponent
                    name="path"
                    label={i18n("addPage.pathField.title")}
                    labelSize={LabelSizes.S}
                    hint={i18n("addPage.pathField.helpText")}
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
                        {i18n("addPage.sectionOption.title")}
                    </label>
                    <span className="govuk-hint">
                        {i18n("addPage.sectionOption.helpText")}
                    </span>
                    {sections.length > 0 && (
                        <select
                            className="govuk-select"
                            id="page-section"
                            name="section"
                            value={section?.name}
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
                    {/* {section?.name && (
                            <a
                                href="#"
                                className="govuk-link govuk-!-display-block"
                                onClick={this.editSection}
                            >
                                Edit section
                            </a>
                        )} */}
                    {/* <a
                            href="#"
                            className="govuk-link govuk-!-display-block"
                            onClick={this.editSection}
                        >
                            Create section
                        </a> */}
                </div>

                <button type="submit" className="govuk-button">
                    Save
                </button>
            </form>
        </div>
    );
}

export default withI18n(PageCreate);
