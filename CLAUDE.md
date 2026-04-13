# HHDev Coding Standards

## Core Principles

- Write code that is easy to maintain and build upon — someone else may work on it later
- Follow these standards before marking any work "complete"
- PRs with blatant violations should be rejected; minor issues can be noted in comments
- Follow [Microsoft C# Coding Conventions](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions) as the baseline

---

## Naming Conventions

| Target | Convention | Example |
|---|---|---|
| Public properties | PascalCase | `FirstName` |
| Private class members | _camelCase | `_firstName` |
| Function parameters & locals | camelCase | `firstName` |
| Class names | PascalCase | `UserProfile` |
| Enum names | ePascalCase, plural | `eColours` |
| UI control variables | Prefix + PascalCase | `tb_FirstName`, `cmb_Status` |

**UI control prefixes:** `tb` (TextBox), `cmb` (ComboBox), `lbl` (Label), `dgv` (DataGridView)

**Project/solution naming:** Always prefix with `HHDev.` — e.g. `HHDev.DataManagement.Client.Core`

---

## Code Structure

### No Duplication
Never copy-paste code. If logic appears twice, extract a reusable function. Consider adding generic utilities to `HHDev-Core`.

### Single Responsibility
Functions should do one thing, named to reflect it clearly. No hard line limit — use judgment, but keep functions small.

### Return Early
Reduce nesting by returning or throwing as soon as a condition is met:

```csharp
// ✅ DO
private string GetResult(string key, string defaultValue)
{
    if (key == null) throw new ArgumentException();
    if (dictionary.ContainsKey(key)) return dictionary[key];

    dictionary.Add(key, defaultValue);
    return defaultValue;
}

// ❌ DON'T
private string GetResult(string key, string defaultValue)
{
    string result;
    if (key != null)
    {
        if (dictionary.ContainsKey(key)) { result = dictionary[key]; }
        else { dictionary.Add(key, defaultValue); result = defaultValue; }
    }
    else { throw new ArgumentException(); }
    return result;
}
```

---

## Syntax Rules

### Always Use Curly Braces
```csharp
// ✅ DO
if (condition)
{
    DoSomething();
}

// ❌ DON'T
if (condition)
    DoSomething();
```

### Boolean Checks — Avoid `!`
```csharp
// ✅ DO
if (a == false) { }
if (a != b) { }

// ❌ DON'T
if (!a) { }
if (!(a == b)) { }
```

### No `this.` Keyword
Avoid `this.` to access members — the naming convention makes it unnecessary.

### No Optional Parameters
Use overloads instead:
```csharp
// ✅ DO
void Save(string path) => Save(path, false);
void Save(string path, bool overwrite) { ... }

// ❌ DON'T
void Save(string path, bool overwrite = false) { ... }
```

### Target-Typed `new()` — Limited Use
Only use when the type is explicit at the declaration site:
```csharp
// ✅ OK
public List<double> MyList { get; set; } = new();

// ❌ DON'T — type is unclear to reader
DoSomething(instance1, new("test"));
```

---

## Class Design

### Constructors Should Define Requirements
```csharp
// ✅ DO
class A
{
    private int _a;
    public A(int a) { _a = a; }
}
var a = new A(1);

// ❌ DON'T
class A { public int A { get; set; } }
var a = new A() { A = 1 };
```

### Variable Declarations
Declare class variables/properties at the top of the class (or top of a region if scoped there — though large classes should be broken up).

---

## Project Configuration

### TreatWarningsAsErrors
Enable for all new .NET projects.

### Unused Events (CS0067)
When an interface forces an unused event, use an empty handler:
```csharp
public event EventHandler NeverRaised
{
    add { }
    remove { }
}
```
Or `#pragma warning disable 0067` only when there's a plan to address it later.

### Fody.PropertyChanged
- Use `[AddINotifyPropertyChangedInterface]` when you don't need the `PropertyChanged` event directly.
- Add `[SuppressPropertyChangedWarnings]` to `On...Changed()` methods that trigger Fody warnings.

### VB.NET
`Option Strict` is **not** used in HH Timing VB.NET code — this codebase is being phased out.
