import AuthSave from "./save.js";

export default class Auth extends AuthSave {
  static override description =
    "Manage Bitbucket authentication. Running `bb auth` is an alias for `bb auth save`.";

  static override examples = [
    "<%= config.bin %> auth",
    "<%= config.bin %> auth save",
    "<%= config.bin %> auth show",
  ];
}
