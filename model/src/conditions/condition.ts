import { ConditionField } from "./condition-field";
import { ConditionAbstract } from "./condition-abstract";
import { getExpression } from "./condition-operators";
import { ConditionValue, RelativeTimeValue } from "./condition-values";
import { ConditionValueAbstract } from "./condition-value-abstract";
import { Coordinator } from "./types";

export class Condition extends ConditionAbstract {
    field: ConditionField;
    operator: string;
    value: ConditionValue | RelativeTimeValue;
    conditionType?: string;
    datasetId?: string;

    constructor(
        field: ConditionField,
        operator: string,
        value: ConditionValue | RelativeTimeValue,
        conditionType?: string,
        coordinator?: Coordinator,
        datasetId?: string
    ) {
        super(coordinator);

        if (!(field instanceof ConditionField)) {
            throw Error(`field ${field} is not a valid ConditionField object`);
        }
        if (typeof operator !== "string") {
            throw Error(`operator ${operator} is not a valid operator`);
        }
        if (!(value instanceof ConditionValueAbstract)) {
            throw Error(`value ${value} is not a valid value type`);
        }
        if (conditionType && typeof conditionType !== "string") {
            throw Error(`conditionType ${conditionType} is not a valid`);
        }
        if (datasetId && typeof datasetId !== "string") {
            throw Error(`datasetId ${datasetId} is not a valid`);
        }

        this.field = field;
        this.operator = operator;
        this.value = value;
        if (conditionType) {
            this.conditionType = conditionType;
        }
        this.datasetId = datasetId;
    }

    asFirstCondition() {
        this._asFirstCondition();
        return this;
    }

    conditionString() {
        return `'${this.field.display}' ${
            this.operator
        } '${this.value.toPresentationString()}'`;
    }

    conditionExpression() {
        return getExpression(
            this.field.type,
            this.field.name,
            this.operator,
            this.value
        );
    }

    clone() {
        return new Condition(
            ConditionField.from(this.field),
            this.operator,
            this.value.clone(),
            this.conditionType,
            this.coordinator,
            this.datasetId
        );
    }
}
