/* istanbul ignore file */
import { EventType, PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../config/authConfig";

export default class MsalClientApplication {
    static instance: PublicClientApplication;

    static getInstance() {
        if (MsalClientApplication.instance == null) {
            MsalClientApplication.instance = new PublicClientApplication(
                msalConfig
            );
            MsalClientApplication.instance.initialize();

            this.instance.addEventCallback((event) => {
                if (
                    event.eventType === EventType.LOGIN_SUCCESS &&
                    event?.payload?.account
                ) {
                    const account = event.payload.account;
                    this.instance.setActiveAccount(account);
                    window.location.reload();
                }
            });
        }
        // Default to using the first account if no account is active on page load
        if (
            this.instance.getActiveAccount() &&
            this.instance.getAllAccounts().length > 0
        ) {
            // Account selection logic is app dependent. Adjust as needed for different use cases.
            this.instance.setActiveAccount(this.instance.getAllAccounts()[0]);
        }
        // Optional - This will update account state if a user signs in from another tab or window
        this.instance.enableAccountStorageEvents();
        return this.instance;
    }

    static async logout(homeAccountId) {
        if (MsalClientApplication.instance) {
            const currentAccount = this.instance.getAccountByHomeId(
                homeAccountId
            );
            await this.instance.logoutRedirect({
                account: currentAccount,
                postLogoutRedirectUri: `/app/`,
            });
            localStorage.clear();
        }
    }
}
