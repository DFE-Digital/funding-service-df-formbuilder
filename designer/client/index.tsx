import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
    NewConfig,
    StartPage,
    NewDashboard,
    ListPage,
    Playground,
    ParentChild,
    ChangeFormStatus,
    DeleteForm,
    ChangeAccessType,
    DuplicateForm,
    FormSection,
    CalculationModule,
} from "./pages";
import "./styles/index.scss";
import { initI18n } from "./i18n";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Designer from "./designer";
import { SaveError } from "./pages/ErrorPages";
import { ChangeFormAccessType } from "./pages/LandingPage";
import { MsalProvider } from "@azure/msal-react";
import MsalClientApplication from "./auth/clientApplication";
import { AppContext } from "./context/AppContext";
import { Provider as ReduxProvider } from "react-redux";
import ReduxStore from "./store";
import { isDev } from "./utils";
import SwitchAccessGroup from "./pages/ParentChild/GroupForms/SwitchAccessGroup";
import { ApiLoader } from "./ui";

const msalInstance = MsalClientApplication.getInstance();

initI18n();

function NoMatch() {
    return <div className="govuk-body">404 Not found</div>;
}

function App() {
    const [lastModifiedForm, setLastModifiedForm] = useState();
    const [uploadedFile, setUploadedFile] = useState<File | undefined | null>();
    const [previouslyUploadedFile, setPreviouslyUploadedFile] = useState("");
    const [hasNewFileBeenUploaded, setHasNewFileBeenUploaded] = useState(false);
    const [incorrectFileType, setIncorrectFileTypeError] = useState(false);

    useEffect(() => {
        setHasNewFileBeenUploaded(false);
        setUploadedFile(null);
    }, [previouslyUploadedFile]);

    // Passed into context to allow change for the fileUpload state in the file input type component
    const onFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        const uploadedFile1 = target.files && target.files[0];
        setUploadedFile(uploadedFile1);
        setHasNewFileBeenUploaded(true);
    };

    return (
        <Router basename="/app">
            <MsalProvider instance={msalInstance}>
                <AppContext.Provider
                    value={{
                        lastModifiedForm,
                        setLastModifiedForm,
                        uploadedFile,
                        setUploadedFile: onFileUploadChange,
                        previouslyUploadedFile,
                        setPreviouslyUploadedFile,
                        hasNewFileBeenUploaded,
                        incorrectFileType: incorrectFileType,
                        setIncorrectFileTypeError: setIncorrectFileTypeError,
                    }}
                >
                    <ReduxProvider store={ReduxStore}>
                        <div id="app">
                            <Switch>
                                <Route path="/" exact>
                                    <StartPage />
                                </Route>
                                <Route path="/dashboard" exact>
                                    <NewDashboard />
                                </Route>
                                <Route path="/change-form-status/:formId" exact>
                                    <ChangeFormStatus />
                                </Route>
                                <Route path="/delete-form/:formId" exact>
                                    <DeleteForm />
                                </Route>
                                <Route path="/change-access-type/:formId" exact>
                                    <ChangeAccessType />
                                </Route>
                                <Route path="/duplicate-form/:formId" exact>
                                    <DuplicateForm />
                                </Route>
                                <Route path="/change-accessType" exact>
                                    <ChangeFormAccessType />
                                </Route>
                                <Route
                                    path="/change-accessType-group/:parentId"
                                    exact
                                >
                                    <SwitchAccessGroup />
                                </Route>
                                <Route path="/group-form/:parentId">
                                    <ParentChild />
                                </Route>
                                <Route
                                    path="/designer/:id"
                                    //@ts-ignore
                                    component={Designer}
                                />
                                <Route
                                    path="/list-module/:id"
                                    component={ListPage}
                                />
                                <Route
                                    path="/calculation/:id"
                                    component={CalculationModule}
                                />
                                <Route
                                    path="/form-section/:id"
                                    component={FormSection}
                                />
                                <Route path="/new" exact>
                                    <NewConfig />
                                </Route>
                                {isDev && (
                                    <Route path="/playground" exact>
                                        <Playground />
                                    </Route>
                                )}
                                <Route path="/save-error" exact>
                                    <SaveError />
                                </Route>
                                <Route path="*">
                                    <NoMatch />
                                </Route>
                            </Switch>
                            <ApiLoader />
                        </div>
                    </ReduxProvider>
                </AppContext.Provider>
            </MsalProvider>
        </Router>
    );
}
ReactDOM.render(<App />, document.getElementById("root"));
