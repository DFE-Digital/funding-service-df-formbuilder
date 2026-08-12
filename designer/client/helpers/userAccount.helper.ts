import { PublicClientApplication } from "@azure/msal-browser";
import { UserAccount } from "@xgovformbuilder/model";

export class UserAccountHelper {
    static async getUserAccount(
        pca: PublicClientApplication
    ): Promise<UserAccount> {
        return {
            UserId: pca.getActiveAccount()?.localAccountId,
            UserName: UserAccountHelper.parseName(pca.getActiveAccount()?.name),
            HomeAccountId: pca.getActiveAccount()?.homeAccountId,
        };
    }
    static parseName(userName: string | undefined): string | undefined {
        if (userName) {
            //Remove numbers, and split the string
            const names = userName.replace(/[0-9]/g, "").split(",");

            if (names.length === 1) {
                userName = `${names[0]}`;
            } else if (names.length > 0) {
                //Sanitise surname
                names[0] =
                    names[0].charAt(0).toUpperCase() +
                    names[0].substr(1).toLowerCase();
                userName = `${names[1]} ${names[0]}`;
            }
        }
        return userName?.trim();
    }
}
