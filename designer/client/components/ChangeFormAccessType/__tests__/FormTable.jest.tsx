import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import FormTable from "../FormTable";
import { FormAccessType } from "@xgovformbuilder/model";
import RadioInputOption from "../RadioInputOption";
import ChangeAccessTypeButtonAndModal from "../ChangeAccessTypeButtonAndModal";
import TableBody from "../TableBody";
import FileUpload from "../FileUpload";
import DFESignInAdditionalLabel from "../DFESignInAdditionalLabel";
import SuccessConfirmationModal from "../SuccessConfirmationModal";
import { AppContext } from "../../../context/AppContext";

const dummyTableData = {
  createdBy: "sathya",
  data: [
    {
      establishment_URN: "",
      establishment_UKPRN: 10008915,
      establishment_name: "City of London",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10003988,
      establishment_name: "Camden",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10003990,
      establishment_name: "Greenwich",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10006736,
      establishment_name: "Hackney",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10002868,
      establishment_name: "Hammersmith and Fulham",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10003414,
      establishment_name: "Islington",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10005548,
      establishment_name: "Kensington and Chelsea",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10003995,
      establishment_name: "Lambeth",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10003895,
      establishment_name: "Lewisham",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10006042,
      establishment_name: "Southwark",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10006964,
      establishment_name: "Tower Hamlets",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10004002,
      establishment_name: "Wandsworth",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10001464,
      establishment_name: "Westminster",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10000143,
      establishment_name: "Barking and Dagenham",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10003986,
      establishment_name: "Barnet",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10000146,
      establishment_name: "Bexley",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10000863,
      establishment_name: "Brent",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10003987,
      establishment_name: "Bromley",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10003989,
      establishment_name: "Croydon",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10009206,
      establishment_name: "Ealing",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10002260,
      establishment_name: "Enfield",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10002859,
      establishment_name: "Haringey",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10002910,
      establishment_name: "Harrow",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10003993,
      establishment_name: "Havering",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10003089,
      establishment_name: "Hillingdon",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10003165,
      establishment_name: "Hounslow",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10005549,
      establishment_name: "Kingston upon Thames",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10003996,
      establishment_name: "Merton",
    },
    {
      establishment_URN: "",
      establishment_UKPRN: 10003997,
      establishment_name: "Newham",
    },
  ],
  displayName: "i2NB4ABWZN",
  formStatus: "In development",
  id: "Ydb__0jnPJ",
  key: "Ydb__0jnPJ",
  lastModified: "2022/05/27 00:53",
  name: "i2NB4ABWZN",
  signInRequired: false,
  skipSummary: false,
  userId: "e740c8ac-cbfc-4f80-b608-d54f0a31d5a9",
};

const MockWithAppContext = ({ children }) => {
  const uploadedFileMock = new File([":)"], "dummyFileName.csv");
  const setUploadedFileMock = jest.fn();
  const setPreviouslyUploadedFileMock = jest.fn();
  const setLastModifiedFormMock = jest.fn();
  const setIncorrectFileTypeMock = jest.fn();
  const mockData = {
    lastModifiedForm: {
      formGroup: "string",
      formName: "string",
      formKey: "string",
    },
    setLastModifiedForm: setLastModifiedFormMock,
    uploadedFile: uploadedFileMock,
    previouslyUploadedFile: "",
    setPreviouslyUploadedFile: setPreviouslyUploadedFileMock,
    setUploadedFile: setUploadedFileMock,
    hasNewFileBeenUploaded: false,
    incorrectFileType: false,
    setIncorrectFileTypeError: setIncorrectFileTypeMock
  };
  return <AppContext.Provider value={mockData}>{children}</AppContext.Provider>;
};

describe("FormTable snapshot test", () => {
  it("Should match snapshot", () => {
    const FormTableProps = {
      isModalOpen: false,
      showModal: jest.fn(),
      hideModal: jest.fn(),
      goBack: jest.fn(),
      getFormAccessType: jest.fn(),
      accessTypeChangeConfirmed: false,
      modalChangeStatus: jest.fn(),
      toggleAccessTypeConfirmation: jest.fn(),
      selectedAccessType: FormAccessType.Public,
      handleRadioCheck: jest.fn(),
      changeSuccessful: false,
    };
    const { asFragment } = render(
      <FormTable {...FormTableProps} tableData={dummyTableData} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("FormTable caption", () => {
  it("Caption includes form name", () => {
    const FormTableProps = {
      isModalOpen: false,
      showModal: jest.fn(),
      hideModal: jest.fn(),
      goBack: jest.fn(),
      getFormAccessType: jest.fn(),
      accessTypeChangeConfirmed: false,
      modalChangeStatus: jest.fn(),
      toggleAccessTypeConfirmation: jest.fn(),
      selectedAccessType: FormAccessType.Public,
      handleRadioCheck: jest.fn(),
      changeSuccessful: false,
    };
    const { getByTestId } = render(
      <FormTable {...FormTableProps} tableData={dummyTableData} />
    );
    const captionElement = getByTestId("table-caption");

    expect(captionElement).toBeInTheDocument();
    expect(captionElement).toHaveTextContent(
      "Change access type for " + dummyTableData.displayName
    );
  });
});

describe("RadioInputOption for DFE Sign in checked", () => {
  it("Clicking the radio option calls the handler function", () => {
    const handlerFunction = jest.fn();
    const { getByTestId } = render(
      <RadioInputOption
        formAccessType={FormAccessType.DFESignIn}
        selectedAccessType={FormAccessType.Public}
        handleRadioCheck={handlerFunction}
      />
    );

    const publicRadioOption = getByTestId("radio-input-option");
    fireEvent.click(publicRadioOption);

    expect(handlerFunction).toHaveBeenCalledTimes(1);
  });
});

describe("Change access type button", () => {
  it("Clicking the change access type button should call showModal function", () => {
    const showModal = jest.fn();
    const Props = {
      displayName: "Form Name Dummy",
      isModalOpen: false,
      hideModal: jest.fn(),
      getFormAccessType: jest.fn(),
      accessTypeChangeConfirmed: false,
      modalChangeStatus: jest.fn(),
      toggleAccessTypeConfirmation: jest.fn(),
      selectedAccessType: FormAccessType.Public,
      formAccessType: FormAccessType.DFESignIn,
      changeSuccessful: false,
    };
    const { getByTestId } = render(
      <ChangeAccessTypeButtonAndModal {...Props} showModal={showModal} />
    );

    const changeAccessTypeButton = getByTestId("change-access-type-button");
    fireEvent.click(changeAccessTypeButton);

    expect(showModal).toHaveBeenCalledTimes(1);
  });
});

describe("TableBody edge case", () => {
  it("When no table data present the no forms message should present", () => {
    const { getByText } = render(
      <TableBody tableData={undefined} getFormAccessType={jest.fn()} />
    );
    expect(getByText("You do not have any existing forms")).toBeInTheDocument();
  });

  it("Long display name should apply ellipsis class", () => {
    const dummyTableDataWithLongName = {
      ...dummyTableData,
      displayName: "Testname".repeat(10),
    };
    const { getByTestId } = render(
      <TableBody
        tableData={dummyTableDataWithLongName}
        getFormAccessType={jest.fn()}
      />
    );
    expect(getByTestId("displayName-table-cell")).toHaveClass(
      "govuk-formname-ellipsis"
    );
  });
});

describe("File upload", () => {
  it("File upload component should file name label", () => {
    const { getByText } = render(
      <MockWithAppContext>
        <FileUpload />
      </MockWithAppContext>
    );
    const label = getByText("dummyFileName.csv");

    expect(label).toBeInTheDocument();
  });

  it("Check for choose button and simulate onChange", () => {
    const { getByTestId, getByText } = render(
      <MockWithAppContext>
        <FileUpload />
      </MockWithAppContext>
    );

    const chooseFileLabelButton = getByText("Choose file");

    // Simulate file upload
    const fileInput = getByTestId("file-upload-1");
    fireEvent.change(fileInput, {
      target: {
        files: new File([":/"], "newFile"),
      },
    });

    expect(chooseFileLabelButton).toBeInTheDocument();
  });
});

describe("DFESignIn", () => {
  it("DFESignIn with a file to show Notification Banner", () => {
    const { getByText } = render(
      <MockWithAppContext>
        <DFESignInAdditionalLabel />
      </MockWithAppContext>
    );
    expect(
      getByText(
        "Please retain a copy of the selected file on your local machine"
      )
    ).toBeInTheDocument();
  });
});

describe("Success Confirmation Modal", () => {
  it("Success confirmation modal to show success title and message for change to public", () => {
    const { getByText } = render(
      <MockWithAppContext>
        <SuccessConfirmationModal
          selectedAccessType={FormAccessType.Public}
          changeSuccessful={false}
        />
      </MockWithAppContext>
    );

    expect(getByText("Success")).toBeInTheDocument();
    expect(
      getByText("Access type successsfully changed to Public")
    ).toBeInTheDocument();
  });
  it("Success confirmation modal to show success title and message for change to DFE Sign In", () => {
    const { getByText } = render(
      <MockWithAppContext>
        <SuccessConfirmationModal
          selectedAccessType={FormAccessType.DFESignIn}
          changeSuccessful={false}
        />
      </MockWithAppContext>
    );

    expect(getByText("Success")).toBeInTheDocument();
    expect(
      getByText(
        "File uploaded successfully and access type is changed to DFE SignIn"
      )
    ).toBeInTheDocument();
  });
  it("Success confirmation modal for change to DFE Sign In case where file has been overwritten", () => {
    const MockWithAppContextWithPreviousFile = ({ children }) => {
      const uploadedFileMock = new File([":)"], "dummyFileName");
      const setUploadedFileMock = jest.fn();
      const setPreviouslyUploadedFileMock = jest.fn();

      const mockData = {
        lastModifiedForm: {
          formGroup: "string",
          formName: "string",
          formKey: "string",
        },
        setLastModifiedForm: jest.fn(),
        uploadedFile: uploadedFileMock,
        previouslyUploadedFile: "dummyFileName.csv",
        setPreviouslyUploadedFile: setPreviouslyUploadedFileMock,
        setUploadedFile: setUploadedFileMock,
        hasNewFileBeenUploaded: false,
      };
      return (
        <AppContext.Provider value={mockData}>{children}</AppContext.Provider>
      );
    };
    const { getByText } = render(
      <MockWithAppContextWithPreviousFile>
        <SuccessConfirmationModal
          selectedAccessType={FormAccessType.DFESignIn}
          changeSuccessful={false}
        />
      </MockWithAppContextWithPreviousFile>
    );

    expect(getByText("Success")).toBeInTheDocument();
    expect(getByText("File uploaded successfully")).toBeInTheDocument();
    expect(
      getByText("Old file has been over written with the new one")
    ).toBeInTheDocument();
  });
});
