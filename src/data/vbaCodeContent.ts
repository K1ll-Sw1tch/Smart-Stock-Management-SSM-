export interface VBAMacro {
  id: string;
  name: string;
  title: string;
  description: string;
  location: string;
  code: string;
}

export const VBA_MACROS: VBAMacro[] = [
  {
    id: 'macro1',
    name: 'ValidateStockIssue',
    title: 'MACRO 1 — ValidateStockIssue',
    description: 'Loops through all rows in Stock Issued sheet, compares Qty Issued (Col H) against available stock from Master List (Col O), and alerts if any exceeds stock.',
    location: 'Module1 (Standard Module)',
    code: `Attribute VB_Name = "Module1"
Option Explicit

' ====================================================================
' MACRO 1: ValidateStockIssue
' Purpose: Validates that Qty Issued does not exceed available stock.
' Assign to: Button on 'Stock Issued' sheet
' ====================================================================
Public Sub ValidateStockIssue()
    Dim wsIssued As Worksheet
    Dim wsMaster As Worksheet
    Dim lastRow As Long
    Dim r As Long
    Dim sku As String
    Dim qtyIssued As Double
    Dim availStock As Double
    Dim prodName As String
    Dim invalidCount As Long
    Dim msg As String
    
    Set wsIssued = ThisWorkbook.Sheets("Stock Issued")
    Set wsMaster = ThisWorkbook.Sheets("Master List")
    
    lastRow = wsIssued.Cells(wsIssued.Rows.Count, "D").End(xlUp).Row
    If lastRow < 2 Then
        MsgBox "No issued records found to validate.", vbInformation, "Validation Complete"
        Exit Sub
    End If
    
    invalidCount = 0
    msg = "STOCK ISSUE VALIDATION REPORT:" & vbCrLf & vbCrLf
    
    For r = 2 To lastRow
        sku = Trim(wsIssued.Cells(r, "D").Value)
        If sku <> "" Then
            qtyIssued = Val(wsIssued.Cells(r, "H").Value)
            ' Lookup available stock from Master List (Col O)
            availStock = Application.WorksheetFunction.IfError( _
                Application.VLookup(sku, wsMaster.Range("A:O"), 15, False), -1)
            prodName = wsIssued.Cells(r, "E").Value
            
            If availStock < 0 Then
                invalidCount = invalidCount + 1
                msg = msg & "• Row " & r & " [" & sku & " - " & prodName & "]: SKU not found in Master List!" & vbCrLf
                wsIssued.Cells(r, "O").Value = "EXCEEDS STOCK"
            ElseIf qtyIssued > availStock Then
                invalidCount = invalidCount + 1
                msg = msg & "• Row " & r & " [" & sku & "]: Issued " & qtyIssued & " exceeds Available " & availStock & vbCrLf
                wsIssued.Cells(r, "O").Value = "EXCEEDS STOCK"
            Else
                wsIssued.Cells(r, "O").Value = "OK"
            End If
        End If
    Next r
    
    If invalidCount = 0 Then
        MsgBox "All stock issue quantities are valid! No stock deficits detected.", vbInformation, "Validation Succeeded"
    Else
        MsgBox msg & vbCrLf & "Total errors: " & invalidCount, vbExclamation, "Stock Issue Errors Detected"
    End If
End Sub`,
  },
  {
    id: 'macro2',
    name: 'CreateBackup',
    title: 'MACRO 2 — CreateBackup',
    description: 'Saves a timestamped copy of the workbook to a "Backups" subfolder, creating the directory if missing.',
    location: 'Module1 (Standard Module)',
    code: `' ====================================================================
' MACRO 2: CreateBackup
' Purpose: Saves a timestamped backup of the workbook to a subfolder
' ====================================================================
Public Sub CreateBackup()
    Dim fso As Object
    Dim backupFolder As String
    Dim timeStamp As String
    Dim backupPath As String
    Dim baseName As String
    
    Set fso = CreateObject("Scripting.FileSystemObject")
    backupFolder = ThisWorkbook.Path & Application.PathSeparator & "Backups"
    
    ' Create Backups directory if it does not exist
    If Not fso.FolderExists(backupFolder) Then
        fso.CreateFolder backupFolder
    End If
    
    timeStamp = Format(Now, "YYYYMMDD_hhmmss")
    baseName = fso.GetBaseName(ThisWorkbook.Name)
    backupPath = backupFolder & Application.PathSeparator & baseName & "_Backup_" & timeStamp & ".xlsm"
    
    Application.DisplayAlerts = False
    ThisWorkbook.SaveCopyAs backupPath
    Application.DisplayAlerts = True
    
    MsgBox "Backup successfully saved to:" & vbCrLf & backupPath, vbInformation, "Backup Complete"
End Sub`,
  },
  {
    id: 'macro3',
    name: 'LockOldTransactions',
    title: 'MACRO 3 — LockOldTransactions',
    description: 'Locks and greys out rows in Stock Received and Stock Issued older than 7 days with password "admin123".',
    location: 'Module1 (Standard Module)',
    code: `' ====================================================================
' MACRO 3: LockOldTransactions
' Purpose: Locks rows older than 7 days using sheet protection ("admin123")
' ====================================================================
Public Sub LockOldTransactions()
    Const PWD As String = "admin123"
    Dim wsList(1 To 2) As String
    Dim ws As Worksheet
    Dim i As Long, r As Long, lastRow As Long
    Dim txDate As Date
    Dim cutoffDate As Date
    Dim lockedCount As Long
    
    wsList(1) = "Stock Received"
    wsList(2) = "Stock Issued"
    cutoffDate = Date - 7
    lockedCount = 0
    
    For i = 1 To 2
        Set ws = ThisWorkbook.Sheets(wsList(i))
        ws.Unprotect Password:=PWD
        lastRow = ws.Cells(ws.Rows.Count, "B").End(xlUp).Row
        
        For r = 2 To lastRow
            If IsDate(ws.Cells(r, "B").Value) Then
                txDate = CDate(ws.Cells(r, "B").Value)
                If txDate < cutoffDate Then
                    ws.Rows(r).Locked = True
                    ws.Rows(r).Interior.Color = RGB(240, 240, 240) ' Soft grey
                    lockedCount = lockedCount + 1
                End If
            End If
        Next r
        
        ws.Protect Password:=PWD, UserInterfaceOnly:=True, _
                   AllowSorting:=True, AllowFiltering:=True, AllowSelectingUnlockedCells:=True
    Next i
    
    MsgBox "Completed! Locked " & lockedCount & " rows older than 7 days (prior to " & Format(cutoffDate, "dd-mmm-yyyy") & ").", vbInformation, "Protection Enabled"
End Sub`,
  },
  {
    id: 'macro4',
    name: 'PrintIssueVoucher',
    title: 'MACRO 4 — PrintIssueVoucher',
    description: 'Takes currently selected row on Stock Issued sheet, formats a printable voucher with signatures.',
    location: 'Module1 (Standard Module)',
    code: `' ====================================================================
' MACRO 4: PrintIssueVoucher
' Purpose: Generates a formatted Store Issue Voucher for selected row
' ====================================================================
Public Sub PrintIssueVoucher()
    Dim wsIssued As Worksheet
    Dim wsPrint As Worksheet
    Dim selRow As Long
    
    Set wsIssued = ThisWorkbook.Sheets("Stock Issued")
    selRow = ActiveCell.Row
    
    If ActiveSheet.Name <> "Stock Issued" Or selRow < 2 Then
        MsgBox "Please select a transaction row on the 'Stock Issued' sheet first.", vbExclamation, "Selection Required"
        Exit Sub
    End If
    
    ' Check or create Print Voucher sheet
    On Error Resume Next
    Set wsPrint = ThisWorkbook.Sheets("Print Voucher")
    On Error GoTo 0
    If wsPrint Is Nothing Then
        Set wsPrint = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
        wsPrint.Name = "Print Voucher"
    End If
    
    wsPrint.Cells.Clear
    wsPrint.PageSetup.Orientation = xlPortrait
    
    ' Title Header
    wsPrint.Range("A1:F1").Merge
    wsPrint.Range("A1").Value = "OFFICIAL STORE ISSUE VOUCHER / MATERIAL REQUISITION"
    wsPrint.Range("A1").Font.Bold = True
    wsPrint.Range("A1").Font.Size = 14
    wsPrint.Range("A1").HorizontalAlignment = xlCenter
    
    ' Populate metadata
    wsPrint.Range("A3").Value = "Issue Number:"
    wsPrint.Range("B3").Value = wsIssued.Cells(selRow, "A").Value
    wsPrint.Range("D3").Value = "Date Issued:"
    wsPrint.Range("E3").Value = Format(wsIssued.Cells(selRow, "B").Value, "dd-mmm-yyyy")
    
    wsPrint.Range("A4").Value = "Department:"
    wsPrint.Range("B4").Value = wsIssued.Cells(selRow, "C").Value
    wsPrint.Range("D4").Value = "Batch Allocated:"
    wsPrint.Range("E4").Value = wsIssued.Cells(selRow, "Q").Value
    
    ' Item table headers
    wsPrint.Range("A6").Value = "SKU"
    wsPrint.Range("B6").Value = "Product Description"
    wsPrint.Range("C6").Value = "Issue Unit"
    wsPrint.Range("D6").Value = "Qty Issued"
    wsPrint.Range("E6").Value = "Unit Cost"
    wsPrint.Range("F6").Value = "Total Cost"
    wsPrint.Range("A6:F6").Font.Bold = True
    wsPrint.Range("A6:F6").Interior.Color = RGB(220, 230, 242)
    
    ' Item line
    wsPrint.Range("A7").Value = wsIssued.Cells(selRow, "D").Value
    wsPrint.Range("B7").Value = wsIssued.Cells(selRow, "E").Value
    wsPrint.Range("C7").Value = wsIssued.Cells(selRow, "F").Value
    wsPrint.Range("D7").Value = wsIssued.Cells(selRow, "H").Value
    wsPrint.Range("E7").Value = wsIssued.Cells(selRow, "K").Value
    wsPrint.Range("F7").Value = wsIssued.Cells(selRow, "L").Value
    wsPrint.Range("E7:F7").NumberFormat = "$#,##0.00"
    
    ' Remarks
    wsPrint.Range("A9").Value = "Purpose / Remarks:"
    wsPrint.Range("B9:F9").Merge
    wsPrint.Range("B9").Value = wsIssued.Cells(selRow, "P").Value
    
    ' Signature section
    wsPrint.Range("A12").Value = "Issued By (Storekeeper):"
    wsPrint.Range("B12").Value = wsIssued.Cells(selRow, "M").Value
    wsPrint.Range("D12").Value = "Signature: __________________"
    
    wsPrint.Range("A14").Value = "Authorized By (Supervisor):"
    wsPrint.Range("B14").Value = wsIssued.Cells(selRow, "N").Value
    wsPrint.Range("D14").Value = "Signature: __________________"
    
    wsPrint.Columns("A:F").AutoFit
    wsPrint.Activate
    MsgBox "Issue Voucher generated and ready to print for: " & wsIssued.Cells(selRow, "A").Value, vbInformation, "Print Ready"
End Sub`,
  },
  {
    id: 'macro5',
    name: 'Workbook_Open',
    title: 'MACRO 5 — Workbook_Open Expiry Alert',
    description: 'Runs automatically when file opens. Scans Master List Col U for expired and critical items and pops up alert.',
    location: 'ThisWorkbook (Event Procedure)',
    code: `' ====================================================================
' MACRO 5: Workbook_Open Expiry Alert
' Location: Place in 'ThisWorkbook' object (NOT in standard Module)
' ====================================================================
Private Sub Workbook_Open()
    Dim wsMaster As Worksheet
    Dim lastRow As Long
    Dim r As Long
    Dim status As String
    Dim expiredCount As Long
    Dim critCount As Long
    Dim warnCount As Long
    Dim msg As String
    Dim sku As String, prodName As String
    
    Set wsMaster = ThisWorkbook.Sheets("Master List")
    lastRow = wsMaster.Cells(wsMaster.Rows.Count, "A").End(xlUp).Row
    If lastRow < 2 Then Exit Sub
    
    expiredCount = 0
    critCount = 0
    warnCount = 0
    msg = "⚠️ ATTENTION: INVENTORY EXPIRY ALERTS DETECTED!" & vbCrLf & vbCrLf
    
    For r = 2 To lastRow
        status = UCase(Trim(wsMaster.Cells(r, "U").Value))
        sku = wsMaster.Cells(r, "A").Value
        prodName = wsMaster.Cells(r, "B").Value
        
        If InStr(status, "EXPIRED") > 0 Then
            expiredCount = expiredCount + 1
            msg = msg & "[EXPIRED] " & sku & " - " & prodName & " (Qty: " & wsMaster.Cells(r, "W").Value & ")" & vbCrLf
        ElseIf InStr(status, "<30") > 0 Then
            critCount = critCount + 1
            msg = msg & "[<30 DAYS] " & sku & " - " & prodName & " (Qty: " & wsMaster.Cells(r, "V").Value & ")" & vbCrLf
        ElseIf InStr(status, "<90") > 0 Then
            warnCount = warnCount + 1
        End If
    Next r
    
    If expiredCount > 0 Or critCount > 0 Or warnCount > 0 Then
        msg = msg & vbCrLf & "Summary: " & expiredCount & " expired, " & critCount & " critical (<30d), " & warnCount & " warning (<90d)." & vbCrLf & _
              "Enforce FEFO issuing immediately to mitigate stock write-offs."
        MsgBox msg, vbCritical, "SmartStock FEFO Alert"
    End If
End Sub`,
  },
  {
    id: 'macro6',
    name: 'AutoAssignFEFOBatch',
    title: 'MACRO 6 — AutoAssignFEFOBatch',
    description: 'Finds the batch in Batch Tracker with earliest expiry date that has stock > 0 for selected SKU and auto-fills Col Q.',
    location: 'Module1 (Standard Module)',
    code: `' ====================================================================
' MACRO 6: AutoAssignFEFOBatch
' Purpose: 1-Click FEFO Allocation for selected Stock Issued row
' ====================================================================
Public Sub AutoAssignFEFOBatch()
    Dim wsIssued As Worksheet
    Dim wsBatches As Worksheet
    Dim selRow As Long
    Dim sku As String
    Dim lastBatchRow As Long
    Dim bRow As Long
    Dim bestBatch As String
    Dim earliestExp As Date
    Dim batchExp As Date
    Dim remQty As Double
    Dim found As Boolean
    
    Set wsIssued = ThisWorkbook.Sheets("Stock Issued")
    Set wsBatches = ThisWorkbook.Sheets("Batch Tracker")
    selRow = ActiveCell.Row
    
    If ActiveSheet.Name <> "Stock Issued" Or selRow < 2 Then
        MsgBox "Please select a row on the 'Stock Issued' sheet.", vbExclamation, "Row Selection Required"
        Exit Sub
    End If
    
    sku = Trim(wsIssued.Cells(selRow, "D").Value)
    If sku = "" Then
        MsgBox "Please enter an SKU on this row first.", vbExclamation, "SKU Missing"
        Exit Sub
    End If
    
    lastBatchRow = wsBatches.Cells(wsBatches.Rows.Count, "A").End(xlUp).Row
    bestBatch = ""
    earliestExp = DateSerial(2099, 12, 31)
    found = False
    
    For bRow = 2 To lastBatchRow
        If Trim(wsBatches.Cells(bRow, "B").Value) = sku Then
            remQty = Val(wsBatches.Cells(bRow, "I").Value)
            If remQty > 0 Then
                If IsDate(wsBatches.Cells(bRow, "F").Value) Then
                    batchExp = CDate(wsBatches.Cells(bRow, "F").Value)
                    If batchExp < earliestExp Then
                        earliestExp = batchExp
                        bestBatch = wsBatches.Cells(bRow, "A").Value
                        found = True
                    End If
                ElseIf Not found Then
                    ' Non-expiring batch fallback
                    bestBatch = wsBatches.Cells(bRow, "A").Value
                End If
            End If
        End If
    Next bRow
    
    If bestBatch <> "" Then
        wsIssued.Cells(selRow, "Q").Value = bestBatch
        If found Then
            MsgBox "Assigned FEFO Batch: " & bestBatch & vbCrLf & _
                   "Expiry Date: " & Format(earliestExp, "dd-mmm-yyyy"), vbInformation, "FEFO Batch Allocated"
        Else
            MsgBox "Assigned Stock Batch: " & bestBatch & " (No expiry registered).", vbInformation, "Batch Allocated"
        End If
    Else
        wsIssued.Cells(selRow, "Q").Value = "N/A"
        MsgBox "No available stock batches found for SKU: " & sku, vbExclamation, "No Stock Available"
    End If
End Sub`,
  },
  {
    id: 'macro7',
    name: 'GenerateExpiryReport',
    title: 'MACRO 7 — GenerateExpiryReport',
    description: 'Creates or updates "Expiry Report" sheet with all batches expiring in 90 days or expired, color-coded by urgency.',
    location: 'Module1 (Standard Module)',
    code: `' ====================================================================
' MACRO 7: GenerateExpiryReport
' Purpose: Auto-generates comprehensive Expiry Audit Report tab
' ====================================================================
Public Sub GenerateExpiryReport()
    Dim wsBatches As Worksheet
    Dim wsRep As Worksheet
    Dim lastRow As Long, bRow As Long, outRow As Long
    Dim daysLeft As Variant
    Dim remQty As Double
    Dim status As String
    
    Set wsBatches = ThisWorkbook.Sheets("Batch Tracker")
    lastRow = wsBatches.Cells(wsBatches.Rows.Count, "A").End(xlUp).Row
    
    On Error Resume Next
    Set wsRep = ThisWorkbook.Sheets("Expiry Report")
    On Error GoTo 0
    If wsRep Is Nothing Then
        Set wsRep = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
        wsRep.Name = "Expiry Report"
    Else
        wsRep.Cells.Clear
    End If
    
    ' Headers
    wsRep.Range("A1").Value = "EXPIRY RISK AUDIT REPORT (FEFO PRIORITY)"
    wsRep.Range("A1:G1").Merge
    wsRep.Range("A1").Font.Bold = True
    wsRep.Range("A1").Font.Size = 14
    wsRep.Range("A1").Interior.Color = RGB(54, 96, 146)
    wsRep.Range("A1").Font.Color = RGB(255, 255, 255)
    
    wsRep.Range("A3:G3").Value = Array("SKU", "Product Name", "Batch Number", "Expiry Date", "Days Left", "Qty Remaining", "Status")
    wsRep.Range("A3:G3").Font.Bold = True
    wsRep.Range("A3:G3").Interior.Color = RGB(217, 225, 242)
    
    outRow = 4
    For bRow = 2 To lastRow
        remQty = Val(wsBatches.Cells(bRow, "I").Value)
        daysLeft = wsBatches.Cells(bRow, "J").Value
        
        If remQty > 0 And IsNumeric(daysLeft) Then
            If daysLeft <= 90 Then
                wsRep.Cells(outRow, 1).Value = wsBatches.Cells(bRow, "B").Value
                wsRep.Cells(outRow, 2).Value = wsBatches.Cells(bRow, "C").Value
                wsRep.Cells(outRow, 3).Value = wsBatches.Cells(bRow, "A").Value
                wsRep.Cells(outRow, 4).Value = Format(wsBatches.Cells(bRow, "F").Value, "dd-mmm-yyyy")
                wsRep.Cells(outRow, 5).Value = daysLeft
                wsRep.Cells(outRow, 6).Value = remQty
                
                If daysLeft < 0 Then
                    status = "EXPIRED"
                    wsRep.Cells(outRow, 7).Value = status
                    wsRep.Range(wsRep.Cells(outRow, 1), wsRep.Cells(outRow, 7)).Interior.Color = RGB(255, 199, 206)
                ElseIf daysLeft <= 30 Then
                    status = "CRITICAL (<30d)"
                    wsRep.Cells(outRow, 7).Value = status
                    wsRep.Range(wsRep.Cells(outRow, 1), wsRep.Cells(outRow, 7)).Interior.Color = RGB(255, 235, 156)
                Else
                    status = "WARNING (<90d)"
                    wsRep.Cells(outRow, 7).Value = status
                    wsRep.Range(wsRep.Cells(outRow, 1), wsRep.Cells(outRow, 7)).Interior.Color = RGB(255, 242, 204)
                End If
                outRow = outRow + 1
            End If
        End If
    Next bRow
    
    wsRep.Columns("A:G").AutoFit
    wsRep.Activate
    MsgBox "Expiry Report generated with " & (outRow - 4) & " urgent batches identified.", vbInformation, "Audit Generated"
End Sub`,
  },
];
