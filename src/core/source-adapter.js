export class SourceAdapter {
  constructor({ type }) {
    this.type = type;
  }

  supports(source) {
    return source?.type === this.type;
  }

  normalize() {
    throw new Error("normalize() must be implemented by a concrete adapter");
  }
}

export class SourceAdapterRegistry {
  constructor(adapters = []) {
    this.adapters = adapters;
  }

  register(adapter) {
    this.adapters.push(adapter);
  }

  resolve(source) {
    return this.adapters.find((adapter) => adapter.supports(source)) ?? null;
  }
}
