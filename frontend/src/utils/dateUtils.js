/**
 * Unified Date and 12-Hour Time Formatting Utilities for SDEMS
 * Ensures standard 12-hour format (AM/PM) across the entire application.
 */

/**
 * Format a timestamp to 12-hour time (e.g., "02:30 PM" or "02:30:15 PM")
 */
export function format12HourTime(dateInput, includeSeconds = false) {
    if (!dateInput) return "N/A";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "N/A";

    return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: includeSeconds ? "2-digit" : undefined,
        hour12: true
    }).toUpperCase();
}

/**
 * Format a timestamp to Indian standard date (e.g., "29 Sep 2026")
 */
export function format12HourDate(dateInput) {
    if (!dateInput) return "N/A";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "N/A";

    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

/**
 * Format a timestamp to full date and 12-hour time (e.g., "29 Sep 2026, 02:30 PM")
 */
export function format12HourDateTime(dateInput, includeSeconds = false) {
    if (!dateInput) return "N/A";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "N/A";

    const datePart = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    const timePart = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: includeSeconds ? "2-digit" : undefined,
        hour12: true
    }).toUpperCase();

    return `${datePart}, ${timePart}`;
}

/**
 * Helper for ballot / ledger timestamps including timezone designation
 */
export function formatReceiptLedgerTime(dateInput) {
    return `${format12HourDateTime(dateInput, true)} IST`;
}
