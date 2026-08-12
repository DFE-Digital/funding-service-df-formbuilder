import React from "react";
import { render } from "@testing-library/react";
import { PointDown, PointRight } from "../Icons";

describe('PointDown Component', () => {
    test('renders with default dimensions', () => {
        const { container } = render(<PointDown />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).toHaveAttribute('width', '14');
        expect(svgElement).toHaveAttribute('height', '15');
    });

    test('renders with custom dimensions', () => {
        const { container } = render(<PointDown width={20} height={25} />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).toHaveAttribute('width', '20');
        expect(svgElement).toHaveAttribute('height', '25');
    });
});

describe('PointRight Component', () => {
    test('renders with default dimensions', () => {
        const { container } = render(<PointRight />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).toHaveAttribute('width', '12');
        expect(svgElement).toHaveAttribute('height', '14');
    });

    test('renders with custom dimensions', () => {
        const { container } = render(<PointRight width={18} height={22} />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).toHaveAttribute('width', '18');
        expect(svgElement).toHaveAttribute('height', '22');
    });
});
