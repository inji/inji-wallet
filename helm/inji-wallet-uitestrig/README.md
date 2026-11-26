# INJI-WALLET-UITESTRIG

Helm chart to deploy UITESTRIG for `Inji Wallet`. It runs the Inji Wallet mobile UI automation suite (`injitest/`) on BrowserStack as Kubernetes CronJobs, one per enabled module:

- **android** – complete Android UI functional flow
- **ios** – complete iOS UI functional flow

## TL;DR

```console
$ helm repo add inji https://inji.github.io/helm
$ helm install inji-wallet-uitestrig inji/inji-wallet-uitestrig
```

The CronJobs load env from ConfigMaps and Secrets that this chart does **not** create. They must exist in the release namespace before a run, or the pods fail to start:

- ConfigMaps: `global` (from `default`), `keycloak-host` (from `keycloak`)
- Secrets: `keycloak-client-secrets` (from `keycloak`), `s3` (from `s3`), `postgres-postgresql` (from `postgres`)

The [deploy scripts](../../deploy/uitestrig) copy them (`copy_cm.sh`, `copy_secrets.sh`) and run the full install flow, so prefer those over a bare `helm install`. BrowserStack credentials go in `uitestrig.secrets.uitestrig-browserstack`.

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
| `uitestrig.secrets.*` | Secrets created by the chart (values are base64-encoded by the chart) | `uitestrig-browserstack` |
| `activeDeadlineSeconds` | Max duration of a test Job before it is terminated | `21600` |
| `resources` | Test container resource requests / limits | `1000m` CPU, `3500Mi` memory |

`NS` (used by the image-hash script) is set automatically to the release namespace.
