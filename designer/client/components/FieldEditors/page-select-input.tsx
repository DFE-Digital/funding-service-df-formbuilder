import React from "react";

const PageSelectInput = ({
    pages,
    resultCreationPage,
    datasets,
    sections,
    setPageSelected,
    setDatasetSelected,
    setDisplayCalculations4mPage,
    setDisplayDatasets,
    setDisplayComponents4mPage,
    setRepeatableSection,
    setShowRPlus,
}) => {
    /* On selection of page get all the components from that page */
    const getComponentsFromPage = (
        target: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedType = target?.currentTarget?.value?.split("_")[0];
        const targetValue = target?.currentTarget?.value?.split("_")[1];
        if (selectedType === "page") {
            if (targetValue !== "") {
                setPageSelected(true);
                setDatasetSelected(false);
            } else {
                setPageSelected(false);
                setDatasetSelected(false);
            }
            setDisplayDatasets([]);
            const pageDetails = pages.filter(
                (page) => page.path == targetValue
            );
            const createRPlusExpression = (pagePath, pageDetails) => {
                const currentPageSection = getSectionDetailsByPagePath(
                    pageDetails[0].path
                );
                const resultCompCreationPage = getSectionDetailsByPagePath(
                    pagePath
                );
                console.log(currentPageSection, resultCompCreationPage);
                if (
                    currentPageSection &&
                    currentPageSection.repeatableSection === true &&
                    currentPageSection?.name !== resultCompCreationPage?.name &&
                    (resultCompCreationPage === null ||
                        resultCompCreationPage?.repeatableSection === false)
                ) {
                    setShowRPlus(true);
                    return true; // if page does not have repeatable section or page is not mapped to any section
                } else {
                    setShowRPlus(false);
                    return false; // if page is mapped to repeatable section
                }
            };
            const isRepeatableSection = sections.some(
                (sec) =>
                    sec.repeatableSection === true &&
                    sec.name === pageDetails[0].section
            );

            const getSectionDetailsByPagePath = (pagePath) => {
                // Find the page with the given path
                const page = pages.find((p) => p.path === pagePath);
                if (!page) return null;

                // Find the section with the same name as the page's section
                const section = sections.find(
                    (sec) => sec.name === page.section
                );
                return section || null;
            };

            const currentPageSection = getSectionDetailsByPagePath(
                pageDetails[0].path
            );

            const getComponents = pageDetails[0]?.components?.filter(
                (comp) => comp.type === "NumberField"
            );

            const getCalculations = pageDetails[0]?.components?.filter(
                (comp) => comp.type === "Result"
            );

            getComponents && setDisplayComponents4mPage(getComponents);
            const showRPlus = createRPlusExpression(
                resultCreationPage,
                pageDetails
            );
            getCalculations && setDisplayCalculations4mPage(getCalculations);
            isRepeatableSection &&
                showRPlus &&
                setRepeatableSection(currentPageSection);
            !isRepeatableSection && setRepeatableSection();
        } else {
            if (targetValue !== "") {
                setDatasetSelected(true);
                setPageSelected(false);
            } else {
                setDatasetSelected(false);
                setPageSelected(false);
            }

            setDisplayComponents4mPage([]);
            const datasetDetails = datasets.filter(
                (dataset) => dataset.id == targetValue
            );

            const flattenDatasets = datasetDetails[0].data.flat();

            let getCalcDatasets =
                flattenDatasets?.filter((data) => data.calc === true) ?? [];

            getCalcDatasets = getCalcDatasets.map((data) => ({
                ...data,
                value: `${datasetDetails[0].id}->${data.value}`,
            }));

            getCalcDatasets && setDisplayDatasets(getCalcDatasets);
        }
    };

    return (
        <div className="govuk-form-group">
            <label className="govuk-body bold mb-10" htmlFor="page">
                Select a page or a design data set
            </label>
            <br />
            <select
                className="govuk-select add-calculations__pageselection govuk-body-s"
                data-testid="calc-page-select"
                id="pageOrDataset"
                name="page"
                onChange={(e) => getComponentsFromPage(e)}
            >
                <option value="" />
                {pages?.map((page) => (
                    <option
                        key={page.title}
                        value={`page_${page.path}`}
                        data-type="page"
                    >
                        {page.title}
                    </option>
                ))}
                {datasets?.map((dataset) => (
                    <option
                        key={dataset.title}
                        value={`dataset_${dataset.id}`}
                        data-type="dataset"
                    >
                        {dataset.title}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default PageSelectInput;
