import React, { useState, useRef, useEffect, useCallback } from "react";
import { validateExpression } from "./validations";
import "./ComputeBlock.scss";

interface ComputeItem {
    id: string;
    type: "variable" | "operator" | "input" | "calculation";
    label: string;
    value: string;
    originalIndex?: number;
}

interface ComputeBlockProps {
    calculationResult: string;
    setCalculationResult: (result: string) => void;
    selectedComponents?: any[];
    selectedDatasets?: any[];
    onAddMultipleVariables?: (fn: (variables: any[]) => void) => void;
}

const OPERATORS = [
    { id: "add", label: "+", value: "+", type: "operator" as const },
    { id: "subtract", label: "-", value: "-", type: "operator" as const },
    { id: "multiply", label: "*", value: "*", type: "operator" as const },
    { id: "divide", label: "/", value: "/", type: "operator" as const },
];

const ComputeBlock: React.FC<ComputeBlockProps> = ({
    calculationResult,
    setCalculationResult,
    selectedComponents = [],
    selectedDatasets = [],
    onAddMultipleVariables,
}) => {
    const [computeBlocks, setComputeBlocks] = useState<ComputeItem[]>([]);
    const [draggedItem, setDraggedItem] = useState<ComputeItem | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [dropZone, setDropZone] = useState<number | null>(null);
    const [showValidationError, setShowValidationError] = useState(false);
    const [hideToolTip, setHideToolTip] = useState(false);
    const [isDraggingOutside, setIsDraggingOutside] = useState(false);
    const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());

    const computeRef = useRef<HTMLDivElement>(null);

    // Convert selected components and datasets to compute items
    useEffect(() => {
        if (calculationResult && computeBlocks.length === 0) {
            // Parse existing calculation result if editing
            parseCalculationResult(calculationResult);
        }
    }, [calculationResult]);

    // Update calculation result when compute blocks change
    useEffect(() => {
        const result = computeBlocks
            .map((block) => {
                if (block.type === "operator") {
                    return ` ${block.value} `;
                }
                return `(${block.value})`;
            })
            .join("");

        setCalculationResult(result);
    }, [computeBlocks, setCalculationResult]);

    const parseCalculationResult = (result: string) => {
        // Simple parser for existing calculation results
        // This would need to be more sophisticated for complex expressions
        const items: ComputeItem[] = [];
        let index = 0;

        // Basic parsing - this could be enhanced based on actual format
        const tokens = result
            .split(/(\s*(?:(?<!~R)\+|[-*/%])\s*)/)
            .filter((token) => token.trim());

        tokens.forEach((token, i) => {
            const trimmed = token.trim();
            if (["+", "-", "*", "/", "%"].includes(trimmed)) {
                items.push({
                    id: `op-${i}`,
                    type: "operator",
                    label: trimmed,
                    value: trimmed,
                });
            } else if (trimmed) {
                // Remove parentheses and get the variable name
                const value = trimmed.replace(/[()]/g, "");
                items.push({
                    id: `var-${i}`,
                    type: "variable",
                    label: value,
                    value: value,
                });
            }
        });

        setComputeBlocks(items);
    };

    const handleMouseDown = (
        e: React.MouseEvent,
        block: ComputeItem,
        index: number
    ) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });

        setDraggedItem({
            ...block,
            originalIndex: index,
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!draggedItem) return;

        const computeRect = computeRef.current?.getBoundingClientRect();
        if (!computeRect) return;

        // Check if mouse is still inside compute block
        const isInComputeBlock =
            e.clientX >= computeRect.left &&
            e.clientX <= computeRect.right &&
            e.clientY >= computeRect.top &&
            e.clientY <= computeRect.bottom;

        // Update outside dragging state
        setIsDraggingOutside(!isInComputeBlock);

        if (isInComputeBlock) {
            // Find where to insert the dragged item
            const blockElements = computeRef.current?.querySelectorAll(
                ".compute-item:not(.dragging):not(.dragging-outside)"
            );
            let closestIndex = computeBlocks.length;
            let minDistance = Infinity;

            blockElements?.forEach((el, idx) => {
                const rect = el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const distance = Math.abs(e.clientX - centerX);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = e.clientX < centerX ? idx : idx + 1;
                }
            });

            // Adjust for dragging within same array
            if (
                draggedItem.originalIndex !== undefined &&
                draggedItem.originalIndex < closestIndex
            ) {
                closestIndex -= 1;
            }

            setDropZone(closestIndex);
        } else {
            setDropZone(null); // Outside = will delete
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (!draggedItem) return;

        const computeRect = computeRef.current?.getBoundingClientRect();
        const isInComputeBlock =
            computeRect &&
            e.clientX >= computeRect.left &&
            e.clientX <= computeRect.right &&
            e.clientY >= computeRect.top &&
            e.clientY <= computeRect.bottom;

        if (isInComputeBlock && dropZone !== null) {
            // Reorder within compute block
            const newBlocks = [...computeBlocks];
            const [movedItem] = newBlocks.splice(draggedItem.originalIndex!, 1);
            newBlocks.splice(dropZone, 0, movedItem);

            // Only apply if valid expression
            if (validateExpression(newBlocks)) {
                setComputeBlocks(newBlocks);
                setShowValidationError(false);
            } else {
                setShowValidationError(true);
                setTimeout(() => setShowValidationError(false), 3000);
            }
        } else {
            // Delete - dragged outside with animation
            const itemId = draggedItem.id;

            // Add to deleting items to trigger dissolve animation
            setDeletingItems((prev) => new Set([...prev, itemId]));

            // Wait for animation to complete, then remove from state
            setTimeout(() => {
                setComputeBlocks((prev) =>
                    prev.filter(
                        (_, index) => index !== draggedItem.originalIndex
                    )
                );
                setDeletingItems((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(itemId);
                    return newSet;
                });
            }, 400); // Match the CSS animation duration
        }

        setDraggedItem(null);
        setDropZone(null);
        setIsDraggingOutside(false);
    };

    // Add event listeners for mouse events
    useEffect(() => {
        if (draggedItem) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);

            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [draggedItem, computeBlocks, dropZone]);

    const addVariablesToCompute = useCallback(
        (variables: any[]) => {
            const newItems: ComputeItem[] = variables.map(
                (variable, index) => ({
                    id: `var-${Date.now()}-${index}`,
                    type:
                        variable.type === "calculation"
                            ? "calculation"
                            : "variable",
                    label: variable.displayName || variable.name,
                    value: variable.repeatable
                        ? `${variable.name}~R+`
                        : variable.name,
                })
            );

            const newBlocks = [...computeBlocks, ...newItems];
            if (validateExpression(newBlocks)) {
                setComputeBlocks(newBlocks);
                setShowValidationError(false);
            } else {
                setShowValidationError(true);
                setTimeout(() => setShowValidationError(false), 3000);
            }
        },
        [computeBlocks]
    );

    // Expose the function to parent component
    useEffect(() => {
        if (onAddMultipleVariables) {
            onAddMultipleVariables(addVariablesToCompute);
        }
    }, [onAddMultipleVariables, addVariablesToCompute]);

    const addOperatorToCompute = (operatorTemplate: typeof OPERATORS[0]) => {
        const operator: ComputeItem = {
            id: `op-${Date.now()}-${Math.random()}`,
            type: "operator",
            label: operatorTemplate.label,
            value: operatorTemplate.value,
        };

        const newBlocks = [...computeBlocks, operator];
        if (validateExpression(newBlocks)) {
            setComputeBlocks(newBlocks);
            setShowValidationError(false);
        } else {
            setShowValidationError(true);
            setTimeout(() => setShowValidationError(false), 3000);
        }
    };

    // const addNumberInput = () => {
    //   const number = prompt("Enter a number:");
    //   if (number && !isNaN(Number(number))) {
    //     const newItem: ComputeItem = {
    //       id: `num-${Date.now()}`,
    //       type: 'input',
    //       label: number,
    //       value: number
    //     };

    //     const newBlocks = [...computeBlocks, newItem];
    //     if (validateExpression(newBlocks)) {
    //       setComputeBlocks(newBlocks);
    //       setShowValidationError(false);
    //     } else {
    //       setShowValidationError(true);
    //       setTimeout(() => setShowValidationError(false), 3000);
    //     }
    //   }
    // };

    return (
        <div className="compute-block-container govuk-body">
            <div className="upper-compute-block">
                {showValidationError && (
                    <div className="validation-error">
                        Invalid expression: Two operators or two variables
                        cannot be consecutive
                    </div>
                )}

                <div className="compute-block-header govuk-body">
                    <h3 className="govuk-body">Calculation compute block</h3>
                    <br />
                    <div className="legends">
                        {" "}
                        Legends:
                        <span className="legend-item-component">Component</span>
                        <span className="legend-item-design-data-set">
                            Design data set
                        </span>
                    </div>
                </div>

                <div className="computation-operators">
                    <span>Computation operator:</span>
                    {OPERATORS.map((op) => (
                        <button
                            key={op.id}
                            className="operator-btn"
                            onClick={() => addOperatorToCompute(op)}
                            title={`Add ${op.label} operator`}
                        >
                            {op.label}
                        </button>
                    ))}
                </div>

                <div className="repeatable-operator">
                    <span>Repeatable operator:</span>
                    <span>R+</span>
                </div>
            </div>

            <div className="lower-compute-block">
                <div
                    ref={computeRef}
                    className="compute-area"
                    data-testid="compute-area"
                >
                    {computeBlocks.map((block, index) => (
                        <React.Fragment key={block.id}>
                            {dropZone === index && (
                                <div className="drop-indicator"></div>
                            )}
                            <div
                                className={`compute-item ${block.type} ${
                                    draggedItem?.id === block.id
                                        ? isDraggingOutside
                                            ? "dragging-outside"
                                            : "dragging"
                                        : ""
                                } ${
                                    deletingItems.has(block.id)
                                        ? "deleting"
                                        : ""
                                }`}
                                onMouseDown={(e) =>
                                    handleMouseDown(e, block, index)
                                }
                                draggable={false}
                            >
                                {block.label}
                            </div>
                        </React.Fragment>
                    ))}
                    {dropZone === computeBlocks.length && (
                        <div className="drop-indicator"></div>
                    )}
                </div>

                {/* <div className="compute-block-actions">
        <button 
          className="add-number-btn"
          onClick={addNumberInput}
        >
          Add number input box
        </button>
        <button 
          className="add-operator-btn"
          onClick={() => {
            // This would open operator selector
            console.log('Add operator box');
          }}
        >
          Add operator box
        </button>
      </div> */}

                <div className="tool-tip-section">
                    <label>
                        <input
                            type="checkbox"
                            checked={hideToolTip}
                            onChange={(e) => setHideToolTip(e.target.checked)}
                        />
                        Hide tool tip details
                    </label>
                    {!hideToolTip && (
                        <div className="tool-tip-details">
                            To remove a box or variable, drag it out of the
                            compute block.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComputeBlock;
