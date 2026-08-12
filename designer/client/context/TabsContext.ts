import { createContext } from "react";
import { DynamicDataSetTabs } from "../components/FieldEditors/TabEdit/types";

type State = {
    dynamicDataSet: DynamicDataSetTabs;
    setDynamicDataSet: (toUpdate: DynamicDataSetTabs) => boolean;
};

const initialState = {
    dynamicDataSet: {} as DynamicDataSetTabs,
    setDynamicDataSet: (data: DynamicDataSetTabs) => false,
};

const TabsContext = createContext<State>(initialState);

export default TabsContext;
