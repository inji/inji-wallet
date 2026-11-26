# INJI-WALLET UITESTRIG

## Introduction
INJI-WALLET UITESTRIG is a UI automation test rig designed to validate end-to-end functional flows across INJI-WALLET applications.
It includes two cronjobs that automatically run UI test flows:

- **Android** – Executes the complete Android UI functional flow.
- **iOS** – Executes the complete iOS UI functional flow.

These cronjobs help ensure stability, correctness, and consistency across both mobile platforms before releases or environment changes.

It is deployed using the [inji-wallet-uitestrig](../../helm/inji-wallet-uitestrig) helm chart maintained in this repository (published as `inji/inji-wallet-uitestrig`).

## Prerequisites
Before installing INJI-WALLET UITESTRIG, update the environment-specific values in this folder's `values.yaml`
(chart defaults live in [`helm/inji-wallet-uitestrig/values.yaml`](../../helm/inji-wallet-uitestrig/values.yaml)):

1. Create BrowserStack credentials by referring to this [documentation](https://www.browserstack.com/docs/references/service-accounts) and add them under `uitestrig.secrets.uitestrig-browserstack` (`browserstack_username`, `browserstack_accesskey`; rendered as a Kubernetes Secret), along with the Android/iOS app IDs and devices under `uitestrig.configmaps.android` / `ios`.
2. Enable or disable the Android/iOS modules under `modules`.
3. Replace `sandbox.xyz.net` with the required environment domain first, e.g. `api-internal.sandbox.xyz.net` to `api-internal.dev.mosip.net` and `esignet.sandbox.xyz.net` to `esignet.dev.mosip.net`.
4. Then replace the remaining `sandbox` occurrences with the environment name, e.g. `ENV_USER: api-internal.sandbox` to `api-internal.dev`.

   Doing these in the opposite order leaves `ENV_ENDPOINT`, `eSignetbaseurl` and the other URLs pointing at the wrong domain.

## Install
```sh
./install.sh [kubeconfig]
```

## Uninstall
```sh
./delete.sh [kubeconfig]
```

## Run UITESTRIG manually
If you passed a kubeconfig to `install.sh`, point `kubectl` at the same cluster first:
```sh
export KUBECONFIG=<path-to-kubeconfig>
```
Create a new job from an existing cronjob:
```sh
kubectl -n injiuitestrig get cronjobs
kubectl -n injiuitestrig create job --from=cronjob/<cronjob-name> <job-name>
```
Example:
```sh
kubectl -n injiuitestrig create job --from=cronjob/cronjob-injiuitestrig-inji-wallet-uitestrig-android android-manual-run
```
