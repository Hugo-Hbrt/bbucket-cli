import { Args, Command } from "@oclif/core";

const TOP_COMMANDS = "auth branch browse env option pipeline pr completion";

const BASH_SCRIPT = `_bb_completion() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  if [[ $COMP_CWORD -eq 1 ]]; then
    COMPREPLY=($(compgen -W "${TOP_COMMANDS}" -- "\${cur}"))
  fi
}
complete -F _bb_completion bb
`;

const ZSH_SCRIPT = `#compdef bb
_bb() {
  local -a commands
  commands=(${TOP_COMMANDS.split(" ")
    .map((c) => `"${c}"`)
    .join(" ")})
  _describe 'commands' commands
}
_bb "$@"
`;

const FISH_SCRIPT = `complete -c bb -n "__fish_use_subcommand" -a "${TOP_COMMANDS}"
`;

export default class Completion extends Command {
  static override description = "Print a shell completion script";

  static override examples = [
    "<%= config.bin %> completion bash >> ~/.bashrc",
    "<%= config.bin %> completion zsh >> ~/.zshrc",
    "<%= config.bin %> completion fish > ~/.config/fish/completions/bb.fish",
  ];

  static override args = {
    shell: Args.string({
      description: "shell to generate completion for",
      required: true,
      options: ["bash", "zsh", "fish"],
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Completion);
    const script =
      args.shell === "bash" ? BASH_SCRIPT : args.shell === "zsh" ? ZSH_SCRIPT : FISH_SCRIPT;
    process.stdout.write(script);
  }
}
