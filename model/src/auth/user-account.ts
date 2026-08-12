export class UserAccount {
    UserName?: string;
    UserId?: string;
    HomeAccountId?: string;

    constructor(UserName: string, UserId: string, HomeAccountId: string) {
        this.UserId = UserId;
        this.UserName = UserName;
        this.HomeAccountId = HomeAccountId;
    }
}
