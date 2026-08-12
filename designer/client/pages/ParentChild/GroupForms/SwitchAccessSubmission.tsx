import React, { useContext, useState, useEffect } from "react";
import { Button, ButtonVariant, GenericModal } from "../../../ui";
import { useHistory } from "react-router-dom";
import { FormAccessType, FormDefinition } from "@xgovformbuilder/model";
import { AppContext } from "../../../context";
import { ModalType } from "../../../ui/GenericModal";
import { i18n } from "../../../i18n";
import { error } from "console";
import { uploadProvidersMapping } from "../../../api/providerMappingApi";
import { Loader, NotificationBannerModal } from "../../../ui";
import { BannerType } from "../../../ui/NotificationBannerModal";
import { updateMultipleForms } from "../../../api";
import { useAppDispatch } from "../../../store/hooks";
import { resetParentChild } from "../../../store/reducers/parentChildReducer";

type Props = {
    radioValue?: FormAccessType | null;
    selectedForms?: string[] | null;
    file: File | null | undefined;
    formName: string | undefined;
    parentId: string | undefined;
    formData: FormDefinition | null | undefined;
};
function SwitchAccessSubmission(props: Props) {
    const dispatch = useAppDispatch();
    const { hasNewFileBeenUploaded, incorrectFileType } = useContext(
        AppContext
    );
    const {
        radioValue,
        selectedForms,
        file,
        formName,
        parentId,
        formData,
    } = props;
    const [showSwitchModal, setShowSwitchModal] = useState(false);
    const hasParentChecked =
        selectedForms?.filter((id) => id === parentId).length === 1;
    const history = useHistory();
    const [showLoader, setShowLoader] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const isParentChildModule = true;
    const switchModal = {
        warning: i18n("groupForm.switchAccessGroup.warning"),
        hint: hasParentChecked
            ? i18n("groupForm.switchAccessGroup.hint")
            : i18n("groupForm.switchAccessGroup.childgroup", {
                  accessType:
                      radioValue === FormAccessType.Public
                          ? "Public"
                          : "DfE Sign-in",
              }),
        hintNote: hasParentChecked
            ? i18n("groupForm.switchAccessGroup.hintNote", {
                  accessType:
                      radioValue === FormAccessType.Public
                          ? "Public"
                          : "DfE Sign-in",
              })
            : "",
        note: i18n("groupForm.switchAccessGroup.text"),
        confirm: i18n("groupForm.switchAccessGroup.confirm"),
    };

    const formSelected = () => {
        const emptyRemoved = selectedForms?.filter((str) => !!str);
        return emptyRemoved?.length ? true : false;
    };

    const isButtonDisabled = (): boolean => {
        if (formSelected()) {
            if (radioValue === FormAccessType.DFESignIn) {
                if (incorrectFileType) return true;
                return !hasNewFileBeenUploaded;
            }
            if (radioValue === FormAccessType.Public) {
                return false;
            }
            return radioValue === null;
        } else {
            return true;
        }
    };
    const onSwitchingAccessGroup = () => {
        setShowSwitchModal(true);
    };

    const onSwitchModalClose = () => {
        setShowSwitchModal(false);
    };

    const afterAPI = (response: Response) => {
        if (response?.status === 200) {
            setShowSwitchModal(false);
            setShowLoader(false);
            dispatch(resetParentChild());
            history.push(`/dashboard`);
        } else {
            setShowLoader(false);
            setShowSwitchModal(false);
            setShowBanner(true);
            throw error("Error while switching access group");
        }
    };

    const callingUploadProviderMapping = async (
        formIds,
        FormDataWithUploadedFile
    ) => {
        const response = await uploadProvidersMapping(
            formIds,
            FormDataWithUploadedFile,
            isParentChildModule
        );
        afterAPI(response as Response);
    };

    const updateStatusForMultipleForms = async (
        data:
            | {
                  formId: string;
                  FieldChanges: {
                      file: string | undefined;
                      signInRequired: boolean;
                  };
              }[]
            | undefined
    ) => {
        const response = await updateMultipleForms(JSON.stringify(data));
        afterAPI(response as Response);
    };

    const onFinalSwitching = async () => {
        setShowLoader(true);
        const formIds =
            selectedForms?.filter((id) => id !== "").join(",") || "";
        const multipleParentChildData = selectedForms?.map((id) => {
            return {
                formId: id,
                FieldChanges: {
                    file:
                        radioValue === FormAccessType.Public ? "" : file?.name,
                    signInRequired:
                        radioValue === FormAccessType.Public ? false : true,
                },
            };
        });
        const FormDataWithUploadedFile: FormDefinition = {
            ...formData,
            multipleParentChildData,
            file,
        };
        if (radioValue === FormAccessType.Public) {
            updateStatusForMultipleForms(multipleParentChildData);
        } else {
            callingUploadProviderMapping(formIds, FormDataWithUploadedFile);
        }
    };

    const RenderSwitchAccessConfirmation = () => {
        return (
            <GenericModal
                onClose={onSwitchModalClose}
                onDelete={onFinalSwitching}
                listName={hasParentChecked ? formName : ""}
                show={showSwitchModal}
                warning={switchModal.warning}
                hint={switchModal.hint}
                hintNote={switchModal.hintNote}
                note={switchModal.note}
                confirm={switchModal.confirm}
                buttonText="Switch access"
                modalType={ModalType.INFORMATIONAL}
            />
        );
    };
    return (
        <>
            {showLoader && <Loader show={true} />}
            {showBanner && (
                <NotificationBannerModal
                    bannerType={BannerType.INFORMATIONAL}
                    bannerContent="Something went wrong while processing your request. Try again."
                    hasPrimaryButton={true}
                    primaryButtonText="Try again"
                    hasSecondaryButton={true}
                    secondaryButtonText="Back to dashboard"
                    onPrimaryButtonClick={() => onFinalSwitching()}
                    onSecondaryBtnClick={() => history.push("/dashboard")}
                />
            )}
            <Button
                name={"switch-access-button"}
                text="Switch access"
                isDisabled={isButtonDisabled()}
                variant={ButtonVariant.Primary}
                onButtonClick={onSwitchingAccessGroup}
            />
            {RenderSwitchAccessConfirmation()}
        </>
    );
}

export default SwitchAccessSubmission;
