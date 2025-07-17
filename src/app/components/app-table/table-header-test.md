# App Table Header Visibility Test

## Problem Description
The `app-table` component's `showHeader` parameter was only hiding the top filter/search panel, but the actual table headers (th elements) remained visible.

## Solution Implemented
- Wrapped all `*brnHeaderDef` directives with `ng-container`
- Added conditional rendering `*ngIf="showHeader"` to all `hlm-th` elements
- This ensures that when `showHeader="false"`, the entire header row is hidden

## Test Cases

### Case 1: Header Visible (Default)
```html
<app-table
  [columns]="['pod_name', 'namespace', 'status']"
  [dataSource]="data$"
  [showHeader]="true">
</app-table>
```
**Expected Result:** Both search panel and table headers are visible

### Case 2: Header Hidden
```html
<app-table
  [columns]="['pod_name', 'namespace', 'status']"
  [dataSource]="data$"
  [showHeader]="false">
</app-table>
```
**Expected Result:** Both search panel and table headers are hidden

### Case 3: Dashboard Card Usage (Real Example)
```html
<app-table
  [columns]="getTableColumns()"
  [actions]="getTableActions()"
  [tabs]="getTableTabs()"
  [dataSource]="getDataSource()"
  [hasRowAction]="false"
  [showHeader]="false"
  [showFooter]="false">
</app-table>
```
**Expected Result:** Clean table without headers or footer for dashboard embedding

## Technical Implementation

### Before (Broken)
```html
<hlm-th *brnHeaderDef *ngIf="showHeader">{{ 'column.name' | transloco }}</hlm-th>
```
❌ **Error:** Cannot use two structural directives on same element

### After (Fixed)
```html
<ng-container *brnHeaderDef>
  <hlm-th *ngIf="showHeader">{{ 'column.name' | transloco }}</hlm-th>
</ng-container>
```
✅ **Correct:** Proper separation of structural directives

## Files Modified
- `src/app/components/app-table/app-table.component.html`

## Verification
1. ✅ Code compiles without errors
2. ✅ All table headers now respect `showHeader` parameter
3. ✅ Existing functionality preserved
4. ✅ Dashboard cards now display clean tables without headers

## Usage in Project
This fix affects the following components:
- `app-dashboard-card` (already uses `showHeader="false"`)
- `actions.component`
- `alerts.component` 
- `request_decisions.component`
- `clusters.component`
