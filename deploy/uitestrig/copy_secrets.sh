COPY_UTIL=./copy_cm_func.sh
DST_NS=injiuitestrig
$COPY_UTIL secret keycloak-client-secrets keycloak $DST_NS
$COPY_UTIL secret s3 s3 $DST_NS
$COPY_UTIL secret postgres-postgresql postgres $DST_NS
