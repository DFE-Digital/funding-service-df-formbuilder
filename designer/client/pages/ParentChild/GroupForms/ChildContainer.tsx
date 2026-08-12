import React from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { Sortable, Spacing, SpacingUnit } from "../../../ui";

import ChildCard from "./ChildCard";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
    parentChildSelector,
    setChildConfigs,
} from "../../../store/reducers/parentChildReducer";
import { ChildConfig } from "../../../store/types";
import ChildCardEdit from "./ChildCardEdit";

type Props = {};

function ChildContainer(props: Props) {
    const dispatch = useAppDispatch();
    const parentChild = useAppSelector(parentChildSelector);
    const formData = parentChild.selectedFormData;
    const childConfigsWithId = parentChild.childConfigs.map((config) => ({
        id: config.childId,
        ...config,
    }));
    const onChildCardDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;
        if (!over) return;
        if (active.id !== over.id) {
            const oldIndex = childConfigsWithId
                .map((item) => item.id.toString())
                .indexOf(active.id.toString());
            const newIndex = childConfigsWithId
                .map((item) => item.id.toString())
                .indexOf(over.id.toString());
            const newChildConfigsArr = arrayMove(
                childConfigsWithId,
                oldIndex,
                newIndex
            ).map(({ id, ...item }) => item);

            dispatch(setChildConfigs(newChildConfigsArr));
        }
    };

    if (parentChild.editChild !== null) {
        return (
            <div>
                {parentChild.childConfigs.map((config, idx) => (
                    <div key={config.childId}>
                        <Spacing mt={SpacingUnit.Five} />
                        {parentChild.editChild!.childId === config.childId ? (
                            <ChildCardEdit
                                isNewChild={false}
                                formData={formData}
                            />
                        ) : (
                            <div className="border-container">
                                <Spacing mt={SpacingUnit.Four} />
                                <ChildCard
                                    id={config.childId}
                                    index={idx}
                                    item={config}
                                    isEdit={true}
                                />
                            </div>
                        )}
                        <Spacing mb={SpacingUnit.Three} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            <Sortable
                items={childConfigsWithId}
                renderSortableBox={({
                    id,
                    index,
                    item,
                }: {
                    id: string;
                    index: number;
                    item: ChildConfig;
                }) => {
                    return (
                        <>
                            <Spacing mt={SpacingUnit.Five} />
                            <ChildCard id={id} index={index} item={item} />
                            <Spacing mb={SpacingUnit.Three} />
                        </>
                    );
                }}
                onDragEnd={onChildCardDragEnd}
            ></Sortable>
        </div>
    );
}

export default ChildContainer;
