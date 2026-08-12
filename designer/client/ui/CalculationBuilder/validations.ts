const OPERAND_TYPES = ["variable", "input", "calculation"];

export const validateExpression = (blocks: any[]): boolean => {
    if (!Array.isArray(blocks) || blocks.length === 0) return true;

    for (let i = 0; i < blocks.length - 1; i++) {
        const current = blocks[i];
        const next = blocks[i + 1];

        // Variables, inputs, and calculations are operands
        const currentIsOperand = OPERAND_TYPES.includes(current?.type);
        const nextIsOperand = OPERAND_TYPES.includes(next?.type);
        const currentIsOperator = current?.type === "operator";
        const nextIsOperator = next?.type === "operator";

        // Invalid if two operators or two operands are side by side
        if (
            (currentIsOperator && nextIsOperator) ||
            (currentIsOperand && nextIsOperand)
        ) {
            return false;
        }
    }
    return true;
};
