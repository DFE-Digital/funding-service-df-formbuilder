import {
    ComponentDef,
    ComponentTypeEnum,
    ConditionRawData,
    DesignedDataSet,
    Documents,
    FormDefinition,
    ImportedDataSet,
    List,
    Section,
    Output,
    Page,
    Calculation,
} from "@xgovformbuilder/model";

type EffectReport = {
    affectedComponents: { name: string; type: string; title: string }[];
    affectedComponentTypes: string[];
    affectedPages?: { name: string; title: string; section: string }[];
    affectedLists?: { name: string; title: string }[];
    affectedConditions?: { name: string; title: string }[];
    affectedSections?: { name: string; title: string }[];
    affectedOutputs?: { name: string; title: string }[];
    affectedDatasets?: { name: string; title: string }[];
    affectedTabs?: string[];
    affectedChildren?: { name: string; title: string }[];
    affectedCalculations?: { name: string; title: string }[];
};

export enum Module {
    Component = "component",
    Page = "page",
    Section = "section",
    List = "list",
    Condition = "condition",
    Document = "document",
    ImportedDataSet = "imported_data_set",
    DesignedDataSet = "designed_data_set",
    Output = "output",
    Calculation = "calculation",
}

function uniqueTypes(components: { name: string; type: string }[]) {
    return Array.from(new Set(components.map((c) => c.type)));
}

function mergeUnique(
    existingItems: { name: string; title: string }[],
    newItems: { name: string; title: string }[]
): { name: string; title: string }[] {
    const mergedItems = [...existingItems];

    for (const newItem of newItems) {
        const alreadyExists = mergedItems.some(
            (existingItem) => existingItem.name === newItem.name
        );
        if (!alreadyExists) {
            mergedItems.push(newItem);
        }
    }

    return mergedItems;
}

export function getLinkedPropertyEffectReport<T>(
    moduleAffected: Module,
    property: T,
    form: FormDefinition
): EffectReport {
    switch (moduleAffected) {
        /**
         * COMPONENT
         */
        case Module.Component: {
            const comp = property as ComponentDef;

            const affectedConditions =
                form.conditions
                    .filter((c) =>
                        ((c.value as any)?.conditions ?? []).some(
                            (inner) => inner?.field?.name === comp.name
                        )
                    )
                    .map((c) => {
                        return {
                            name: c.name,
                            title: c.displayName,
                        };
                    }) ?? [];

            const affectedSections =
                form.sections
                    .filter(
                        (s) =>
                            s.conditionComp === comp.name ||
                            s.numberComp === comp.name
                    )
                    .map((s) => {
                        return {
                            name: s.name,
                            title: s.title,
                        };
                    }) ?? [];

            // const affectedComponents = [{ name: comp.name, type: comp.type }];

            const affectedOutputs = Array.isArray(form.outputs)
                ? form.outputs
                      .filter(
                          (output) =>
                              output.type === "notify" &&
                              (output.outputConfiguration as any)
                                  ?.emailField === comp.name
                      )
                      .map((output) => ({
                          name: output.name,
                          title: output.title,
                      }))
                : [];
            const affectedCalculations = Array.isArray(form.calculations)
                ? form.calculations
                      .filter((calc) =>
                          calc.components?.some((c) => c.name === comp.name)
                      )
                      .map((calc) => ({
                          name: calc.name,
                          title: calc.title,
                      }))
                : [];

            return {
                affectedComponents: [],
                affectedComponentTypes: [],
                affectedSections,
                affectedConditions,
                affectedOutputs,
                affectedCalculations,
            };
        }

        /**
         * PAGE
         */
        case Module.Page: {
            const page = property as Page;
            const affectedComponents: {
                name: string;
                type: string;
                title: string;
            }[] = [];
            const affectedConditions: { name: string; title: string }[] = [];
            const affectedSections: { name: string; title: string }[] = [];
            const affectedOutputs: { name: string; title: string }[] = [];
            const affectedCalculations: { name: string; title: string }[] = [];

            page.components?.forEach((comp) => {
                affectedComponents.push({
                    name: comp.name,
                    type: comp.type,
                    title: page.title,
                });

                affectedConditions.push(
                    ...(form.conditions
                        .filter((c) =>
                            ((c.value as any)?.conditions ?? []).some(
                                (inner) => inner?.field?.name === comp.name
                            )
                        )
                        .map((c) => {
                            return {
                                name: c.name,
                                title: c.displayName,
                            };
                        }) ?? [])
                );

                affectedSections.push(
                    ...(form.sections
                        .filter(
                            (s) =>
                                s.conditionComp === comp.name ||
                                s.numberComp === comp.name
                        )
                        .map((s) => {
                            return {
                                name: s.name,
                                title: s.title,
                            };
                        }) ?? [])
                );

                affectedOutputs.push(
                    ...(Array.isArray(form.outputs)
                        ? form.outputs
                              .filter(
                                  (output) =>
                                      output.type === "notify" &&
                                      (output.outputConfiguration as any)
                                          ?.emailField === comp.name
                              )
                              .map((output) => ({
                                  name: output.name,
                                  title: output.title,
                              }))
                        : [])
                );
                affectedCalculations.push(
                    ...(Array.isArray(form.calculations)
                        ? form.calculations
                              .filter((calc) =>
                                  calc.components?.some(
                                      (c) => c.name === comp.name
                                  )
                              )
                              .map((calc) => ({
                                  name: calc.name,
                                  title: calc.title,
                              }))
                        : [])
                );
            });

            return {
                affectedComponents,
                affectedComponentTypes: uniqueTypes(affectedComponents),
                affectedSections,
                affectedConditions,
                affectedOutputs,
                affectedCalculations,
            };
        }

        /**
         * SECTION
         */
        case Module.Section: {
            const section = property as Section;
            const affectedPages =
                form.pages
                    .filter((p) => p.section === section.name)
                    .map((p) => ({ name: p.path, title: p.title })) ?? [];

            return {
                affectedComponents: [],
                affectedComponentTypes: [],
                affectedPages: affectedPages.map((p) => ({
                    name: p.name,
                    title: p.title,
                    section: section.title,
                    type: "Page",
                })),
            };
        }
        /**
         * LIST
         */
        case Module.List: {
            const list = property as List;
            const affected: {
                name: string;
                type: string;
                title: string;
            }[] = [];

            form.pages.forEach((page) => {
                page.components?.forEach((comp) => {
                    if ((comp as any).list === list?.name) {
                        affected.push({
                            name: comp.name,
                            type: comp.type,
                            title: page.title,
                        });
                    }
                });
            });

            console.log("affected list", affected);

            return {
                affectedComponents: affected,
                affectedComponentTypes: uniqueTypes(affected),
                // affectedLists: [{ name: list.name, title: list.title }],
            };
        }

        /**
         * CONDITION
         */
        case Module.Condition: {
            const condition = property as ConditionRawData;

            const affectedComponents: {
                name: string;
                type: string;
                title: string;
            }[] = [];
            form.pages.forEach((p) => {
                p.components?.forEach((c) => {
                    if (
                        (c.options as any)?.condition &&
                        (c.options as any).condition === condition.name
                    ) {
                        affectedComponents.push({
                            name: c.name,
                            type: c.type,
                            title: p.title,
                        });
                    }
                });
            });

            const affectedLists =
                form.lists
                    .filter((l) =>
                        l.items.some((i) => i.condition === condition.name)
                    )
                    .map((l) => ({ name: l.name, title: l.title })) ?? [];

            const affectedPages =
                form.pages
                    .filter((p) =>
                        (p.next ?? []).some(
                            (n) => n.condition === condition.name
                        )
                    )
                    .map((p) => ({ name: p.path, title: p.title })) ?? [];

            const affectedChildren =
                form.parentChild?.parentChildConfig.childConfigs
                    .filter((c) => c.condition === condition.name)
                    .map((c) => ({
                        name: c.childId,
                        title: c.childFormTitle,
                    })) ?? [];

            return {
                affectedComponents,
                affectedComponentTypes: uniqueTypes(affectedComponents),
                // affectedConditions: [
                //     { name: condition.name, title: condition.displayName },
                // ],
                affectedLists,
                affectedPages: affectedPages.map((p) => ({
                    name: p.name,
                    title: p.title,
                    section: p.name,
                    type: "Page",
                })),
                affectedChildren,
            };
        }

        /**
         * DOCUMENT
         */
        case Module.Document: {
            const doc = property as Documents;
            const affected: {
                name: string;
                type: string;
                title: string;
            }[] = [];

            form.pages.forEach((page) => {
                page.components?.forEach((comp) => {
                    if (
                        (comp.type === ComponentTypeEnum.Filedownload ||
                            comp.type === ComponentTypeEnum.DataImport) &&
                        comp.selectedDocument === doc.id
                    ) {
                        affected.push({
                            name: comp.name,
                            type: comp.type,
                            title: page.title,
                        });
                    }
                });
            });

            return {
                affectedComponents: affected,
                affectedComponentTypes: uniqueTypes(affected),
            };
        }

        /**
         * IMPORTED DATASET
         */
        case Module.ImportedDataSet: {
            const imported = property as ImportedDataSet;

            const designedDataSetsAffected =
                form.designedDataSets
                    ?.filter((ds) => ds.csvUsed === imported.fileId)
                    .map((ds) => {
                        return {
                            name: ds.id,
                            title: ds.title,
                        };
                    }) ?? [];

            const tabsAffected =
                form.tabs
                    ?.filter((t) =>
                        t.tabData?.some(
                            (td) =>
                                td.type === "select_dataset" &&
                                designedDataSetsAffected.some(
                                    (ds) => ds.name === td.value
                                )
                        )
                    )
                    .map((t) => t.id) ?? [];

            const affectedComponents: {
                name: string;
                type: string;
                title: string;
            }[] = [];
            form.pages.forEach((p) =>
                p.components?.forEach((c) => {
                    if (
                        c.type === ComponentTypeEnum.TableDataset &&
                        designedDataSetsAffected.some(
                            (ds) => ds.name === c.content
                        )
                    ) {
                        affectedComponents.push({
                            name: c.name,
                            type: c.type,
                            title: p.title,
                        });
                    } else if (
                        c.type === ComponentTypeEnum.Tabs &&
                        tabsAffected.includes(c.name)
                    ) {
                        affectedComponents.push({
                            name: c.name,
                            type: c.type,
                            title: p.title,
                        });
                    }
                })
            );

            return {
                affectedComponents,
                affectedComponentTypes: uniqueTypes(affectedComponents),
                affectedDatasets: designedDataSetsAffected,
                affectedTabs: tabsAffected,
            };
        }

        /**
         * DESIGNED DATASET
         */
        case Module.DesignedDataSet: {
            const designed = property as DesignedDataSet;

            const tabsAffected =
                form.tabs
                    ?.filter((t) =>
                        t.tabData?.some(
                            (td) =>
                                td.type === "select_dataset" &&
                                td.value === designed.id
                        )
                    )
                    .map((t) => t.id) ?? [];

            const affectedComponents: {
                name: string;
                type: string;
                title: string;
            }[] = [];
            form.pages.forEach((p) =>
                p.components?.forEach((c) => {
                    if (
                        c.type === ComponentTypeEnum.TableDataset &&
                        c.content === designed.id
                    ) {
                        affectedComponents.push({
                            name: c.name,
                            type: c.type,
                            title: p.title,
                        });
                    } else if (
                        c.type === ComponentTypeEnum.Tabs &&
                        tabsAffected.includes(c.name)
                    ) {
                        affectedComponents.push({
                            name: c.name,
                            type: c.type,
                            title: p.title,
                        });
                    }
                })
            );

            const affectedCalcs =
                form.calculations
                    ?.filter((calc) =>
                        calc.datasets.some(
                            (ds) => ds.designedDataSetId === designed.id
                        )
                    )
                    .map((calc) => {
                        return {
                            name: calc.name,
                            title: calc.title,
                        };
                    }) ?? [];

            return {
                affectedComponents,
                affectedComponentTypes: uniqueTypes(affectedComponents),
                // affectedDatasets: [],
                affectedTabs: tabsAffected,
                affectedCalculations: affectedCalcs,
            };
        }

        /**
         * Output .emailField === component.name
         */
        case Module.Output: {
            const output = property as Output;

            const affectedComponents: {
                name: string;
                type: string;
                title: string;
            }[] = [];
            form.pages.forEach((p) =>
                p.components?.forEach((c) => {
                    if ((c as any).emailField === output.name) {
                        affectedComponents.push({
                            name: c.name,
                            type: c.type,
                            title: p.title,
                        });
                    }
                })
            );

            // const affectedOutput = [
            //     {
            //         name: output.name,
            //         title: output.title,
            //     },
            // ];

            return {
                affectedComponents,
                affectedComponentTypes: uniqueTypes(affectedComponents),
                // affectedOutputs: affectedOutput,
            };
        }

        /**
         * CALCULATION
         */
        case Module.Calculation: {
            const calculation = property as Calculation;
            const affected: {
                name: string;
                type: string;
                title: string;
            }[] = [];
            const componentsToDelete: ComponentDef[] = [];
            const allAffected: Partial<EffectReport> = {
                affectedConditions: [],
                affectedCalculations: [],
            };
            form.pages.forEach((page) => {
                page.components?.forEach((comp) => {
                    if (
                        comp.type === ComponentTypeEnum.Result &&
                        (comp.calculationName ?? comp.name) === calculation.name
                    ) {
                        componentsToDelete.push(comp);
                        affected.push({
                            name: comp.name,
                            type: comp.type,
                            title: page.title,
                        });
                    }
                });
            });

            const affectedCalculations = Array.isArray(form.calculations)
                ? form.calculations
                      .filter((calc) =>
                          calc.calculationsMapped?.some(
                              (c) => c === calculation.name
                          )
                      )
                      .map((calc) => ({
                          name: calc.name,
                          title: calc.title,
                      }))
                : [];

            componentsToDelete.forEach((comp) => {
                const report = getLinkedPropertyEffectReport(
                    Module.Component,
                    comp,
                    form
                );

                allAffected.affectedConditions = mergeUnique(
                    allAffected.affectedConditions ?? [],
                    report.affectedConditions ?? []
                );

                allAffected.affectedCalculations = mergeUnique(
                    allAffected.affectedCalculations ?? [],
                    report.affectedCalculations ?? []
                );
            });

            allAffected.affectedCalculations = mergeUnique(
                allAffected.affectedCalculations ?? [],
                affectedCalculations ?? []
            );

            return {
                ...allAffected,
                affectedComponents: affected,
                affectedComponentTypes: uniqueTypes(affected),
            };
        }
    }

    // fallback
    return {
        affectedComponents: [],
        affectedComponentTypes: [],
    };
}
