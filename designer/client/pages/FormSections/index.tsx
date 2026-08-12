import React, { useEffect } from "react";
import { Route, useRouteMatch } from "react-router-dom";

import { FormDefinition } from "@xgovformbuilder/model";

import { DesignerApi } from "../../api/designerApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    fetchSections,
    formSectionSelector,
    updateForm,
} from "../../store/reducers/formSectionReducer";
import {
    currentUserSelector,
    getCurrentUserInfo,
} from "../../store/reducers/usersReducer";

import { DataContext } from "../../context";
import { LoadingState } from "../../store/types";
import FormSectionPage from "./FormSectionPage";
import "./formSection.scss";
import SectionNewEditPage from "./SectionNewEditPage";

type Props = {};

type ParamType = {
    url: string;
    params: { id: string };
};

const FormSectionModule = (props: Props) => {
    const dispatch = useAppDispatch();
    const formSections = useAppSelector(formSectionSelector);
    const currentUser = useAppSelector(currentUserSelector);
    const { url, params }: ParamType = useRouteMatch();
    const designerApi = new DesignerApi();
    const getFormId = () => {
        return params?.id ?? "";
    };
    const saveForm = async (
        data: FormDefinition,
        cb: () => void = () => {}
    ): Promise<FormDefinition> => {
        try {
            // Add current user credentials
            data.lastUpdatedByName = currentUser.data.name;
            data.lastUpdatedById = currentUser.data.id;
            await designerApi.save(getFormId(), data);
            dispatch(updateForm({ updatedForm: data, cb }));
            return data;
        } catch (e) {
            // this.setState({ error: e.message });
            // this.props.history.push({
            //     pathname: "/save-error",
            //     state: { id: this.id },
            // });
            return {} as FormDefinition;
        }
    };

    useEffect(() => {
        dispatch(getCurrentUserInfo());
        const formId = getFormId();
        if (!formId) return;
        dispatch(fetchSections(formId));
    }, []);

    return (
        <DataContext.Provider
            // @ts-ignore
            value={{ data: formSections.form, save: saveForm }}
        >
            {formSections.loading === LoadingState.Succeeded && (
                <div>
                    <Route path={`${url}`} exact>
                        <FormSectionPage />
                    </Route>
                    <Route path={`${url}/new`} exact>
                        <SectionNewEditPage isEdit={false} />
                    </Route>
                    <Route path={`${url}/edit`} exact>
                        <SectionNewEditPage isEdit={true} />
                    </Route>
                </div>
            )}
        </DataContext.Provider>
    );
};

export default FormSectionModule;
