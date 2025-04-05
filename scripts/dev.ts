import { debounce } from "jsr:@std/async/debounce";
import { basename, relative, resolve, SEPARATOR } from "jsr:@std/path";

function isPathInside(childPath: string, parentDir: string): boolean {
  const resolvedChild = resolve(Deno.realPathSync(childPath));
  const resolvedParent = resolve(Deno.realPathSync(parentDir));

  const rel = relative(resolvedParent, resolvedChild);

  // If the relative path does not start with `..`, it's inside
  return !!rel && !rel.startsWith("..") && !rel.includes(`..${SEPARATOR}`);
}

// Run bash script in background for web build
const runCmd = new Deno.Command(Deno.execPath(), {
  args: ["task", "run"],
  cwd: `${import.meta.dirname}/..`,
});

console.log("🚀 Running application in background...");
let runProc = runCmd.spawn();

function restartRunProc() {
  console.log("🔄 Restarting application in background...");

  // Catch an already dead process being killed again
  try {
    runProc.kill();
  } catch (e) {
    console.error(e);
  }
  runProc = runCmd.spawn();
}

const debouncedRestart = debounce(restartRunProc, 1000);

// Run bash script in background for web build
const webBuildCmd = new Deno.Command(Deno.execPath(), {
  args: ["task", "dev"],
  cwd: `${import.meta.dirname}/../web`,
});

console.log("🚀 Running web build in background...");
const webBuildProc = webBuildCmd.spawn();

// Watch the current folder for changes to trigger rebuild
const watcher = Deno.watchFs(".", { recursive: true });

// Debounce go build to avoid unnecessary rebuilds
const debouncedGoBuild = debounce(async (_?: Deno.FsEvent) => {
  console.log("🛠️ Change detected, running `build:go` task...");
  const goBuildCmd = new Deno.Command(Deno.execPath(), {
    args: ["task", "build:go"],
    cwd: `${import.meta.dirname}`,
  });

  const { code } = await goBuildCmd.output();

  if (code !== 0) {
    console.error("❌ Build failed");
  } else {
    console.log("✅ Build completed");

    restartRunProc();
  }
}, 200);

debouncedGoBuild();

// Register exit handler
Deno.addSignalListener("SIGINT", () => watcher.close());

// Start loop of handling file watcher events
console.log("👀 Watching for Go files changes...");

for await (const event of watcher) {
  if (event.kind === "modify" || event.kind === "create") {
    const goBuildRelevant = event.paths.some((path) => {
      const filename = basename(path);
      return (filename.endsWith(".go") || filename === "go.mod" ||
        filename === "go.sum") &&
        (!isPathInside(path, `${import.meta.dirname}/../web/`));
    });

    const serverRestartRelevant = event.paths.some((path) =>
      isPathInside(path, `${import.meta.dirname}/../web/dist`)
    );

    if (goBuildRelevant) {
      // Call a debounced build to avoid too frequent builds
      debouncedGoBuild(event);
    } else if (serverRestartRelevant) {
      debouncedRestart();
    }
  }
}

// Make sure to kill background web build process and application
console.log("🚪 Exiting...");
webBuildProc.kill("SIGKILL");
runProc.kill("SIGKILL");