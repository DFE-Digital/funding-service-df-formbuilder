import React, { useEffect } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";

import { BackLink } from "../../ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { listSelector } from "../../store/reducers/listReducer";
import ListTable from "./components/ListTable";
import ListActionButtons from "./components/ListActionButtons";

type Props = {};

const ListPage = (props: Props) => {
    const dispatch = useAppDispatch();
    const lists = useAppSelector(listSelector);
    const { path } = useRouteMatch();
    const history = useHistory();

    const onAddNewClick = () => {
        history.push(`${path}/new`);
    };

    const goBack = (event) => {
        event.preventDefault();
        history.push(`/designer/${lists?.form?.id}`);
        window.location.reload();
    };

    return (
        <div className="list-page-container">
            <div className="list-page-backlink-container">
                <BackLink onClick={goBack}>Back</BackLink>
            </div>
            <div className="list-page-main-container govuk-!-margin-bottom-6">
                <h1 className="govuk-heading-l">Add or Edit a List</h1>
                <p className="govuk-body">
                    Use lists to provide information as bullets, numbered items
                    or multiple links. You can also use them to set out answers
                    to multiple choice questions. After creating a list you can
                    assign it to components in your form.
                </p>
                <div className="add-list-button-container">
                    <button
                        className="govuk-button"
                        data-testid="add-new-list-button"
                        onClick={() => onAddNewClick()}
                    >
                        Add List
                    </button>
                </div>
            </div>
            <ListTable />
            <ListActionButtons />
        </div>
    );
};

export default ListPage;
