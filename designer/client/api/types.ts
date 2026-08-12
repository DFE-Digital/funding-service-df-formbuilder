export type FileUploadResponse =
    | {
          status: true;
          data: {
              fileId: string;
              fileName: string;
          };
      }
    | {
          status: false;
          error: unknown;
      };
