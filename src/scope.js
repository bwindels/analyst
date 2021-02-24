// we will actually set Binding's to a scope, which have a name and a value.


export class Scope {
	add(name, type) {
		return new LexicalScope(null, name, type);
	}
	resolve() {
		return null;
	}

	toArray() {
		return [];
	}

	keys() {
		return new ScopeIterator(null);
	}

	values() {
		return new ScopeIterator(null);
	}

	entries() {
		return new ScopeIterator(null);
	}
}

class LexicalScope {
	constructor(parent, name, type) {
		this._parent = parent;
		this._name = name
		this._type = type;
	}

	add(name, type) {
		return new LexicalScope(this, name, type);
	}

	get(name) {
		if (this._name === name) {
			return this._type;
		} else if (this._parent) {
			return this._parent.get(name);
		}
		return null;
	}

	keys() {
		return new ScopeIterator(this, s => s._name);
	}

	values() {
		return new ScopeIterator(this, s => s._type);
	}

	entries() {
		return new ScopeIterator(this, s => [s._name, s._type]);
	}
}

class ScopeIterator {
	constructor(start, mapper) {
		this._current = start;
		this._mapper = mapper;
	}

	next() {
		if (this._current) {
			const result = {done: false, value: this._mapper(this._current)};
			this._current = this._current._parent;
			return result;
		} else {
			return {value: undefined, done: true};
		}
	}

	[Symbol.iterator]() {
		return this;
	}
}
