#!/bin/bash
# Deletes INJI UITESTRIG deployment
# Usage: ./delete.sh [kubeconfig]

# If kubeconfig is provided, export it
if [ $# -ge 1 ] ; then
  export KUBECONFIG=$1
fi

NS="injiuitestrig"
RELEASE_NAME="injiuitestrig"

echo "Deleting INJI UITESTRIG from namespace: $NS"

# Check if namespace exists
kubectl get ns $NS >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Namespace $NS does not exist. Nothing to delete."
  exit 0
fi

# Uninstall Helm release
echo "Uninstalling helm release $RELEASE_NAME..."
helm uninstall $RELEASE_NAME -n $NS

# Verify uninstall
if [ $? -ne 0 ]; then
  echo "Helm uninstall failed or release not found."
else
  echo "Helm release removed successfully."
fi

# Delete namespace
echo "Deleting namespace $NS..."
kubectl delete ns $NS --ignore-not-found=true

echo "Cleanup completed."
