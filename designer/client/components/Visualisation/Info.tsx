import React, { useContext } from "react";
import { DataContext } from "../../context";
import moment from "moment";

type Props = {
    updatedAt?: string;
    downloadedAt?: string;
};

export const Info = () => {
    const { data } = useContext(DataContext);

    return (
        <div className="notification">
            <p className="govuk-body">
                last downloaded at{" "}
                {data.lastDownloaded
                    ? moment(data.lastDownloaded).format(
                          "DD/MM/YYYY, h:mm:ss a"
                      )
                    : ""}
            </p>
            <p className="govuk-body">
                last updated at{" "}
                {moment(data.lastModified).format("DD/MM/YYYY, h:mm:ss a")}
            </p>
        </div>
    );
};
