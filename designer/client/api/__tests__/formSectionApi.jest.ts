import { FormDefinition, Section } from "@xgovformbuilder/model";
import { getConfiguration } from "../formConfigurationsApi";
import { DesignerApi } from "../designerApi";
import { fetchSectionsFromFormId, addEditSection, deleteSectionFromForm } from "../formSectionApi";
import { FormSectionState, LoadingState } from "../../store/types";

jest.mock("../formConfigurationsApi");
jest.mock("../designerApi");

describe("formSectionApi", () => {
  const mockSection: Section = {
    name: "test-section",
    title: "Test Section",
    repeatableSection: false
  };

  const mockForm: FormDefinition = {
    id: "test-id",
    key: "test-key",
    displayName: "Test Form",
    lastModified: "2025-04-25",
    lastDownloaded: "2025-04-25",
    pages: [],
    conditions: [],
    lists: [],
    sections: [mockSection],
    confirmationMsg: "",
    fees: [],
    calculations: []
  };

  const mockState: FormSectionState = {
    form: mockForm,
    selectedSection: mockSection,
    newSection: mockSection,
    entities: [],
    loading: LoadingState.Idle,
    numberComponents: [],
    conditionalComponents: []
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("fetchSectionsFromFormId", () => {
    it("should fetch sections successfully", async () => {
      (getConfiguration as jest.Mock).mockResolvedValueOnce(mockForm);

      const result = await fetchSectionsFromFormId("test-id");

      expect(result).toEqual({
        data: [mockSection],
        form: mockForm,
        error: ""
      });
      expect(getConfiguration).toHaveBeenCalledWith("test-id");
    });

    it("should return empty config when no response", async () => {
      (getConfiguration as jest.Mock).mockResolvedValueOnce(null);

      const result = await fetchSectionsFromFormId("test-id");

      expect(result).toEqual({
        data: [],
        form: {
          id: "",
          key: "",
          displayName: "",
          lastModified: "",
          lastDownloaded: "",
          pages: [],
          conditions: [],
          lists: [],
          sections: [],
          confirmationMsg: "",
          fees: [],
          calculations: []
        },
        error: ""
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      (getConfiguration as jest.Mock).mockRejectedValueOnce(error);

      const result = await fetchSectionsFromFormId("test-id");

      expect(result.error).toBe("Error: Test error");
      expect(result.data).toEqual([]);
    });
  });

  describe("addEditSection", () => {
    it("should edit section successfully", async () => {
      const mockDesignerApi = {
        save: jest.fn().mockResolvedValueOnce({ ok: true })
      };
      (DesignerApi as jest.Mock).mockImplementation(() => mockDesignerApi);

      const result = await addEditSection(mockState, true);

      expect(result.error).toBe("");
      expect(result.form.sections).toEqual([mockSection]);
      expect(mockDesignerApi.save).toHaveBeenCalled();
    });

    it("should add new section successfully", async () => {
      const mockDesignerApi = {
        save: jest.fn().mockResolvedValueOnce({ ok: true })
      };
      (DesignerApi as jest.Mock).mockImplementation(() => mockDesignerApi);

      const result = await addEditSection(mockState, false);

      expect(result.error).toBe("");
      expect(result.form.sections).toEqual([mockSection, mockSection]);
      expect(mockDesignerApi.save).toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      const mockDesignerApi = {
        save: jest.fn().mockRejectedValueOnce(error)
      };
      (DesignerApi as jest.Mock).mockImplementation(() => mockDesignerApi);

      const result = await addEditSection(mockState, true);

      expect(result.error).toBe("Error: Test error");
      expect(result.form).toEqual(mockForm);
    });
  });

  describe("deleteSectionFromForm", () => {
    it("should delete section successfully", async () => {
      const mockDesignerApi = {
        save: jest.fn().mockResolvedValueOnce({ ok: true })
      };
      (DesignerApi as jest.Mock).mockImplementation(() => mockDesignerApi);

      const result = await deleteSectionFromForm(mockState);

      expect(result.error).toBe("");
      expect(result.form.sections).toEqual([]);
      expect(mockDesignerApi.save).toHaveBeenCalledWith("test-id", {
        ...mockForm,
        sections: []
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      const mockDesignerApi = {
        save: jest.fn().mockRejectedValueOnce(error)
      };
      (DesignerApi as jest.Mock).mockImplementation(() => mockDesignerApi);

      const result = await deleteSectionFromForm(mockState);

      expect(result.error).toBe("Error: Test error");
      expect(result.form).toEqual(mockForm);
    });
  });
});