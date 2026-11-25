# INJI-WALLET-UITESTRIG

Helm chart to deploy UITESTRIG for `Inji Wallet`. It runs the Inji Wallet mobile UI automation suite (`injitest/`) on BrowserStack as Kubernetes CronJobs, one per enabled module:

- **android** – complete Android UI functional flow
- **ios** – complete iOS UI functional flow

## TL;DR

```console
$ helm repo add inji https://inji.github.io/helm
$ helm install inji-wallet-uitestrig inji/inji-wallet-uitestrig
```

For the full install flow (config maps, secrets, BrowserStack credentials) use the [deploy scripts](../../deploy/uitestrig).

## Key values

| Key | Description | Default |
|-----|-------------|---------|
| `modules[].enabled` | Create the CronJob for this module | `true` |
| `modules[].image` | Test image (`registry`, `repository`, `tag`, `pullPolicy`) | `docker.io/injistack/uitest-inji-wallet:develop` |
| `modules[].crontime` | Optional per-module schedule, overrides `crontime` | unset |
| `modules[].extraEnvVarsCM` / `extraEnvVarsSecret` | Module-specific ConfigMaps / Secrets loaded as env | `android` / `ios` |
| `crontime` | Global cron schedule | `0 3 * * *` |
| `containerUser` | User the test image runs as; scripts run from `/home/<containerUser>/` | `inji` |
| `enable_insecure` | Import the api-internal host certificate (no public domain / valid SSL) | `false` |
| `cacertsPath` | JDK truststore path in the test image, used with `enable_insecure` | `/etc/ssl/certs/java/cacerts` |
| `extraEnvVarsCM` / `extraEnvVarsSecret` | ConfigMaps / Secrets loaded as env by every module | see `values.yaml` |
| `uitestrig.configmaps.*` | ConfigMaps created by the chart (`uitestrig`, `android`, `ios`, `s3`, `db`, `scripts`) | see `values.yaml` |
| `uitestrig.secrets.*` | Secrets created by the chart (values are base64-encoded by the chart) | empty |

`NS` (used by the image-hash script) is set automatically to the release namespace.
