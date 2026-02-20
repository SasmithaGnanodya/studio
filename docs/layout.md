# Valuation Report Layout Specification

This document defines the final, standardized layout for vehicle valuation reports.

## Core Structure
The report is rendered on an **A4 (210mm x 297mm)** canvas. All coordinates are defined in millimeters (mm) relative to the top-left corner.

## Fields and Coordinates

### Header
| Field Name | Type | X (mm) | Y (mm) | Properties |
|------------|------|--------|--------|------------|
| Seylan Bank PLC | Static | 80 | 10 | Bold, Blue, 16pt |
| Report Num | Data | 170 | 15 | Bold, 10pt |
| Date | Data | 170 | 22 | 10pt |

### Identification
| Field Name | Type | X (mm) | Y (mm) | Properties |
|------------|------|--------|--------|------------|
| Reg. Number | Data | 45 | 45 | Bold, 11pt |
| Manufacturer | Data | 135 | 45 | 10pt |
| Model / Type | Data | 45 | 52 | 10pt |
| Type of Fuel | Data | 135 | 52 | Dropdown: Petrol, Diesel, etc. |

### Technical Details
- **Drive Train Title**: (15, 75), Bold, 10pt
- **Drive Wheels**: (45, 82), Dropdown: FWD, RWD, etc.
- **Main Photo**: (15, 125), Width: 180, Height: 100

### Valuation
- **Market Value Rs**: (65, 255), Bold, 14pt, Red
- **Forced Sale Value**: (65, 275), 11pt

## Layout Consistency
The system implements a **Layout Versioning** system. 
1. New reports always use the `currentId` defined in `/layouts/config`.
2. Existing reports store a reference to the `layoutId` they were created with.
3. Admins can manually "Upgrade Layout" to migration an older report to the latest visual specifications.
