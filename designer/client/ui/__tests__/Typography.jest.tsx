import React from 'react';
import { render } from '@testing-library/react';
import Heading, { HeadingType } from '../Typography/Heading';
import Hint from '../Typography/Hint';
import Label, { LabelSizes } from '../Typography/Label';
import Legend, { LegendSizes } from '../Typography/Legend';
import Para, { ParaType, ParaFontSizes, ParaAlignTypes } from '../Typography/Para';

describe('Heading Component', () => {
    test('renders XL heading with caption', () => {
        const { getByText } = render(<Heading type={HeadingType.XL} text="Test XL" caption="Caption XL" />);
        expect(getByText("Test XL")).toBeInTheDocument();
        expect(getByText("Caption XL")).toBeInTheDocument();
    });

    test('renders L heading with caption', () => {
        const { getByText } = render(<Heading type={HeadingType.L} text="Test L" caption="Caption L" />);
        expect(getByText("Test L")).toBeInTheDocument();
        expect(getByText("Caption L")).toBeInTheDocument();
    });

    test('renders M heading with caption', () => {
        const { getByText } = render(<Heading type={HeadingType.M} text="Test M" caption="Caption M" />);
        expect(getByText("Test M")).toBeInTheDocument();
        expect(getByText("Caption M")).toBeInTheDocument();
    });

    test('renders S heading', () => {
        const { getByText } = render(<Heading type={HeadingType.S} text="Test S" />);
        expect(getByText("Test S")).toBeInTheDocument();
    });

    test('renders default L heading when type is not provided', () => {
        const { getByText } = render(<Heading text="Default Heading" caption="Default Caption"/>);
        expect(getByText("Default Heading")).toBeInTheDocument();
        expect(getByText("Default Caption")).toBeInTheDocument();
    });
});

describe('Hint Component', () => {
    test('renders hint with provided text and id', () => {
        const { getByText } = render(<Hint id="test-id" text="Hint Text" />);
        const hintElement = getByText("Hint Text");
        expect(hintElement).toBeInTheDocument();
        expect(hintElement.id).toBe("test-id-hint");
    });
});

describe('Label Component', () => {
    test('renders label with large size', () => {
        const { getByText } = render(<Label text="Label Text" size={LabelSizes.L} />);
        const labelElement = getByText("Label Text");
        expect(labelElement).toHaveClass('govuk-label govuk-label--l');
    });

    test('renders label with additional classes', () => {
        const { getByText } = render(<Label text="Label with Classes" additionalClasses="extra-class" />);
        const labelElement = getByText("Label with Classes");
        expect(labelElement).toHaveClass('govuk-label extra-class');
    });

    test('renders label with renderRight function', () => {
        const renderRight = () => <span>Rendered Right</span>;
        const { getByText } = render(<Label text="Label with Render Right" renderRight={renderRight} />);
        expect(getByText("Rendered Right")).toBeInTheDocument();
    });
});

describe('Legend Component', () => {
    test('renders legend with text as a heading', () => {
        const { getByRole } = render(<Legend text="Legend Heading" isHeading={true} />);
        const headingElement = getByRole('heading', { level: 1 });
        expect(headingElement).toHaveTextContent("Legend Heading");
    });

    test('renders legend with specific size', () => {
        const { getByText } = render(<Legend text="Legend M" size={LegendSizes.M} />);
        expect(getByText("Legend M")).toHaveClass('govuk-fieldset__legend--m');
    });

    test('renders legend without heading', () => {
        const { getByText } = render(<Legend text="Simple Legend" />);
        expect(getByText("Simple Legend")).toBeInTheDocument();
    });
});

describe('Para Component', () => {
    test('renders paragraph with default props', () => {
        const { getByText } = render(<Para text="Default Paragraph" />);
        const paraElement = getByText("Default Paragraph");
        expect(paraElement).toHaveClass('govuk-body govuk-!-margin-0');
    });

    test('renders large paragraph with custom size and alignment', () => {
        const { getByText } = render(
            <Para text="Custom Paragraph" type={ParaType.L} size={ParaFontSizes.S24} align={ParaAlignTypes.Centre} />
        );
        const paraElement = getByText("Custom Paragraph");
        expect(paraElement).toHaveClass('govuk-body-l govuk-!-font-size-24 govuk-!-text-align-centre');
    });

    test('renders small paragraph with custom size and alignment', () => {
        const { getByText } = render(
            <Para text="Custom Paragraph" type={ParaType.S} size={ParaFontSizes.S14} align={ParaAlignTypes.Centre} />
        );
        const paraElement = getByText("Custom Paragraph");
        expect(paraElement).toHaveClass('govuk-body-s govuk-!-font-size-14 govuk-!-text-align-centre');
    });

    test('renders bold paragraph', () => {
        const { getByText } = render(<Para text="Bold Paragraph" bold={true} />);
        const paraElement = getByText("Bold Paragraph");
        expect(paraElement).toHaveClass('govuk-!-font-weight-bold');
    });
});
