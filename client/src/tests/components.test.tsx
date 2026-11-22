import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusBadge } from '../components/StatusBadge.js';
import { CategoryBadge, PriorityBadge } from '../components/CategoryBadge.js';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider.js';
import { TimelineView } from '../components/TimelineView.js';
import { ThemeToggle } from '../components/ThemeToggle.js';
import { ThemeProvider } from '../context/ThemeContext.js';

describe('SmartBin AI Frontend Component Suite', () => {
  it('StatusBadge renders Submitted, In Progress, and Resolved states correctly', () => {
    const { rerender } = render(<StatusBadge status="Submitted" />);
    expect(screen.getByText('Submitted')).toBeDefined();

    rerender(<StatusBadge status="In Progress" />);
    expect(screen.getByText('In Progress')).toBeDefined();

    rerender(<StatusBadge status="Resolved" />);
    expect(screen.getByText('Resolved & Cleaned')).toBeDefined();
  });

  it('CategoryBadge renders waste category names and icons', () => {
    const { rerender } = render(<CategoryBadge category="plastic" />);
    expect(screen.getByText('Plastic & Polymers')).toBeDefined();

    rerender(<CategoryBadge category="organic" />);
    expect(screen.getByText('Organic Biomass')).toBeDefined();

    rerender(<CategoryBadge category="electronic" />);
    expect(screen.getByText('E-Waste')).toBeDefined();
  });

  it('PriorityBadge renders critical and low priority indicators', () => {
    const { rerender } = render(<PriorityBadge priority="Critical" />);
    expect(screen.getByText('Critical Hazard')).toBeDefined();

    rerender(<PriorityBadge priority="Low" />);
    expect(screen.getByText('Low Priority')).toBeDefined();
  });

  it('BeforeAfterSlider renders image labels and comparative structure', () => {
    render(
      <BeforeAfterSlider
        beforeUrl="https://example.com/before.jpg"
        afterUrl="https://example.com/after.jpg"
        beforeLabel="Initial Heap"
        afterLabel="Cleaned Area"
      />
    );
    expect(screen.getByText('Initial Heap')).toBeDefined();
    expect(screen.getByText('Cleaned Area')).toBeDefined();
  });

  it('TimelineView renders audit trail notes and user details', () => {
    const timeline = [
      {
        status: 'Submitted' as const,
        changedByName: 'Ananya Deshmukh',
        role: 'citizen',
        note: 'Garbage reported near bus stop',
        timestamp: new Date().toISOString(),
      },
      {
        status: 'Assigned' as const,
        changedByName: 'Commissioner Vikram',
        role: 'admin',
        note: 'Assigned to Rajesh Kumar',
        timestamp: new Date().toISOString(),
      },
    ];

    render(<TimelineView timeline={timeline} currentStatus="Assigned" />);
    expect(screen.getByText('Ananya Deshmukh')).toBeDefined();
    expect(screen.getByText('Garbage reported near bus stop')).toBeDefined();
    expect(screen.getByText('Commissioner Vikram')).toBeDefined();
  });

  it('ThemeToggle toggles between dark and light view modes', () => {
    render(
      <ThemeProvider>
        <ThemeToggle showLabel={true} />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /toggle dark and light view/i });
    expect(toggleButton).toBeDefined();

    // Click to toggle
    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('light')).toBe(true);

    // Click again to toggle back
    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

