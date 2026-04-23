# Unit Testing Guide for C# Developers

This guide explains how testing works in this Next.js TypeScript project. It uses C#/.NET examples where that helps.

## Folder structure

```text
Project Root
|-- lib/                    # Business logic under test
|   |-- repositories/
|   |-- services/
|   `-- utils/
|-- tests/                  # Test files
|   |-- lib/
|   |   |-- repositories/
|   |   |   |-- weatherDataRepository.test.ts
|   |   |   `-- apiClient.test.ts
|   |   |-- services/
|   |   `-- utils/
|   |-- helpers/
|   |   `-- testHelpers.ts  # Test helpers
|   `-- setup.ts            # Global test setup
|-- jest.config.js          # Test configuration
`-- package.json            # Test scripts
```

## Framework comparison

| C#/.NET | TypeScript/Jest | Purpose |
|---------|-----------------|---------|
| `[TestClass]` | `describe()` | Test class/group |
| `[TestMethod]` | `it()` or `test()` | Individual test |
| `[TestInitialize]` | `beforeEach()` | Setup before each test |
| `[TestCleanup]` | `afterEach()` | Cleanup after each test |
| `Assert.AreEqual()` | `expect().toBe()` | Assertions |
| `[ExpectedException]` | `expect().toThrow()` | Exception testing |
| Moq | `jest.fn()` | Mocking |

## Running tests

### Basic commands
```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

### Run specific tests
```bash
# Run tests matching a pattern
npm test -- weatherDataRepository

# Run tests in a specific file
npm test -- tests/lib/repositories/weatherDataRepository.test.ts

# Run tests with specific name pattern
npm test -- --testNamePattern="should return"
```

## Test structure example

### TypeScript/Jest
```typescript
describe('WeatherDataRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new WeatherDataRepository();
  });

  it('should return weather station for valid coordinates', async () => {
    // Arrange
    const latitude = 40.7128;
    const longitude = -74.0060;

    // Act
    const result = await repository.findNearestStation(latitude, longitude);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe('STATION_001');
  });
});
```

### C# equivalent
```csharp
[TestClass]
public class WeatherDataRepositoryTests
{
    private WeatherDataRepository _repository;

    [TestInitialize]
    public void Setup()
    {
        _repository = new WeatherDataRepository();
    }

    [TestMethod]
    public async Task ShouldReturnWeatherStationForValidCoordinates()
    {
        // Arrange
        var latitude = 40.7128;
        var longitude = -74.0060;

        // Act
        var result = await _repository.FindNearestStationAsync(latitude, longitude);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual("STATION_001", result.Id);
    }
}
```

## Common Jest assertions

| Jest | C# Equivalent | Purpose |
|------|---------------|---------|
| `expect(value).toBe(expected)` | `Assert.AreEqual(expected, value)` | Exact equality |
| `expect(value).toEqual(expected)` | `Assert.AreEqual(expected, value)` | Deep equality |
| `expect(value).toBeDefined()` | `Assert.IsNotNull(value)` | Not null/undefined |
| `expect(value).toBeNull()` | `Assert.IsNull(value)` | Is null |
| `expect(array).toHaveLength(3)` | `Assert.AreEqual(3, array.Length)` | Array/collection length |
| `expect(obj).toHaveProperty('name')` | `Assert.IsTrue(obj.HasProperty("name"))` | Object has property |
| `expect(() => func()).toThrow()` | `Assert.ThrowsException<T>(() => func())` | Exception testing |

## Mocking

### TypeScript/Jest
```typescript
it('should call external API', async () => {
  // Arrange
  const mockFetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ id: 'TEST' })
  });
  global.fetch = mockFetch;

  // Act
  await repository.findNearestStation(40, -74);

  // Assert
  expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/...');
});
```

### C# with Moq
```csharp
[TestMethod]
public async Task ShouldCallExternalApi()
{
    // Arrange
    var mockHttpClient = new Mock<IHttpClient>();
    mockHttpClient.Setup(x => x.GetAsync(It.IsAny<string>()))
              .ReturnsAsync(new HttpResponseMessage { Content = ... });

    // Act
    await repository.FindNearestStationAsync(40, -74);

    // Assert
    mockHttpClient.Verify(x => x.GetAsync("https://api.example.com/..."), Times.Once);
}
```

## Coverage reports

After running `npm run test:coverage`, you'll see:

```
---------------------------------|---------|----------|---------|---------|-------------------
File                             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------------------|---------|----------|---------|---------|-------------------
weatherDataRepository.ts        |     100 |      100 |     100 |     100 | 
```

- **% Stmts**: Statement coverage
- **% Branch**: Branch coverage (if/else)
- **% Funcs**: Function coverage
- **% Lines**: Line coverage

## Test helpers and utilities

Use the helper functions in `tests/helpers/testHelpers.ts`:

```typescript
import { createMockWeatherStation, testCoordinates } from '@/tests/helpers/testHelpers';

it('should handle mock data', () => {
  const station = createMockWeatherStation({ name: 'Test Station' });
  const coords = testCoordinates.newYork;
  
  expect(station.name).toBe('Test Station');
});
```

## Best practices

### 1. Test organization
- Group related tests in `describe()` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Test data
- Use test helpers for creating mock data
- Keep test data close to the test
- Use meaningful test values

### 3. Async testing
```typescript
// Good - properly handle async
it('should handle async operations', async () => {
  const result = await repository.findNearestStation(40, -74);
  expect(result).toBeDefined();
});

// Bad - missing async/await
it('should handle async operations', () => {
  const result = repository.findNearestStation(40, -74);
  expect(result).toBeDefined(); // This will fail!
});
```

### 4. Mocking external dependencies
- Mock external APIs, databases, file systems
- Reset mocks between tests
- Verify mock interactions

## Debugging tests

### VS Code integration
1. Install "Jest" extension
2. Click the play button next to individual tests
3. Set breakpoints in test files
4. Use "Debug Test" from command palette

### Console output
```typescript
it('should debug test', () => {
  console.log('Debug info:', someValue);
  expect(someValue).toBeDefined();
});
```

## Test-driven development

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make it pass
3. **Refactor**: Improve the code while keeping tests green

```typescript
// 1. RED - Write failing test first
it('should calculate distance between stations', () => {
  const distance = station1.distanceTo(station2);
  expect(distance).toBeCloseTo(100.5, 1);
});

// 2. GREEN - Implement method to make test pass
// 3. REFACTOR - Improve implementation
```

This setup gives you the same core testing habits you may already use in C#, adapted to the TypeScript toolchain.