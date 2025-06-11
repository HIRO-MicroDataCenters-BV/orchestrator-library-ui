import { NgIcon } from '@ng-icons/core';

export type TableData = {
  id: string;
  cluster_name: string;
  status: number; // 0-2: 0 - inactive, 1 - running, 2 - success, -1 - warning, -2 - failed
  workloads: number;
  nodes: number;
  cpu_usage: number; // percent
  memory_usage: number; // percent
};

export type TableAction = {
  id: string;
  label: string;
  icon: NgIcon;
};

export type TableActionGroup = {
  id: string;
  label?: string | null;
  actions: TableAction[];
};