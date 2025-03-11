declare module "cli-columns" {
  interface CliColumnsOptions {
    width?: number;
    padding?: number;
    sort?: boolean;
    newline?: string;
  }

  function cliColumns(values: string[], options?: CliColumnsOptions): string;
  export = cliColumns;
}
