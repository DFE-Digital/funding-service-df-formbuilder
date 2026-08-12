import MsalClientApplication from "../auth/clientApplication";
import { UserAccountHelper } from "../helpers/userAccount.helper";

export const getCurrentUserData = async () => {
    const pca = MsalClientApplication.getInstance();
    const userData = await UserAccountHelper.getUserAccount(pca);
    if (userData.UserId && userData.UserName && userData.HomeAccountId) {
        const data = {
            id: userData.UserId,
            name: userData.UserName,
            isSessionActive: userData.UserId ? true : false,
            homeAccountId: userData.HomeAccountId,
        };
        return data;
    } else {
        throw Error("Error in fetching current user data");
    }
};
