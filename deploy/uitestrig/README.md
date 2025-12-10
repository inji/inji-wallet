# INJI-WALLET UITESTRIG

## Introduction
INJI-WALLET UITESTRIG is a UI automation test rig designed to validate end-to-end functional flows across INJI-WALLET applications.  
It includes two cronjobs that automatically run UI test flows:

- **Android** – Executes the complete Android UI functional flow.
- **iOS** – Executes the complete iOS UI functional flow.

These cronjobs help ensure stability, correctness, and consistency across both mobile platforms before releases or environment changes.

## Prerequisites
Before installing INJI-WALLET UITESTRIG, you must update the required configuration in the `values.yaml` file.  
The following fields must be reviewed and updated:

- Enable or disable the Android/iOS test modules.
- Add or modify environment-specific values.
- Verify correct cron schedules for automated execution.

Ensure all values are correctly configured before initiating the installation.

## Install
To install INJI-WALLET UITESTRIG, run:
```
   ./install.sh
```

## Uninstall
To Uninstall INJI-WALLET UITESTRIG, run:

```
  ./delete.sh
```
