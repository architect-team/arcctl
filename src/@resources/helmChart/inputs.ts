export type HelmChartInputs = {
  /**
   * Name of the helm release
   */
  name: string;

  /**
   * The namespace to install the release in
   * @default default
   */
  namespace?: string;

  /**
   * The URL of the repository where the chart lives
   */
  repository: string;

  /**
   * Chart to be installed
   */
  chart: string;

  /**
   * The exact chart version to install. Otherwise will use the latest.
   */
  version?: string;

  /**
   * Values to pass to the helm chart release
   */
  values?: Record<string, any>;
};

export default HelmChartInputs;
