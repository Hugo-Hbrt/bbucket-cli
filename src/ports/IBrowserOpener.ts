export interface IBrowserOpener {
  open(url: string): Promise<void>;
}
