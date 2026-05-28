---
name: unit-test
description: Describe what this skill does and when to use it. Include keywords that help agents identify relevant tasks.
---

# Unit Testing Strategy

---
name: Unit Testing Strategy
description: Write confident, maintainable unit tests that prioritize behavior validation and clean code over coverage metrics
type: skill
trigger:
  - "write tests for"
  - "add test coverage"
  - "review my tests"
  - "improve test quality"
  - "refactor tests"
applies_to:
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

# Unit Testing Strategy

## Core Principles

**Not about coverage %, about confidence:** A test is valuable if it:
- Tests actual behavior users/systems depend on
- Fails when functionality breaks
- Doesn't break when refactoring implementation
- Is clear about what it's validating

**Test code is production code:** Apply the same standards—readability, maintainability, DRY.

**Table-driven tests eliminate duplication:** When you're writing similar tests with different inputs, use table-driven approach.

## Decision Flow

### 1. Identify What to Test
Ask:
- What behavior should this function have?
- What would break user workflows if this failed?
- What edge cases matter in production?

*Skip:* Internal implementation details, private state, things covered by type system.

### 2. Arrange → Act → Assert (AAA)
```typescript
// Arrange: set up state
const input = "test value";

// Act: call the function
const result = myFunction(input);

// Assert: verify behavior
expect(result).toBe(expectedValue);
```

One logical assertion per test. Multiple assertions OK if testing one behavior.

### 3. Spot Duplication → Convert to Table-Driven Test

**Before (repetitive):**
```typescript
it("should handle lowercase", () => {
  expect(normalize("abc")).toBe("ABC");
});
it("should handle uppercase", () => {
  expect(normalize("ABC")).toBe("ABC");
});
it("should handle mixed case", () => {
  expect(normalize("AbC")).toBe("ABC");
});
```

**After (table-driven):**
```typescript
it.each([
  ["abc", "ABC"],
  ["ABC", "ABC"],
  ["AbC", "ABC"],
])("should normalize %s to %s", (input, expected) => {
  expect(normalize(input)).toBe(expected);
});
```

### 4. Assertions Must Be Strict

**Golden rule:** Assert exactly what matters. Vague assertions hide bugs.

#### ❌ Weak Assertions (allow false positives)
```typescript
expect(result).toBeTruthy();           // Could be true, 1, "yes"—unclear
expect(result).toEqual({});            // Empty object passes, but so does any object
expect(result.length).toBeGreaterThan(0); // Doesn't verify content
expect(result).toBeDefined();           // Still could be null, 0, false
```

#### ✅ Strict Assertions (validate exact behavior)
```typescript
expect(result).toBe("specific-value"); // Exact string match
expect(result).toEqual({
  id: 123,
  name: "John",
  status: "active"
}); // Exact object structure—will fail if any property differs
expect(result).toHaveLength(3);        // Exact array length
expect(result).toStrictEqual(expected); // Strict type + value matching
```

#### Assertion Strategy

| Scenario | Strict Assertion | Why |
|----------|-----------------|-----|
| String result | `expect(result).toBe("exact")` | Catches typos, wrong values |
| Number result | `expect(result).toBe(42)` | Not just `> 0` or `toBeTruthy()` |
| Object shape | `expect(result).toEqual({exact, shape})` | Fails if properties missing/extra |
| Array contents | `expect(result).toEqual([item1, item2])` | Verifies order AND content |
| Array length | First assert length, then contents | Catches off-by-one errors |
| Error message | `expect(error.message).toContain("specific text")` | Not just any error |
| Type | `expect(typeof result).toBe("string")` | Especially for boundaries |

#### Examples of Strict Assertions

**API Response:**
```typescript
// ❌ Weak
expect(response).toBeTruthy();
expect(response.data).toBeDefined();

// ✅ Strict
expect(response).toEqual({
  status: 200,
  data: {
    users: [
      { id: 1, email: "user@example.com", role: "admin" },
      { id: 2, email: "other@example.com", role: "user" }
    ]
  },
  timestamp: expect.any(Number) // Only relax where necessary
});
```

**Parsed Data:**
```typescript
// ❌ Weak
expect(parsed).toEqual({});
expect(parsed.count).toBeGreaterThan(0);

// ✅ Strict
expect(parsed).toEqual({
  count: 3,
  items: ["a", "b", "c"],
  hasMore: false
});
```

**Error Handling:**
```typescript
// ❌ Weak
expect(() => myFunction(null)).toThrow();
expect(error).toBeDefined();

// ✅ Strict
expect(() => myFunction(null)).toThrow(TypeError);
expect(error.message).toBe("Cannot process null value");
expect(error.code).toBe("INVALID_INPUT");
```

#### When to Use `expect.any()` or Matchers
Only relax assertions for truly unpredictable values:
```typescript
expect(result).toEqual({
  id: expect.any(Number),        // ID varies, we only care it's a number
  createdAt: expect.any(Date),   // Timestamp varies
  name: "John"                    // These should be exact
});

// NOT like this:
expect(result.email).toEqual(expect.any(String)); // Emails ARE predictable
```

#### Custom Matchers for Domain Logic
```typescript
// If you're checking the same strict assertion multiple times:
expect.extend({
  toBeValidUserId(received) {
    const pass = typeof received === "string" && received.match(/^user_\d+$/);
    return {
      pass,
      message: () => `Expected valid user ID format (user_123), got ${received}`
    };
  }
});

// Now use it:
expect(userId).toBeValidUserId(); // Much clearer than complex assertion
```

### 5. Clean Test Code Checklist
- [ ] Test name clearly describes the behavior being tested
- [ ] No magic numbers; use named constants or descriptive values
- [ ] Setup is minimal; only include relevant state
- [ ] No conditional logic inside tests (if/else/loops in test body = red flag)
- [ ] Reuse factories/fixtures for common setup, not copy-paste
- [ ] One reason for a test to fail (one logical assertion area)

### 5. Confidence Indicators
✓ Test fails when you introduce a bug
✓ Test passes after you fix the bug
✓ Test doesn't break when refactoring implementation
✓ Test reads like documentation—someone unfamiliar could understand intent

✗ Test is brittle (breaks on harmless refactors)
✗ Test is unclear (teammate asks "what is this testing?")
✗ Test repeats implementation logic (mirrors the code it tests)

## Common Patterns

### Mocking Strategy
Only mock:
- External dependencies (APIs, databases, file system)
- Things you can't easily control in tests (time, random)

Don't mock:
- The function you're testing
- Internal utility functions
- Things the type system validates

### Error Testing
```typescript
it("should throw when input is invalid", () => {
  expect(() => myFunction(null)).toThrow(ValidationError);
});

it("should include helpful error message", () => {
  const error = expectError(() => myFunction(null));
  expect(error.message).toContain("expected non-null");
});
```

### Async Testing
```typescript
it("should fetch data", async () => {
  const result = await fetchUser(123);
  expect(result.id).toBe(123);
});
```

## When to Refactor Tests
- **Duplication appears:** Convert to table-driven tests
- **Setup is complex:** Extract to a factory function
- **Test name doesn't match behavior:** Rename or split
- **Multiple logical assertions:** Split into focused tests
- **Mocking is brittle:** Reconsider what you're mocking

## Implementation Workflow

1. **Identify behavior** → What should this do?
2. **Write one test** → Simple case first
3. **Make it pass** → Implement
4. **Add edge cases** → Use table-driven if pattern emerges
5. **Review for clean code** → Apply checklist above
6. **Refactor for confidence** → Ensure it catches bugs

---

## Ordering / Sorting Tests — Avoid Index-Based Assertions

**Anti-pattern: asserting on surrogate indices instead of actual values**

When testing that a list is sorted or ordered correctly (e.g. required items before optional), a common mistake is to look up *where* something appears in the list using an ID assigned by render position, then compare those positions. This gives a false green because the positions are always ascending regardless of the actual order.

```typescript
// ❌ WRONG — testId is assigned by render index, so section-0 is always before section-1
const requiredIdx = calls.findIndex(c => c.testId.includes('section-0'));
const optionalIdx = calls.findIndex(c => c.testId.includes('section-1'));
expect(requiredIdx).toBeLessThan(optionalIdx); // always passes — proves nothing

// ✅ CORRECT — assert on the actual domain property at each render position
expect(calls[0].credentialSet.required).toBe(true);   // first rendered = required
expect(calls[1].credentialSet.required).toBe(false);  // second rendered = optional
```

**Rule:** For ordering tests, always assert the **domain property** (e.g. `required`, `priority`, `status`) at each explicit array index in the received output. Never derive "which came first" from IDs that are themselves index-based.

**Mutation test to validate your ordering test:** Flip the ordering logic (swap `unshift` ↔ `push`, or flip the `if` condition), then run the test — it must fail. If it doesn't fail, the assertion is not testing order at all.

---

**Goal:** Tests that give you confidence to refactor fearlessly, not tests that slow you down.
