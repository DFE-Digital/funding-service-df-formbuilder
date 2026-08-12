import React, { useEffect } from "react";
import { Route, useRouteMatch } from "react-router-dom";
import { FormDefinition } from "@xgovformbuilder/model";

import { DesignerApi } from "../../api/designerApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    fetchCalculations,
    updateForm,
} from "../../store/reducers/calculationBuilderReducer";
import {
    currentUserSelector,
    getCurrentUserInfo,
} from "../../store/reducers/usersReducer";

import { LoadingState } from "../../store/types";
import { DataContext } from "../../context";
import "./calculation.scss";
import CalculationPage from "./CalculationPage";
import { calculationBuilderSelector } from "../../store/reducers/calculationBuilderReducer";
import AddEditCalculationPage from "./AddEditCalculationPage";

type Props = {};

type ParamType = {
    url: string;
    params: { id: string };
};

const CalculationModule = (props: Props) => {
    const dispatch = useAppDispatch();
    const calculations = useAppSelector(calculationBuilderSelector);
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
            return {} as FormDefinition;
        }
    };

    useEffect(() => {
        dispatch(getCurrentUserInfo());
        const formId = getFormId();
        if (!formId) return;
        dispatch(fetchCalculations(formId));
    }, []);
    return (
        <DataContext.Provider
            // @ts-ignore
            value={{ data: calculations.form, save: saveForm }}
        >
            {calculations.loading === LoadingState.Succeeded && (
                <div className="calculation-page-container">
                    {/**@ts-ignore*/}
                    <Route path={`${url}`} exact>
                        <CalculationPage />
                    </Route>
                    {/**@ts-ignore*/}
                    <Route path={`${url}/edit/:calculationId`} exact>
                        <AddEditCalculationPage isEdit />
                    </Route>
                    {/**@ts-ignore*/}
                    <Route path={`${url}/new`} exact>
                        <AddEditCalculationPage />
                    </Route>
                </div>
            )}
        </DataContext.Provider>
    );
};

export default CalculationModule;
