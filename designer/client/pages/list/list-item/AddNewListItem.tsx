import React from "react";
import ListItemAddEdit from "./ListItemAddEdit";

type Props = {};

const AddNewListItem = (props: Props) => {
    return (
        <div>
            <ListItemAddEdit isEdit={false} />
        </div>
    );
};

export default AddNewListItem;
