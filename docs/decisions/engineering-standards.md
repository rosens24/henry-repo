# Engineering Standards

## Decision Hierarchy

When tradeoffs exist, prioritize:

1. Security
2. Data integrity
3. Reliability
4. Simplicity
5. Maintainability
6. Scalability
7. Performance
8. Visual polish

Never sacrifice higher priorities for lower priorities.

## Code Standards

Code should be:

- strongly typed
- modular
- reusable
- documented
- testable

Avoid:

- magic values
- duplicated logic
- giant files
- deeply nested components
- hardcoded configuration

Target:

- small components
- clear interfaces
- explicit typing
- predictable architecture
- simple debugging

Every feature should be understandable by a new engineer within 10 minutes.

## Business And Cost Review

Every architecture decision should consider:

- monthly cost
- vendor lock-in
- scaling cost
- maintenance cost

Prefer solutions that remain economical at:

- 10 customers
- 100 customers
- 1,000 customers
- 10,000 customers

## Operational Leverage

Do not optimize for code generation. Optimize for operational leverage.

Every feature should reduce human effort, increase visibility, improve decision making, or automate repetitive work. If it does not, challenge whether it should exist.

Report discoveries that can save money, save time, reduce complexity, improve conversion, improve automation, or improve customer experience even when not asked.
