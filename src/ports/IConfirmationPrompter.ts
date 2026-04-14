export interface IConfirmationPrompter {
  confirm(message: string, defaultValue: boolean): Promise<boolean>;
}
