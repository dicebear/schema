// Compares every schema embedded in DiceBear.Schema against its source file in
// src/, and fails the build when one drifts or no longer resolves.

using System.Reflection;

using DiceBear;

// CheckParity.csproj bakes the repository root in at build time, so the tool
// depends neither on the working directory nor on how deep the build output
// happens to sit.
var root = Assembly.GetExecutingAssembly()
    .GetCustomAttributes<AssemblyMetadataAttribute>()
    .FirstOrDefault(a => a.Key == "RepositoryRoot")?.Value;

if (root is null)
{
    Console.Error.WriteLine(
        "RepositoryRoot assembly metadata is missing (see CheckParity.csproj)");
    return 1;
}

var sourceDir = Path.Combine(root, "src");

if (!Directory.Exists(sourceDir))
{
    Console.Error.WriteLine($"Source directory not found: {sourceDir}");
    return 1;
}

var failed = false;

foreach (var name in Schema.All())
{
    var embedded = Schema.Get(name);

    if (embedded is null)
    {
        Console.Error.WriteLine($"{name}: All() lists it, but Get() returns null");
        failed = true;
        continue;
    }

    var sourceFile = Path.Combine(sourceDir, $"{name}.json");

    if (!File.Exists(sourceFile))
    {
        Console.Error.WriteLine($"{name}: src/{name}.json is missing");
        failed = true;
        continue;
    }

    var source = File.ReadAllText(sourceFile);

    if (embedded != source)
    {
        Console.Error.WriteLine($"{name}: the embedded copy differs from src/{name}.json");
        failed = true;
        continue;
    }

    Console.WriteLine($"{name}: {embedded.Length} chars, identical to src/{name}.json");
}

// The other direction: the csproj lists its resources explicitly, while
// scripts/build.sh globs src/*.json for the npm and Dart builds. A schema added
// without touching the csproj and the shim would ship there but not here.
var known = new HashSet<string>(Schema.All());

foreach (var file in Directory.GetFiles(sourceDir, "*.json"))
{
    var name = Path.GetFileNameWithoutExtension(file);

    if (!known.Contains(name))
    {
        Console.Error.WriteLine(
            $"{name}: src/{name}.json is not in All() — add it to " +
            "DiceBear.Schema.csproj and schema.cs");
        failed = true;
    }
}

// An unknown name must not resolve to a schema, or `Get` would silently hand
// callers the wrong bytes.
if (Schema.Get("does-not-exist") is not null)
{
    Console.Error.WriteLine("Get() returned a schema for an unknown name");
    failed = true;
}

return failed ? 1 : 0;
