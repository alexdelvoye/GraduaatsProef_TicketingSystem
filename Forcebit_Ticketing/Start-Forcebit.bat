@echo off
setlocal

REM Double-click launcher for development and showcase demos. The PowerShell
REM script contains the real startup/cleanup logic so this file stays small.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Start-Forcebit.ps1" %*
