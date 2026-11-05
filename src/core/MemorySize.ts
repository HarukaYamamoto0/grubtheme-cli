export class MemorySize {
	private constructor(readonly bytes: bigint) {}

	static gb(value: number): MemorySize {
		return new MemorySize(this.validate(value) * 1000n ** 3n);
	}

	static gib(value: number): MemorySize {
		return new MemorySize(this.validate(value) * 1024n ** 3n);
	}

	static mb(value: number): MemorySize {
		return new MemorySize(this.validate(value) * 1000n ** 2n);
	}

	static mib(value: number): MemorySize {
		return new MemorySize(this.validate(value) * 1024n ** 2n);
	}

	private static validate(value: number): bigint {
		if (!Number.isSafeInteger(value) || value <= 0)
			throw new RangeError('Memory size must be a positive safe integer');

		return BigInt(value);
	}

	toString(): string {
		const mib = 1024n ** 2n;
		const gib = 1024n ** 3n;

		if (this.bytes % gib === 0n) return `${this.bytes / gib}G`;

		return `${(this.bytes + mib - 1n) / mib}M`;
	}
}
