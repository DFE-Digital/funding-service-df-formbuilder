import React, { useEffect } from "react";
import { Route, useRouteMatch } from "react-router-dom";
import { FormDefinition } from "@xgovformbuilder/model";

import { DesignerApi } from "../../api/designerApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    fetchLists,
    listSelector,
    updateForm,
} from "../../store/reducers/listReducer";
import {
    currentUserSelector,
    getCurrentUserInfo,
} from "../../store/reducers/usersReducer";

import ListEditPage from "./ListEditPage";
import ListPage from "./ListPage";
import { DataContext } from "../../context";
import "./lists.scss";
import ListNewPage from "./ListNewPage";
import AddNewListItem from "./list-item/AddNewListItem";
import EditListItem from "./list-item/EditListItem";
import { LoadingState } from "../../store/types";

type Props = {};

type ParamType = {
    url: string;
    params: { id: string };
};

const ListModule = (props: Props) => {
    const dispatch = useAppDispatch();
    const lists = useAppSelector(listSelector);
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
        dispatch(fetchLists(formId));
    }, []);

    return (
        // @ts-ignore
        <DataContext.Provider value={{ data: lists.form, save: saveForm }}>
            {lists.loading === LoadingState.Succeeded && (
                <div className="list-container">
                    <Route path={`${url}`} exact>
                        <ListPage />
                    </Route>
                    <Route path={`${url}/edit/:listId`} exact>
                        <ListEditPage />
                    </Route>
                    <Route path={`${url}/new`} exact>
                        <ListNewPage />
                    </Route>
                    <Route path={`${url}/new/add-item`} exact>
                        <AddNewListItem />
                    </Route>
                    <Route path={`${url}/edit/:listId/add-item`} exact>
                        <AddNewListItem />
                    </Route>
                    <Route path={`${url}/new/edit-item/:itemIndex`} exact>
                        <EditListItem />
                    </Route>
                    <Route
                        path={`${url}/edit/:listId/edit-item/:itemIndex`}
                        exact
                    >
                        <EditListItem />
                    </Route>
                </div>
            )}
        </DataContext.Provider>
    );
};

export default ListModule;
