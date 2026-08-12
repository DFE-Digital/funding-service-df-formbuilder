import { Row } from "@tanstack/react-table";
import { FormConfigurationWithChild } from "../store/types";
import {
    Calculation,
    ComponentDef,
    ComponentTypeEnum,
    ConditionRawData,
    DesignedDataSet,
    Documents,
    FormDefinition,
    ImportedDataSet,
    List,
    NotifyOutputConfiguration,
    OutputType,
    Page,
    Section,
} from "@xgovformbuilder/model";

export const isDev = process.env.NODE_ENV !== "production";

export enum FormConfigurationTabs {
    MyForms = "my_forms",
    ColleagueForms = "colleague_forms",
}

export enum DependentFormStatus {
    InProgress = "in_progress",
    Completed = "completed",
}

export enum RowType {
    Parent = "parent",
    Child = "child",
    Standalone = "standalone",
}

export const getRowType = (row: Row<FormConfigurationWithChild>) => {
    if (row.getCanExpand()) {
        return RowType.Parent;
    } else if (row?.parentId) {
        return RowType.Child;
    } else {
        return RowType.Standalone;
    }
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
    Calculation = "calculation",
}

export enum PropertyAction {
    Edited = "edited",
    Deleted = "deleted",
}

export function handleLinkedPropertyEffect<T>(
    moduleAffected: Module,
    property: T,
    propertyAction: PropertyAction,
    form: FormDefinition
) {
    let formAfterEffect = form;
    switch (moduleAffected) {
        case Module.Component:
            if (propertyAction === PropertyAction.Deleted) {
                formAfterEffect = handleComponentDeletion(
                    property as ComponentDef,
                    form
                );
            } else if (propertyAction == PropertyAction.Edited) {
                formAfterEffect = handleComponentEdited(
                    property as ComponentDef,
                    form
                );
            }
            return formAfterEffect;
        case Module.Page:
            if (propertyAction === PropertyAction.Deleted) {
                (property as Page)?.components?.forEach((component) => {
                    component;
                    formAfterEffect = handleComponentDeletion(
                        component as ComponentDef,
                        form
                    );
                });
            }
            return formAfterEffect;
        case Module.Section:
            if (propertyAction === PropertyAction.Deleted) {
                formAfterEffect = handleSectionDeletion(
                    property as Section,
                    form
                );
            }
            return formAfterEffect;
        case Module.List:
            if (propertyAction === PropertyAction.Deleted) {
                formAfterEffect = handleListDeletion(property as List, form);
            }
            return formAfterEffect;
        case Module.Condition:
            if (propertyAction === PropertyAction.Deleted) {
                formAfterEffect = handleConditionDeletion(
                    property as ConditionRawData,
                    form
                );
            }
            return formAfterEffect;
        case Module.Document:
            if (propertyAction === PropertyAction.Deleted) {
                formAfterEffect = handleDocumentDeletion(
                    property as Documents,
                    form
                );
            }
            return formAfterEffect;
        case Module.ImportedDataSet:
            if (propertyAction === PropertyAction.Deleted) {
                formAfterEffect = handleImportedDatasetDeletion(
                    property as ImportedDataSet,
                    form
                );
            }
            return formAfterEffect;
        case Module.DesignedDataSet:
            if (propertyAction === PropertyAction.Deleted) {
                formAfterEffect = handleDesignedDatasetDeletion(
                    property as DesignedDataSet,
                    form
                );
            }
            return formAfterEffect;
        case Module.Calculation:
            if (propertyAction === PropertyAction.Deleted) {
                formAfterEffect = handleCalculationDeletion(
                    property as Calculation,
                    form
                );
            }
            return formAfterEffect;
    }
}

const handleComponentDeletion = (
    component: ComponentDef,
    form: FormDefinition
) => {
    let updatedForm = form;
    const conditionsToDelete: ConditionRawData[] = [];
    updatedForm = {
        ...form,
        sections: form.sections.map((section) => {
            // Remove trigger components from repeatable section by respective component deletion
            if (
                component.type === ComponentTypeEnum.NumberField ||
                component.type === ComponentTypeEnum.YesNoField
            ) {
                if (section.repeatableSection) {
                    if (section.conditionComp === component.name) {
                        return {
                            ...section,
                            conditionComp: undefined,
                            repeatableSection: section.numberComp
                                ? true
                                : false,
                        };
                    } else if (section.numberComp === component.name) {
                        return {
                            ...section,
                            numberComp: undefined,
                            repeatableSection: section.conditionComp
                                ? true
                                : false,
                        };
                    }
                }
            }
            return section;
        }),
        conditions: form.conditions
            .map((condition) => {
                const filteredConditions = (
                    (condition.value as any)?.conditions ?? []
                ).filter(
                    (innerCondition) =>
                        innerCondition?.field?.name !== component.name
                );

                return {
                    ...condition,
                    value: {
                        ...(condition.value as any),
                        conditions: filteredConditions,
                    },
                };
            })
            // Remove the entire condition if no inner conditions remain
            .filter((condition) => {
                const hasConditions =
                    (condition.value?.conditions ?? []).length > 0;
                if (!hasConditions) {
                    conditionsToDelete.push(condition);
                }
                return hasConditions;
            }),
        outputs: Array.isArray(form.outputs)
            ? form.outputs.map((output) => {
                  // Remove emailField from outputConfiguration if output type is notify
                  if (
                      output.type === OutputType.Notify &&
                      (output.outputConfiguration as NotifyOutputConfiguration)
                          ?.emailField === component.name
                  ) {
                      // Set the emailField property to undefined to satisfy the NotifyOutputConfiguration type
                      return {
                          ...output,
                          outputConfiguration: {
                              ...output.outputConfiguration,
                              emailField: (undefined as unknown) as string,
                          },
                      };
                  }
                  return output;
              })
            : [],
    };
    conditionsToDelete.forEach((condition) => {
        updatedForm = handleConditionDeletion(condition, updatedForm);
    });
    return updatedForm;
};

const handleComponentEdited = (
    component: ComponentDef,
    form: FormDefinition
) => {
    let updatedForm = form;

    updatedForm = {
        ...form,
        conditions: form.conditions.map((condition) => {
            const updatedinnerConditionConditions = (
                (condition.value as any)?.conditions || []
            ).map((innerCondition) => {
                if (innerCondition.field?.name === component.name) {
                    return {
                        ...innerCondition,
                        field: {
                            ...innerCondition.field,
                            display: component.title,
                        },
                    };
                }
                return innerCondition;
            });

            return {
                ...condition,
                value: {
                    ...(condition.value as any),
                    conditions: updatedinnerConditionConditions,
                },
            };
        }),
    };

    return updatedForm;
};

const handleSectionDeletion = (section: Section, form: FormDefinition) => {
    let updatedForm = form;
    // Remove section reference from page on section deletion
    updatedForm = {
        ...form,
        pages: form.pages.map((page) => {
            if (page.section === section.name) {
                // Set the section property to undefined to satisfy the Page type
                return { ...page, section: (undefined as unknown) as string };
            }
            return page;
        }),
    };
    return updatedForm;
};

const handleDocumentDeletion = (document: Documents, form: FormDefinition) => {
    let updatedForm = form;

    updatedForm = {
        ...form,
        pages: form.pages.map((page) => {
            const newFiltereedComponents = page.components?.filter((comp) => {
                if (comp.type === ComponentTypeEnum.Filedownload) {
                    return comp.selectedDocument !== document.id;
                } else if (comp.type === ComponentTypeEnum.DataImport) {
                    return comp.selectedDocument !== document.id;
                } else {
                    return true;
                }
            });
            return {
                ...page,
                components: newFiltereedComponents ?? ([] as ComponentDef[]),
            };
        }),
    };

    return updatedForm;
};

const handleConditionDeletion = (
    condition: ConditionRawData,
    form: FormDefinition
) => {
    let updatedForm = form;

    updatedForm = {
        ...form,
        pages: form.pages.map((page) => ({
            ...page,
            components: (page.components ?? []).map((component) => {
                // Clear condition in component options
                if (
                    component.options &&
                    typeof component.options === "object" &&
                    "condition" in component.options &&
                    (component.options as any).condition === condition.name
                ) {
                    // Remove the 'condition' property from options
                    const {
                        condition,
                        ...restOptions
                    } = component.options as any;
                    return {
                        ...component,
                        options: {
                            ...restOptions,
                        },
                    };
                }
                return component;
            }),
            next: page.next
                ? page.next.map((elem) => {
                      // Clear condition in page.next
                      if (elem.condition === condition.name) {
                          return { ...elem, condition: undefined };
                      }
                      return elem;
                  })
                : [],
        })),
        lists: form.lists.map((list) => ({
            ...list,
            items: list.items.map((item) => {
                // Clear condition in list items
                if (item.condition === condition.name) {
                    return { ...item, condition: undefined };
                }
                return item;
            }),
        })),
        parentChild: form.parentChild
            ? {
                  ...form.parentChild,
                  parentChildConfig: {
                      ...form.parentChild.parentChildConfig,
                      childConfigs: form.parentChild.parentChildConfig.childConfigs.map(
                          (childConfig) => {
                              // Clear condition in childConfig
                              if (childConfig.condition === condition.name) {
                                  return {
                                      ...childConfig,
                                      condition: "",
                                      conditionName: "",
                                  };
                              }
                              return childConfig;
                          }
                      ),
                  },
              }
            : undefined,
    };

    return updatedForm;
};

const handleImportedDatasetDeletion = (
    importedDataSet: ImportedDataSet,
    form: FormDefinition
) => {
    let updatedForm = form;

    const designedDataSetsAffected =
        form.designedDataSets
            ?.filter((dataSet) => dataSet.csvUsed === importedDataSet.fileId)
            .map((dataSet) => dataSet.id) ?? ([] as string[]);

    // Compute updated tabs after removing tabData entries that reference the removed designed datasets
    const updatedTabs = form.tabs?.map((tab) => ({
        ...tab,
        tabData: (tab.tabData ?? []).filter((tabData) => {
            return !(
                tabData.type === "select_dataset" &&
                designedDataSetsAffected.includes(tabData.value)
            );
        }),
    }));

    // Tabs that become empty (no tabData left) should have their associated Tabs component removed from pages
    const tabsToRemove =
        updatedTabs
            ?.filter((t) => !(t.tabData && t.tabData.length > 0))
            .map((t) => t.id) ?? ([] as string[]);

    // Update the designed data set and table/tab component in the form definition
    updatedForm = {
        ...form,
        designedDataSets: form.designedDataSets?.filter(
            (dataSet) => dataSet.csvUsed !== importedDataSet.fileId
        ),
        pages: form.pages.map((page) => {
            return {
                ...page,
                components: (page.components ?? []).filter((component) => {
                    if (component.type === ComponentTypeEnum.TableDataset) {
                        // If the component is using the imported data set, filters it
                        return !designedDataSetsAffected.includes(
                            component.content
                        );
                    } else if (component.type === ComponentTypeEnum.Tabs) {
                        // If the Tabs component's matching global tab has no tabData left, remove the component
                        return !tabsToRemove.includes(component.name);
                    } else {
                        return true;
                    }
                }),
            };
        }),
        // update global tabs array to remove tabData entries referencing the removed designed datasets
        // and remove any tabs which no longer have tabData
        tabs: updatedTabs?.filter((t) => t.tabData && t.tabData.length > 0),
    };

    return updatedForm;
};

const handleDesignedDatasetDeletion = (
    designedDataSet: DesignedDataSet,
    form: FormDefinition
) => {
    let updatedForm = form;

    // Compute updated tabs after removing tabData entries that reference the removed designed dataset
    const updatedTabs = form.tabs?.map((tab) => ({
        ...tab,
        tabData: (tab.tabData ?? []).filter((tabData) => {
            return !(
                tabData.type === "select_dataset" &&
                tabData.value === designedDataSet.id
            );
        }),
    }));

    const tabsToRemove =
        updatedTabs
            ?.filter((t) => !(t.tabData && t.tabData.length > 0))
            .map((t) => t.id) ?? ([] as string[]);

    updatedForm = {
        ...form,
        pages: form.pages.map((page) => {
            return {
                ...page,
                components: (page.components ?? []).filter((component) => {
                    if (component.type === ComponentTypeEnum.TableDataset) {
                        // If the component is using the designed data set, filters it
                        return component.content !== designedDataSet.id;
                    } else if (component.type === ComponentTypeEnum.Tabs) {
                        // If the Tabs component's matching global tab has no tabData left, remove the component
                        return !tabsToRemove.includes(component.name);
                    } else {
                        return true;
                    }
                }),
            };
        }),
        // update global tabs array after removing tabData referencing the designed dataset
        // and remove any tabs which no longer have tabData
        tabs: updatedTabs?.filter((t) => t.tabData && t.tabData.length > 0),
        calculations: form.calculations?.map((calculation) => {
            // Remove calculation that uses the designed data set
            if (calculation.datasets.length > 0) {
                return {
                    ...calculation,
                    datasets: calculation.datasets.filter((dataset) => {
                        const datasetId = dataset.designedDataSetId;
                        return datasetId !== designedDataSet.id;
                    }),
                };
            } else {
                return calculation;
            }
        }),
    };

    return updatedForm;
};

const handleListDeletion = (list: List, form: FormDefinition) => {
    let updatedForm = form;

    updatedForm = {
        ...form,
        pages: form.pages.map((page) => ({
            ...page,
            components: (page.components ?? []).map((component) => {
                // Clear list in component
                if (
                    (component as any).list &&
                    (component as any).list === list.name
                ) {
                    // Remove the 'list' property from component
                    const { list, ...restComp } = component as any;
                    return restComp;
                }
                return component;
            }),
        })),
    };

    return updatedForm;
};

const handleCalculationDeletion = (
    calculation: Calculation,
    form: FormDefinition
) => {
    let updatedForm = form;
    const componentsToDelete: ComponentDef[] = [];

    updatedForm = {
        ...form,
        pages: form.pages.map((page) => {
            const newFilteredComponents = page.components?.filter((comp) => {
                if (comp.type === ComponentTypeEnum.Result) {
                    if (
                        (comp.calculationName ?? comp.name) === calculation.name
                    )
                        componentsToDelete.push(comp);
                    return (
                        (comp.calculationName ?? comp.name) !== calculation.name
                    );
                } else {
                    return true;
                }
            });
            return {
                ...page,
                components: newFilteredComponents ?? ([] as ComponentDef[]),
            };
        }),
    };

    componentsToDelete.forEach((comp) => {
        updatedForm = handleComponentDeletion(comp, updatedForm);
    });

    return updatedForm;
};
