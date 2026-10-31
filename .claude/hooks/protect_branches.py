#!/usr/bin/env python3
"""PreToolUse guard: nothing is committed or pushed straight to gh-pages or main.

gh-pages is published to www.tikitala.com as soon as it changes, and main holds the engine.
Both change only through pull requests the owner opens and reviews. Work goes on a branch
off gh-pages (site-feature/<name>), and that branch is what gets pushed.

Blocked (exit 2, the reason goes back to Claude):
  - Bash: git commit / merge / cherry-pick / revert / am while the branch in use is protected
  - Bash: git push whose destination is a protected branch, or a bare push from one, or --all / --mirror
  - GitHub MCP: file writes or deletes on a protected branch, and merging pull requests
"""
import json
import os
import re
import shlex
import subprocess
import sys

PROTECTED = {"gh-pages", "main"}
COMMITTING = {"commit", "merge", "cherry-pick", "revert", "am"}
# git options that take a separate value, before the subcommand
GIT_VALUE_OPTS = {"-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path"}
PUSH_VALUE_OPTS = {"-o", "--push-option", "--repo", "--receive-pack", "--exec"}
HOW = ("Commit on a branch off gh-pages (for example site-feature/<name>), push that branch, "
       "and leave the pull request and merge to the owner.")


def block(reason):
    print(f"Blocked by .claude/hooks/protect_branches.py: {reason} {HOW}", file=sys.stderr)
    sys.exit(2)


def branch_name(ref):
    ref = ref.lstrip("+")
    return ref[len("refs/heads/"):] if ref.startswith("refs/heads/") else ref


def current_branch(cwd):
    try:
        out = subprocess.run(["git", "-C", cwd, "symbolic-ref", "--short", "-q", "HEAD"],
                             capture_output=True, text=True, timeout=5)
        return out.stdout.strip()
    except Exception:
        return ""


def split_words(segment):
    try:
        return shlex.split(segment, comments=True)
    except ValueError:
        return segment.split()


def check_bash(command, cwd):
    if "git" not in command:
        return
    branch = current_branch(cwd)
    # walk the command in order, so a checkout earlier in a chain counts for what follows
    for segment in re.split(r"&&|\|\||[;|\n]", command):
        words = split_words(segment)
        while words and re.match(r"^\w+=", words[0]):    # FOO=bar git ...
            words = words[1:]
        if not words:
            continue
        if words[0] == "cd" and len(words) > 1:
            cwd = os.path.join(cwd, os.path.expanduser(words[1]))
            branch = current_branch(cwd)
            continue
        if os.path.basename(words[0]) != "git":
            continue

        # skip git's own options to find the subcommand
        i, git_cwd = 1, cwd
        while i < len(words) and words[i].startswith("-"):
            opt = words[i]
            if opt in GIT_VALUE_OPTS and i + 1 < len(words):
                if opt == "-C":
                    git_cwd = os.path.join(cwd, words[i + 1])
                i += 2
            else:
                i += 1
        if i >= len(words):
            continue
        sub, args = words[i], words[i + 1:]
        here = branch if git_cwd == cwd else current_branch(git_cwd)

        if sub in ("checkout", "switch"):
            names = [a for a in args if not a.startswith("-")]
            new = next((args[k + 1] for k, a in enumerate(args)
                        if a in ("-b", "-B", "-c", "-C", "--orphan") and k + 1 < len(args)), None)
            if new:
                branch = new
            elif "--" not in args and names:
                branch = names[0]
            continue

        if sub in COMMITTING and here in PROTECTED:
            block(f"'git {sub}' would add a commit to '{here}'.")

        if sub == "push":
            if any(a in ("--all", "--mirror") for a in args):
                block("'git push --all/--mirror' would push the protected branches too.")
            positional, k = [], 0
            while k < len(args):
                a = args[k]
                if a in PUSH_VALUE_OPTS:
                    k += 2
                    continue
                if not a.startswith("-"):
                    positional.append(a)
                k += 1
            refspecs = positional[1:]
            if not refspecs and here in PROTECTED:
                block(f"a bare 'git push' from '{here}' would update '{here}' on the remote.")
            for spec in refspecs:
                src, _, dst = spec.partition(":")
                target = branch_name(dst if dst else src)
                if target == "HEAD":
                    target = here
                if target in PROTECTED:
                    block(f"'git push ... {spec}' would update '{target}' on the remote.")


def check_github(tool, tool_input):
    name = tool.split("__")[-1]
    if name in ("merge_pull_request", "enable_pr_auto_merge"):
        block("merging pull requests is left to the owner.")
    if branch_name(str(tool_input.get("branch", ""))) in PROTECTED:
        block(f"'{name}' would write to '{tool_input.get('branch')}' directly.")


def main():
    try:
        event = json.load(sys.stdin)
    except Exception:
        return
    tool = event.get("tool_name", "")
    tool_input = event.get("tool_input") or {}
    if tool == "Bash":
        check_bash(str(tool_input.get("command", "")), event.get("cwd") or os.getcwd())
    elif tool.startswith("mcp__") and "github" in tool:
        check_github(tool, tool_input)


if __name__ == "__main__":
    main()
