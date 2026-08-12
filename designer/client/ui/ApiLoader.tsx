import React from "react";
import { useAppSelector } from "../store/hooks";
import { getApiStatus } from "../store/reducers/apiReducer";
import Loader from "./Loader";
import { LoadingState } from "../store/types";

type Props = {};

const ApiLoader = (props: Props) => {
    const { status, message } = useAppSelector(getApiStatus);
    return (
        <Loader show={status === LoadingState.Pending} loadingText={message} />
    );
};
export default ApiLoader;
