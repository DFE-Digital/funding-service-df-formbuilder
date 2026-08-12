import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ErrorSummary, { ErrorSummaryListItem } from '../ErrorSummary';

describe('ErrorSummary component', () => {
    const items: ErrorSummaryListItem[] = [
        { text: 'Error 1', href: '#error1', componentId: 'error1' },
        { text: 'Error 2', componentId: 'error2' },
    ];

    beforeEach(() => {
        Element.prototype.scrollIntoView = jest.fn();
    });

    test('renders correctly with error items', () => {
        const { container } = render(<ErrorSummary items={items} />);

        const errorSummary = container.querySelector('.govuk-error-summary');
        const errorListItems = container.querySelectorAll(
            '.govuk-error-summary__list li'
        );

        expect(errorSummary).toBeInTheDocument();
        expect(errorListItems.length).toBe(2);
        expect(errorListItems[0]).toHaveTextContent('Error 1');
        expect(errorListItems[1]).toHaveTextContent('Error 2');
    });

    test('clicking an error link triggers scrollIntoView on the corresponding component', () => {
        const { container } = render(<ErrorSummary items={items} />);

        const error1Element = document.createElement('div');
        error1Element.id = 'error1';
        document.body.appendChild(error1Element);

        const errorLink = container.querySelector('a[href="#error1"]');
        expect(errorLink).toBeInTheDocument();

        fireEvent.click(errorLink!);
        expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });

    test('clicking a link with no href defaults to # and triggers scrollIntoView', () => {
        const { container } = render(<ErrorSummary items={items} />);

        const error2Element = document.createElement('div');
        error2Element.id = 'error2';
        document.body.appendChild(error2Element);

        const errorLink = container.querySelector('a[href="#"]');
        expect(errorLink).toBeInTheDocument();

        fireEvent.click(errorLink!);
        expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
});
