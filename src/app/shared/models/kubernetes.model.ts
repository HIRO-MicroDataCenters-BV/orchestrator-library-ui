/**
 * Kubernetes API models
 * Based on OpenAPI schema from /k8s_* endpoints
 */

/**
 * Kubernetes Pod response
 */
export interface K8sPodResponse {
  pods?: K8sPod[];
  total?: number;
}

/**
 * Kubernetes Pod
 */
export interface K8sPod {
  id?: string;
  name: string;
  namespace: string;
  status: string;
  node_name?: string;
  pod_id?: string;
  created_at?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  containers?: K8sContainer[];
  resources?: K8sResourceRequirements;
}

/**
 * Kubernetes Container
 */
export interface K8sContainer {
  name: string;
  image: string;
  state?: string;
  ready?: boolean;
  restart_count?: number;
  resources?: K8sResourceRequirements;
}

/**
 * Kubernetes Resource Requirements
 */
export interface K8sResourceRequirements {
  requests?: K8sResourceList;
  limits?: K8sResourceList;
}

/**
 * Kubernetes Resource List
 */
export interface K8sResourceList {
  cpu?: string;
  memory?: string;
  [key: string]: string | undefined;
}

/**
 * Kubernetes Node response
 */
export interface K8sNodeResponse {
  nodes?: K8sNode[];
  total?: number;
}

/**
 * Kubernetes Node
 */
export interface K8sNode {
  id?: string;
  name: string;
  status: string;
  node_id?: string;
  roles?: string[];
  version?: string;
  capacity?: K8sResourceList;
  allocatable?: K8sResourceList;
  conditions?: K8sNodeCondition[];
  addresses?: K8sNodeAddress[];
  node_info?: K8sNodeInfo;
  created_at?: string;
}

/**
 * Kubernetes Node Condition
 */
export interface K8sNodeCondition {
  type: string;
  status: string;
  reason?: string;
  message?: string;
  last_transition_time?: string;
}

/**
 * Kubernetes Node Address
 */
export interface K8sNodeAddress {
  type: string;
  address: string;
}

/**
 * Kubernetes Node Info
 */
export interface K8sNodeInfo {
  machine_id?: string;
  system_uuid?: string;
  boot_id?: string;
  kernel_version?: string;
  os_image?: string;
  container_runtime_version?: string;
  kubelet_version?: string;
  kube_proxy_version?: string;
  operating_system?: string;
  architecture?: string;
}

/**
 * Kubernetes Cluster Info response
 */
export interface K8sClusterInfoResponse {
  cluster_name?: string;
  server_version?: string;
  nodes_count?: number;
  namespaces_count?: number;
  pods_count?: number;
  services_count?: number;
  deployments_count?: number;
  advanced_info?: K8sAdvancedClusterInfo;
}

/**
 * Advanced Kubernetes Cluster Info
 */
export interface K8sAdvancedClusterInfo {
  api_versions?: string[];
  resource_types?: string[];
  storage_classes?: K8sStorageClass[];
  persistent_volumes?: K8sPersistentVolume[];
  [key: string]: unknown;
}

/**
 * Kubernetes Storage Class
 */
export interface K8sStorageClass {
  name: string;
  provisioner: string;
  reclaim_policy?: string;
  volume_binding_mode?: string;
}

/**
 * Kubernetes Persistent Volume
 */
export interface K8sPersistentVolume {
  name: string;
  capacity?: K8sResourceList;
  access_modes?: string[];
  status?: string;
  claim?: string;
}

/**
 * Kubernetes Token response
 */
export interface K8sTokenResponse {
  token: string;
  expires_at?: string;
}

/**
 * Kubernetes Pod Parent types
 */
export type K8sPodParentType =
  | 'Deployment'
  | 'StatefulSet'
  | 'ReplicaSet'
  | 'Job'
  | 'DaemonSet'
  | 'CronJob';

/**
 * Kubernetes Pod Parent
 */
export interface K8sPodParent {
  name: string;
  type: K8sPodParentType;
  uid: string;
  namespace: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  replicas?: number;
  ready_replicas?: number;
  available_replicas?: number;
}

/**
 * Query parameters for Kubernetes Pod API
 */
export interface K8sPodQueryParams {
  namespace?: string;
  name?: string;
  pod_id?: string;
  status?: string;
  node_name?: string;
  [key: string]: unknown;
}

/**
 * Query parameters for Kubernetes Node API
 */
export interface K8sNodeQueryParams {
  name?: string;
  node_id?: string;
  status?: string;
  namespace?: string;
  [key: string]: unknown;
}

/**
 * Query parameters for Kubernetes Pod Parent API
 */
export interface K8sPodParentQueryParams {
  namespace: string;
  name?: string;
  pod_id?: string;
  [key: string]: unknown;
}

/**
 * Query parameters for Kubernetes Token API
 */
export interface K8sTokenQueryParams {
  namespace?: string;
  service_account_name?: string;
  [key: string]: unknown;
}

/**
 * Query parameters for Kubernetes Cluster Info API
 */
export interface K8sClusterInfoQueryParams {
  advanced?: boolean;
  [key: string]: unknown;
}
