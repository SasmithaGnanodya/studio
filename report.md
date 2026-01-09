# Application Report: Valuation Report Generator

This document provides a comprehensive overview of the Valuation Report Generator application, including its technical stack, user guide, and core functionalities.

## 1. Technical Stack

The application is built with a modern, robust, and scalable technology stack, designed for performance and maintainability.

-   **Core Framework**: **Next.js (v15)** with **React (v19)** using the App Router. This provides server-side rendering, static site generation, and a powerful component-based architecture.
-   **Database**: **Firebase Firestore**. A NoSQL, cloud-native database used for storing all application data, including reports, layouts, and user information.
-   **Authentication**: **Firebase Authentication**. Securely manages user identity, supporting sign-in via Google. It includes a distinction between standard users and a designated admin user.
-   **UI Components**: **shadcn/ui**. A collection of beautifully designed, accessible, and composable components built on top of Radix UI and Tailwind CSS.
-   **Styling**: **Tailwind CSS**. A utility-first CSS framework for rapidly building custom user interfaces. The application uses a theming system based on CSS variables for consistent styling.
-   **Icons**: **Lucide React**. A comprehensive and lightweight icon library.
-   **Forms Management**: **React Hook Form**. Efficiently manages form state and validation for the data entry sections of the application.
-   **Language**: **TypeScript**. Provides static typing for improved code quality, readability, and developer experience.

## 2. How to Use the Application

The application is divided into three main user experiences: the public-facing report management, the admin panel, and the layout editor.

### Standard User Workflow

1.  **Authentication**: Sign in using the "Sign In" button in the top-right corner, which uses your Google account.
2.  **Landing Page**: After signing in, you will see the main search interface.
    -   **Search for a Report**: Enter a vehicle registration number to find an existing report. Results will appear in real-time.
    -   **Create a New Report**: If no report is found for the entered number, a "Create New Report" button will appear. Click it to start a new report for that vehicle.
3.  **Report Page**: This is the main workspace for filling out a report.
    -   **Data Form (Left Panel)**: Fill in all the required details for the vehicle valuation. The form includes text inputs, dropdowns, and image upload fields.
    -   **Live Preview (Right Panel)**: As you type, the right side of the screen shows a live preview of how the data will appear on the final, pre-printed document.
    -   **Saving**: Click the "Save Report" button to save your changes.
    -   **Printing**: Click the "Print to PDF" button to open your browser's print dialog, allowing you to save the document as a PDF.

### Admin Workflow

A designated admin user (identified by a specific email address in the code) has access to powerful administrative features.

1.  **Accessing the Admin Panel**: If you are signed in as an admin, an "Admin" link will appear in the header.
2.  **Admin Dashboard**:
    -   This dashboard displays a list of **all** reports in the system, grouped by date.
    -   You can see the Vehicle ID, who last saved the report, and when it was created.
    -   You can search for specific reports by Vehicle ID.
    -   From here, you can navigate to **View** a report, edit the **Layout**, or view a report's **History**.
3.  **Viewing Report History**:
    -   Click the "History" button for any report on the admin dashboard.
    -   This page shows a complete, un-editable log of every time that report was saved, including who saved it and at what time. This provides a full audit trail.
4.  **Using the Layout Editor**:
    -   Click the "Edit Layout" button on the admin dashboard to enter the editor.
    -   **Visual Editing**: You can drag, drop, and resize every single field on the report preview. Each field has handles for moving and resizing.
    -   **Adding Fields**: Use the toolbar to add new fields:
        -   **Add Text Field**: Adds a standard data-bound field with a label and a value area.
        -   **Add Static Text**: Adds a simple text label for titles or instructions, without a corresponding data field.
        -   **Add Image**: Adds a placeholder for an image.
    -   **Editing Field Properties**: Click on any field to open the Editor Sidebar. Here you can configure:
        -   **Field ID**: The key used to link this field to the data.
        -   **Text, Position, and Size**: Precisely control the text content, coordinates (in mm), and dimensions.
        -   **Styling**: Change the color, font size, and font weight (bold).
        -   **Input Type**: For data fields, you can set the input to be a standard text box or a dropdown menu (with configurable options).
    -   **Saving a New Version**: When you click "Save as New Version," the current layout is saved as the new global standard. All **new** reports created from that point forward will use this layout. Existing reports will remain on their original layout unless manually upgraded.

## 3. Core Application Functions

-   **Collaborative Report Editing**: Multiple users can edit the same report. The system tracks who last saved the report.
-   **Layout Versioning**: The application maintains a complete version history of layouts. Reports are tied to the specific layout version they were created with, ensuring that old reports always render correctly, even if the master layout changes.
-   **Controlled Layout Upgrades**: When editing a report that uses an older layout, a button appears allowing the user to upgrade it to the latest version. This is an explicit action and not automatic.
-   **Dynamic Previews**: The report page provides an instant, pixel-perfect preview of the final document as data is entered.
-   **Role-Based Access Control**: A clear distinction exists between standard users and a powerful admin user who can manage system-wide settings and view all data.
-   **Transactional Saves**: All save operations, including history creation, are performed within a Firestore transaction to guarantee data integrity.
-   **Responsive Design**: The application is designed to be usable on both desktop and mobile devices, with adaptive UI for different screen sizes.