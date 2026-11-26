{{/*
Return the proper image name
*/}}
{{- define "uitestrig.image" -}}
{{ include "common.images.image" (dict "imageRoot" .Values.image "global" .Values.global) }}
{{- end -}}

{{/*
Return the proper image name (for the init container volume-permissions image)
*/}}
{{- define "uitestrig.volumePermissions.image" -}}
{{- include "common.images.image" ( dict "imageRoot" .Values.volumePermissions.image "global" .Values.global ) -}}
{{- end -}}

{{/*
Return the proper Docker Image Registry Secret Names
*/}}
{{- define "uitestrig.imagePullSecrets" -}}
{{- include "common.images.pullSecrets" (dict "images" (list .Values.image .Values.volumePermissions.image) "global" .Values.global) -}}
{{- end -}}

{{/*
Image pull secrets for a module's CronJob Pod: global, chart-level image and the module's own image.
Usage: include "uitestrig.moduleImagePullSecrets" (dict "module" $module "context" $)
*/}}
{{- define "uitestrig.moduleImagePullSecrets" -}}
{{- $ctx := .context -}}
{{- include "common.images.pullSecrets" (dict "images" (list $ctx.Values.image .module.image) "global" $ctx.Values.global) -}}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "uitestrig.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
    {{ default (printf "%s" (include "common.names.fullname" .)) .Values.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
Return podAnnotations
*/}}
{{- define "uitestrig.podAnnotations" -}}
{{- if .Values.podAnnotations }}
{{ include "common.tplvalues.render" (dict "value" .Values.podAnnotations "context" $) }}
{{- end }}
{{- if and .Values.metrics.enabled .Values.metrics.podAnnotations }}
{{ include "common.tplvalues.render" (dict "value" .Values.metrics.podAnnotations "context" $) }}
{{- end }}
{{- end -}}

{{/*
Base name for the per-module cronjobs
*/}}
{{- define "uitestrig.cronjob" -}}
{{- printf "cronjob-%s" (include "common.names.fullname" .) -}}
{{- end -}}

{{/*
Name of a module's CronJob, kept within the 52-character CronJob name limit.
The base is truncated (not the module suffix) so module names stay distinct.
Usage: include "uitestrig.cronjobName" (dict "module" $module "context" $)
*/}}
{{- define "uitestrig.cronjobName" -}}
{{- $suffix := printf "-%s" .module.name -}}
{{- $room := int (sub 52 (len $suffix)) -}}
{{- if lt $room 1 -}}
{{- fail (printf "module name %q is too long: it must leave room for the release name within the 52-character CronJob name limit" .module.name) -}}
{{- end -}}
{{- $base := include "uitestrig.cronjob" .context | trunc $room | trimSuffix "-" -}}
{{- printf "%s%s" $base $suffix -}}
{{- end -}}
