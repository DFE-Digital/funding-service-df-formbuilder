import { faker } from "@faker-js/faker";

import NameCell from "./Name";
import SubRowToggle from "./SubRowToggle";

type Employee = {
    userId: string;
    jobTitleName: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    region: string;
    phoneNumber: string;
    emailAddress: string;
    subRows?: Employee[];
};

const range = (len: number) => {
    const arr: number[] = [];
    for (let i = 0; i < len; i++) {
        arr.push(i);
    }
    return arr;
};

const newEmployee = (): Employee => {
    const firstName = faker.person.firstName();
    return {
        firstName: firstName,
        lastName: faker.person.lastName(),
        userId: faker.string.alphanumeric(10),
        jobTitleName: faker.person.jobTitle(),
        employeeCode: faker.string.alphanumeric(5),
        region: faker.location.countryCode(),
        phoneNumber: faker.phone.number(),
        emailAddress: faker.internet.email({ firstName }),
    };
};

function makeData(...lens: number[]) {
    const makeDataLevel = (depth = 0): Employee[] => {
        const len = lens[depth]!;
        return range(len).map(
            (d): Employee => {
                return {
                    ...newEmployee(),
                    subRows: lens[depth + 1]
                        ? makeDataLevel(depth + 1)
                        : undefined,
                };
            }
        );
    };

    return makeDataLevel();
}

export { makeData, Employee, NameCell, SubRowToggle };
