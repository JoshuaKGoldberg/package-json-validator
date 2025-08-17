export type FieldSpec = FieldSpecWithType | FieldSpecWithTypes;

export type SpecMap = Record<string, FieldSpec>;

/** @deprecated commonjs_1.0 and commonjs_1.1 specs have been deprecated */
export type SpecName = "commonjs_1.0" | "commonjs_1.1" | "npm";

export type SpecType = "array" | "boolean" | "object" | "string";

interface BaseFieldSpec {
	format?: RegExp;
	or?: string;
	recommended?: boolean;
	required?: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	validate?: (name: string, obj: any) => string[];
	warning?: boolean;
}

type FieldSpecWithType = BaseFieldSpec & {
	type?: SpecType;
	types?: never;
};

type FieldSpecWithTypes = BaseFieldSpec & {
	type?: never;
	types?: SpecType[];
};
